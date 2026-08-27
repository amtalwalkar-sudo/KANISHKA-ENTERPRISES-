import { db } from '../db/database.js';

export function createModuleRepository(moduleName) {
  const table = () => db.records;
  return {
    name: moduleName,
    async get(id) { return table().get(id); },
    async list() { return table().where('module').equals(moduleName).toArray(); },
    async put(record) { return table().put({ ...record, module: moduleName }); },
    async softDelete(id) {
      const current = await table().get(id);
      if (!current) return;
      await table().put({ ...current, is_deleted: true, synced: false, updated_at: new Date().toISOString() });
    }
  };
}

export const moduleRepositories = Object.fromEntries(
  Array.from({ length: 7 }, (_, index) => {
    const name = `module${index + 1}`;
    return [name, createModuleRepository(name)];
  })
);
