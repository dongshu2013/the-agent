import { createClient } from '@supabase/supabase-js';

// Get user from API key
export async function getUserFromApiKey(env: any, apiKey: string): Promise<string | null> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // Query the users table for the API key
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('api_key', apiKey)
      .eq('api_key_enabled', true)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user from API key:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in getUserFromApiKey:', error);
    return null;
  }
}

// Get user credits
export async function getUserCredits(env: any, userId: string): Promise<number> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // Query the balances table for the user's credits
    const { data, error } = await supabase
      .from('balances')
      .select('user_credits')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user credits:', error);
      return 0;
    }
    
    return parseFloat(data.user_credits) || 0;
  } catch (error) {
    console.error('Error in getUserCredits:', error);
    return 0;
  }
}

// Deduct credits from user
export async function deductUserCredits(
  env: any, 
  userId: string, 
  amount: number, 
  conversationId?: string, 
  model?: string
): Promise<{ success: boolean; remainingCredits: number }> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    // Get current credits
    const currentCredits = await getUserCredits(env, userId);
    
    if (currentCredits < amount) {
      return { success: false, remainingCredits: currentCredits };
    }
    
    const newBalance = currentCredits - amount;
    
    // Start a transaction
    const { error: balanceError } = await supabase
      .from('balances')
      .update({ 
        user_credits: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      return { success: false, remainingCredits: currentCredits };
    }
    
    // Record the transaction
    const { error: creditError } = await supabase
      .from('credits')
      .insert({
        user_id: userId,
        trans_credits: -amount,
        trans_type: 'completion',
        conversation_id: conversationId,
        model: model
      });
    
    if (creditError) {
      console.error('Error recording credit transaction:', creditError);
      // We still consider this a success since the balance was updated
    }
    
    return { success: true, remainingCredits: newBalance };
  } catch (error) {
    console.error('Error in deductUserCredits:', error);
    return { success: false, remainingCredits: 0 };
  }
}
