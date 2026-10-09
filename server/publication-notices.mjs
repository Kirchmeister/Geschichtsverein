// Part of the publication transaction: never notify for an unsuccessful/stale request.
// This technical archive identity has no Linux account, credentials or login privileges.
export function publicationNoticeStatements(db,{id,token,now,reminder=false}){
 const thread=(reminder?'publication-reminder-':'publication-request-')+token,source="FROM entries e WHERE e.id=? AND e.review_token=? AND e.publication_status='pending' AND e.deleted=0",eligible="SELECT a.id,a.name FROM linux_accounts a JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.disabled=0 AND u.role IN ('admin','manager')",guard=source+' AND EXISTS('+eligible+')';
 return [
 db.prepare("INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) SELECT 'system-publication-notices','system','publication-notices','Archiv-Benachrichtigung',?,'user' "+guard+" ON CONFLICT(id) DO NOTHING").bind(now,id,token),
 db.prepare("INSERT OR IGNORE INTO archive_message_threads(id,subject,created,announcement) SELECT ?,substr(?||coalesce(json_extract(e.data,'$.title'),'Beitrag'),1,120),?,1 "+guard).bind(thread,reminder?'Erinnerung zur Veröffentlichung: ':'Veröffentlichungsanfrage: ',now,id,token),
 db.prepare('INSERT OR IGNORE INTO archive_message_members(thread_id,account_id,name) SELECT ?,a.id,a.name FROM ('+eligible+') a WHERE EXISTS(SELECT 1 FROM archive_message_threads WHERE id=?)').bind(thread,thread),
 db.prepare("INSERT OR IGNORE INTO archive_message_references(thread_id,entry_id,review_key) SELECT ?,e.id,'notice:'||e.review_token "+source+' AND EXISTS(SELECT 1 FROM archive_message_threads WHERE id=?)').bind(thread,id,token,thread),
 db.prepare("INSERT INTO archive_messages(thread_id,sender_id,sender_name,body,created) SELECT ?,'system-publication-notices','Archiv-Benachrichtigung',?,? "+source+' AND EXISTS(SELECT 1 FROM archive_message_threads WHERE id=?) AND NOT EXISTS(SELECT 1 FROM archive_messages WHERE thread_id=?)').bind(thread,reminder?'Diese Veröffentlichungsanfrage ist seit mindestens drei Tagen offen. Bitte prüfen Sie den verknüpften Beitrag und nutzen Sie dort die vorhandene Genehmigungsfunktion. Dies ist die einmalige Erinnerung.':'Ein Beitrag wurde zur Veröffentlichung angefragt. Bitte öffnen Sie den verknüpften Beitrag, prüfen Sie ihn und nutzen Sie dort die vorhandene Genehmigungsfunktion.',now,id,token,thread,thread)
 ];
}

// The transaction serializes concurrent runners; the deterministic thread is the durable receipt.
export function remindPublicationRequests(db,now=new Date().toISOString()){
 db.exec('BEGIN IMMEDIATE');
 try{
 const due=db.prepare("SELECT id,review_token AS token FROM entries WHERE publication_status='pending' AND deleted=0 AND review_token IS NOT NULL AND julianday(requested_at)<=julianday(?)-3 AND NOT EXISTS(SELECT 1 FROM archive_message_threads WHERE id='publication-reminder-'||entries.review_token)").all(now);
 const adapter={prepare(sql){return {bind(...args){return {run:()=>db.prepare(sql).run(...args)}}}}};
 for(const e of due)for(const s of publicationNoticeStatements(adapter,{...e,now,reminder:true}))s.run();
 db.exec('COMMIT');return due.length;
 }catch(e){db.exec('ROLLBACK');throw e}
}
