import { DurableObject } from 'cloudflare:workers';
import OpenAI from 'openai';
import {
  AgentMessage,
  Conversation,
  Message,
  TextMessage,
  ToolCall,
} from './types';
import {
  CREATE_CONVERSATION_TABLE_QUERY,
  CREATE_MESSAGE_TABLE_QUERY,
} from './sql';

const EMBEDDING_MODEL = 'intfloat/multilingual-e5-large';
const EMBEDDING_API_BASE_URL = 'https://api.deepinfra.com/v1/openai';

const DEFAULT_VECTOR_NAMESPACE = 'default';

export class AgentContext extends DurableObject<Env> {
  openai: OpenAI;
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(CREATE_CONVERSATION_TABLE_QUERY);
    this.sql.exec(CREATE_MESSAGE_TABLE_QUERY);

    this.openai = new OpenAI({
      apiKey: env.EMBEDDING_API_KEY,
      baseURL: EMBEDDING_API_BASE_URL,
    });
  }

  createConversation(conversationId: number): number {
    this.sql.exec(`INSERT INTO agent_conversations (id) VALUES ($1)`, [
      conversationId,
    ]);
    return conversationId;
  }

  deleteConversation(conversationId: number): void {
    this.sql.exec(
      `UPDATE agent_conversations SET status = 'deleted' WHERE id = $1`,
      [conversationId]
    );
  }

  listConversations(limit = 10): Conversation[] {
    const results: Conversation[] = [];
    const conversations = this.sql.exec(
      `SELECT c.id
        FROM agent_conversations c
        WHERE c.status = 'active'
        ORDER BY c.id DESC
        LIMIT ${limit}`
    );
    for (const row of conversations) {
      const messages = this.sql.exec(
        `SELECT * FROM agent_messages WHERE conversation_id = $1`,
        [row.id]
      );
      const msgs: Message[] = [];
      for (const message of messages) {
        msgs.push({
          id: message.id as number,
          conversation_id: message.conversation_id as number,
          role: message.role as string,
          content: JSON.parse(message.content as string) as AgentMessage[],
          tool_calls: JSON.parse(message.tool_calls as string) as ToolCall[],
          tool_call_id: message.tool_call_id as string,
        });
      }
      results.push({
        id: row.id as number,
        messages: msgs,
      });
    }
    return results;
  }

  async saveMessage(
    message: Message,
    topK = 3,
    threshold = 0.7
  ): Promise<{ success: boolean; topKMessageIds: string[] }> {
    this.sql.exec(
      `INSERT INTO agent_messages
        (id, conversation_id, role, content, tool_calls, tool_call_id)
        VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        message.id,
        message.conversation_id,
        message.role,
        message.content ? JSON.stringify(message.content) : null,
        message.tool_calls ? JSON.stringify(message.tool_calls) : null,
        message.tool_call_id,
      ]
    );
    this.sql.exec(
      `UPDATE agent_conversations SET last_message_at = $1 WHERE id = $2`,
      [message.id, message.conversation_id]
    );
    const texts =
      message.content
        ?.filter((m): m is TextMessage => m.type === 'text')
        .map((m) => m.text?.value)
        ?.filter((v): v is string => v?.trim().length > 0) || [];
    if (texts.length === 0) {
      return {
        success: true,
        topKMessageIds: [],
      };
    }
    const response = await this.openai.embeddings.create({
      input: texts.join('\n'),
      model: EMBEDDING_MODEL,
      encoding_format: 'float',
    });
    const embedding = response.data[0].embedding;
    const toInsert = [
      {
        id: message.id.toString(),
        values: embedding,
        metadata: {
          conversation_id: message.conversation_id,
        },
        namespace: DEFAULT_VECTOR_NAMESPACE,
      },
    ];
    if (topK > 0) {
      const [topKMessages, _] = await Promise.all([
        this.env.MYTSTA_E5_INDEX.query(embedding, {
          topK,
          namespace: DEFAULT_VECTOR_NAMESPACE,
          filter: {
            conversation_id: { $eq: message.conversation_id },
          },
          returnValues: false,
          returnMetadata: 'indexed',
        }),
        this.env.MYTSTA_E5_INDEX.insert(toInsert),
      ]);
      const topKMessageIds = topKMessages.matches
        .filter((m) => m.score && m.score >= threshold)
        .map((m) => m.id);
      return {
        success: true,
        topKMessageIds,
      };
    } else {
      await this.env.MYTSTA_E5_INDEX.insert(toInsert);
      return {
        success: true,
        topKMessageIds: [],
      };
    }
  }
}
