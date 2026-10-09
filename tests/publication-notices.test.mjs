import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createECDH,randomBytes} from 'node:crypto';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
import {messageService} from '../server/message-service.mjs';
import {publicationNoticeStatements} from '../server/publication-notices.mjs';
import {initializePush,pushService} from '../server/push-service.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-publication-notices-')),storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=storage.database;
try{
 initializeAuth(db);
 for(const [id,role,disabled] of [['admin','admin',0],['manager','manager',0],['user','user',0],['disabled','admin',1]]){db.prepare('INSERT INTO linux_accounts VALUES(?,?,?,?)').run(id,id+'@example.test',id,disabled);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(id,'linux',id,id,'now',role)}
 db.prepare("INSERT INTO entries(id,data,updated) VALUES('entry',?, 'now')").run(JSON.stringify({title:'Titel des Beitrags'}));
 db.prepare("INSERT INTO entry_references VALUES('entry','REF-1','now')").run();
 async function request(token){return storage.batch([storage.prepare("UPDATE entries SET publication_status='pending',requested_by='user',requested_version=1,review_token=? WHERE id='entry' AND publication_status IN ('draft','rejected')").bind(token),...publicationNoticeStatements(storage,{id:'entry',token,now:'2026-10-09T17:00:00Z'})])}
 initializePush(db);const sent=[];const push=pushService(db,{send:async(s,p)=>sent.push({endpoint:s.endpoint,payload:JSON.parse(p)})});
 for(const id of ['admin','manager']){const ec=createECDH('prime256v1');ec.generateKeys();push.subscribe(id,{endpoint:'https://fcm.googleapis.com/fcm/send/'+id,keys:{p256dh:ec.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}});push.configure(id,true,{...push.settings(id).preferences,message:id==='admin'})}
 await request('first');const service=messageService(db),thread=service.list('admin')[0];assert.ok(thread.notification);assert.equal(service.count('admin'),1);assert.equal(service.count('manager'),1);assert.equal(service.count('user'),0);assert.throws(()=>service.detail('user',thread.id));assert.equal(db.prepare("SELECT count(*) AS n FROM archive_message_members WHERE account_id='disabled'").get().n,0);
 const detail=service.detail('admin',thread.id);assert.equal(detail.entry.id,'entry');assert.equal(detail.entry.reference,'REF-1');assert.equal(detail.entry.pending,null);assert.equal(detail.notification,true);assert.equal(detail.announcement,1);assert.throws(()=>service.send('manager',{threadId:thread.id,body:'Reply'}));assert.equal(db.prepare("SELECT count(*) AS n FROM linux_accounts WHERE id='system-publication-notices'").get().n,0);
 push.scan();push.scan();assert.equal((await push.deliver()).sent,1);assert.equal(sent[0].endpoint,'https://fcm.googleapis.com/fcm/send/admin');assert.ok(sent[0].payload.tag.startsWith('archive-message-'));assert.ok(sent[0].payload.url.includes(encodeURIComponent(thread.id)));assert.equal(db.prepare("SELECT count(*) AS n FROM linux_push_queue WHERE topic='publication'").get().n,0);
 await storage.batch(publicationNoticeStatements(storage,{id:'entry',token:'first',now:'now'}));await request('stale');assert.equal(db.prepare('SELECT count(*) AS n FROM archive_messages').get().n,1);
 db.prepare("UPDATE entries SET publication_status='rejected' WHERE id='entry'").run();await request('second');assert.equal(service.count('admin'),2);assert.equal(service.count('manager'),2);
 db.prepare("UPDATE entries SET publication_status='draft' WHERE id='entry'").run();await assert.rejects(()=>storage.batch([storage.prepare("UPDATE entries SET publication_status='pending',review_token='broken' WHERE id='entry'"),...publicationNoticeStatements(storage,{id:'entry',token:'broken',now:'now'}),storage.prepare('INSERT INTO no_such_table VALUES(1)')]));assert.equal(db.prepare("SELECT publication_status FROM entries WHERE id='entry'").get().publication_status,'draft');assert.equal(db.prepare('SELECT count(*) AS n FROM archive_messages').get().n,2);
 db.prepare("UPDATE archive_users SET role='user' WHERE id='manager'").run();await request('third');assert.equal(service.count('manager'),2);assert.equal(service.count('admin'),3);
 // Retire already queued legacy publication notifications on upgrade.
 db.prepare("INSERT INTO linux_push_queue(id,subscription_id,topic,payload,created) VALUES('legacy','missing','publication','{}',0)").run();initializePush(db);assert.equal(db.prepare("SELECT count(*) AS n FROM linux_push_queue WHERE topic='publication'").get().n,0);
 // Backup import rewrites identity providers; keep the existing technical identity by ID.
 db.prepare("UPDATE archive_users SET identity_provider='imported:system' WHERE id='system-publication-notices'").run();db.prepare("UPDATE entries SET publication_status='draft' WHERE id='entry'").run();await request('after-import');assert.equal(service.count('admin'),4);
 assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 console.log('PASS: all active reviewers, no ordinary/disabled users, linked entry, existing approval only, message preference controls push, duplicate/stale requests, atomic failure, re-request and revoked roles, retired push queue.');
}finally{storage.close();await fs.rm(root,{recursive:true,force:true})}
