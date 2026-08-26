import { createViewModels } from './view-models/viewModels.js';
import { workRepository } from '../infrastructure/repositories/workRepository.js';
import { startWork as domainStartWork, endWork as domainEndWork } from '../domain/work/work.js';
import { outbox } from '../infrastructure/outbox/outbox.js';

export function installRuntimeContract() {
  const viewModels = createViewModels();
  const runtime = { viewModels, repository: workRepository, dashboard: { workKm: 0, workSessions: 0 }, actions: {} };
  const refresh = async () => {
    const records = await workRepository.list();
    viewModels.work.data = records;
    runtime.dashboard = { workKm: records.reduce((sum, r) => sum + (Number(r.km) || 0), 0), workSessions: records.length };
    window.KFE_DASHBOARD_SNAPSHOT = runtime.dashboard;
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
