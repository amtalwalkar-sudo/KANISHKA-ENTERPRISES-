import { createApp } from 'vue';
import App from './ui/App.vue';
import './ui/styles.css';
import { installRuntimeContract } from './application/runtimeContract.js';
import { registerServiceWorker } from './pwa/register.js';

installRuntimeContract();
createApp(App).mount('#app');
void registerServiceWorker();
