import {scanPush} from '@/lib/archive-push';
import {archiveDb} from '@/lib/archive-db';
import {commentMode,commentEntry,sameOrigin} from '@/lib/archive-comments';
import {accessResponse} from '@/lib/archive-access';
import {resolveArchiveActor} from '@/lib/archive-identity';
export async function GET(req:Request){try{const id=new URL(req.url).searchParams.get('entry')||'';const access=await commentEntry(req,id);const mode=await commentMode();const rows=mode==='hidden'?[]:(await archiveDb().prepare("SELECT id,parent_id AS parentId,author_name AS authorName,body,created FROM archive_comments WHERE entry_id=? AND status='approved' ORDER BY created,id").bind(id).all()).results;return Response.json({mode,comments:rows,authenticated:!!access&&access.role!=='public',name:access&&access.role!=='public'?access.identity.name:null},{headers:{'Cache-Control':'no-store'}})}catch(e){return accessResponse(e)||Response.json({error:'Kommentare konnten nicht geladen werden.'},{status:503})}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return Response.json({error:'Bitte die Website direkt öffnen.'},{status:403});
 if(Number(req.headers.get('content-length'))>12000)return Response.json({error:'Der Kommentar ist zu lang.'},{status:413});
 const d=await req.json() as any;const access=await commentEntry(req,d.entryId);
 if(await commentMode()!=='open')return Response.json({error:'Neue Kommentare sind derzeit ausgeschaltet.'},{status:403});
 const actor=access&&access.role!=='public'?await resolveArchiveActor(req):null;
 const name=actor?.name||(typeof d.name==='string'?d.name.trim():'');const body=typeof d.body==='string'?d.body.trim():'';
 if(name.length<2||name.length>100||body.length<1||body.length>3000)return Response.json({error:'Bitte einen Namen (2–100 Zeichen) und einen Kommentar (bis 3.000 Zeichen) eingeben.'},{status:400});
 if(d.website)return Response.json({error:'Der Kommentar konnte nicht angenommen werden.'},{status:400});
 const db=archiveDb();if(d.parentId){const parent=await db.prepare("SELECT id FROM archive_comments WHERE id=? AND entry_id=? AND status='approved'").bind(d.parentId,d.entryId).first();if(!parent)return Response.json({error:'Auf diesen Kommentar kann derzeit nicht geantwortet werden.'},{status:409})}
 await db.prepare("INSERT INTO archive_comments(id,entry_id,parent_id,author_id,author_name,body,status,created) SELECT ?,?,?,?,?,?,'pending',? WHERE COALESCE((SELECT json_extract(data,'$') FROM archive_settings WHERE key='comments_mode'),'open')='open' AND (SELECT count(*) FROM archive_comments WHERE entry_id=? AND status='pending')<200").bind(crypto.randomUUID(),d.entryId,d.parentId||null,actor?.id||null,name,body,new Date().toISOString(),d.entryId).run().then(r=>{if(!r.meta.changes)throw Error('queue-full')});
 return Response.json({message:'Vielen Dank! Ihr Kommentar wird geprüft und erscheint nach der Freigabe durch den Administrator.'},{status:201});
 }catch(e){return accessResponse(e)||Response.json({error:'Der Kommentar konnte gerade nicht gespeichert werden. Bitte später erneut versuchen. Ihre Eingaben bleiben erhalten.'},{status:503})}finally{await scanPush()}}
