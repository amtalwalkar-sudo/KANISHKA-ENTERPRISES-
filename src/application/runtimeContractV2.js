import { createFoundationViewModels } from './view-models/viewModels.js';
import { outbox } from '../infrastructure/outbox/outbox.js';

export function installRuntimeContract() {
  const viewModels = createFoundationViewModels();
  const runtime = { viewModels, outbox: { pending: () => outbox.pending() }, actions: {} };
  runtime.actions.save = async (moduleName, record = {}) => {
    const vm = viewModels[moduleName];
    if (!vm) throw new Error(`FOUNDATION_MODULE_NOT_FOUND: ${moduleName}`);
    return vm.save(record);
  };
  runtime.actions.remove = async (moduleName, id) => {
    const vm = viewModels[moduleName];
    if (!vm) throw new Error(`FOUNDATION_MODULE_NOT_FOUND: ${moduleName}`);
    return vm.remove(id);
  };
  runtime.refresh = async () => {
    await Promise.all(Object.values(viewModels).map((vm) => vm.refresh()));
    return viewModels;
  };
  window.__KFE_RUNTIME__ = runtime;
  window.KFE_VIEW_MODELS = viewModels;
  void runtime.refresh();
  return runtime;
}
