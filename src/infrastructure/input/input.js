export function assertPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_INPUT_OBJECT');
  return value;
}

export function assertNonEmptyString(value, code = 'INVALID_INPUT') {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(code);
  return value.trim();
}

export function assertInteger(value, code = 'INVALID_INTEGER') {
  if (!Number.isSafeInteger(value)) throw new Error(code);
  return value;
}
