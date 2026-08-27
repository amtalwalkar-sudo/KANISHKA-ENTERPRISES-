import { createViewModels } from './view-models/functionalViewModels.js';
import { outbox } from '../infrastructure/outbox/outbox.js';
import { startWork as domainStartWork, endWork as domainEndWork } from '../domain/work/work.js';

export function installRuntimeContract() {
  const viewModels = createViewModels();
  const workViewModel = viewModels.work;
  const runtime = {
    viewModels,
    outbox: { pending: () => outbox.pending() },
    actions: {}
  };

  const refresh = async () => {
    await Promise.all(Object.values(viewModels).map((vm) => vm.refresh()));
    return viewModels;
  };

  runtime.actions.startWork = async ({ id = crypto.randomUUID(), date = new Date().toISOString(), startOdo }) => {
    const record = domainStartWork({ id, date, startOdo });
    await workViewModel.save(record);
    await refresh();
    return record;
  };

  runtime.actions.endWork = async ({ id, endOdo }) => {
    const current = await workViewModel.get(id);
    if (!current) throw new Error(`WORK_NOT_FOUND: ${id}`);
    const record = domainEndWork(current, endOdo);
    await workViewModel.save(record);
    await refresh();
    return record;
  };

  runtime.refresh = refresh;
  window.__KFE_RUNTIME__ = runtime;
  window.KFE_VIEW_MODELS = viewModels;
  void refresh();
  return runtime;
}
