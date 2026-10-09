import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createECDH,randomBytes} from 'node:crypto';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
import {initializePush,pushService} from '../server/push-service.mjs';
import {messageService} from '../server/message-service.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-delete-')),storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=storage.database;
try{
 initializeAuth(db);initializePush(db);
 for(const role of ['admin','manager','user']){db.prepare('INSERT INTO linux_accounts(id,email,name) VALUES(?,?,?)').run(role,role+'@example.test',role);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(role,'linux',role,role,'now',role)}
 const service=messageService(db),push=pushService(db,{send:async()=>{}});
 for(const role of ['admin','manager','user']){const k=createECDH('prime256v1');k.generateKeys();push.subscribe(role,{endpoint:'https://fcm.googleapis.com/fcm/send/'+role,keys:{p256dh:k.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}});push.configure(role,true,push.settings(role).preferences)}
 const first=service.send('admin',{subject:'Together',body:'Old',all:true});push.scan();
 for(const actor of ['admin','manager','user']){service.hide(actor,first.threadId,first.messageId);assert.equal(service.count(actor),0);assert.equal(service.list(actor).length,0);assert.throws(()=>service.detail(actor,first.threadId));}
 assert.equal(db.prepare("SELECT count(*) AS n FROM linux_push_queue WHERE topic='message'").get().n,0);
 assert.equal(db.prepare('SELECT count(*) AS n FROM archive_messages').get().n,1);
 const next=service.send('admin',{threadId:first.threadId,body:'New'});push.scan();
 assert.equal(service.count('manager'),1);assert.equal(service.count('user'),1);assert.equal(service.list('admin').length,1);
 // Snapshot-based deletion must not consume a concurrently received reply or its Push.
 service.hide('user',first.threadId,first.messageId);assert.equal(service.count('user'),1);assert.equal(service.list('user').length,1);assert.equal(service.detail('user',first.threadId).messages.at(-1).id,next.messageId);
 assert.equal(db.prepare("SELECT count(*) AS n FROM linux_push_queue q JOIN linux_push_subscriptions s ON s.id=q.subscription_id WHERE s.account_id='user'").get().n,1);
 service.hide('user',first.threadId,next.messageId);assert.equal(service.count('user'),0);assert.equal(service.count('manager'),1);assert.equal(service.list('user').length,0);assert.equal(service.list('manager').length,1);
 const privateThread=service.send('user',{subject:'Private',body:'Private',recipients:['manager']});assert.throws(()=>service.hide('admin',privateThread.threadId,privateThread.messageId));assert.throws(()=>service.hide('user',first.threadId,privateThread.messageId));assert.throws(()=>service.hide('user',first.threadId,'1'));
 db.prepare("UPDATE linux_accounts SET disabled=1 WHERE id='manager'").run();assert.throws(()=>service.hide('manager',first.threadId,next.messageId));
 assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 console.log('PASS: all roles, personal isolation, deep-link hiding, new reply revival, deletion/reply race, unread and queued Push isolation, membership and disabled-account guards.');
}finally{storage.close();await fs.rm(root,{recursive:true,force:true})}
