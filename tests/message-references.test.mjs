import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
import {messageService} from '../server/message-service.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-message-ref-')),storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=storage.database;
try{
 initializeAuth(db);for(const role of ['admin','manager','user']){db.prepare('INSERT INTO linux_accounts VALUES(?,?,?,0)').run(role,role+'@example.test',role);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(role,'linux',role,role,'now',role)}
 db.prepare("INSERT INTO entries(id,data,updated,publication_status,requested_version,requested_by,review_token) VALUES(?,?,?,'pending',1,'user','request-1')").run('entry',JSON.stringify({title:'Testbeitrag'}),'now');db.prepare('INSERT INTO entry_references(entry_id,reference,created) VALUES(?,?,?)').run('entry','REF-1','now');
 const s=messageService(db);assert.throws(()=>s.reviewDraft('user','entry'));const draft=s.reviewDraft('manager','entry');assert.equal(draft.recipient,'user');assert.equal(draft.threadId,null);
 const a=s.send('manager',{subject:'Rückfrage',body:'Bitte prüfen.',recipients:['user'],entryId:'entry',reviewToken:draft.reviewToken});assert.equal(s.detail('user',a.threadId).entry.reference,'REF-1');assert.equal(s.detail('user',a.threadId).entry.pending,null);assert.ok(s.detail('manager',a.threadId).entry.pending);assert.throws(()=>s.detail('admin',a.threadId));
 assert.equal(s.reviewDraft('manager','entry').threadId,a.threadId);const b=s.send('manager',{subject:'Rückfrage',body:'Noch eine Frage.',recipients:['user'],entryId:'entry',reviewToken:'request-1'});assert.equal(b.threadId,a.threadId);assert.equal(s.detail('user',a.threadId).messages.length,2);
 s.send('user',{threadId:a.threadId,body:'Antwort'});assert.throws(()=>s.send('user',{threadId:a.threadId,body:'Referenz tauschen',entryId:'other'}));
 const before=s.list('manager').length;assert.throws(()=>s.send('manager',{subject:'Stale',body:'Text',recipients:['admin'],entryId:'entry',reviewToken:'request-1'}));assert.equal(s.list('manager').length,before);
 const own=s.send('user',{subject:'Allgemeine Frage',body:'Text',recipients:['admin'],entryId:'entry'});assert.equal(s.detail('admin',own.threadId).entry.title,'Testbeitrag');
 db.prepare("UPDATE entries SET publication_status='approved' WHERE id='entry'").run();assert.equal(s.detail('manager',a.threadId).entry.pending,null);assert.throws(()=>s.reviewDraft('manager','entry'));assert.throws(()=>s.send('manager',{subject:'Stale',body:'Text',recipients:['user'],entryId:'entry',reviewToken:'request-1'}));
 db.prepare("UPDATE entries SET publication_status='pending',review_token='request-2' WHERE id='entry'").run();assert.equal(s.reviewDraft('manager','entry').threadId,null);assert.throws(()=>s.send('manager',{subject:'Stale',body:'Text',recipients:['user'],entryId:'entry',reviewToken:'request-1'}));
 db.prepare("UPDATE entries SET deleted=1 WHERE id='entry'").run();assert.equal(s.detail('user',a.threadId).entry.unavailable,true);assert.throws(()=>s.send('user',{subject:'Deleted',body:'Text',recipients:['admin'],entryId:'entry'}));assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 console.log('PASS: references, membership privacy, role-limited pending decisions, requester preselection, conversation reuse, preserved replies, changed/finished request rejection and deleted entry handling.');
}finally{storage.close();await fs.rm(root,{recursive:true,force:true})}
