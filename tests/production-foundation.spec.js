import { test, expect } from 'playwright/test';

async function clearKfeDatabase(page) {
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('kfe2');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  }));
}

async function outboxPending(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('kfe2');
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('outbox')) return resolve(0);
      const tx = db.transaction('outbox', 'readonly');
      const get = tx.objectStore('outbox').getAll();
      get.onsuccess = () => resolve(get.result.filter((item) => item.status === 'pending').length);
      get.onerror = () => reject(get.error);
    };
    request.onerror = () => reject(request.error);
  }));
}

test('production foundation: UI, runtime contract, persistence, dashboard and offline outbox', async ({ page }) => {
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

  const started = await page.evaluate(() => window.__KFE_RUNTIME__.viewModels.work.data);
  expect(started).toHaveLength(1);
  expect(started[0].startOdo).toBe(12345);

  await page.getByLabel('End odometer').fill('12350');
  await page.getByRole('button', { name: 'End Duty' }).click();
  await expect(page.getByText('State: Off duty')).toBeVisible();
  await expect(page.getByText('Work sessions: 1')).toBeVisible();
  await expect(page.getByText('Work KM: 5')).toBeVisible();

  const persisted = await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('kfe2');
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('work', 'readonly');
      const get = tx.objectStore('work').getAll();
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
    };
    request.onerror = () => reject(request.error);
  }));
  expect(persisted).toHaveLength(1);
  expect(persisted[0].endOdo).toBe(12350);

  await page.reload();
  await expect(page.getByText('Work sessions: 1')).toBeVisible();
  await expect(page.getByText('Work KM: 5')).toBeVisible();

  await page.context().setOffline(true);
  await page.getByLabel('Start odometer').fill('20000');
  await page.getByRole('button', { name: 'Start Duty' }).click();
  await expect(page.getByText('State: On duty')).toBeVisible();
  expect(await outboxPending(page)).toBeGreaterThanOrEqual(1);

  await page.context().setOffline(false);
  await expect.poll(() => outboxPending(page), { timeout: 5000 }).toBeGreaterThanOrEqual(1);
});
