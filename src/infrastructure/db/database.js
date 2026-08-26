import Dexie from 'dexie';
export const db=new Dexie('kfe2');
db.version(1).stores({work:'id,date,status',fuel:'id,date',expenses:'id,date',revenue:'id,date',maintenance:'id,date',loans:'id,date',renewals:'id,date',outbox:'++id,createdAt,status',crashLogs:'++id,createdAt'});
