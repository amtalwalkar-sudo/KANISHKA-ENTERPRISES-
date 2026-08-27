export function toMinorUnits(value) {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('INVALID_MONEY');
    return Math.round(value * 100);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error('INVALID_MONEY');
    return Math.round(parsed * 100);
  }
  throw new Error('INVALID_MONEY');
}

export function fromMinorUnits(value) {
  if (!Number.isInteger(value)) throw new Error('INVALID_MINOR_UNITS');
  return value / 100;
}

export function assertMinorUnits(value) {
  if (!Number.isSafeInteger(value)) throw new Error('INVALID_MINOR_UNITS');
  return value;
}
