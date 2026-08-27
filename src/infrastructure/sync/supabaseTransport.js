import { supabase } from './supabaseClient.js';

export async function syncFoundationRecord(record) {
  if (!supabase) return { skipped: true };
  const { error } = await supabase.from('kfe_records').upsert({
    id: record.id,
    user_id: record.user_id,
    created_at: record.created_at,
    updated_at: record.updated_at,
    synced: true,
    is_deleted: record.is_deleted,
    module: record.module,
    payload: record
  }, { onConflict: 'id' });
  if (error) throw error;
  return { synced: true };
}
