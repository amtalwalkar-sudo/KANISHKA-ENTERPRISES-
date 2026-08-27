export function foundationMetadata(userId) {
  if (!userId || typeof userId !== 'string') throw new Error('FOUNDATION_USER_ID_REQUIRED');
  const now = new Date().toISOString();
  return { user_id: userId, created_at: now, updated_at: now, synced: false, is_deleted: false };
}

export function touchMetadata(record) {
  return { ...record, updated_at: new Date().toISOString(), synced: false };
}
