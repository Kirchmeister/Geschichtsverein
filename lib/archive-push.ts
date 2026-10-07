import {env} from '@/lib/runtime-env';
export function pushAvailable(){return (env as any).ARCHIVE_HOSTING_RUNTIME==='linux'}
export function pushService(){if(!pushAvailable())throw Error('Push ist auf dieser Umgebung nicht verfügbar.');return (env as any).ARCHIVE_PUSH_SERVICE}
export async function scanPush(){if(pushAvailable())try{pushService().scan()}catch{console.error('Push-Ereignisse konnten derzeit nicht verarbeitet werden.')}}
