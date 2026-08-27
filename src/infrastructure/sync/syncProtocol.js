export const SYNC_PROTOCOL_VERSION = 1;

export function createSyncEnvelope(record, operation = 'upsert') {
  return {
    protocol_version: SYNC_PROTOCOL_VERSION,
    operation,
    idempotency_key: record.id,
    record
  };
}

export function shouldReplaceLocal(localRecord, cloudRecord) {
  if (!localRecord) return true;
  if (!cloudRecord) return false;
  const localTime = new Date(localRecord.updated_at).getTime();
  const cloudTime = new Date(cloudRecord.updated_at).getTime();
  if (cloudTime !== localTime) return cloudTime > localTime;
  if (Boolean(cloudRecord.is_deleted) !== Boolean(localRecord.is_deleted)) {
    return Boolean(cloudRecord.is_deleted);
  }
  return false;
}

export function mergeLww(localRecord, cloudRecord) {
  return shouldReplaceLocal(localRecord, cloudRecord) ? cloudRecord : localRecord;
}
