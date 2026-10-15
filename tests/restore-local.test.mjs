import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {initializeAuth} from '../server/auth-service.mjs';
import {initializePush} from '../server/push-service.mjs';
import {createHash} from 'node:crypto';
import {preserveLocal,verifyRestoredFiles} from '../scripts/restore-preserve-local.mjs';
const root=fs.mkdtempSync(path.resolve('.restore-local-test-'));
function database(name){const file=path.join(root,name),db=new DatabaseSync(file);for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));return {db,file}}
try{
 const fileDir=path.join(root,'file-test');fs.mkdirSync(fileDir);fs.mkdirSync(path.join(fileDir,'bucket'));const key='media-key',bytes=Buffer.from('original'),hash=b=>createHash('sha256').update(b).digest('hex'),base=path.join(fileDir,'bucket',hash(key));fs.writeFileSync(fileDir+'/objects.json',JSON.stringify([{key,size:bytes.length,sha256:hash(bytes)}]));fs.writeFileSync(base+'.json',JSON.stringify({key,size:bytes.length,etag:hash(bytes)}));fs.writeFileSync(base+'.'+hash(bytes),bytes);await verifyRestoredFiles(fileDir);fs.writeFileSync(base+'.'+hash(bytes),'changed!');await assert.rejects(()=>verifyRestoredFiles(fileDir),/beschädigt/);
 const {db:live,file:source}=database('live.sqlite'),{db:staged,file:target}=database('staged.sqlite');initializeAuth(live);initializePush(live);
 live.prepare("INSERT INTO linux_accounts VALUES('local','admin@example.invalid','Admin',0)").run();live.prepare("INSERT INTO linux_credentials VALUES('key','local','public-key',23,'[]')").run();live.prepare("INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,role,created) VALUES('local','linux','local','Admin','admin','2026-01-01')").run();
 live.prepare("INSERT INTO linux_sessions VALUES('old-session','local',1,9999999999)").run();staged.prepare("INSERT INTO linux_sessions VALUES('backup-session','local',1,9999999999)").run();
 live.prepare("INSERT INTO linux_challenges VALUES('temporary','temporary','login',NULL,9999999999)").run();
 for(const [key,data] of [['installation',{place:'Live',association:'Live',completed:true}],['system_settings',{domain:'https://live.example.invalid',webdav:{password:'encrypted-live',daily:true,tested:'today'},smtp:{password:'smtp-live'},invitations:{expiryDays:7}}],['deleted-account:old',{code:'OLD'}],['admin-succession',{enabled:true,weeks:4,startedAt:'2026-10-15T10:00:00Z',revision:'local-policy'}],['admin-login:local',{at:'2026-10-15T11:00:00Z'}]])live.prepare('INSERT INTO archive_settings VALUES(?,?,?,?)').run(key,JSON.stringify(data),'today','admin');
 staged.prepare("INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,role,created) VALUES('foreign','imported:linux','foreign','Foreign','user','2026-01-01')").run();staged.prepare("INSERT INTO archive_settings VALUES('installation',?,'today','import')").run(JSON.stringify({place:'Restored',association:'Restored',title:'Restored title',completed:false}));staged.prepare("INSERT INTO archive_settings VALUES('system_settings',?,'today','import')").run(JSON.stringify({domain:'https://backup.invalid',webdav:{password:''},smtp:{password:''}}));
 live.close();staged.close();preserveLocal(source,target);
 const result=new DatabaseSync(target);assert.equal(result.prepare("SELECT role FROM archive_users WHERE id='local'").get().role,'admin');assert.equal(result.prepare("SELECT identity_provider FROM archive_users WHERE id='foreign'").get().identity_provider,'imported:linux');assert.equal(result.prepare('SELECT counter FROM linux_credentials').get().counter,23);assert.equal(result.prepare('SELECT count(*) n FROM linux_challenges').get().n,0);
 assert.equal(result.prepare('SELECT count(*) n FROM linux_sessions').get().n,0);
 const setting=key=>JSON.parse(result.prepare('SELECT data FROM archive_settings WHERE key=?').get(key).data);assert.equal(setting('installation').title,'Restored title');assert.equal(setting('installation').completed,true);assert.equal(setting('system_settings').webdav.password,'encrypted-live');assert.equal(setting('system_settings').webdav.daily,false);assert.equal(setting('system_settings').domain,'https://live.example.invalid');assert.equal(setting('deleted-account:old').code,'OLD');assert.equal(setting('admin-succession').revision,'local-policy');assert.equal(setting('admin-login:local').at,'2026-10-15T11:00:00Z');assert.equal(result.prepare('PRAGMA foreign_key_check').all().length,0);result.close();
 console.log('PASS: local admin, roles, passkey counters and encrypted service secrets survive; imported identities stay disabled and schedules pause.');
}finally{fs.rmSync(root,{recursive:true,force:true})}
