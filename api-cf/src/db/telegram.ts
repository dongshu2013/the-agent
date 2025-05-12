import { createClient } from '@supabase/supabase-js';

/**
 * Get Telegram dialogs for a user
 */
export async function getTelegramDialogs(
  env: any,
  userId: string,
  limit: number = 100,
  offset: number = 0,
  chatTitle?: string,
  isPublic?: boolean,
  isFree?: boolean,
  status?: string,
  sortBy: string = 'updated_at',
  sortOrder: string = 'desc'
) {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // Start query
    let query = supabase
      .from('telegram_chats')
      .select('*, telegram_messages(count)')
      .eq('user_id', userId);
    
    // Apply filters
    if (chatTitle) {
      query = query.ilike('chat_title', `%${chatTitle}%`);
    }
    
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic);
    }
    
    if (isFree !== undefined) {
      query = query.eq('is_free', isFree);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Get total count
    const { count } = await supabase
      .from('telegram_chats')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Apply sorting
    const validSortColumns = ['updated_at', 'created_at', 'chat_title', 'last_synced_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'updated_at';
    const order = sortOrder.toLowerCase() === 'asc' ? true : false;
    
    query = query.order(sortColumn, { ascending: order });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: chats, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching Telegram dialogs: ${error.message}`);
    }
    
    // Format the response
    const dialogs = chats.map(chat => ({
      id: chat.id,
      chat_id: chat.chat_id,
      chat_type: chat.chat_type,
      chat_title: chat.chat_title,
      is_public: chat.is_public,
      is_free: chat.is_free,
      subscription_fee: parseFloat(chat.subscription_fee),
      last_synced_at: chat.last_synced_at,
      status: chat.status,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      message_count: chat.telegram_messages.length > 0 ? chat.telegram_messages[0].count : 0
    }));
    
    return {
      dialogs,
      total_count: count || 0,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error in getTelegramDialogs:', error);
    throw error;
  }
}

/**
 * Get messages from a specified Telegram chat
 */
export async function getTelegramMessages(
  env: any,
  userId: string,
  chatId: string,
  limit: number = 100,
  offset: number = 0,
  messageText?: string,
  senderId?: string,
  senderUsername?: string,
  startTimestamp?: number,
  endTimestamp?: number,
  sortBy: string = 'message_timestamp',
  sortOrder: string = 'desc'
) {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // First check if the chat belongs to the user
    const { data: chat, error: chatError } = await supabase
      .from('telegram_chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();
    
    if (chatError || !chat) {
      throw new Error('Chat not found or you do not have permission to access it');
    }
    
    // Start query for messages
    let query = supabase
      .from('telegram_messages')
      .select('*')
      .eq('chat_id', chatId);
    
    // Apply filters
    if (messageText) {
      query = query.ilike('message_text', `%${messageText}%`);
    }
    
    if (senderId) {
      query = query.eq('sender_id', senderId);
    }
    
    if (senderUsername) {
      query = query.ilike('sender_username', `%${senderUsername}%`);
    }
    
    if (startTimestamp) {
      query = query.gte('message_timestamp', startTimestamp);
    }
    
    if (endTimestamp) {
      query = query.lte('message_timestamp', endTimestamp);
    }
    
    // Get total count
    const { count } = await supabase
      .from('telegram_messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId);
    
    // Apply sorting
    const validSortColumns = ['message_timestamp', 'message_id'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'message_timestamp';
    const order = sortOrder.toLowerCase() === 'asc' ? true : false;
    
    query = query.order(sortColumn, { ascending: order });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: messages, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching Telegram messages: ${error.message}`);
    }
    
    // Format the response
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      message_id: msg.message_id,
      message_text: msg.message_text,
      message_timestamp: msg.message_timestamp,
      sender_id: msg.sender_id,
      sender_username: msg.sender_username,
      sender_firstname: msg.sender_firstname,
      sender_lastname: msg.sender_lastname
    }));
    
    return {
      chat: {
        id: chat.id,
        chat_id: chat.chat_id,
        chat_title: chat.chat_title,
        chat_type: chat.chat_type,
        is_public: chat.is_public,
        is_free: chat.is_free
      },
      messages: formattedMessages,
      total_count: count || 0,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error in getTelegramMessages:', error);
    throw error;
  }
}

/**
 * Search messages based on vector similarity
 */
export async function searchTelegramMessages(
  env: any,
  userId: string,
  query: string,
  chatId?: string,
  topK: number = 10,
  messageRange: number = 2,
  threshold: number = 0.7,
  isPublic?: boolean,
  isFree?: boolean
) {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // Generate embedding for the query
    // Note: In a real implementation, you would use a proper embedding service
    // This is a placeholder for the actual embedding generation
    const embedding = await generateEmbedding(env, query);
    
    // Convert embedding to PostgreSQL array format
    const embeddingStr = JSON.stringify(embedding).replace('[', '{').replace(']', '}');
    
    // Build the SQL query
    let sqlQuery = `
      SELECT 
        m.id, 
        m.chat_id, 
        m.message_id,
        m.message_text,
        m.message_timestamp,
        m.embedding <=> '${embeddingStr}'::vector AS distance
      FROM 
        telegram_messages m
      JOIN 
        telegram_chats c ON m.chat_id = c.id
      WHERE 
        c.user_id = '${userId}'
    `;
    
    // SQL parameters are handled directly in the query string for simplicity
    
    // Add optional filters
    if (chatId) {
      sqlQuery += ` AND c.id = '${chatId}'`;
    }
    
    if (isPublic !== undefined) {
      sqlQuery += ` AND c.is_public = ${isPublic}`;
    }
    
    if (isFree !== undefined) {
      sqlQuery += ` AND c.is_free = ${isFree}`;
    }
    
    // Add sorting and limit
    sqlQuery += `
      ORDER BY 
        distance
      LIMIT ${topK}
    `;
    
    // Execute query
    const { data: results, error } = await supabase.rpc('pgvector_search', {
      query_text: sqlQuery
    });
    
    if (error) {
      throw new Error(`Error searching Telegram messages: ${error.message}`);
    }
    
    // Filter results below threshold
    const filteredResults = results.filter((r: any) => r.distance <= threshold);
    
    // Get context for matching messages
    const resultsWithContext = [];
    
    for (const match of filteredResults) {
      // Get chat info
      const { data: chat, error: chatError } = await supabase
        .from('telegram_chats')
        .select('*')
        .eq('id', match.chat_id)
        .single();
      
      if (chatError || !chat) {
        continue;
      }
      
      // Get context messages
      const { data: contextMessages, error: msgError } = await supabase
        .from('telegram_messages')
        .select('*')
        .eq('chat_id', match.chat_id)
        .gte('message_timestamp', match.message_timestamp - (messageRange * 60))
        .lte('message_timestamp', match.message_timestamp + (messageRange * 60))
        .order('message_timestamp', { ascending: true });
      
      if (msgError) {
        continue;
      }
      
      // Build message chunk
      const messageChunk = contextMessages.map((msg: any) => ({
        id: msg.id,
        message_id: msg.message_id,
        message_text: msg.message_text,
        message_timestamp: msg.message_timestamp,
        sender_id: msg.sender_id,
        sender_username: msg.sender_username,
        sender_firstname: msg.sender_firstname,
        sender_lastname: msg.sender_lastname,
        is_match: msg.id === match.id,
        similarity: msg.id === match.id ? 1 - match.distance : null
      }));
      
      // Build chat info
      const chatInfo = {
        id: chat.id,
        chat_id: chat.chat_id,
        chat_title: chat.chat_title,
        chat_type: chat.chat_type,
        is_public: chat.is_public,
        is_free: chat.is_free
      };
      
      resultsWithContext.push({
        chat: chatInfo,
        message_chunk: messageChunk
      });
    }
    
    return {
      results: resultsWithContext,
      query_embedding_available: true
    };
  } catch (error) {
    console.error('Error in searchTelegramMessages:', error);
    throw error;
  }
}

/**
 * Generate embedding for a text
 * Note: This is a placeholder. In a real implementation, you would use a proper embedding service
 */
async function generateEmbedding(env: any, text: string): Promise<number[]> {
  // This is a placeholder for the actual embedding generation
  // In a real implementation, you would call an embedding service like OpenAI
  try {
    const response = await fetch(env.LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: env.DEFAULT_MODEL
      })
    });
    
    const data = await response.json() as { data: Array<{embedding: number[]}>; error?: { message: string } };
    
    if (!response.ok || data.error) {
      throw new Error(`Error generating embedding: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}
