import {archiveRequestOrigin} from '@/lib/archive-request-origin';
import {archiveDb} from '@/lib/archive-db';
import {archiveAccess,AccessError} from '@/lib/archive-access';
export type CommentMode='open'|'closed'|'hidden';
export async function commentMode():Promise<CommentMode>{const r=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='comments_mode'").first<{data:string}>();return r?JSON.parse(r.data):'open'}
export async function commentEntry(req:Request,id:string){
 const access=await archiveAccess(req);
 const row=await archiveDb().prepare("SELECT id,publication_status,approved_version,approved_by,approved_at FROM entries WHERE id=? AND deleted=0").bind(id).first<any>();
 if(!row||(!access||access.role==='public')&&!(row.publication_status==='approved'&&row.approved_version&&row.approved_by&&row.approved_at))throw new AccessError('Dieser Beitrag ist nicht verfügbar.',404);
 return access;
}
export function sameOrigin(req:Request){return req.headers.get('origin')===archiveRequestOrigin(req)||!req.headers.get('origin')}
