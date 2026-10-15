import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {issueSession,hashToken} from '../server/auth-security.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createHmac} from 'node:crypto';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-restore-http-')),key='c'.repeat(64),port=18424,origin='http://localhost:'+port,standalone=process.env.ARCHIVE_TEST_STANDALONE_ROOT;
assert.ok(standalone,'Use tests/linux-package.test.mjs to exercise the real packaged server.');
const storage=sqliteBinding(root+'/archive.sqlite',path.resolve('drizzle'));initializeAuth(storage.database);
for(const role of ['admin','manager','user','guest']){storage.database.prepare('INSERT INTO linux_accounts VALUES(?,?,?,0)').run(role,role+'@example.invalid',role);storage.database.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,role,created) VALUES(?,?,?,?,?,?)').run(role,'linux',role,role,role,'2026-01-01')}
storage.close();let reject=false,statusFailure=false,newFeatures=false;const commands=[],uploaded=Buffer.alloc(1536,65);
const service=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;
 const expected=createHmac('sha256',key).update([req.headers['x-archive-time'],req.headers['x-archive-nonce'],req.method,req.url,body].join('\n')).digest('hex');assert.equal(req.headers['x-archive-signature'],expected);assert.equal(req.url,'/updates');
 if(req.method==='GET'){if(statusFailure){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Synthetic service unavailable'}));return}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({enabled:true,currentVersion:'0.35.0',serviceVersion:'0.35.0',features:{restore:true,compatibility:true,betaChannels:true,manualRollback:newFeatures,updateHistory:newFeatures},busy:false}));return}
 const command=JSON.parse(body);commands.push(command);
 if(command.action==='history'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({enabled:true,history:Array.from({length:37},(_,n)=>({id:'job-'+n,status:'complete',tag:'v0.'+n+'.0'}))}));return}
 if(command.action==='restore-inspect'){
  assert.deepEqual(await fs.readFile(root+'/restore-inbox/'+command.id+'.tar'),uploaded);
  if(reject){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Prüfung abgelehnt'}));return}
  await fs.unlink(root+'/restore-inbox/'+command.id+'.tar');
 }
 res.writeHead(202,{'Content-Type':'application/json'});res.end(JSON.stringify({queued:true,id:command.id}));
});await new Promise(r=>service.listen(0,'127.0.0.1',r));const updater='http://127.0.0.1:'+service.address().port;
await fs.writeFile(root+'/app.env',`ARCHIVE_ORIGIN=${origin}\nARCHIVE_SESSION_KEY=${key}\nARCHIVE_SETTINGS_KEY=${key}\nARCHIVE_RUNNER_KEY=${key}\nARCHIVE_UPDATER_URL=${updater}\nARCHIVE_UPDATER_SECRET=${key}\nARCHIVE_INITIAL_PLACE=Testort\nARCHIVE_INITIAL_ASSOCIATION=Testverein\n`);
const app=spawn(process.execPath,['scripts/linux-start.mjs'],{cwd:standalone,env:{...process.env,PORT:String(port),ARCHIVE_CONFIG_FILE:root+'/app.env',ARCHIVE_BIND_HOST:'127.0.0.1',ARCHIVE_DATA_DIR:root,ARCHIVE_MAINTENANCE_FILE:root+'/maintenance'},stdio:['ignore','pipe','pipe']});let output='';app.stdout.on('data',b=>output+=b);app.stderr.on('data',b=>output+=b);
function cookie(role){const db=new DatabaseSync(path.join(root,'archive.sqlite'));try{const account=db.prepare('SELECT * FROM linux_accounts WHERE id=? AND disabled=0').get(role);return 'archive_session='+(account?issueSession(db,key,account):'invalid')}finally{db.close()}}
const upload=(role='admin',extra={})=>fetch(origin+'/api/restores',{method:'POST',headers:{Cookie:cookie(role),Origin:origin,'Content-Type':'application/x-tar',...extra},body:uploaded});
try{
 let ready=false;for(let n=0;n<100;n++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,output);
 const updateStatus=()=>fetch(origin+'/api/updates',{headers:{Cookie:cookie('admin')}});let updateReply=await updateStatus();assert.equal(updateReply.status,200);let updateData=await updateReply.json();assert.equal(updateData.appVersion,JSON.parse(await fs.readFile('version.json','utf8')).version);assert.equal(updateData.serviceVersion,'0.35.0');assert.equal((await fetch(origin+'/api/updates',{headers:{Cookie:cookie('guest')}})).status,403);statusFailure=true;updateReply=await updateStatus();assert.equal(updateReply.status,200);updateData=await updateReply.json();assert.equal(updateData.enabled,false);assert.equal(updateData.connectionStatus,'unreachable');assert.ok(updateData.appVersion);statusFailure=false;
 const updateAction=(data,role='admin',extra={})=>fetch(origin+'/api/updates',{method:'POST',headers:{Cookie:cookie(role),Origin:origin,'Content-Type':'application/json',...extra},body:JSON.stringify(data)});
 for(const role of ['manager','user','guest'])for(const action of ['history','rollback-inspect','rollback-start'])assert.equal((await updateAction({action},role)).status,403);
 assert.equal((await updateAction({action:'rollback-inspect'},'admin',{Origin:'https://attacker.invalid'})).status,403);assert.equal((await updateAction({action:'rollback-inspect'},'admin',{'x-archive-preview-role':'user'})).status,403);
 for(const action of ['history','rollback-inspect'])assert.equal((await updateAction({action})).status,409);newFeatures=true;
 assert.equal((await updateAction({action:'rollback-start',token:crypto.randomUUID(),confirmation:'wrong'})).status,400);assert.equal(commands.some(c=>c.action==='rollback-start'),false);
 assert.equal((await updateAction({action:'rollback-inspect'})).status,202);const rollbackToken=crypto.randomUUID();assert.equal((await updateAction({action:'rollback-start',token:rollbackToken,confirmation:'UPDATE RÜCKGÄNGIG MACHEN'})).status,202);assert.equal(commands.at(-1).token,rollbackToken);assert.equal(commands.at(-1).confirmation,'UPDATE RÜCKGÄNGIG MACHEN');assert.equal((await (await updateAction({action:'history'})).json()).history.length,37);
 for(const role of ['manager','user','guest'])assert.equal((await upload(role)).status,403);
 assert.equal((await upload('admin',{Origin:'https://attacker.invalid'})).status,403);
 assert.equal((await upload('admin',{'x-archive-preview-role':'user'})).status,403);
 let r=await upload();assert.equal(r.status,202,await r.clone().text());const id=(await r.json()).id;assert.match(id,/^[a-f0-9-]{36}$/);assert.equal((await fs.readdir(root+'/restore-inbox')).length,0);
 const start=confirmation=>fetch(origin+'/api/restores',{method:'POST',headers:{Cookie:cookie('admin'),Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({action:'restore-start',id,confirmation})});
 assert.equal((await start('wrong')).status,400);assert.equal(commands.some(c=>c.action==='restore-start'),false);assert.equal((await start('ARCHIV WIEDERHERSTELLEN')).status,202);assert.equal(commands.at(-1).confirmation,'ARCHIV WIEDERHERSTELLEN');
 reject=true;assert.equal((await upload()).status,400);assert.equal((await fs.readdir(root+'/restore-inbox')).length,0);
 await fs.writeFile(root+'/maintenance','1');assert.equal((await fetch(origin+'/api/restores',{headers:{Cookie:cookie('admin')}})).status,200);assert.equal((await fetch(origin+'/api/entries',{headers:{Cookie:cookie('admin')}})).status,503);
 console.log('PASS: real Linux HTTP admin/preview/origin gates, streamed TAR upload, signed service handoff, confirmation, rejected upload cleanup and status access during maintenance.');
}finally{app.kill('SIGTERM');await new Promise(r=>app.once('exit',r));await new Promise(r=>service.close(r));await fs.rm(root,{recursive:true,force:true})}
