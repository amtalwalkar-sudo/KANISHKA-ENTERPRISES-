import { db } from '../db/database.js';

export async function exportFoundationBackup() {
  const records = await db.records.toArray();
  const outbox = await db.outbox.toArray();
  return JSON.stringify({
    format: 'kfe2-foundation-backup',
    version: 1,
    exported_at: new Date().toISOString(),
    records,
    outbox
  });
}

export async function restoreFoundationBackup(serialized) {
  const backup = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
  if (backup?.format !== 'kfe2-foundation-backup' || backup?.version !== 1) {
    throw new Error('INVALID_FOUNDATION_BACKUP');
  }
  await db.transaction('rw', db.records, db.outbox, async () => {
    if (Array.isArray(backup.records)) await db.records.bulkPut(backup.records);
    if (Array.isArray(backup.outbox)) await db.outbox.bulkPut(backup.outbox);
  });
}
