import { db } from '../db/database.js';

const tableNames = {
  work: 'work',
  fuel: 'fuel',
  expenses: 'expenses',
  revenue: 'revenue',
  maintenance: 'maintenance',
  loan: 'loans',
  renewals: 'renewals'
};

export function createModuleRepository(moduleName) {
  const tableName = tableNames[moduleName];
  if (!tableName) throw new Error(`Unknown module: ${moduleName}`);

  const table = () => db.table(tableName);
  return {
    async get(id) { return table().get(id); },
    async list() { return table().toArray(); },
    async put(record) { return table().put(record); },
    async delete(id) { return table().delete(id); },
    async clear() { return table().clear(); }
  };
}

export const moduleRepositories = Object.fromEntries(
  Object.keys(tableNames).map((name) => [name, createModuleRepository(name)])
);
