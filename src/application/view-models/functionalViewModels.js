import { moduleRepositories } from '../../infrastructure/repositories/moduleRepository.js';
import { outbox } from '../../infrastructure/outbox/outbox.js';
import { foundationMetadata, touchMetadata } from '../../infrastructure/sync/metadata.js';

const names = Array.from({ length: 7 }, (_, index) => `module${index + 1}`);

function createViewModel(name) {
  const repository = moduleRepositories[name];
  const vm = { name, data: [], loading: false, error: null };

  vm.refresh = async () => {
    vm.loading = true;
    vm.error = null;
    try { vm.data = await repository.list(); return vm.data; }
    catch (error) { vm.error = error instanceof Error ? error.message : String(error); throw error; }
    finally { vm.loading = false; }
  };

  vm.get = (id) => repository.get(id);

  vm.save = async (record = {}) => {
    const id = record.id || globalThis.crypto.randomUUID();
    const existing = await repository.get(id);
    const normalized = existing
      ? { ...existing, ...record, ...touchMetadata(existing) }
      : { id, ...foundationMetadata(record.user_id), ...record };
    await repository.put(normalized);
    await outbox.enqueue({ action: 'UPSERT', module: name, record: normalized });
    await vm.refresh();
    return normalized;
  };

  vm.remove = async (id) => {
    const current = await repository.get(id);
    if (!current) return;
    const deleted = { ...current, is_deleted: true, synced: false, updated_at: new Date().toISOString() };
    await repository.put(deleted);
    await outbox.enqueue({ action: 'UPSERT', module: name, record: deleted });
    await vm.refresh();
  };

  return vm;
}

export function createViewModels() {
  return Object.fromEntries(names.map((name) => [name, createViewModel(name)]));
}
