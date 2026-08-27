import fs from 'node:fs';

const required = [
  'package.json',
  'vite.config.js',
  'src/main.js',
  'src/ui/FoundationShell.vue',
  'src/infrastructure/db/database.js',
  'src/infrastructure/repositories/moduleRepository.js',
  'src/infrastructure/outbox/outbox.js',
  'src/infrastructure/outbox/retry.js',
  'src/application/view-models/viewModels.js',
  'src/application/runtimeContract.js',
  'src/infrastructure/sync/metadata.js',
  'src/infrastructure/sync/supabaseClient.js',
  'supabase/foundation.sql',
  'public/sw.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing foundation boundary: ${file}`);
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const dependency of ['vue', 'dexie', '@supabase/supabase-js']) {
  if (!pkg.dependencies?.[dependency]) throw new Error(`Missing foundation dependency: ${dependency}`);
}

const ui = fs.readFileSync('src/ui/FoundationShell.vue', 'utf8');
if (/indexeddb|Dexie|localStorage|fetch\s*\(/i.test(ui)) throw new Error('UI directly accesses infrastructure');

const models = fs.readFileSync('src/application/view-models/functionalViewModels.js', 'utf8');
for (const name of Array.from({ length: 7 }, (_, i) => `module${i + 1}`)) {
  if (!models.includes(`module${name.slice(-1)}`)) throw new Error(`VIEW_MODEL_SLOT_MISSING: ${name}`);
}

const db = fs.readFileSync('src/infrastructure/db/database.js', 'utf8');
for (const field of ['id,user_id,created_at,updated_at,synced,is_deleted']) {
  if (!db.includes(field)) throw new Error(`METADATA_SCHEMA_MISSING: ${field}`);
}

console.log('Architecture foundation gate: PASS');
