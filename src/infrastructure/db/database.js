import Dexie from 'dexie';

export const db = new Dexie('kfe2');

db.version(1).stores({
  records: 'id,user_id,created_at,updated_at,synced,is_deleted',
  outbox: 'id,created_at,status,updated_at',
  crashLogs: 'id,created_at'
});

db.version(2).stores({
  records: 'id,user_id,created_at,updated_at,synced,is_deleted',
  outbox: 'id,created_at,status,updated_at',
  crashLogs: 'id,created_at'
});
