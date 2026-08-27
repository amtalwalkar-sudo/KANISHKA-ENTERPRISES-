export function utcNow() {
  return new Date().toISOString();
}

export function normalizeUtc(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('INVALID_UTC_TIMESTAMP');
  return date.toISOString();
}

export function compareUtc(a, b) {
  return new Date(normalizeUtc(a)).getTime() - new Date(normalizeUtc(b)).getTime();
}
