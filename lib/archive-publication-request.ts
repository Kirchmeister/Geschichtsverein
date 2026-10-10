import {env} from '@/lib/runtime-env';
import {publicationNoticeStatements} from '@/server/publication-notices.mjs';
// Shared by a standalone request and saving with a request. Append to the same D1 transaction.
export function publicationRequestStatements(db:any,{id,updated,version,actor,token,now}:{id:string,updated:string,version?:number,actor:{id:string,name:string},token:string,now:string}){
 const savedVersion="(SELECT max(v.version) FROM entry_versions v WHERE v.entry_id=entries.id AND v.action='Gespeichert' AND json_extract(v.data,'$.updated')=entries.updated)";
 return [
 db.prepare(`UPDATE entries SET publication_status='pending',requested_version=${savedVersion},requested_by=?,requested_at=?,review_token=?,approved_version=NULL,approved_by=NULL,approved_at=NULL WHERE id=? AND updated=? AND deleted=0 AND publication_status IN ('draft','rejected') AND ${savedVersion} IS NOT NULL${version!==undefined?` AND ${savedVersion}=?`:''}`).bind(actor.id,now,token,id,updated,...(version!==undefined?[version]:[])),
 db.prepare("INSERT INTO entry_versions(entry_id,data,created,action,actor_id,actor_name) SELECT id,data,?,'Veröffentlichung angefragt',?,? FROM entries WHERE id=? AND review_token=?").bind(now,actor.id,actor.name,id,token),
 ...((env as any).ARCHIVE_HOSTING_RUNTIME==='linux'?publicationNoticeStatements(db,{id,token,now}):[])
 ];
}
