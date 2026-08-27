export async function getStorageHealth() {
  if (!navigator.storage?.estimate) return { supported: false, persistent: false, usage: null, quota: null, ratio: null };
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage ?? 0;
  const quota = estimate.quota ?? 0;
  return {
    supported: true,
    persistent: navigator.storage.persisted ? await navigator.storage.persisted() : false,
    usage,
    quota,
    ratio: quota > 0 ? usage / quota : null
  };
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  try { return await navigator.storage.persist(); } catch { return false; }
}

export function isQuotaExceeded(error) {
  return error?.name === 'QuotaExceededError' || /quota|storage.*full/i.test(String(error?.message ?? ''));
}
