import { createApp } from 'vue';
import App from './ui/App.vue';
import './ui/styles.css';
import { installRuntimeContract } from './application/runtimeContractV2.js';
import { installNetworkRetry, syncRecordToApi } from './application/network/outboxRetry.js';
import { registerServiceWorker } from './pwa/register.js';

installRuntimeContract();
installNetworkRetry(syncRecordToApi);
createApp(App).mount('#app');
void registerServiceWorker();
