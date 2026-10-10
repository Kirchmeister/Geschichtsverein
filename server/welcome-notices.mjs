import {randomUUID,createHash} from 'node:crypto';
const key=id=>'welcome:'+id;
function state(db,id){const row=db.prepare('SELECT data FROM archive_settings WHERE key=?').get(key(id));return row?JSON.parse(row.data):null}
function save(db,id,s,now){db.prepare('INSERT INTO archive_settings(key,data,updated,updated_by) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated=excluded.updated').run(key(id),JSON.stringify(s),new Date(now).toISOString(),id)}
const iphoneGuide='Auf dem iPhone: Öffnen Sie diese Webseite in Safari. Tippen Sie auf Teilen → Zum Home-Bildschirm → Hinzufügen. Öffnen Sie anschließend das neue Symbol und melden Sie sich an. Push funktioniert ab iOS 16.4 in dieser installierten Web-App.';
const androidGuide='Unter Android: Öffnen Sie die Webseite in Chrome. Wählen Sie im Drei-Punkte-Menü App installieren oder Zum Startbildschirm hinzufügen und öffnen Sie anschließend das neue Symbol. In unterstützten Android-Browsern ist Push auch ohne Installation möglich.';
const activate='Tippen Sie unten auf Ihren Namen → Benachrichtigungen → Push aktivieren und bestätigen Sie Erlauben. Die Einrichtung ist freiwillig. Bei blockierten Mitteilungen prüfen Sie die Browser- bzw. iPhone-Mitteilungseinstellungen.';
function notice(db,id,name,subject,body,now){const sender='system-welcome',created=new Date(now).toISOString(),thread=randomUUID();db.prepare('INSERT OR IGNORE INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(sender,'system','welcome','Archiv-Benachrichtigung',created,'user');db.prepare('INSERT INTO archive_message_threads VALUES(?,?,?,1)').run(thread,subject,created);db.prepare('INSERT INTO archive_message_members(thread_id,account_id,name) VALUES(?,?,?)').run(thread,id,name);const m=db.prepare('INSERT INTO archive_messages(thread_id,sender_id,sender_name,body,created) VALUES(?,?,?,?,?)').run(thread,sender,'Archiv-Benachrichtigung',body,created);return {thread,messageId:Number(m.lastInsertRowid)}}
export function welcomeNotice(db,account,role,userAgent='',now=Date.now()){
 if(state(db,account.id))return;
 const platform=/iPhone|iPad|iPod/.test(userAgent)?'iphone':/Android/.test(userAgent)?'android':'other';
 const body=`Willkommen, ${account.name}!\n\nHier können Sie im Archiv recherchieren und Beiträge lesen. Ihre zugeordnete Rolle bestimmt die weiteren Möglichkeiten. Über Ihren Namen unten links öffnen Sie Ihr persönliches Menü.\n\n${platform==='iphone'?iphoneGuide:platform==='android'?androidGuide:iphoneGuide+'\n\n'+androidGuide}\n\n${role==='guest'?'Als Gast haben Sie lesenden Zugriff auf die für Gäste freigegebenen Felder und auf Mitteilungen von Admin oder Verwalter. Antworten sind nur über vorgegebene Auswahlfragen möglich. Push informiert Sie ausschließlich über neue interne Nachrichten.\n\n'+activate:activate}`;
 const n=notice(db,account.id,account.name,'Willkommen im Geschichtsarchiv',body,now);save(db,account.id,{...n,platform,readAt:null,remindedAt:null,device:null},now);
}
export function welcomeRead(db,actor,thread,lastId,now=Date.now()){const s=state(db,actor);if(s&&s.thread===thread&&lastId>=s.messageId&&s.readAt===null){s.readAt=now;save(db,actor,s,now)}}
export function welcomeDevice(db,actor,d,now=Date.now()){
 const s=state(db,actor);if(!s)return;
 if(!['iphone','android','other'].includes(d.platform)||typeof d.capable!=='boolean'||!['default','granted','denied','unsupported'].includes(d.permission)||typeof d.endpoint!=='string'||d.endpoint.length>2000)throw Error('Ungültiger Gerätestatus.');
 // Keep only capability flags and endpoint digest, never the browser history or raw user agent.
 if(d.platform!=='iphone'&&s.device?.platform==='iphone')return;
 s.device={platform:d.platform,capable:d.capable,permission:d.permission,endpoint:d.endpoint?createHash('sha256').update(d.endpoint).digest('hex'):null};save(db,actor,s,now);
}
export function remindWelcome(db,now=Date.now()){
 db.exec('BEGIN IMMEDIATE');try{
 const rows=db.prepare("SELECT a.id,a.name,s.data FROM archive_settings s JOIN linux_accounts a ON s.key='welcome:'||a.id JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.disabled=0 AND u.role IN ('user','manager','admin','guest')").all();let count=0;
 for(const a of rows){const s=JSON.parse(a.data),d=s.device;if(s.readAt===null||!Number.isFinite(s.readAt)||now-s.readAt<86400000||s.remindedAt!==null||d?.platform!=='iphone'||!d.capable)continue;
 const prefs=db.prepare('SELECT enabled FROM linux_push_preferences WHERE account_id=?').get(a.id);if(prefs&&prefs.enabled===0)continue;
 if(d.endpoint&&prefs?.enabled&&db.prepare('SELECT 1 FROM linux_push_subscriptions WHERE id=? AND account_id=?').get(d.endpoint,a.id))continue;
 notice(db,a.id,a.name,'Push-Benachrichtigungen auf diesem iPhone einrichten',`Hallo ${a.name},\n\nauf dem zuletzt verwendeten iPhone sind Push-Benachrichtigungen noch nicht eingerichtet. Wenn Sie möchten, können Sie damit Hinweise auf neue interne Nachrichten erhalten.\n\n${iphoneGuide}\n\n${activate}`,now);s.remindedAt=now;save(db,a.id,s,now);count++;
 }db.exec('COMMIT');return count;
 }catch(e){db.exec('ROLLBACK');throw e}
}
