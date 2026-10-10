import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
import {messageService} from '../server/message-service.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-guest-messages-')),storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=storage.database;
try{
 initializeAuth(db);for(const [id,role] of [['admin','admin'],['manager','manager'],['user','user'],['guest','guest'],['guest2','guest'],['outsider','guest']]){db.prepare('INSERT INTO linux_accounts VALUES(?,?,?,0)').run(id,id+'@example.test',id);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(id,'linux',id,id,'now',role)}
 const s=messageService(db);assert.ok(s.recipients('manager').some(r=>r.id==='guest'));assert.ok(!s.recipients('user').some(r=>r.role==='guest'));
 assert.throws(()=>s.send('user',{subject:'No',body:'No',recipients:['guest']}));assert.throws(()=>s.send('guest',{subject:'No',body:'No',recipients:['admin']}));
 const t=s.send('manager',{subject:'Zugriff',body:'Bitte beantworten.',recipients:['guest','guest2'],poll:{question:'Zugriff weiterhin benötigt?',options:['Ja','Nein']}});
 assert.equal(s.count('guest'),1);assert.equal(s.list('guest').length,1);assert.throws(()=>s.detail('outsider',t.threadId));assert.throws(()=>s.vote('outsider',t.threadId,0));assert.throws(()=>s.vote('manager',t.threadId,0));assert.throws(()=>s.vote('guest',t.threadId,5));assert.throws(()=>s.send('guest',{threadId:t.threadId,body:'free text'}));assert.throws(()=>s.send('manager',{threadId:t.threadId,body:'reply'}));
 s.vote('guest',t.threadId,1);assert.throws(()=>s.vote('guest',t.threadId,0));assert.equal(s.detail('guest2',t.threadId).poll.answers.length,0);const result=s.detail('manager',t.threadId).poll;assert.equal(result.answers[0].name,'guest');assert.ok(result.answers[0].answeredAt);assert.equal(result.recipients.length,2);
 s.hide('guest',t.threadId,t.messageId);assert.equal(s.count('guest'),0);assert.equal(s.list('guest').length,0);assert.equal(s.detail('manager',t.threadId).poll.answers.length,1);
 s.closePoll('manager',t.threadId);assert.throws(()=>s.vote('guest2',t.threadId,0));assert.equal(db.prepare("SELECT role FROM archive_users WHERE id='guest'").get().role,'guest');
 const allGuests=s.send('admin',{subject:'Alle Gäste',body:'Bitte auswählen.',all:true,audience:'guests',poll:{question:'Weiterlesen?',options:['Ja','Nein']}});assert.equal(s.detail('admin',allGuests.threadId).poll.recipients.length,3);assert.ok(s.detail('guest',allGuests.threadId));assert.throws(()=>s.detail('user',allGuests.threadId));const members=s.send('admin',{subject:'Mitglieder',body:'Intern',all:true,audience:'members',announcement:true});assert.throws(()=>s.detail('guest',members.threadId));assert.equal(s.detail('admin',members.threadId).members.length,3);
 const normal=s.send('admin',{subject:'Mitteilung',body:'Hallo',recipients:['guest']});assert.equal(s.detail('guest',normal.threadId).poll,null);assert.equal(s.detail('guest',normal.threadId).messages[0].sender_name,'admin');
 assert.throws(()=>s.send('manager',{subject:'Bad',body:'x',recipients:['guest'],poll:{question:'?',options:['Ja','ja']}}));assert.throws(()=>s.send('manager',{subject:'Bad',body:'x',recipients:['guest','user'],poll:{question:'?',options:['Ja','Nein']}}));assert.throws(()=>s.send('manager',{subject:'Bad',body:'x',recipients:['guest'],entryId:'private'}));
 const preview=messageService(db,'guest');assert.throws(()=>preview.closePoll('manager',t.threadId));assert.throws(()=>preview.vote('manager',t.threadId,0));
 console.log('PASS: guest recipient permissions, private read-only notices, isolated poll answers, one vote, close/invalid choices, deletion preserves answers, no access changes or preview bypass.');
}finally{storage.close();await fs.rm(root,{recursive:true,force:true})}
