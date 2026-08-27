import { db } from '../db/database.js';
import { utcNow } from '../time/utc.js';

export async function recordDiagnostic({ severity = 'error', category = 'runtime', message, context = null } = {}) {
  const event = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    created_at: utcNow(),
    severity,
    category,
    message: String(message ?? ''),
    context
  };
  try { await db.crashLogs.put(event); } catch { /* diagnostics must never crash the app */ }
  return event;
}

export function installGlobalErrorBoundary(onError = recordDiagnostic) {
  const errorHandler = (event) => { void onError({ category: 'window.error', message: event?.error?.message ?? event?.message ?? 'Unhandled error', context: { stack: event?.error?.stack } }); };
  const rejectionHandler = (event) => { void onError({ category: 'unhandledrejection', message: event?.reason?.message ?? String(event?.reason ?? 'Unhandled rejection') }); };
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', rejectionHandler);
  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', rejectionHandler);
  };
}
