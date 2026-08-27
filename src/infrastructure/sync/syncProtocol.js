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
  return new Date(cloudRecord.updated_at).getTime() > new Date(localRecord.updated_at).getTime();
}

export function mergeLww(localRecord, cloudRecord) {
  return shouldReplaceLocal(localRecord, cloudRecord) ? cloudRecord : localRecord;
}
