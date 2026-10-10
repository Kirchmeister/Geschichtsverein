import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{ARCHIVE_BOOTSTRAP_ADMIN_EMAIL:'admin@example.test',ARCHIVE_INITIAL_PLACE:'Testort',ARCHIVE_INITIAL_ASSOCIATION:'Testverein'},d1Databases:['DB'],r2Buckets:['BUCKET']});
const actorHeaders={'oai-authenticated-user-id':'test-user-1','oai-authenticated-user-email':'admin@example.test','oai-authenticated-user-full-name':encodeURIComponent('Test Admin Ä'),'oai-authenticated-user-full-name-encoding':'percent-encoded-utf-8'};
const get=async url=>{const r=await mf.dispatchFetch('https://archive.test'+url,{headers:actorHeaders});assert.equal(r.status,200);return r.json()};
const upload=async form=>{const req=new Request('https://archive.test/api/files',{method:'POST',headers:{Origin:'https://archive.test',...actorHeaders},body:form});return mf.dispatchFetch(req.url,{method:'POST',headers:Object.fromEntries(req.headers),body:await req.arrayBuffer()})};
const post=async(data,method='POST')=>mf.dispatchFetch('https://archive.test/api/entries',{method,headers:{Origin:'https://archive.test','Content-Type':'application/json',...actorHeaders},body:JSON.stringify(data)});
try{
 const db=await mf.getD1Database('DB');
 for(const path of readdirSync('drizzle').filter(p=>p.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+path,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
 let entry={id:crypto.randomUUID(),title:'Testeintrag',category:'Bild / Dokument',period:'',start:'',end:'',place:'',description:'Erste Beschreibung',sources:'Archivquelle',interpretation:'',uncertainty:'',rights:'Ungeklärte Rechte',tags:'Test',status:'Offen',files:[]};
 // Existing data from before versioning must also survive editing.
 await db.prepare('INSERT INTO entries(id,data,updated) VALUES(?,?,?)').bind(entry.id,JSON.stringify({...entry,updated:'2026-01-01T00:00:00.000Z'}),'2026-01-01T00:00:00.000Z').run();entry.updated='2026-01-01T00:00:00.000Z';
 const stale={...entry};let r=await post({...entry,description:'Zweite Beschreibung'});assert.equal(r.status,200);entry=await r.json();
 let history=await get('/api/entries?history='+entry.id);assert.equal(history.length,2);assert.equal(history[1].data.description,'Erste Beschreibung');
 r=await post(stale);assert.equal(r.status,409);assert.equal((await get('/api/entries?history='+entry.id)).length,2);
 const form=new FormData();form.set('file',new File([new Uint8Array(1024).fill(17)],'aufnahme.mp3',{type:'audio/mpeg'}));r=await upload(form);assert.equal(r.status,200);const file=await r.json();assert.equal(file.type,'audio/mpeg');
 r=await post({...entry,files:[file]});assert.equal(r.status,200);entry=await r.json();const withAudio={...entry};
 r=await mf.dispatchFetch('https://archive.test/api/files?key='+file.key,{headers:{...actorHeaders,Range:'bytes=10-19'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,10);assert.equal(r.headers.get('content-range'),'bytes 10-19/1024');
 r=await mf.dispatchFetch('https://archive.test/api/files?key='+file.key,{headers:{...actorHeaders,Range:'bytes=-12'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,12);
 r=await mf.dispatchFetch('https://archive.test/api/files?key='+file.key,{headers:{...actorHeaders,Range:'bytes=2000-'}});assert.equal(r.status,416);
 r=await mf.dispatchFetch('https://archive.test/api/files?key='+file.key+'&download=1',{headers:actorHeaders});assert.match(r.headers.get('content-disposition'),/attachment.*aufnahme.mp3/);
 r=await post({...entry,files:[]});assert.equal(r.status,200);entry=await r.json();history=await get('/api/entries?history='+entry.id);assert.equal(history[1].data.files[0].key,file.key);
 r=await post(entry,'DELETE');assert.equal(r.status,200);assert.equal((await get('/api/entries')).length,0);const deleted=await get('/api/entries?deleted=1');assert.equal(deleted.length,1);assert.equal((await post(entry)).status,409);entry=deleted[0];
 // Restore one old field while retaining the most recent other fields.
 r=await post({...entry,description:stale.description});assert.equal(r.status,200);entry=await r.json();assert.equal(entry.description,'Erste Beschreibung');assert.equal(entry.files.length,0);assert.equal((await get('/api/entries?deleted=1')).length,0);
 r=await post({...withAudio,updated:entry.updated});assert.equal(r.status,200);entry=await r.json();assert.equal(entry.files[0].key,file.key);
 const concurrent=await Promise.all([post({...entry,title:'Änderung A'}),post({...entry,title:'Änderung B'})]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
 r=await mf.dispatchFetch('https://archive.test/api/entries',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json'},body:JSON.stringify(entry)});assert.equal(r.status,403);
 const bad=new FormData();bad.set('file',new File(['x'],'script.exe',{type:'application/octet-stream'}));r=await upload(bad);assert.equal(r.status,400);
 // Author identity comes only from the authenticated adapter, not the submitted entry.
 r=await post({...entry,updated:(await get('/api/entries'))[0].updated,actorName:'Gefälscht',actorId:'impostor',publicationStatus:'approved'});assert.equal(r.status,200);entry=await r.json();
 history=await get('/api/entries?history='+entry.id);assert.equal(history[0].actorName,'Test Admin Ä');assert.equal(history.at(-1).actorName,null);assert.ok(history[0].actorId);const actorId=history[0].actorId;
 const secondHeaders={...actorHeaders,'oai-authenticated-user-id':'test-user-2','oai-authenticated-user-email':'test2@example.test','oai-authenticated-user-full-name':encodeURIComponent('Zweite Person')};
 r=await mf.dispatchFetch('https://archive.test/api/entries',{method:'POST',headers:{Origin:'https://archive.test','Content-Type':'application/json',...secondHeaders},body:JSON.stringify({...entry,title:'Älteres Gebäude'})});assert.equal(r.status,200);entry=await r.json();
 let activity=await get('/api/activity');assert.equal(activity.items[0].actorName,'Zweite Person');assert.equal(activity.authors.length,2);assert.ok(activity.items.some(x=>x.actorName===null));
 const own=await get('/api/activity?author='+actorId);assert.ok(own.items.length);assert.ok(own.items.every(x=>x.actorId===actorId));
 const unknown=await get('/api/activity?author=unknown');assert.equal(unknown.items.length,1);assert.equal(unknown.items[0].actorName,null);
 const searched=await get('/api/activity?q='+encodeURIComponent('ÄLTERES'));assert.equal(searched.items[0].title,'Älteres Gebäude');
 assert.equal((await get('/api/activity?q=unfindbares_stichwort')).items.length,0);
 r=await mf.dispatchFetch('https://archive.test/api/entries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});assert.equal(r.status,401);
 r=await mf.dispatchFetch('https://archive.test/api/entries',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});assert.equal(r.status,401);
 // Prepared approval never exposes the working draft; an edit invalidates approval.
 const permissionsSource=readFileSync('lib/archive-permissions.ts','utf8');const publicQuery=/approvedEntriesQuery="([^"]+)"/.exec(permissionsSource)[1];
 assert.equal((await db.prepare(publicQuery).all()).results.length,0);
 const approved=history.find(v=>v.action==='Gespeichert');await db.prepare("UPDATE entries SET publication_status='approved',approved_version=?,approved_by=?,approved_at=? WHERE id=?").bind(approved.version,actorId,new Date().toISOString(),entry.id).run();
 let published=await db.prepare(publicQuery).all();assert.equal(JSON.parse(published.results[0].data).title,approved.data.title);
 r=await mf.dispatchFetch('https://archive.test/api/entries',{method:'POST',headers:{'Content-Type':'application/json',...secondHeaders},body:JSON.stringify({...entry,description:'Neue private Bearbeitung'})});assert.equal(r.status,200);entry=await r.json();assert.equal((await db.prepare(publicQuery).all()).results.length,0);
 // More than one page, identical timestamps, historical baseline and stable cursors.
 const existingCount=(await get('/api/activity')).items.length;
 for(let i=0;i<55;i++)await db.prepare('INSERT INTO entry_versions(entry_id,data,created,action,actor_id,actor_name) VALUES(?,?,?,?,?,?)').bind(entry.id,JSON.stringify(entry),'2025-01-01T10:00:00.000Z','Gespeichert',actorId,'Test Admin Ä').run();
 const first=await get('/api/activity');assert.equal(first.items.length,50);assert.ok(first.next);const second=await get('/api/activity?before='+first.next);const ids=[...first.items,...second.items].map(v=>v.version);assert.equal(new Set(ids).size,ids.length);assert.equal(ids.length,existingCount+55);assert.equal(second.next,null);
 const ordered=[...first.items,...second.items];for(let i=1;i<ordered.length;i++)assert.ok(ordered[i-1].created>=ordered[i].created);
 const countBefore=(await db.prepare('SELECT COUNT(*) AS n FROM entry_versions').first()).n;r=await post(entry,'DELETE');assert.equal(r.status,200);const afterDelete=await get('/api/activity');assert.equal(afterDelete.items[0].action,'Gelöscht');assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM entry_versions').first()).n,countBefore+1);
 console.log('PASS: authenticated attribution, legacy unknown authors, keyword/author filters, complete chronological pagination, retained deleted entries and prepared approval isolation.');
 console.log('PASS: legacy versions, conflict protection, deletion, partial and full restoration, retained audio, upload/download and seeking ranges.');
 const combined={...entry,id:crypto.randomUUID(),updated:undefined,title:'Combined worker save',requestPublication:true};r=await post(combined);assert.equal(r.status,200,await r.clone().text());const combinedSaved=await r.json();assert.equal(combinedSaved.publicationRequested,true);const pending=await db.prepare('SELECT publication_status,requested_version FROM entries WHERE id=?').bind(combinedSaved.id).first();assert.equal(pending.publication_status,'pending');const savedVersion=await db.prepare("SELECT max(version) AS version FROM entry_versions WHERE entry_id=? AND action='Gespeichert'").bind(combinedSaved.id).first();assert.equal(pending.requested_version,savedVersion.version);r=await post({...combinedSaved,requestPublication:false});assert.equal(r.status,200);assert.equal((await db.prepare('SELECT publication_status FROM entries WHERE id=?').bind(combinedSaved.id).first()).publication_status,'draft');assert.equal((await post({...combined,requestPublication:true})).status,409);console.log('PASS: Sites atomic save and optional publication request uses the saved version; save-only restores draft and stale saves stay isolated.');
}finally{await mf.dispose()}
