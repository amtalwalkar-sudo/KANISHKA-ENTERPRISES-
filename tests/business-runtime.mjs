import { chromium } from 'playwright';
const base = process.env.KFE_BASE_URL || 'http://127.0.0.1:4173/';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
const errors=[]; page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto(base,{waitUntil:'networkidle'});
await page.waitForFunction(() => !!window.__KFE_RUNTIME__);
const contract = await page.evaluate(async () => ({
 keys:Object.keys(window.__KFE_RUNTIME__),
 models:Object.keys(window.__KFE_RUNTIME__.viewModels),
 actions:Object.keys(window.__KFE_RUNTIME__.actions),
 dashboard:window.KFE_DASHBOARD_SNAPSHOT
}));
const expected=['work','fuel','expenses','revenue','maintenance','loan','renewals'];
if(expected.some(x=>!contract.models.includes(x))) throw new Error(`Missing VM: ${JSON.stringify(contract)}`);
if(!contract.actions.includes('startWork')||!contract.actions.includes('endWork')) throw new Error(`Missing Work actions: ${JSON.stringify(contract.actions)}`);
await page.evaluate(async()=>{const db=window.__KFE_RUNTIME__.repository; for(const r of await db.list()) await db.delete(r.id); await window.__KFE_RUNTIME__.refresh()});
await page.evaluate(async()=>window.__KFE_RUNTIME__.actions.startWork({id:'runtime-proof-12345',startOdo:12345}));
const open=await page.evaluate(()=>window.__KFE_RUNTIME__.repository.get('runtime-proof-12345'));
if(!open||open.startOdo!==12345||open.status!=='Open') throw new Error(`Work start persistence failed: ${JSON.stringify(open)}`);
await page.reload({waitUntil:'networkidle'}); await page.waitForFunction(()=>!!window.__KFE_RUNTIME__); 
const afterReload=await page.evaluate(()=>window.__KFE_RUNTIME__.repository.get('runtime-proof-12345'));
if(!afterReload||afterReload.startOdo!==12345||afterReload.status!=='Open') throw new Error(`Repository persistence failed: ${JSON.stringify(afterReload)}`);
await page.evaluate(async()=>window.__KFE_RUNTIME__.actions.endWork({id:'runtime-proof-12345',endOdo:12395}));
const closed=await page.evaluate(()=>window.__KFE_RUNTIME__.repository.get('runtime-proof-12345'));
if(!closed||closed.status!=='Closed'||closed.km!==50) throw new Error(`Work end failed: ${JSON.stringify(closed)}`);
const dash=await page.evaluate(()=>window.KFE_DASHBOARD_SNAPSHOT);
if(dash.workKm!==50||dash.workSessions!==1) throw new Error(`Dashboard aggregation failed: ${JSON.stringify(dash)}`);
if(errors.length) throw new Error(`Browser console errors: ${errors.join(' | ')}`);
await browser.close(); console.log('Business runtime gate: PASS');
