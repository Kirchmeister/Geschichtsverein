import {randomUUID} from 'node:crypto';
const key='admin-succession';
const defaults={enabled:false,weeks:4,startedAt:null,revision:''};
function fail(message){return Object.assign(Error(message),{publicMessage:message})}
export function successionPolicy(db){const row=db.prepare('SELECT data FROM archive_settings WHERE key=?').get(key);if(!row)return {...defaults};try{const p=JSON.parse(row.data);if(typeof p.enabled!=='boolean'||!Number.isInteger(p.weeks)||p.weeks<1||p.weeks>52||typeof p.revision!=='string'||p.enabled&&!Number.isFinite(Date.parse(p.startedAt)))return {...defaults};return {enabled:p.enabled,weeks:p.weeks,startedAt:p.enabled?p.startedAt:null,revision:p.revision}}catch{return {...defaults}}}
export function successionStatus(db,now=Math.floor(Date.now()/1000)){
 const p=successionPolicy(db);if(!p.enabled)return {eligible:false,reason:'Die Administrator-Vertretung ist nicht aktiviert.',availableAt:null};let baseline=Date.parse(p.startedAt);
 const logins=db.prepare("SELECT s.data FROM archive_settings s JOIN linux_accounts a ON s.key='admin-login:'||a.id JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.disabled=0 AND u.role='admin' AND NOT EXISTS(SELECT 1 FROM archive_settings d WHERE d.key='deleted-account:'||a.id)").all();
 for(const row of logins){try{const time=Date.parse(JSON.parse(row.data).at);if(!Number.isFinite(time))throw Error();baseline=Math.max(baseline,time)}catch{return {eligible:false,reason:'Die Administrator-Anmeldung konnte nicht sicher geprüft werden. Bitte die Administration kontaktieren.',availableAt:null}}}
 const availableAt=new Date(baseline+p.weeks*7*86400000).toISOString(),eligible=now*1000>=Date.parse(availableAt);return {eligible,reason:eligible?'Die Wartezeit ist abgelaufen. Eine Hochstufung ist mit Ihrem eigenen Passkey möglich.':'Die Wartezeit seit Aktivierung oder letzter Administrator-Anmeldung ist noch nicht abgelaufen.',availableAt};
}
export function requireSuccession(db,now){const status=successionStatus(db,now);if(!status.eligible)throw fail(status.reason);return {revision:successionPolicy(db).revision,availableAt:status.availableAt}}
export function recordAdministratorLogin(db,actor,now=Math.floor(Date.now()/1000)){
 const at=new Date(now*1000).toISOString();db.prepare("INSERT INTO archive_settings(key,data,updated,updated_by) SELECT ?,?,?,? FROM linux_accounts a JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.id=? AND a.disabled=0 AND u.role='admin' AND NOT EXISTS(SELECT 1 FROM archive_settings d WHERE d.key='deleted-account:'||a.id) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated=excluded.updated,updated_by=excluded.updated_by").run('admin-login:'+actor,JSON.stringify({at}),at,actor,actor);
}
export function saveSuccession(db,actor,{enabled,weeks,expectedRevision},now=Math.floor(Date.now()/1000)){
 if(typeof enabled!=='boolean'||!Number.isInteger(weeks)||weeks<1||weeks>52||typeof expectedRevision!=='string')throw fail('Bitte eine Wartezeit von 1 bis 52 ganzen Wochen angeben.');
 db.exec('BEGIN IMMEDIATE');try{
 if(!db.prepare("SELECT 1 FROM linux_accounts a JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.id=? AND a.disabled=0 AND u.role='admin'").get(actor))throw fail('Nur Administratoren dürfen diese Einstellung ändern.');
 const old=successionPolicy(db);if(old.revision!==expectedRevision)throw Object.assign(fail('Die Einstellung wurde inzwischen geändert. Bitte neu laden.'),{status:409});
 if(old.enabled===enabled&&old.weeks===weeks){db.exec('COMMIT');return {...old,status:successionStatus(db,now)}}
 const at=new Date(now*1000).toISOString(),next={enabled,weeks,startedAt:enabled?at:null,revision:randomUUID()};db.prepare('INSERT INTO archive_settings VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated=excluded.updated,updated_by=excluded.updated_by').run(key,JSON.stringify(next),at,actor);db.exec('COMMIT');return {...next,status:successionStatus(db,now)};
 }catch(e){try{db.exec('ROLLBACK')}catch{}throw e}
}
