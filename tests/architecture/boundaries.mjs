import fs from 'node:fs';
const required=['package.json','vite.config.js','src/main.js','src/ui/App.vue','src/infrastructure/db/database.js','src/infrastructure/repositories/workRepository.js','src/infrastructure/outbox/outbox.js','src/infrastructure/outbox/retry.js','src/domain/work/work.js','src/application/view-models/viewModels.js','src/pwa/sw.js'];
for(const f of required)if(!fs.existsSync(f))throw new Error(`Missing architecture boundary: ${f}`);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const p of ['vue','dexie'])if(!pkg.dependencies?.[p])throw new Error(`Missing runtime dependency: ${p}`);
console.log('Architecture boundary gate: PASS');
