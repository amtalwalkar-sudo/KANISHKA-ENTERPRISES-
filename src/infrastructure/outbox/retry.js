import {outbox} from './outbox.js';
export async function flushOutbox(send){if(!navigator.onLine)return {sent:0,skipped:true};let sent=0;for(const item of await outbox.pending()){try{await send(item.payload);await outbox.markDone(item.id);sent++}catch{break}}return {sent,skipped:false}}
