import { db } from '../db/database.js';

function uuid() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }

export const outbox = {
  async enqueue(payload) {
    const now = new Date().toISOString();
    return db.outbox.add({ id: uuid(), payload, created_at: now, updated_at: now, status: 'pending' });
  },
  async pending() { return db.outbox.where('status').equals('pending').toArray(); },
  async markDone(id) { return db.outbox.update(id, { status: 'done', updated_at: new Date().toISOString() }); }
};
