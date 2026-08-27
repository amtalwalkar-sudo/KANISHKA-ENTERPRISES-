import { db } from '../db/database.js';
import { newClientUuid } from '../../domain/foundationRecord.js';

const now = () => new Date().toISOString();

function nextRetry(attempts) {
  const delay = Math.min(60_000, 1_000 * (2 ** Math.min(attempts, 6)));
  return new Date(Date.now() + delay).toISOString();
}

export const outbox = {
  async enqueue(payload, { record_id = null, user_id = null, operation = 'upsert' } = {}) {
    const timestamp = now();
    const idempotency_key = newClientUuid();
    try {
      return await db.outbox.add({
        id: newClientUuid(),
        record_id,
        user_id,
        operation,
        payload,
        created_at: timestamp,
        updated_at: timestamp,
        next_retry_at: timestamp,
        idempotency_key,
        attempts: 0,
        status: 'pending',
        last_error: null
      });
    } catch (error) {
      throw Object.assign(new Error('OUTBOX_WRITE_FAILED'), { cause: error });
    }
  },

  async pending() {
    const timestamp = now();
    return db.outbox
      .where('status').equals('pending')
      .filter(item => !item.next_retry_at || item.next_retry_at <= timestamp)
      .toArray();
  },

  async claim(id) {
    return db.outbox.update(id, { status: 'processing', updated_at: now() });
  },

  async markDone(id) {
    return db.outbox.update(id, { status: 'done', updated_at: now(), last_error: null });
  },

  async markFailed(id, error, attempts = 0) {
    const count = attempts + 1;
    return db.outbox.update(id, {
      status: 'pending',
      attempts: count,
      last_error: error instanceof Error ? error.message : String(error),
      next_retry_at: nextRetry(count),
      updated_at: now()
    });
  },

  async countPending() {
    return db.outbox.where('status').equals('pending').count();
  }
};
