import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatMessageWithId } from '../types/chat';

// Create a new conversation
export async function createConversation(env: any, userId: string): Promise<string> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    const conversationId = uuidv4();
    
    const { error } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        user_id: userId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
    
    return conversationId;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw new Error('Failed to create conversation');
  }
}

// Get a conversation by ID
export async function getConversation(env: any, conversationId: string, userId: string) {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching conversation:', error);
      throw new Error('Conversation not found');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getConversation:', error);
    throw new Error('Failed to fetch conversation');
  }
}

// Delete a conversation (mark as deleted)
export async function deleteConversation(env: any, conversationId: string, userId: string): Promise<boolean> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // First verify the conversation belongs to the user
    const conversation = await getConversation(env, conversationId, userId);
    
    if (!conversation) {
      throw new Error('Conversation not found or you do not have permission to delete it');
    }
    
    // Update the conversation status to deleted
    const { error } = await supabase
      .from('conversations')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw new Error('Failed to delete conversation');
  }
}

// List user conversations
export async function listUserConversations(env: any, userId: string) {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // Get conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });
    
    if (convError) {
      console.error('Error fetching conversations:', convError);
      throw new Error(`Failed to fetch conversations: ${convError.message}`);
    }
    
    // For each conversation, get the messages
    const result = [];
    
    for (const conversation of conversations) {
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      
      if (msgError) {
        console.error(`Error fetching messages for conversation ${conversation.id}:`, msgError);
        continue;
      }
      
      // Format messages
      const formattedMessages = messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.created_at,
        tool_calls: message.tool_calls ? JSON.parse(message.tool_calls) : null,
        tool_call_id: message.tool_call_id
      }));
      
      result.push({
        id: conversation.id,
        user_id: conversation.user_id,
        created_at: conversation.created_at,
        status: conversation.status,
        messages: formattedMessages
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in listUserConversations:', error);
    throw new Error('Failed to list conversations');
  }
}

// Save a message to a conversation
export async function saveMessage(
  env: any, 
  userId: string, 
  conversationId: string, 
  message: ChatMessageWithId,
  topKRelated: number = 0
): Promise<{ success: boolean; topKMessages: string[] }> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // First verify the conversation belongs to the user
    await getConversation(env, conversationId, userId);
    
    // Extract text content for embedding generation
    let textContent = message.content || '';
    
    // If there are tool calls, include their arguments in the text content
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCallsText = message.tool_calls.map(tc => 
        `${tc.function.name}: ${tc.function.arguments}`
      ).join(' ');
      textContent += ' ' + toolCallsText;
    }
    
    // Insert the message
    const { error } = await supabase
      .from('messages')
      .insert({
        id: message.message_id,
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        tool_calls: message.tool_calls ? JSON.stringify(message.tool_calls) : null,
        tool_call_id: message.tool_call_id || message.toolCallId,
        created_at: message.created_at || new Date().toISOString(),
        text_content: textContent, // For searching
        embedding: null // Will be updated by background task
      });
    
    if (error) {
      console.error('Error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
    
    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    // Queue embedding generation (in a real implementation, this would be a background task)
    // For now, we'll just return success
    
    // If topKRelated > 0, we would find similar messages here
    // This is a simplified implementation
    const topKMessages: string[] = [];
    
    return { success: true, topKMessages };
  } catch (error) {
    console.error('Error in saveMessage:', error);
    throw new Error('Failed to save message');
  }
}
