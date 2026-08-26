import {db} from '../db/database.js';
export const outbox={enqueue(payload){return db.outbox.add({payload,createdAt:Date.now(),status:'pending'})},async pending(){return db.outbox.where('status').equals('pending').toArray()},async markDone(id){return db.outbox.update(id,{status:'done'})}};
