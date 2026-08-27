import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config.js';

let client = null;

export function getSupabaseClient() {
  if (client) return client;
  const { url, anonKey } = getSupabaseConfig();
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  return client;
}

export async function getAuthenticatedUserId() {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}
