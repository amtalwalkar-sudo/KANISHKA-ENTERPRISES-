import {db} from '../db/database.js';
export const workRepository={
  async get(id){return db.work.get(id)},
  async put(record){return db.work.put(record)},
  async delete(id){return db.work.delete(id)},
  async list(){return db.work.toArray()}
};
