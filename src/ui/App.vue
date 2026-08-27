<script setup>
import { ref, computed, onMounted } from 'vue';
const runtime = window.__KFE_RUNTIME__;
const viewModels = runtime.viewModels;
const modules = computed(() => Object.keys(viewModels));
const onDuty = ref(false);
const offline = ref(!navigator.onLine);
const startOdo = ref('');
const endOdo = ref('');
const activeId = ref(null);
const lastError = ref('');
const dashboard = ref({ ...runtime.dashboard });
window.addEventListener('online', () => { offline.value = false; });
window.addEventListener('offline', () => { offline.value = true; });

onMounted(async () => {
  try {
    await runtime.refresh();
    dashboard.value = { ...runtime.dashboard };
  } catch (e) {
    lastError.value = e instanceof Error ? e.message : String(e);
  }
});

async function start() {
  lastError.value = '';
  try {
    const value = Number(startOdo.value);
    if (!Number.isFinite(value) || value < 0) throw new Error('Starting odometer must be a non-negative number');
    const record = await runtime.actions.startWork({ startOdo: value });
    activeId.value = record.id; onDuty.value = true; dashboard.value = { ...runtime.dashboard };
  } catch (e) { lastError.value = e.message; }
}

async function end() {
  lastError.value = '';
  try {
    const value = Number(endOdo.value);
    if (!Number.isFinite(value) || value < 0) throw new Error('Ending odometer must be a non-negative number');
    await runtime.actions.endWork({ id: activeId.value, endOdo: value });
    activeId.value = null; onDuty.value = false; dashboard.value = { ...runtime.dashboard };
  } catch (e) { lastError.value = e.message; }
}
</script>
<template><main class="shell">
<header><h1>Kanishka Fleet ERP 2.0</h1><p>Core operational shell</p><div role="status">{{ offline ? 'Offline' : 'Online' }}</div></header>
<section><h2>On-Duty</h2><label>Start odometer <input v-model="startOdo" inputmode="decimal" type="number" min="0"></label><button v-if="!onDuty" type="button" @click="start">Start Duty</button><label v-else>End odometer <input v-model="endOdo" inputmode="decimal" type="number" min="0"></label><button v-if="onDuty" type="button" @click="end">End Duty</button><p>State: {{ onDuty ? 'On duty' : 'Off duty' }}</p><p v-if="lastError" role="alert">{{ lastError }}</p></section>
<section><h2>Dashboard</h2><p>Work sessions: <strong>{{ dashboard.workSessions }}</strong></p><p>Work KM: <strong>{{ dashboard.workKm }}</strong></p></section>
<nav aria-label="Modules"><ul><li v-for="name in modules" :key="name">{{ name }}</li></ul></nav>
</main></template>
