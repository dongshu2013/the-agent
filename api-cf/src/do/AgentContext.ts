import { DurableObject } from 'cloudflare:workers';
import OpenAI from 'openai';
import { CREATE_CONVERSATION_TABLE_QUERY, CREATE_MESSAGE_TABLE_QUERY } from './sql';
import { createEmbeddingClient, generateEmbedding } from './embedding';
import { GatewayServiceError } from '../types/service';
import {
  Message,
  Conversation,
  ListConversationsRequest,
  MessageRole,
  ToolCall,
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
    const messages = this.sql.exec(
      `SELECT id FROM agent_messages WHERE conversation_id = ?`,
      conversationId
    );
    const ids: string[] = [];
    for (const row of messages) {
      ids.push(row.id as string);
    }
    this.cleanupVectorIndexEntries(ids);
  }

  listConversations(params: ListConversationsRequest): Conversation[] {
    const startFrom = params.startFrom || 0;
    const sqlStmt = `SELECT c.id
        FROM agent_conversations c
        WHERE c.status = 'active'
        AND (c.id > ? OR c.last_message_at > ?)`;
    const rows = this.sql.exec(sqlStmt, startFrom, startFrom);
    const result: Conversation[] = [];
    for (const row of rows) {
      const convId = row.id as number;
      const messages = this.sql.exec(
        `SELECT * FROM agent_messages WHERE conversation_id = ? and id > ?`,
        convId,
        startFrom
      );
      const messagesList: Message[] = [];
      for (const message of messages) {
        messagesList.push({
          id: message.id as number,
          conversation_id: convId,
          role: message.role as MessageRole,
          content: message.content as string,
          tool_calls: JSON.parse(message.tool_calls as string) as ToolCall[],
          tool_call_id: message.tool_call_id as string,
          name: message.name as string,
        });
      }
      result.push({
        id: convId,
        messages: messagesList,
      });
    }
    return sortConversations(result);
  }

  async reset() {
    try {
      const messages = this.sql.exec('SELECT id FROM agent_messages');
      const ids: string[] = [];
      for (const row of messages) {
        ids.push(row.id as string);
      }
      // Clean up vector index entries
      await this.cleanupVectorIndexEntries(ids);

      // Drop tables completely instead of deleting rows for better performance
      // Drop messages first to respect foreign key constraints
      this.sql.exec('DROP TABLE IF EXISTS agent_messages');
      this.sql.exec('DROP TABLE IF EXISTS agent_conversations');

      console.log('Dropped tables: agent_messages, agent_conversations');

      // Recreate the tables
      this.sql.exec(CREATE_CONVERSATION_TABLE_QUERY);
      this.sql.exec(CREATE_MESSAGE_TABLE_QUERY);

      console.log('Recreated tables: agent_messages, agent_conversations');
    } catch (error) {
      console.error('Error during reset:', error);
      throw new GatewayServiceError(500, 'Failed to reset data');
    }
  }

  /**
   * Cleans up vector index entries for the current user
   * Uses the Vectorize API to remove entries associated with this user ID
   */
  private async cleanupVectorIndexEntries(ids: string[]): Promise<void> {
    if (!this.env.MYTSTA_E5_INDEX) {
      return;
    }
    try {
      // Delete these vectors by ID
      await this.env.MYTSTA_E5_INDEX.deleteByIds(ids);
      console.info(`Deleted ${ids.length} vector entries so far`);
    } catch (error) {
      // Log the error but don't fail the reset operation
      console.error('Error cleaning up vector index entries:', error);
    }
  }

  async saveMessage(
    message: Message,
    topK = 3,
    threshold = 0.7
  ): Promise<{
    topKMessageIds: string[];
    totalCost: number;
  }> {
    const convExistsQuery = this.sql.exec(
      'SELECT 1 FROM agent_conversations WHERE id = ? LIMIT 1',
      message.conversation_id
    );
    const convExists = Array.from(convExistsQuery);
    if (convExists.length === 0) {
      console.log('Got orphan conversation: ', message.conversation_id);
      this.createConversation(message.conversation_id);
    }

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
