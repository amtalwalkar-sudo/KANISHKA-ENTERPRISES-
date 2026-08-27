import { test, expect } from '@playwright/test';

async function pendingOutbox(page) {
  return page.evaluate(() => window.__KFE_RUNTIME__.outbox.pending());
}

test('production foundation: shell, seven VM boundary, metadata, persistence and offline outbox retry', async ({ page }) => {
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
  await expect(page.getByRole('heading', { name: 'KFE 2.0' })).toBeVisible();

  const contract = await page.evaluate(() => ({
    runtime: Boolean(window.__KFE_RUNTIME__),
    models: Object.keys(window.__KFE_RUNTIME__?.viewModels ?? {}),
    actions: Object.keys(window.__KFE_RUNTIME__?.actions ?? {})
  }));
  expect(contract.runtime).toBe(true);
  expect(contract.models).toEqual(['module1', 'module2', 'module3', 'module4', 'module5', 'module6', 'module7']);
  expect(contract.actions).toEqual(expect.arrayContaining(['save', 'remove']));

  await page.context().setOffline(true);
  const userId = await page.evaluate(() => crypto.randomUUID());
  const recordId = await page.evaluate(() => crypto.randomUUID());

  await page.evaluate(async ({ userId, recordId }) => {
    await window.__KFE_RUNTIME__.actions.save('module1', { id: recordId, user_id: userId, payload: { foundation: true } });
  }, { userId, recordId });

  const persisted = await page.evaluate(async (recordId) => window.__KFE_RUNTIME__.viewModels.module1.get(recordId), recordId);
  expect(persisted.id).toBe(recordId);
  expect(persisted.user_id).toBe(userId);
  expect(persisted.synced).toBe(false);
  expect(persisted.is_deleted).toBe(false);
  expect(persisted.created_at).toBeTruthy();
  expect(persisted.updated_at).toBeTruthy();

  const queued = await pendingOutbox(page);
  expect(queued.some((item) => item.payload?.record?.id === recordId)).toBe(true);

  await page.context().setOffline(false);
  await expect.poll(() => syncCalled, { timeout: 10000 }).toBe(true);
  expect(syncedPayload.record.id).toBe(recordId);
  expect(syncedPayload.record.user_id).toBe(userId);

  await expect.poll(async () => {
    const items = await pendingOutbox(page);
    return items.filter((item) => item.payload?.record?.id === recordId).length;
  }, { timeout: 10000 }).toBe(0);

  await expect.poll(async () => {
    const record = await page.evaluate(async (recordId) => window.__KFE_RUNTIME__.viewModels.module1.get(recordId), recordId);
    return record?.synced;
  }, { timeout: 10000 }).toBe(true);
});
