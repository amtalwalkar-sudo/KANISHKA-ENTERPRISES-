import { getSupabaseClient } from './client.js';

export async function upsertFoundationRecord(record) {
  const { data, error } = await getSupabaseClient()
    .from('kfe_records')
    .upsert(record, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listCloudRecords(userId, { since = null } = {}) {
  let query = getSupabaseClient().from('kfe_records').select('*').eq('user_id', userId);
  if (since) query = query.gt('updated_at', since);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
