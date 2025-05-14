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
import { createEmbeddingClient, generateEmbedding } from './embedding';

const DEFAULT_VECTOR_NAMESPACE = 'default';

function formatSqlString(str: string | null | undefined): string | null {
  if (str === null || str === undefined) return null;
  return `'${str.replace(/'/g, "''")}'`;
}

function formatSqlJsonb(
  obj: Record<string, any> | null | undefined
): string | null {
  if (obj === null || obj === undefined) return null;
  const jsonstr = JSON.stringify(obj);
  return formatSqlString(jsonstr);
}

export class AgentContext extends DurableObject<Env> {
  openai: OpenAI;
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(CREATE_CONVERSATION_TABLE_QUERY);
    this.sql.exec(CREATE_MESSAGE_TABLE_QUERY);
    this.openai = createEmbeddingClient(env);
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
    const params = Object.fromEntries(
      Object.entries({
        id: message.id,
        conversation_id: message.conversation_id,
        role: formatSqlString(message.role),
        content: formatSqlJsonb(message.content || []),
        tool_calls: formatSqlJsonb(message.tool_calls),
        tool_call_id: formatSqlString(message.tool_call_id),
        name: formatSqlString(message.name),
      }).filter(([_, v]) => v !== null)
    );
    const insertQuery = `INSERT INTO agent_messages
        (${Object.keys(params).join(', ')})
        VALUES (${Object.values(params).join(', ')})`;
    this.sql.exec(insertQuery);
    this.sql.exec(
      `UPDATE agent_conversations SET last_message_at = ${message.id} WHERE id = ${message.conversation_id}`
    );
    const texts =
      (message.content || [])
        .filter((m): m is TextMessage => m.type === 'text')
        .map((m) => m.text?.value)
        ?.filter((v): v is string => v?.trim().length > 0) || [];
    if (texts.length === 0) {
      return {
        success: true,
        topKMessageIds: [],
      };
    }
    const embedding = await generateEmbedding(this.openai, texts);
    if (embedding === null) {
      return {
        success: true,
        topKMessageIds: [],
      };
    }
    const toInsert = [
      {
        id: message.id.toString(),
        values: embedding,
        metadata: {
          user_id: this.ctx.id.toString(),
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
            user_id: { $eq: this.ctx.id.toString() },
            conversation_id: { $eq: message.conversation_id },
          },
          returnValues: false,
          returnMetadata: 'none',
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
