import { outbox } from '../../infrastructure/outbox/outbox.js';

let running = false;

export async function retryOutbox(send, { batchSize = 25 } = {}) {
  if (running || typeof send !== 'function') return { attempted: 0, completed: 0, failed: 0 };
  running = true;
  try {
    const pending = (await outbox.pending()).slice(0, batchSize);
    let completed = 0;
    let failed = 0;
    for (const message of pending) {
      try {
        await send(message.payload);
        await outbox.markDone(message.id);
        completed += 1;
      } catch {
        failed += 1;
      }
    }
    return { attempted: pending.length, completed, failed };
  } finally {
    running = false;
  }
}

export function installNetworkRetry(send) {
  const run = () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    void retryOutbox(send);
  };
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', run);
  return () => window.removeEventListener('online', run);
}
