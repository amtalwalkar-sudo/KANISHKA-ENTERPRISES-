const SESSION_KEY = 'kfe2.identity';

export function getLocalIdentity() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function setLocalIdentity(identity) {
  if (!identity?.user_id) throw new Error('IDENTITY_USER_ID_REQUIRED');
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user_id: identity.user_id }));
}

export function clearLocalIdentity() {
  localStorage.removeItem(SESSION_KEY);
}
