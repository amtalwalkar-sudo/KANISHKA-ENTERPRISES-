export function createFoundationRecord(input = {}) {
  if (!input || typeof input !== 'object') throw new Error('FOUNDATION_RECORD_INVALID');
  return { ...input };
}

export function markDeleted(record) {
  return { ...record, is_deleted: true, updated_at: new Date().toISOString(), synced: false };
}
