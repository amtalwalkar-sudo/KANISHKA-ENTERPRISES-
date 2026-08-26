<script setup>
import {ref,computed} from 'vue';
import {createViewModels} from '../application/view-models/viewModels.js';
const viewModels=createViewModels();
const onDuty=ref(false); const offline=ref(!navigator.onLine);
const modules=computed(()=>Object.keys(viewModels));
const toggle=()=>{onDuty.value=!onDuty.value};
window.addEventListener('online',()=>offline.value=false); window.addEventListener('offline',()=>offline.value=true);
</script>
<template><main class="shell"><header><h1>Kanishka Fleet ERP 2.0</h1><p>Core operational shell</p><div role="status">{{ offline?'Offline':'Online' }}</div></header><section><h2>On-Duty</h2><button type="button" @click="toggle">{{onDuty?'End Duty':'Start Duty'}}</button><p>State: {{onDuty?'On duty':'Off duty'}}</p></section><nav aria-label="Modules"><ul><li v-for="name in modules" :key="name">{{name}}</li></ul></nav></main></template>
