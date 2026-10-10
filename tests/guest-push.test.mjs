import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createECDH,randomBytes} from 'node:crypto';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth,authService} from '../server/auth-service.mjs';
import {initializePush,pushService} from '../server/push-service.mjs';
import {messageService} from '../server/message-service.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-guest-push-')),storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=storage.database;
try{initializeAuth(db);for(const [id,role] of [['admin','admin'],['guest','guest'],['other','guest'],['changed','user']]){db.prepare('INSERT INTO linux_accounts VALUES(?,?,?,0)').run(id,id+'@example.test',id);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(id,'linux',id,id,'now',role)}initializePush(db);const sent=[],push=pushService(db,{origin:'https://archive.example.test',send:async(s,p)=>sent.push({endpoint:s.endpoint,payload:JSON.parse(p)})}),messages=messageService(db),auth=authService(db,{origin:'https://archive.example.test',sessionKey:'a'.repeat(64)});
for(const id of ['guest','other','changed']){const k=createECDH('prime256v1');k.generateKeys();push.subscribe(id,{endpoint:'https://fcm.googleapis.com/fcm/send/'+id,keys:{p256dh:k.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}});push.configure(id,true,push.settings(id).preferences)}
assert.deepEqual(push.settings('guest').preferences,{message:true});assert.throws(()=>push.configure('guest',true,{qr:true}));assert.throws(()=>push.configure('guest',true,{comment:true}));
const one=messages.send('admin',{subject:'Secret subject',body:'Secret question',recipients:['guest'],poll:{question:'Secret?',options:['Ja','Nein']}});push.scan();await push.deliver();assert.equal(sent.length,1);assert.ok(sent[0].endpoint.endsWith('/guest'));assert.equal(sent[0].payload.url,'/?ansicht=nachrichten&unterhaltung='+one.threadId);assert.ok(!JSON.stringify(sent[0].payload).includes('Secret'));push.scan();assert.equal((await push.deliver()).sent,0);
const all=messages.send('admin',{subject:'Alle Gäste',body:'Alle',all:true,audience:'guests',poll:{question:'Weiter?',options:['Ja','Nein']}});push.scan();assert.equal((await push.deliver()).sent,2);assert.ok(sent.slice(1).every(x=>!x.endpoint.endsWith('/changed')));
// A queued internal discussion loses guest accessibility on a role downgrade.
messages.send('admin',{subject:'Internal',body:'Protected',recipients:['changed']});push.scan();auth.edit('changed','guest',false,'admin');assert.equal((await push.deliver()).sent,0);assert.equal(push.settings('changed').devices,1);assert.deepEqual(push.settings('changed').preferences,{message:true});
// Restart cleanup keeps message devices but removes stale non-message topics and retains opt-out.
push.configure('guest',true,{message:false});db.prepare("UPDATE linux_push_preferences SET data='{\"message\":false,\"backup\":true}' WHERE account_id='guest'").run();initializePush(db);assert.deepEqual(push.settings('guest').preferences,{message:false});assert.equal(push.settings('guest').devices,1);messages.send('admin',{subject:'No Push',body:'Still readable',recipients:['guest']});push.scan();assert.equal((await push.deliver()).sent,0);
messages.send('admin',{subject:'Disabled',body:'No push',recipients:['other']});push.scan();auth.edit('other','guest',true,'admin');assert.equal((await push.deliver()).sent,0);
console.log('PASS: single/all guest message Push, private generic payload, no other topics, disabled/opt-out protection, restart device retention and inaccessible queued thread revocation.');
}finally{storage.close();await fs.rm(root,{recursive:true,force:true})}
