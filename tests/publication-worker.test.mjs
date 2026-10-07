import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{ARCHIVE_BOOTSTRAP_ADMIN_EMAIL:'admin@example.test',ARCHIVE_INITIAL_PLACE:'Testort',ARCHIVE_INITIAL_ASSOCIATION:'Testverein'},d1Databases:['DB'],r2Buckets:['BUCKET']});
const owner={'oai-authenticated-user-id':'owner-subject','oai-authenticated-user-email':'admin@example.test','oai-authenticated-user-full-name':encodeURIComponent('Test Admin'),'oai-authenticated-user-full-name-encoding':'percent-encoded-utf-8'};
const outsider={'oai-authenticated-user-id':'other-subject','oai-authenticated-user-email':'other@example.test'};
const roleHeaders=role=>({...owner,...(role?{'x-archive-preview-role':role}:{})});
const call=(path,{role='admin',method='GET',body,headers={}}={})=>mf.dispatchFetch('https://archive.test'+path,{method,headers:{...roleHeaders(role),Origin:'https://archive.test',...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
const json=async(path,opts)=>{const r=await call(path,opts);assert.equal(r.status,200,await r.clone().text());return r.json()};
try {
 const db=await mf.getD1Database('DB');for(const path of readdirSync('drizzle').filter(p=>p.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+path,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
 assert.equal((await json('/api/session')).canPreview,true);
 const signedOther=await mf.dispatchFetch('https://archive.test/api/session',{headers:outsider});assert.equal((await signedOther.json()).canPreview,false);
 const bucket=await mf.getR2Bucket('BUCKET'),audioKey=crypto.randomUUID(),hiddenKey=crypto.randomUUID();await bucket.put(audioKey,new Uint8Array(1000),{httpMetadata:{contentType:'audio/mpeg'},customMetadata:{name:'Erinnerung.mp3'}});await bucket.put(hiddenKey,'private',{httpMetadata:{contentType:'application/pdf'}});
 let entry={id:crypto.randomUUID(),title:'Testbeitrag',category:'Ereignis',period:'1900',start:'',end:'',place:'Beispielort',description:'Sichtbare Beschreibung',sources:'Beleg',interpretation:'GEHEIME_NOTIZ',uncertainty:'PRIVATE_FRAGE',rights:'Rechte',tags:'',status:'Offen',files:[{key:audioKey,name:'Erinnerung.mp3',type:'audio/mpeg'},{key:hiddenKey,name:'Privates.pdf',type:'application/pdf'}]};
 entry=await json('/api/entries',{role:'user',method:'POST',body:entry});
 let meta=(await json('/api/publication?id='+entry.id,{role:'user'}))[0];assert.equal(meta.status,'draft');assert.ok(meta.currentVersion);
 let review={id:entry.id,updated:entry.updated,version:meta.currentVersion};
 assert.equal((await json('/api/public-profile',{role:'public'})).entries.length,0);
 await json('/api/publication',{role:'user',method:'POST',body:{...review,action:'request'}});
 assert.equal((await call('/api/publication',{role:'user',method:'POST',body:{...review,action:'request'}})).status,409);
 assert.equal((await call('/api/publication',{role:'user',method:'POST',body:{...review,action:'approve'}})).status,403);
 assert.equal((await call('/api/public-fields',{role:'user',method:'POST',body:{fields:['description']}})).status,403);for(const role of ['user','manager'])assert.equal((await call('/api/entries',{role,method:'DELETE',body:entry})).status,403)
 assert.equal((await mf.dispatchFetch('https://archive.test/api/publication',{method:'POST',headers:{...outsider,'x-archive-preview-role':'admin','Content-Type':'application/json'},body:JSON.stringify({...review,action:'approve'})})).status,403);
 assert.equal((await call('/api/publication',{method:'POST',body:{...review,version:review.version+999,action:'approve'}})).status,409);
 await json('/api/publication',{role:'manager',method:'POST',body:{...review,action:'approve'}});
 await json('/api/timeline-selection',{role:'user',method:'POST',body:{id:entry.id,visible:true}});const details=async()=>({entries:[(await json('/api/public-entry?reference='+entry.reference,{role:'public'})).entry]});let publicData=await details();assert.equal(publicData.entries.length,1);assert.equal(publicData.entries[0].description,entry.description);assert.equal(publicData.entries[0].interpretation,undefined);assert.equal(publicData.entries[0].uncertainty,undefined);assert.equal(publicData.entries[0].files.length,0);assert.ok(!JSON.stringify(publicData).includes('GEHEIME_NOTIZ'));
 assert.equal((await call('/api/files?public=1&key='+audioKey,{role:'public'})).status,403);
 await json('/api/public-fields',{method:'POST',body:{fields:['title','description','audio']}});
 publicData=await details();assert.equal(publicData.entries[0].files.length,1);assert.equal(publicData.entries[0].files[0].key,audioKey);assert.equal(publicData.entries[0].sources,undefined);
 const range=await call('/api/files?public=1&key='+audioKey,{role:'public',headers:{Range:'bytes=10-19'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,10);
 assert.equal((await call('/api/files?public=1&key='+hiddenKey,{role:'public'})).status,403);
 for(const path of ['/api/entries','/api/activity','/api/publication','/api/public-fields'])assert.equal((await call(path,{role:'public'})).status,403);
 assert.equal((await call('/api/entries',{role:'public',method:'POST',body:entry})).status,403);
 await json('/api/public-fields',{method:'POST',body:{fields:['description']}});publicData=await details();assert.equal(publicData.entries[0].title,undefined);assert.equal(publicData.entries[0].files.length,0);
 assert.equal((await call('/api/public-fields',{method:'POST',body:{fields:['id','badfield']}})).status,400);
 // Editing an approved or pending version revokes approval and invalidates stale requests.
 entry=await json('/api/entries',{role:'user',method:'POST',body:{...entry,description:'Neu bearbeitet'}});assert.equal((await json('/api/public-profile',{role:'public'})).entries.length,0);
 meta=(await json('/api/publication?id='+entry.id))[0];review={id:entry.id,updated:entry.updated,version:meta.currentVersion};await json('/api/publication',{role:'manager',method:'POST',body:{...review,action:'request'}});
 await json('/api/publication',{role:'manager',method:'POST',body:{...review,action:'reject'}});assert.equal((await json('/api/publication?id='+entry.id))[0].status,'rejected');
 await json('/api/publication',{role:'user',method:'POST',body:{...review,action:'request'}});
 const racing=await Promise.all([call('/api/publication',{method:'POST',body:{...review,action:'approve'}}),call('/api/entries',{role:'user',method:'POST',body:{...entry,description:'Konkurrierende Änderung'}})]);assert.equal(racing[1].status,200);assert.ok([200,409].includes(racing[0].status));entry=await racing[1].json();assert.equal((await json('/api/public-profile',{role:'public'})).entries.length,0);assert.equal((await call('/api/publication',{method:'POST',body:{...review,action:'approve'}})).status,409);
 const history=await json('/api/entries?history='+entry.id);assert.ok(history.some(v=>v.action==='Veröffentlichung angefragt'));assert.ok(history.some(v=>v.action==='Veröffentlichung genehmigt'));assert.ok(history.some(v=>v.action==='Veröffentlichung abgelehnt'));assert.ok(history.every(v=>v.actorName==='Test Admin'));
 console.log('PASS: owner-only role preview, User/Verwalter requests, Admin/Verwalter approval, saved field selection, redacted public data/files, approval races and audit history.');
}finally{await mf.dispose()}
