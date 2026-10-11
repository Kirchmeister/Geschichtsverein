import {createHmac} from 'node:crypto';
import {env} from '@/lib/runtime-env';
export async function updateAgent(method:string,body=''){
 const e=env as any,u=new URL(e.ARCHIVE_UPDATER_URL);
 if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.pathname!=='/'||u.username||u.password||u.search||u.hash)throw Error('Ungültige Dienstadresse.');
 const time=String(Date.now()),nonce=crypto.randomUUID(),signature=createHmac('sha256',e.ARCHIVE_UPDATER_SECRET).update([time,nonce,method,'/updates',body].join('\n')).digest('hex');
 return fetch(new URL('/updates',u),{method,headers:{'Content-Type':'application/json','X-Archive-Time':time,'X-Archive-Nonce':nonce,'X-Archive-Signature':signature},...(body?{body}:{}),signal:AbortSignal.timeout(25000),redirect:'error'});
}
