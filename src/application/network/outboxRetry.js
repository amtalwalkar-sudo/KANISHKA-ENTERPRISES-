import { outbox } from '../../infrastructure/outbox/outbox.js';
import { db } from '../../infrastructure/db/database.js';
import { createSyncEnvelope } from '../../infrastructure/sync/syncProtocol.js';

let running = false;

export async function syncRecordToApi(payload, { fetchImpl = globalThis.fetch, endpoint = '/api/sync' } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('SYNC_TRANSPORT_UNAVAILABLE: fetch is not available.');
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`SYNC_TRANSPORT_FAILED: HTTP ${response.status}`);
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return {ok: true};
}

export async function retryOutbox(send = syncRecordToApi, { batchSize = 25 } = {}) {
  if (running || typeof send !== 'function') return {attempted: 0, completed: 0, failed: 0};
  running = true;
  try {
    const pending = (await outbox.pending()).slice(0, batchSize);
    let completed = 0;
    let failed = 0;
    for (const message of pending) {
      try {
        await outbox.claim(message.id);
        await send(createSyncEnvelope(message.payload, message.operation || 'upsert'));
        const recordId = message.record_id || message.payload?.record?.id;
        if (recordId) await db.records.update(recordId, { synced: true, updated_at: message.payload?.record?.updated_at });
        await outbox.markDone(message.id);
        completed += 1;
      } catch (error) {
        await outbox.markFailed(message.id, error, message.attempts || 0);
        failed += 1;
      }
    }
    return {attempted: pending.length, completed, failed};
  } finally {
    running = false;
  }
}

export function installNetworkRetry(send = syncRecordToApi) {
  const run = () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    void retryOutbox(send);
  };
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', run);
  return () => window.removeEventListener('online', run);
}
