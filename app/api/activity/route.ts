import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
import {archiveDb} from '@/lib/archive-db';
export async function GET(req:Request){try{
 await requireArchiveAction(req,'readActivity');const u=new URL(req.url),q=(u.searchParams.get('q')||'').trim().normalize('NFKC').toLocaleLowerCase('de'),author=u.searchParams.get('author')||'',before=u.searchParams.get('before');
 if(q.length>200||author.length>100||before&&!/^\d{1,12}$/.test(before))return Response.json({error:'Bitte Suche und Filter prüfen.'},{status:400});
 const db=archiveDb(),where:string[]=[],values:any[]=[];
 if(q){where.push("instr(lower(replace(replace(replace(replace(data,'Ä','ä'),'Ö','ö'),'Ü','ü'),'ẞ','ß')),?)>0");values.push(q)}
 if(author){if(author==='unknown')where.push('actor_id IS NULL');else{where.push('actor_id=?');values.push(author)}}
 if(before){where.push('(created < (SELECT created FROM entry_versions WHERE version=?) OR (created = (SELECT created FROM entry_versions WHERE version=?) AND version<?))');values.push(Number(before),Number(before),Number(before))}
 const result=await db.prepare(`SELECT version,entry_id AS entryId,data,created,action,actor_id AS actorId,actor_name AS actorName FROM entry_versions ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY created DESC,version DESC LIMIT 51`).bind(...values).all();
 const rows=result.results as any[],more=rows.length>50,items=rows.slice(0,50).map(v=>{const d=JSON.parse(v.data);return {version:v.version,entryId:v.entryId,title:d.title,category:d.category,created:v.created,action:v.action,actorId:v.actorId,actorName:v.actorName}});
 const authors=await db.prepare('SELECT DISTINCT v.actor_id AS id,COALESCE(u.display_name,v.actor_name) AS name FROM entry_versions v LEFT JOIN archive_users u ON u.id=v.actor_id WHERE v.actor_id IS NOT NULL ORDER BY name').all();
 const unique=new Map<string,string>();for(const a of authors.results as any[])unique.set(a.id,a.name);
 return Response.json({items,authors:Array.from(unique,([id,name])=>({id,name})),next:more?items[items.length-1].version:null},{headers:{'Cache-Control':'no-store'}});
 }catch(e){const denied=accessResponse(e);if(denied)return denied;console.error(e);return Response.json({error:'Das Änderungsprotokoll ist gerade nicht erreichbar. Bitte erneut versuchen.'},{status:503})}}
