export function startWork({ id, date, startOdo }) {
  return { id, date, status: 'Open', startOdo, endOdo: null };
}

export function endWork(record, endOdo) {
  return { ...record, endOdo, status: 'Closed' };
}
