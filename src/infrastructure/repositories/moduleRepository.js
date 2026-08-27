import { db } from '../db/database.js';
import { createFoundationRecord, markDeleted } from '../../domain/foundationRecord.js';

export function createModuleRepository(moduleName) {
  const table = () => db.records;
  return {
    name: moduleName,
    async get(id) { return table().get(id); },
    async list() { return table().where('module').equals(moduleName).toArray(); },
    async put(record) {
      const normalized = createFoundationRecord({ ...record, module: moduleName });
      return table().put(normalized);
    },
    async softDelete(id) {
      const current = await table().get(id);
      if (!current) return;
      await table().put(markDeleted(current));
    }
  };
}

export const moduleRepositories = Object.fromEntries(
  Array.from({ length: 7 }, (_, index) => {
    const name = `module${index + 1}`;
    return [name, createModuleRepository(name)];
  })
);
