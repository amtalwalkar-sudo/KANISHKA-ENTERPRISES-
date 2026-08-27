import { test, expect } from '@playwright/test';

async function clearKfeDatabase(page) {
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('kfe2');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  }));
}

async function pendingOutbox(page) {
  return page.evaluate(() => window.__KFE_RUNTIME__.outbox.pending());
}

test('production foundation: shell, VM boundary, persistence and offline outbox retry', async ({ page }) => {
  let syncCalled = false;
  let syncedPayload = null;

  await page.route('**/api/sync', async (route) => {
    syncCalled = true;
    syncedPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Kanishka Fleet ERP 2.0' })).toBeVisible();

  const contract = await page.evaluate(() => ({
    runtime: Boolean(window.__KFE_RUNTIME__),
    models: Object.keys(window.__KFE_RUNTIME__?.viewModels ?? {}),
    actions: Object.keys(window.__KFE_RUNTIME__?.actions ?? {})
  }));
  expect(contract.runtime).toBe(true);
  expect(contract.models).toEqual(expect.arrayContaining(['work', 'fuel', 'expenses', 'revenue', 'maintenance', 'loan', 'renewals']));
  expect(contract.actions).toEqual(expect.arrayContaining(['startWork', 'endWork']));

  await clearKfeDatabase(page);
  await page.reload();
  await expect(page.getByText('State: Off duty')).toBeVisible();

  await page.getByLabel('Start odometer').fill('12345');
  await page.getByRole('button', { name: 'Start Duty' }).click();
  await expect(page.getByText('State: On duty')).toBeVisible();
  await page.getByLabel('End odometer').fill('12350');
  await page.getByRole('button', { name: 'End Duty' }).click();
  await expect(page.getByText('State: Off duty')).toBeVisible();

  await page.reload();
  const persisted = await page.evaluate(async () => window.__KFE_RUNTIME__.viewModels.work.data);
  expect(persisted).toHaveLength(1);
  expect(persisted[0].status).toBe('Closed');
  expect(persisted[0].startOdo).toBe('12345');
  expect(persisted[0].endOdo).toBe('12350');

  await page.context().setOffline(true);
  await page.getByLabel('Start odometer').fill('20000');
  await page.getByRole('button', { name: 'Start Duty' }).click();
  await expect(page.getByText('State: On duty')).toBeVisible();

  const queued = await pendingOutbox(page);
  expect(queued.some((item) => item.payload?.record?.startOdo === '20000')).toBe(true);

  await page.context().setOffline(false);
  await expect.poll(() => syncCalled, { timeout: 10000 }).toBe(true);
  expect(syncedPayload.record.startOdo).toBe('20000');

  await expect.poll(async () => {
    const items = await pendingOutbox(page);
    return items.filter((item) => item.payload?.record?.startOdo === '20000').length;
  }, { timeout: 10000 }).toBe(0);
});
