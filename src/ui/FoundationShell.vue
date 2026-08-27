<script setup>
import { computed, onMounted, ref } from 'vue';

const runtime = window.__KFE_RUNTIME__;
const viewModels = runtime.viewModels;
const modules = computed(() => Object.keys(viewModels));
const offline = ref(!navigator.onLine);

window.addEventListener('online', () => { offline.value = false; });
window.addEventListener('offline', () => { offline.value = true; });

onMounted(() => runtime.refresh());
</script>

<template>
  <main class="shell">
    <header>
      <h1>KFE 2.0</h1>
      <p>Foundation UI shell</p>
      <div role="status">{{ offline ? 'Offline' : 'Online' }}</div>
    </header>
    <section aria-label="Foundation modules">
      <h2>View-model slots</h2>
      <ul><li v-for="name in modules" :key="name">{{ name }}</li></ul>
    </section>
  </main>
</template>
