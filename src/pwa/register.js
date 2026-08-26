export function registerServiceWorker(){if('serviceWorker' in navigator) return navigator.serviceWorker.register('/sw.js',{scope:'/'});return null}
