import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
export const backupPath='/api/updates/backup';
export function signedBackupHeaders(secret,method,body='',time=String(Date.now()),nonce=randomUUID()){
 return {'Content-Type':'application/json','X-Archive-Time':time,'X-Archive-Nonce':nonce,'X-Archive-Signature':createHmac('sha256',secret).update([time,nonce,method,backupPath,body].join('\n')).digest('hex')};
}
export function verifyBackupRequest(secret,method,body,headers,nonces,now=Date.now()){
 const time=headers.get('x-archive-time'),nonce=headers.get('x-archive-nonce'),signature=headers.get('x-archive-signature');
 if(!/^[a-f0-9]{64}$/.test(secret||'')||headers.has('origin')||!/^\d{13}$/.test(time||'')||Math.abs(now-Number(time))>60000||!/^[-\w]{36}$/.test(nonce||'')||!/^[a-f0-9]{64}$/.test(signature||'')||nonces.has(nonce))return false;
 const expected=signedBackupHeaders(secret,method,body,time,nonce)['X-Archive-Signature'];
 if(!timingSafeEqual(Buffer.from(expected),Buffer.from(signature)))return false;
 for(const [n,t] of nonces)if(t<now-60000)nonces.delete(n);
 nonces.set(nonce,now);return true;
}
export function updateBackupClient({secret,appPort},request=fetch){
 if(!Number.isInteger(appPort)||appPort<1024||appPort>65535)throw Error('Ungültiger Archivport.');
 return async(method,data)=>{const body=data?JSON.stringify(data):'';const response=await request('http://127.0.0.1:'+appPort+backupPath,{method,headers:signedBackupHeaders(secret,method,body),...(body?{body}:{}),redirect:'error',signal:AbortSignal.timeout(150000)});if(!response.ok)throw Error('Nextcloud-Sicherung vor dem Update nicht verfügbar (HTTP '+response.status+').');return response.json()};
}
export async function runUpdateBackup(client,jobId,report,{timeout=7200000}={}){
 const started=Date.now();while(Date.now()-started<timeout){let result;try{result=await client('POST',{jobId})}catch(e){throw Error('Nextcloud-Sicherung unterbrochen: '+e.message)}
 if(result.status==='error')throw Error('Nextcloud-Sicherung fehlgeschlagen: '+String(result.error||'Bitte Sicherungsstatus prüfen.').slice(0,250));
 if(!['copying','verifying','uploading','complete'].includes(result.status))throw Error('Ungültiger Nextcloud-Sicherungsstatus.');
 await report(result);
 if(result.status==='complete'){if(!Number.isFinite(Date.parse(result.verified))||typeof result.id!=='string'||!result.id)throw Error('Nextcloud-Sicherung ist nicht vollständig geprüft.');return {id:result.id,verified:result.verified,version:result.version};}
 }
 throw Error('Nextcloud-Sicherung dauert zu lange. Update abgebrochen; Sicherung kann unter Backups fortgesetzt werden.');
}
