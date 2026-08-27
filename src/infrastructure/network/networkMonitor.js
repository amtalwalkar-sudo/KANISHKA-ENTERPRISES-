let online = typeof navigator !== 'undefined' ? navigator.onLine : true;
const listeners = new Set();

export function isOnline() { return online; }
export function onNetworkChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function installNetworkMonitor() {
  const update = (value) => {
    online = value;
    for (const listener of listeners) {
      try { listener(online); } catch { /* observers cannot break the monitor */ }
    }
  };
  const onOnline = () => update(true);
  const onOffline = () => update(false);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
