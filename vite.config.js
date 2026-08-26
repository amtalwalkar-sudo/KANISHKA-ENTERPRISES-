import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[vue(),VitePWA({registerType:'autoUpdate',manifest:{name:'Kanishka Fleet ERP 2.0',short_name:'KFE 2.0',start_url:'/',display:'standalone',theme_color:'#111827',background_color:'#ffffff',icons:[]}})]});
