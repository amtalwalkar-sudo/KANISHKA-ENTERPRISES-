import { moduleRepositories } from '../../infrastructure/repositories/moduleRepository.js';
import { outbox } from '../../infrastructure/outbox/outbox.js';

const names = ['work', 'fuel', 'expenses', 'revenue', 'maintenance', 'loan', 'renewals'];

function createViewModel(name) {
  const repository = moduleRepositories[name];
  const vm = { name, data: [], loading: false, error: null, repository };

  vm.refresh = async () => {
    vm.loading = true;
    vm.error = null;
    try { vm.data = await repository.list(); return vm.data; }
    catch (error) { vm.error = error instanceof Error ? error.message : String(error); throw error; }
    finally { vm.loading = false; }
  };
  vm.get = (id) => repository.get(id);
  vm.save = async (record) => {
    if (!record || typeof record !== 'object' || !record.id) throw new Error(`${name}: record.id is required`);
    await repository.put(record);
    await outbox.enqueue({ type: `${name.toUpperCase()}_UPSERTED`, record });
    await vm.refresh();
    return record;
  };
  vm.remove = async (id) => {
    await repository.delete(id);
    await outbox.enqueue({ type: `${name.toUpperCase()}_DELETED`, id });
    await vm.refresh();
  };
  return vm;
}

export function createViewModels() {
  return Object.fromEntries(names.map((name) => [name, createViewModel(name)]));
}
