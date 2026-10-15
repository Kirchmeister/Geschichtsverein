import {randomUUID} from 'node:crypto';
const eventPrefix='admin-security-event:',mailPrefix='admin-security-mail:';
const iso=now=>new Date(now*1000).toISOString();
function put(db,key,data,now,actor){db.prepare('INSERT INTO archive_settings(key,data,updated,updated_by) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated=excluded.updated,updated_by=excluded.updated_by').run(key,JSON.stringify(data),iso(now),actor)}
export function activeAdministrators(db){return db.prepare("SELECT a.id,a.name,a.email FROM linux_accounts a JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.disabled=0 AND u.role='admin' AND NOT EXISTS(SELECT 1 FROM archive_settings d WHERE d.key='deleted-account:'||a.id) ORDER BY a.id").all()}
// Called only within the business transaction. Internal messages and email outbox roll back together.
export function adminSecurityNotice(db,{kind,actor,target,old,next,availableAt,recipients=activeAdministrators(db)},now){
 const issuer=db.prepare('SELECT id,name FROM linux_accounts WHERE id=?').get(actor),id=randomUUID(),at=iso(now),subject=kind==='succession'?'Administrator-Nachfolge durchgeführt':'Administrator-Vertretung geändert';
 const body=[subject,'Zeitpunkt: '+at,'Handelndes Konto: '+issuer.name+' ('+issuer.id+')',kind==='succession'?'Hochgestuftes Konto: '+target.name+' ('+target.id+')':'Bisher: '+(old.enabled?'aktiviert':'ausgeschaltet')+', '+old.weeks+' Wochen\nNeu: '+(next.enabled?'aktiviert':'ausgeschaltet')+', '+next.weeks+' Wochen',availableAt?'Neue frühestmögliche Nachfolge: '+availableAt:'Keine Nachfolge freigeschaltet.','Falls diese Änderung unerwartet ist: Melden Sie sich über die bekannte Vereinsadresse an, prüfen Sie Konten und Administrator-Vertretung und kontaktieren Sie die Vereinsadministration bzw. den Serverbetreiber. Widerrufen Sie bei Verdacht die betroffenen Sitzungen und prüfen Sie die Passkeys.'].join('\n\n');
 put(db,eventPrefix+id,{id,kind,at,actor:{id:issuer.id,name:issuer.name},target:target?{id:target.id,name:target.name}:undefined,old,next,availableAt,recipients:recipients.map(r=>r.id)},now,actor);
 db.prepare("INSERT OR IGNORE INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES('system-admin-security','system','admin-security','Archiv-Sicherheit',?,'user')").run(at);
 for(const r of recipients){const thread=randomUUID();db.prepare('INSERT INTO archive_message_threads VALUES(?,?,?,1)').run(thread,subject,at);db.prepare('INSERT INTO archive_message_members(thread_id,account_id,name) VALUES(?,?,?)').run(thread,r.id,r.name);db.prepare("INSERT INTO archive_messages(thread_id,sender_id,sender_name,body,created) VALUES(?,'system-admin-security','Archiv-Sicherheit',?,?)").run(thread,body,at);
 const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)?r.email:null;put(db,mailPrefix+id+':'+r.id,{event:id,recipient:r.id,to:email,subject,body,state:email?'pending':'unavailable',attempts:0,nextAt:now,lastError:email?null:'Keine nutzbare E-Mail-Adresse hinterlegt.',lease:null},now,actor);}
 return id;
}
export function securityDeliveryStatus(db){const rows=db.prepare("SELECT key,data,updated FROM archive_settings WHERE key LIKE 'admin-security-mail:%' ORDER BY updated DESC,key DESC LIMIT 100").all();return rows.map(r=>{const d=JSON.parse(r.data);return {id:r.key,recipient:d.recipient,state:d.state,attempts:d.attempts,nextAt:d.nextAt,lastError:d.lastError,updated:r.updated}})}
export function retrySecurityMail(db,id,now=Math.floor(Date.now()/1000)){
 const row=db.prepare('SELECT data FROM archive_settings WHERE key=? AND key LIKE ?').get(id,mailPrefix+'%');if(!row)throw Error('Versandauftrag nicht gefunden.');const d=JSON.parse(row.data);if(!d.to||!['failed','blocked'].includes(d.state))throw Error('Dieser Versandauftrag kann derzeit nicht erneut versucht werden.');d.state='pending';d.attempts=0;d.nextAt=now;d.lastError=null;d.lease=null;db.prepare('UPDATE archive_settings SET data=?,updated=? WHERE key=? AND data=?').run(JSON.stringify(d),iso(now),id,row.data);
}
export async function deliverSecurityMail(db,{ready,send,now=()=>Math.floor(Date.now()/1000),limit=10}){
 let sent=0,failed=0;
 for(let i=0;i<limit;i++){
 const time=now();let job;
 db.exec('BEGIN IMMEDIATE');try{
 const row=db.prepare("SELECT key,data FROM archive_settings WHERE key LIKE 'admin-security-mail:%' AND json_extract(data,'$.state') IN ('pending','retry','sending','blocked') AND json_extract(data,'$.nextAt')<=? ORDER BY updated,key LIMIT 1").get(time);
 if(!row){db.exec('COMMIT');break}const d=JSON.parse(row.data);
 if(!ready){d.state='blocked';d.lastError='E-Mail-Versand nicht eingerichtet. Interne Nachricht ist gespeichert.';d.nextAt=time+60;put(db,row.key,d,time,'system-admin-security');db.exec('COMMIT');continue}
 // A crashed/expired claim counts as an attempt too. SMTP can accept a message before a timeout.
 if(d.attempts>=8){d.state='failed';d.lastError='Versand nach acht Versuchen angehalten. SMTP prüfen und erneut versuchen.';put(db,row.key,d,time,'system-admin-security');db.exec('COMMIT');continue}
 d.state='sending';d.attempts++;d.lease=randomUUID();d.nextAt=time+300;put(db,row.key,d,time,'system-admin-security');job={key:row.key,data:d};db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e}
 const d=job.data;try{await send(d.to,d.subject,d.body);d.state='sent';d.lastError=null;sent++}catch{d.state=d.attempts>=8?'failed':'retry';d.lastError='E-Mail-Versand fehlgeschlagen. SMTP-Konfiguration und Serverprotokoll prüfen.';d.nextAt=now()+Math.min(3600,60*2**(d.attempts-1));failed++}
 // Only the current lease may acknowledge; other workers never overwrite a newer claim.
 db.prepare("UPDATE archive_settings SET data=?,updated=? WHERE key=? AND json_extract(data,'$.lease')=?").run(JSON.stringify({...d,lease:null}),iso(now()),job.key,job.data.lease);
 }
 return {sent,failed};
}
