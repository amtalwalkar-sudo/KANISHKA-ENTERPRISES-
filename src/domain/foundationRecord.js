function clientUuid() {
  const value = globalThis.crypto?.randomUUID?.();
  if (!value) throw new Error('FOUNDATION_UUID_UNAVAILABLE');
  return value;
}

export function createFoundationRecord(input = {}) {
  if (!input || typeof input !== 'object') throw new Error('FOUNDATION_RECORD_INVALID');
  const now = new Date().toISOString();
  const id = input.id ?? clientUuid();
  const userId = input.user_id;
  if (!userId || typeof userId !== 'string') throw new Error('FOUNDATION_USER_ID_REQUIRED');

  return {
    ...input,
    id,
    user_id: userId,
    created_at: input.created_at ?? now,
    updated_at: now,
    synced: false,
    is_deleted: input.is_deleted === true
  };
}

export function markDeleted(record) {
  return {
    ...record,
    is_deleted: true,
    updated_at: new Date().toISOString(),
    synced: false
  };
}
