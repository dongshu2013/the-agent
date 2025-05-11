import { createClient } from '@supabase/supabase-js';

export async function getUserFromApiKey(env: any, apiKey: string): Promise<string | null> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  const { data, error } = await supabase.from("users").where('api_key', 'eq', apiKey).select('id');

  if (error) throw error;
  return data[0].id;
}
