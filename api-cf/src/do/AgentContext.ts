import { DurableObject } from 'cloudflare:workers';
import { CREATE_CONVERSATION_TABLE_QUERY, CREATE_MESSAGE_TABLE_QUERY } from './sql';
import {
  Message,
  Conversation,
  ListConversationsRequest,
  MessageRole,
  ToolCall,
} from '@the-agent/shared';

export class AgentContext extends DurableObject<Env> {
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(CREATE_CONVERSATION_TABLE_QUERY);
    this.sql.exec(CREATE_MESSAGE_TABLE_QUERY);
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

  async saveMessage(message: Message) {
    const convExistsQuery = this.sql.exec(
      'SELECT 1 FROM agent_conversations WHERE id = ? LIMIT 1',
      message.conversation_id
    );
    const convExists = Array.from(convExistsQuery);
    if (convExists.length === 0) {
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
        relatedMessages: [],
        totalCost: 0,
      };
    }

    // 2. add embedding and get totalCost
    const addRes = await fetch(`${process.env.MEMORY_SERVER_URL}/memory/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [message],
        options: { metadata: { id: message.id, conversationId: message.conversation_id } },
      }),
    });
    const addResult = (await addRes.json()) as any;
    const totalCost = addResult.totalCost || 0;

    // 3. search related memory
    const searchRes = await fetch(`${process.env.MEMORY_SERVER_URL}/memory/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message.content }),
    });
    const searchResult = (await searchRes.json()) as any;
    const relatedMessages = searchResult.results || [];

    return { totalCost, relatedMessages };
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
