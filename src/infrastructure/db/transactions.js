import { db } from './database.js';

export async function withFoundationTransaction(work = {}) {
  const tables = [db.records, db.outbox];
  return db.transaction('rw', ...tables, async () => work({ records: db.records, outbox: db.outbox }));
}

export async function safeDexieWrite(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      const wrapped = new Error('STORAGE_QUOTA_EXCEEDED');
      wrapped.cause = error;
      wrapped.code = 'STORAGE_QUOTA_EXCEEDED';
      throw wrapped;
    }
    throw error;
  }
}
