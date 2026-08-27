import { createApp } from 'vue';
import App from './ui/FoundationShell.vue';
import './ui/styles.css';
import { installRuntimeContract } from './application/runtimeContractV2.js';
import { installNetworkRetry, syncRecordToApi } from './application/network/outboxRetry.js';
import { registerServiceWorker } from './pwa/register.js';
import { installNetworkMonitor } from './infrastructure/network/networkMonitor.js';
import { requestPersistentStorage } from './infrastructure/storage/storageHealth.js';
import { installGlobalErrorBoundary } from './infrastructure/diagnostics/diagnostics.js';

installRuntimeContract();
installNetworkMonitor();
installNetworkRetry(syncRecordToApi);
void requestPersistentStorage();
installGlobalErrorBoundary();
createApp(App).mount('#app');
void registerServiceWorker();
