import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createECDH,randomBytes} from 'node:crypto';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
import {publicationPushStatements,publicationPushEvent} from '../server/publication-notices.mjs';
import {initializePush,pushService} from '../server/push-service.mjs';
const root=await fs.mkdtemp(path.resolve('.publication-push-test-')),storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=storage.database;
const adapter={prepare(sql){return {bind(...args){return {run:()=>db.prepare(sql).run(...args)}}}}};
try{
 initializeAuth(db);
 for(const role of ['admin','manager','user','guest']){db.prepare('INSERT INTO linux_accounts VALUES(?,?,?,0)').run(role,role+'@example.test',role);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run('archive-'+role,'linux',role,role,'now',role)}
 initializePush(db);const sent=[],service=pushService(db,{send:async(s,p)=>sent.push({endpoint:s.endpoint,...JSON.parse(p)})});
 for(const role of ['admin','manager','user','guest']){const curve=createECDH('prime256v1');curve.generateKeys();service.subscribe(role,{endpoint:'https://fcm.googleapis.com/fcm/send/'+role,keys:{p256dh:curve.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}});assert.equal(service.settings(role).enabled,false);service.configure(role,true,service.settings(role).preferences)}
 assert.equal(service.settings('user').preferences.publicationApproved,true);assert.equal(service.settings('user').preferences.publicationRequest,undefined);assert.equal(service.settings('admin').preferences.publicationRequest,true);assert.throws(()=>service.configure('user',true,{publicationRequest:true}));assert.throws(()=>service.configure('guest',true,{publicationApproved:true}));
 function request(id,token,requester='archive-user'){
  db.prepare("INSERT INTO entries(id,data,updated,publication_status,requested_version,requested_by,requested_at,review_token) VALUES(?,?,?,'pending',1,?,?,?)").run(id,JSON.stringify({title:'Titel '+id}),'now',requester,'now',token);
  for(const statement of publicationPushStatements(adapter,{id,token,now:'now'}))statement.run();
 }
 function approve(id,token){db.prepare("UPDATE entries SET publication_status='approved',approved_version=requested_version,approved_by='archive-admin',approved_at='now',review_token=? WHERE id=?").run(token,id);for(const statement of publicationPushStatements(adapter,{id,token,now:'now',approved:true}))statement.run()}
 request('first','request-first');for(const s of publicationPushStatements(adapter,{id:'first',token:'request-first',now:'now'}))s.run();
 assert.equal(db.prepare('SELECT count(*) AS n FROM archive_messages').get().n,0);service.scan();service.scan();assert.equal((await service.deliver()).sent,2);assert.deepEqual(sent.map(p=>p.endpoint.split('/').pop()).sort(),['admin','manager']);assert.ok(sent.every(p=>p.body==='Ein Beitrag wartet auf Veröffentlichungsfreigabe.'&&p.url==='/'));assert.equal((await service.deliver()).sent,0);
 approve('first','approved-first');service.scan();service.scan();assert.equal((await service.deliver()).sent,1);assert.equal(sent.at(-1).endpoint.split('/').pop(),'user');assert.equal(sent.at(-1).body,'Dein Beitrag „Titel first“ wurde zur Veröffentlichung freigegeben.');assert.equal(sent.at(-1).url,'/?eintrag=first');assert.equal(db.prepare('SELECT count(*) AS n FROM archive_messages').get().n,0);
 // Independent topics: message opt-out must not silence review requests.
 service.configure('admin',true,{...service.settings('admin').preferences,message:false});service.configure('manager',true,{...service.settings('manager').preferences,publicationRequest:false});request('second','request-second');service.scan();assert.equal((await service.deliver()).sent,1);assert.equal(sent.at(-1).endpoint.split('/').pop(),'admin');
 service.configure('user',true,{...service.settings('user').preferences,publicationApproved:false});approve('second','approved-second');service.scan();assert.equal((await service.deliver()).sent,0);
 // Withdrawn or edited events never escape the queue; fresh cycles have new keys.
 request('cancelled','request-cancelled');service.scan();db.prepare("UPDATE entries SET publication_status='draft',review_token='cancelled' WHERE id='cancelled'").run();assert.equal((await service.deliver()).sent,0);
 request('changed','request-changed');approve('changed','approved-changed');service.configure('user',true,{...service.settings('user').preferences,publicationApproved:true});service.scan();db.prepare("UPDATE entries SET publication_status='draft',review_token=NULL WHERE id='changed'").run();assert.equal((await service.deliver()).sent,0);
 request('role','request-role');service.scan();db.prepare("UPDATE archive_users SET role='user' WHERE identity_subject='admin'").run();assert.equal((await service.deliver()).sent,0);db.prepare("UPDATE archive_users SET role='admin' WHERE identity_subject='admin'").run();
 request('disabled','request-disabled');service.scan();service.configure('admin',false,service.settings('admin').preferences);assert.equal((await service.deliver()).sent,0);service.configure('admin',true,service.settings('admin').preferences);
 request('preference','request-preference');service.scan();service.configure('admin',true,{...service.settings('admin').preferences,publicationRequest:false});assert.equal((await service.deliver()).sent,0);service.configure('admin',true,{...service.settings('admin').preferences,publicationRequest:true});
 // An absent requester must never broadcast an approval to everyone.
 request('missing','request-missing',null);approve('missing','approved-missing');service.scan();assert.equal((await service.deliver()).sent,0);
 // Existing records remain, but old system messages do not generate new pushes.
 db.prepare("INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created) VALUES('system-publication-notices','system','publication','System','now')").run();db.prepare("INSERT INTO archive_message_threads VALUES('publication-request-legacy','Historische Anfrage','now',1)").run();db.prepare("INSERT INTO archive_message_members(thread_id,account_id,name) VALUES('publication-request-legacy','archive-admin','admin')").run();db.prepare("INSERT INTO archive_messages(thread_id,sender_id,sender_name,body,created) VALUES('publication-request-legacy','system-publication-notices','System','Alte Nachricht','now')").run();
 const subscription=db.prepare("SELECT id FROM linux_push_subscriptions WHERE account_id='admin'").get().id;db.prepare('INSERT INTO linux_push_queue(id,subscription_id,topic,payload,created) VALUES(?,?,?,?,?)').run('legacy',subscription,'message',JSON.stringify({url:'/?ansicht=nachrichten&unterhaltung=publication-request-legacy',tag:'archive-message-'+db.prepare("SELECT id FROM archive_messages WHERE thread_id='publication-request-legacy'").get().id+':admin'}),Date.now());initializePush(db);service.scan();assert.equal((await service.deliver()).sent,0);assert.equal(db.prepare('SELECT count(*) AS n FROM archive_messages').get().n,1);
 // Transaction failure must roll back both decision and outbox.
 db.exec("CREATE TRIGGER fail_event BEFORE INSERT ON archive_settings WHEN NEW.key LIKE 'publication-push:%' BEGIN SELECT RAISE(ABORT,'fixture'); END");db.exec('BEGIN IMMEDIATE');try{db.prepare("UPDATE entries SET publication_status='pending',review_token='rollback' WHERE id='cancelled'").run();for(const s of publicationPushStatements(adapter,{id:'cancelled',token:'rollback',now:'now'}))s.run();assert.fail('Expected failure')}catch{db.exec('ROLLBACK')}
 assert.equal(db.prepare("SELECT publication_status FROM entries WHERE id='cancelled'").get().publication_status,'draft');assert.equal(publicationPushEvent(db,'publication-push:publicationRequest:rollback'),null);db.exec('DROP TRIGGER fail_event');
 const before=sent.length;initializePush(db);service.scan();await service.deliver();assert.equal(sent.length,before);assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 console.log('PASS: no new messages/reminders; role-specific defaults, independent opt-outs, mapped requester-only approval/title, deduplication/restart, cancelled/edited/role/disabled guards, missing-target protection, legacy preservation and atomic rollback.');
}finally{storage.close();await fs.rm(root,{recursive:true,force:true})}
