import {withPersonTags} from '@/lib/archive-people';
import {archiveDb} from '@/lib/archive-db';
import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
import {guestFields,projectGuestEntry} from '@/lib/archive-guest';
import {ensureReference} from '@/lib/archive-references';
import {readArchiveQuery} from '@/lib/archive-query';
import {registerArchiveSearch,archiveSearchPlan} from '@/server/archive-search.mjs';
import {markdownPlain} from '@/lib/archive-markdown';
const headers={'Cache-Control':'no-store'};
const excerpt=(text:any,markdown:boolean)=>{const raw=typeof text==='string'?text.slice(0,4000):'';return (markdown?markdownPlain(raw):raw).replace(/\s+/gu,' ').trim().slice(0,240)};
export async function GET(req:Request){try{
 const access=await requireArchiveAction(req,'readEntries'),binding=archiveDb(),db=(binding as any).database;
 if(!db)throw Error('Linux-Datenbank erforderlich');registerArchiveSearch(db,withPersonTags);
 const url=new URL(req.url),query=readArchiveQuery(url.search),fields=access.role==='guest'?await guestFields():null,plan=archiveSearchPlan(query,fields),mode=url.searchParams.get('mode');
 if(query.from&&query.to&&Number(query.from)>Number(query.to))return Response.json({error:'Das Von-Jahr darf nicht nach dem Bis-Jahr liegen.'},{status:400,headers});
 if(mode==='summary'){
  const base=archiveSearchPlan(readArchiveQuery(''),fields),category=base.field('category'),status=base.field('status');
  const cards:any=db.prepare(`SELECT count(*) AS total,sum(CASE WHEN ${category}='Ort / Gebäude' THEN 1 ELSE 0 END) AS places,sum(CASE WHEN ${category}='Thema' THEN 1 ELSE 0 END) AS themes,sum(CASE WHEN ${category}='Artefakt' THEN 1 ELSE 0 END) AS artifacts,sum(CASE WHEN ${base.allowed('people')?"json_array_length(archive_person_tags(e.data))>0":'0'} THEN 1 ELSE 0 END) AS people,sum(CASE WHEN ${base.allowed('sources')?`length(trim(coalesce(${base.field('sources')},'')))>0`:'0'} THEN 1 ELSE 0 END) AS sources,sum(CASE WHEN ${['bilder','dokumente'].filter(type=>base.allowed(type==='bilder'?'images':'documents')).map(base.files).join(' OR ')||'0'} THEN 1 ELSE 0 END) AS media,sum(CASE WHEN ${status}<>'Quellengeprüft' THEN 1 ELSE 0 END) AS open ${base.from} WHERE e.deleted=0`).get();
  if(!base.allowed('status'))cards.open=null;return Response.json({cards,fields}, {headers});
 }
 if(mode==='people'){
  if(!plan.allowed('people'))return Response.json({people:[]},{headers});
  const people=db.prepare("SELECT json_extract(t.value,'$.entityId') AS entityId,min(json_extract(t.value,'$.name')) AS name,json_extract(t.value,'$.kind') AS kind,count(DISTINCT e.id) AS count FROM entries e,json_each(archive_person_tags(e.data)) t WHERE e.deleted=0 AND instr(archive_fold(json_extract(t.value,'$.name')),archive_fold(?))>0 GROUP BY entityId,kind ORDER BY archive_title_key(name),entityId LIMIT 30").all(query.q.trim());
  return Response.json({people},{headers});
 }
 if(mode==='references'||mode==='qr'){
  await requireArchiveAction(req,mode==='qr'?'qrBulk':'edit');
  const references=mode==='references'&&url.searchParams.has('referenzen')?(url.searchParams.get('referenzen')||'').split(','):null;
  if(references&&(references.length>200||references.some(value=>!/^[A-Z0-9-]{1,80}$/.test(value))))return Response.json({error:'Ungültige Beitragsreferenzen.'},{status:400,headers});
  const predicate=references?'r.reference IN (SELECT value FROM json_each(?))':"instr(archive_fold(coalesce(json_extract(e.data,'$.title'),'')||coalesce(r.reference,'')),archive_fold(?))>0";
  const rows=db.prepare(`SELECT e.id,json_extract(e.data,'$.title') AS title,r.reference ${plan.from} WHERE e.deleted=0 ${mode==='references'?'AND '+predicate:''} ORDER BY archive_title_key(title),e.id ${mode==='references'?'LIMIT '+(references?200:30):''}`).all(...(mode==='references'?[references?JSON.stringify(references):query.q.trim()]:[]));
  const entries=await Promise.all(rows.map(async(row:any)=>({...row,reference:row.reference||await ensureReference(row.id)})));return Response.json({entries},{headers});
 }
 if(mode)return Response.json({error:'Unbekannte Archivabfrage.'},{status:400,headers});
 let total:number,rows:any[],page:number,pages:number;
 db.exec('BEGIN');try{total=Number(db.prepare(`SELECT count(*) AS n ${plan.from} WHERE ${plan.where}`).get(...plan.args).n);pages=Math.max(1,Math.ceil(total/query.limit));page=Math.min(query.page,pages);rows=db.prepare(`SELECT e.id,e.data,e.updated,r.reference,p.name AS storagePlace ${plan.from} WHERE ${plan.where} ORDER BY ${plan.order} LIMIT ? OFFSET ?`).all(...plan.args,query.limit,(page-1)*query.limit);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 const items=await Promise.all(rows.map(async row=>{const reference=row.reference||await ensureReference(row.id),raw=withPersonTags(JSON.parse(row.data)),data=fields?projectGuestEntry(raw,fields,reference,row.storagePlace||''):raw;return {id:row.id,reference,title:data.title||'Beitrag',category:data.category||'',period:data.period||'',start:data.start||'',end:data.end||'',...(!fields||data.isApproximateDate!==undefined?{isApproximateDate:data.isApproximateDate===true}:{}),place:data.place||'',tags:data.tags||'',status:data.status||'',description:excerpt(data.description,data.fieldFormats?.description==='markdown'),sources:excerpt(data.sources,data.fieldFormats?.sources==='markdown'),uncertainty:!!data.uncertainty};}));
 const storages=plan.allowed('storagePlaceId')?db.prepare("SELECT p.id,p.name FROM storage_places p WHERE EXISTS(SELECT 1 FROM entries e WHERE e.deleted=0 AND json_extract(e.data,'$.storagePlaceId')=p.id) ORDER BY archive_title_key(p.name),p.id").all():[];
 const personName=plan.effective.person?db.prepare("SELECT json_extract(t.value,'$.name') AS name FROM entries e,json_each(archive_person_tags(e.data)) t WHERE e.deleted=0 AND json_extract(t.value,'$.entityId')=? LIMIT 1").get(plan.effective.person)?.name:null;
 return Response.json({items,total,page,pages,limit:query.limit,query:{...plan.effective,page},fields,storages,personName},{headers});
 }catch(e){return accessResponse(e)||Response.json({error:'Das Archiv konnte gerade nicht geladen werden. Bitte erneut versuchen.'},{status:503,headers})}
}
