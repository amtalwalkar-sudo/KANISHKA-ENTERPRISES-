import { createViewModels } from './view-models/functionalViewModels.js';
import { moduleRepositories } from '../infrastructure/repositories/moduleRepository.js';
import { startWork as domainStartWork, endWork as domainEndWork } from '../domain/work/work.js';
import { outbox } from '../infrastructure/outbox/outbox.js';

export function installRuntimeContract() {
  const viewModels = createViewModels();
  const workRepository = moduleRepositories.work;
  const runtime = { viewModels, repository: workRepository, outbox: { pending: () => outbox.pending() }, dashboard: { workKm: 0, workSessions: 0 }, actions: {} };

  const refresh = async () => {
    await Promise.all(Object.values(viewModels).map((vm) => vm.refresh()));
    const records = viewModels.work.data;
    Object.assign(runtime.dashboard, {
      workKm: records.reduce((sum, r) => sum + (Number(r.km) || 0), 0),
      workSessions: records.length
    });
    window.KFE_DASHBOARD_SNAPSHOT = { ...runtime.dashboard };
    return runtime.dashboard;
  };

  runtime.actions.startWork = async ({ id = crypto.randomUUID(), date = new Date().toISOString(), startOdo }) => {
    const record = domainStartWork({ id, date, startOdo });
    await workRepository.put(record);
    await outbox.enqueue({ type: 'WORK_CREATED', record });
    await refresh();
    return record;
  };

  runtime.actions.endWork = async ({ id, endOdo }) => {
    const current = await workRepository.get(id);
    if (!current) throw new Error(`WORK_NOT_FOUND: ${id}`);
    const record = domainEndWork(current, endOdo);
    await workRepository.put(record);
    await outbox.enqueue({ type: 'WORK_UPDATED', record });
    await refresh();
    return record;
  };

  runtime.refresh = refresh;
  window.__KFE_RUNTIME__ = runtime;
  window.KFE_VIEW_MODELS = viewModels;
  void refresh();
  return runtime;
}
