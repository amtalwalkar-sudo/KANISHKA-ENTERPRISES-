import { moduleRepositories } from '../../infrastructure/repositories/moduleRepository.js';
import { outbox } from '../../infrastructure/outbox/outbox.js';

const names = ['work', 'fuel', 'expenses', 'revenue', 'maintenance', 'loan', 'renewals'];

function createViewModel(name) {
  const repository = moduleRepositories[name];
  const state = { name, data: [], loading: false, error: null };
  return {
    ...state,
    repository,
    async refresh() {
      state.loading = true;
      state.error = null;
      try { state.data = await repository.list(); return state.data; }
      catch (error) { state.error = error instanceof Error ? error.message : String(error); throw error; }
      finally { state.loading = false; }
    },
    get(id) { return repository.get(id); },
    async save(record) {
      if (!record || typeof record !== 'object' || !record.id) throw new Error(`${name}: record.id is required`);
      await repository.put(record);
      await outbox.enqueue({ type: `${name.toUpperCase()}_UPSERTED`, record });
      await this.refresh();
      return record;
    },
    async remove(id) {
      await repository.delete(id);
      await outbox.enqueue({ type: `${name.toUpperCase()}_DELETED`, id });
      await this.refresh();
    }
  };
}

export function createViewModels() {
  return Object.fromEntries(names.map((name) => [name, createViewModel(name)]));
}
