// Durable push outbox in the same transaction as the publication decision.
// Existing historical system messages are deliberately left untouched.
export function publicationPushStatements(db,{id,token,now,approved=false}){
 const topic=approved?'publicationApproved':'publicationRequest',status=approved?'approved':'pending';
 return [db.prepare("INSERT OR IGNORE INTO archive_settings(key,data,updated,updated_by) SELECT ?,json_object('topic',?,'entryId',e.id,'token',e.review_token,'version',e.requested_version,'title',coalesce(json_extract(e.data,'$.title'),'Beitrag'),'target',(SELECT u.identity_subject FROM archive_users u WHERE u.id=e.requested_by AND u.identity_provider='linux')),?,e.requested_by FROM entries e WHERE e.id=? AND e.review_token=? AND e.deleted=0 AND e.publication_status=? AND e.requested_version IS NOT NULL"+(approved?" AND e.approved_version=e.requested_version":"")).bind('publication-push:'+topic+':'+token,topic,now,id,token,status)];
}
export function publicationPushEvent(db,key){
 const row=db.prepare("SELECT s.data FROM archive_settings s JOIN entries e ON e.id=json_extract(s.data,'$.entryId') WHERE s.key=? AND e.deleted=0 AND e.review_token=json_extract(s.data,'$.token') AND e.requested_version=json_extract(s.data,'$.version') AND ((json_extract(s.data,'$.topic')='publicationRequest' AND e.publication_status='pending') OR (json_extract(s.data,'$.topic')='publicationApproved' AND e.publication_status='approved' AND e.approved_version=e.requested_version))").get(key);
 return row?JSON.parse(row.data):null;
}
