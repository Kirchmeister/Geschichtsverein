import {randomUUID} from 'node:crypto';
// Called inside the same transaction as the first guest invitation/role change.
export function guestSetupNotice(db,labels={title:'Titel',category:'Bereich',period:'Zeitraum / Datierung',description:'Beschreibung'}){
 if(db.prepare("SELECT 1 FROM archive_settings WHERE key IN ('guest_fields','guest_setup_notice') LIMIT 1").get())return;
 const admins=db.prepare("SELECT a.id,a.name FROM linux_accounts a JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.disabled=0 AND u.role='admin'").all();
 if(!admins.length)return;
 const id=randomUUID(),created=new Date().toISOString(),sender='system-guest-setup';
 db.prepare('INSERT OR IGNORE INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(sender,'system','guest-setup','Archiv-Benachrichtigung',created,'user');
 db.prepare('INSERT INTO archive_message_threads VALUES(?,?,?,1)').run(id,'Sichtbare Felder für Gäste prüfen',created);
 for(const a of admins)db.prepare('INSERT INTO archive_message_members(thread_id,account_id,name) VALUES(?,?,?)').run(id,a.id,a.name);
 db.prepare('INSERT INTO archive_messages(thread_id,sender_id,sender_name,body,created) VALUES(?,?,?,?,?)').run(id,sender,'Archiv-Benachrichtigung','Die erste Gastrolle wurde eingerichtet. Bitte prüfen Sie unter Einstellungen → Sichtbare Felder für Gäste die Freigabe. Gäste können auch nicht veröffentlichte Beiträge lesen. Derzeit sichtbar: '+['title','category','period','description'].map(k=>labels[k]||k).join(', ')+'. Dateien sind standardmäßig ausgeblendet. Diese Auswahl gilt für alle Gäste; Gäste können nichts bearbeiten und erhalten keine Push-Benachrichtigungen.',created);
 db.prepare("INSERT INTO archive_settings(key,data,updated,updated_by) VALUES('guest_setup_notice',?,?,?)").run(JSON.stringify({threadId:id}),created,sender);
}
