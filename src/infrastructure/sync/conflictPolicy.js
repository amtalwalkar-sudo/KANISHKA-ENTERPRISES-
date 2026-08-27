export function chooseNewer(localRecord, cloudRecord) {
  if (!localRecord) return cloudRecord;
  if (!cloudRecord) return localRecord;
  return new Date(localRecord.updated_at) >= new Date(cloudRecord.updated_at)
    ? localRecord
    : cloudRecord;
}
