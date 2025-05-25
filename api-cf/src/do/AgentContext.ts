import { DurableObject } from 'cloudflare:workers';
import OpenAI from 'openai';
import { CREATE_CONVERSATION_TABLE_QUERY, CREATE_MESSAGE_TABLE_QUERY } from './sql';
import { createEmbeddingClient, generateEmbedding } from './embedding';
import { GatewayServiceError } from '../types/service';
import {
  Message,
  Conversation,
  ToolCall,
  MessageRole,
  ListConversationsRequest,
} from '@the-agent/shared';

const DEFAULT_VECTOR_NAMESPACE = 'default';

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
    this.sql.exec(`INSERT INTO agent_conversations (id) VALUES (?)`, conversationId);
    return conversationId;
  }

  deleteConversation(conversationId: number): void {
    this.sql.exec(`UPDATE agent_conversations SET status = 'deleted' WHERE id = ?`, conversationId);
  }

  listConversations(params: ListConversationsRequest): Conversation[] {
    const startFrom = params.startFrom || 0;
    const messages = this.sql.exec(`SELECT * FROM agent_messages WHERE id > ?`, startFrom);

    // group messages
    const conversations: Record<number, Conversation> = {};
    for (const row of messages) {
      const message = {
        id: row.id as number,
        conversation_id: row.conversation_id as number,
        role: row.role as MessageRole,
        content: row.content as string,
        tool_calls: JSON.parse(row.tool_calls as string) as ToolCall[],
        tool_call_id: row.tool_call_id as string,
      };
      const conv = conversations[message.conversation_id];
      if (conv) {
        conv.messages!.push(message);
      } else {
        conversations[message.conversation_id] = {
          id: message.conversation_id,
          messages: [message],
        };
      }
    }

    // it's possible that there is groups without any messages
    // created after start from
    const sqlStmt = `SELECT c.id
        FROM agent_conversations c
        WHERE c.status = 'active'
        AND c.id > ?`;
    const rows = this.sql.exec(sqlStmt, startFrom);
    for (const row of rows) {
      const convId = row.id as number;
      if (!conversations[convId]) {
        conversations[convId] = {
          id: convId,
          messages: [],
        };
      }
    }
    return sortConversations(Object.values(conversations));
  }

  async saveMessage(
    message: Message,
    topK = 3,
    threshold = 0.7
  ): Promise<{
    topKMessageIds: string[];
    totalCost: number;
  }> {
    const insertQuery =
      'INSERT INTO agent_messages' +
      '(id, conversation_id, role, content, tool_calls, tool_call_id, name)' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)';
    this.sql.exec(
      insertQuery,
      message.id,
      message.conversation_id,
      message.role,
      message.content,
      message.tool_calls ? JSON.stringify(message.tool_calls) : null,
      message.tool_call_id,
      message.name
    );
    this.sql.exec(
      'UPDATE agent_conversations SET last_message_at = ? WHERE id = ?',
      message.id,
      message.conversation_id
    );
    const text = collectText(message);
    if (!text) {
      return {
        topKMessageIds: [],
        totalCost: 0,
      };
    }
    // Generate embedding
    const embeddingResult = await generateEmbedding(this.openai, [text], topK);
    if (embeddingResult === null) {
      throw new GatewayServiceError(500, 'Failed to generate embedding');
    }
    const { embedding, totalCost } = embeddingResult;

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
        .filter(m => m.score && m.score >= threshold)
        .map(m => m.id);
      return {
        topKMessageIds,
        totalCost,
      };
    } else {
      await this.env.MYTSTA_E5_INDEX.insert(toInsert);
      return {
        topKMessageIds: [],
        totalCost,
      };
    }
  }
}

function collectText(message: Message): string {
  if (!message.content) {
    return '';
  }

  try {
    const parsed = JSON.parse(message.content);
    if (Array.isArray(parsed)) {
      const texts: string[] = [];
      for (const c of parsed) {
        if (c.type === 'text') {
          if (typeof c.text === 'string') {
            if (c.text.trim().length > 0) {
              texts.push(c.text);
            }
          } else if (c.text?.value) {
            texts.push(c.text.value);
          }
        }
      }
      if (texts.length === 0) {
        return '';
      }
      return texts.join('\n');
    } else {
      console.error('Invalid message content:', message.content);
      return '';
    }
  } catch (error) {
    if (typeof message.content === 'string') {
      return message.content;
    }
    console.error('Error collecting text from message:', error);
    return '';
  }
}

const sortConversations = (conversations: Conversation[]) => {
  const getTimestamp = (conversation: Conversation) => {
    const messages = conversation.messages || [];
    if (messages.length > 0) {
      return messages[messages.length - 1].id;
    }
    return conversation.id;
  };
  return conversations.sort((a, b) => {
    const aTimestamp = getTimestamp(a);
    const bTimestamp = getTimestamp(b);
    return bTimestamp - aTimestamp;
  });
};
