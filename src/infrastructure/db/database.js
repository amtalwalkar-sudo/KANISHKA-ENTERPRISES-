import Dexie from 'dexie';

export const db = new Dexie('kfe2');

db.version(1).stores({
  work: 'id,date,status', fuel: 'id,date', expenses: 'id,date', revenue: 'id,date',
  maintenance: 'id,date', loans: 'id,date', renewals: 'id,date',
  outbox: '++id,createdAt,status', crashLogs: '++id,createdAt'
});

db.version(2).stores({
  work: null, fuel: null, expenses: null, revenue: null, maintenance: null, loans: null, renewals: null,
  outbox: null, crashLogs: null
});

db.version(3).stores({
  records: 'id,user_id,created_at,updated_at,synced,is_deleted,module',
  outbox: 'id,created_at,status,updated_at',
  crashLogs: 'id,created_at'
});
