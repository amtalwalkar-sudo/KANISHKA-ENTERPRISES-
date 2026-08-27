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

window.addEventListener('online', () => { offline.value = false; });
window.addEventListener('offline', () => { offline.value = true; });

onMounted(async () => {
  try { await runtime.refresh(); }
  catch (e) { lastError.value = e instanceof Error ? e.message : String(e); }
});

async function start() {
  lastError.value = '';
  try {
    const record = await runtime.actions.startWork({ startOdo: startOdo.value });
    activeId.value = record.id;
    onDuty.value = true;
  } catch (e) { lastError.value = e instanceof Error ? e.message : String(e); }
}

async function end() {
  lastError.value = '';
  try {
    await runtime.actions.endWork({ id: activeId.value, endOdo: endOdo.value });
    activeId.value = null;
    onDuty.value = false;
  } catch (e) { lastError.value = e instanceof Error ? e.message : String(e); }
}
</script>

<template>
  <main class="shell">
    <header>
      <h1>Kanishka Fleet ERP 2.0</h1>
      <p>Core operational shell</p>
      <div role="status">{{ offline ? 'Offline' : 'Online' }}</div>
    </header>

    <section>
      <h2>On-Duty</h2>
      <label>Start odometer <input v-model="startOdo" inputmode="decimal" type="number"></label>
      <button v-if="!onDuty" type="button" @click="start">Start Duty</button>
      <label v-else>End odometer <input v-model="endOdo" inputmode="decimal" type="number"></label>
      <button v-if="onDuty" type="button" @click="end">End Duty</button>
      <p>State: {{ onDuty ? 'On duty' : 'Off duty' }}</p>
      <p v-if="lastError" role="alert">{{ lastError }}</p>
    </section>

    <nav aria-label="Modules">
      <ul><li v-for="name in modules" :key="name">{{ name }}</li></ul>
    </nav>
  </main>
</template>
