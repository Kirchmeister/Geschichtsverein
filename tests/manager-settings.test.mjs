import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {authService,initializeAuth} from '../server/auth-service.mjs';
import {accountCode,adminGrantConfirmation,protectLastAdmin} from '../server/account-management.mjs';
const root=await fs.mkdtemp(path.resolve('.manager-settings-test-')),store=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle')),db=store.database;
try{
 initializeAuth(db);
 function add(id,role){db.prepare('INSERT INTO linux_accounts VALUES(?,?,?,0)').run(id,id+'@example.test',id);db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created,role) VALUES(?,?,?,?,?,?)').run(id,'linux',id,id,'now',role)}
 add('admin','admin');add('manager','manager');add('user','user');add('other','user');
 const config={origin:'https://archive.example.test',sessionKey:'b'.repeat(64)},s=authService(db,config);
 assert.throws(()=>s.edit('other','admin',false,'user',adminGrantConfirmation));assert.throws(()=>s.edit('other','admin',false,'manager'));assert.throws(()=>s.edit('manager','admin',false,'manager',adminGrantConfirmation));assert.equal(s.grantLog().length,0);
 assert.throws(()=>protectLastAdmin(db,{id:'admin',role:'admin',disabled:0}),/letzte aktive/);
 assert.throws(()=>s.delete('admin','manager',accountCode(db,'admin')));assert.throws(()=>s.rename('admin','Changed','manager'));
 s.rename('user','New name','manager');s.edit('user','user',true,'manager');s.edit('user','user',false,'manager');
 s.edit('user','admin',false,'manager',adminGrantConfirmation);assert.equal(s.grantLog()[0].actor.id,'manager');assert.equal(s.grantLog()[0].target.id,'user');assert.ok(s.grantLog()[0].at);assert.equal(s.grantLog()[0].kind,'promotion');
 for(const change of [()=>s.edit('user','user',false,'manager'),()=>s.edit('user','admin',true,'manager'),()=>s.rename('user','No','manager'),()=>s.delete('user','manager',accountCode(db,'user'))])assert.throws(change,/bestehende Administratorkonten/);
 const preview=authService(db,{...config,managementRole:'manager'});assert.throws(()=>preview.edit('user','user',false,'admin'));assert.throws(()=>preview.rename('user','No','admin'));assert.throws(()=>preview.delete('user','admin',accountCode(db,'user')));
 s.edit('user','user',false,'admin');assert.throws(()=>protectLastAdmin(db,{id:'admin',role:'admin',disabled:0}));
 s.edit('other','admin',false,'admin',adminGrantConfirmation);s.delete('other','admin',accountCode(db,'other'));assert.throws(()=>protectLastAdmin(db,{id:'admin',role:'admin',disabled:0}));
 assert.throws(()=>s.invite({email:'pending@example.test',name:'Pending',role:'admin'},false,'manager'));assert.equal(s.pending().length,0);
 const token=s.invite({email:'pending@example.test',name:'Pending',role:'admin',confirmation:adminGrantConfirmation},false,'manager');assert.equal(s.pending().length,1);assert.ok(!JSON.stringify(s.grantLog()).includes(token));assert.equal(s.grantLog().find(g=>g.target.email==='pending@example.test').kind,'invitation');s.revoke(s.pending()[0].hash,'manager');assert.equal(s.pending().length,0);assert.ok(s.grantLog().find(g=>g.target.email==='pending@example.test'));
 // Audit write and role change must roll back together on failure.
 db.exec("CREATE TRIGGER reject_grant BEFORE INSERT ON archive_settings WHEN NEW.key LIKE 'admin-grant:%' BEGIN SELECT RAISE(ABORT,'fixture'); END");assert.throws(()=>s.edit('user','admin',false,'manager',adminGrantConfirmation));assert.equal(s.accounts().find(a=>a.id==='user').role,'user');db.exec('DROP TRIGGER reject_grant');
 s.invite({email:'recover@example.test',name:'Recovery',role:'admin',confirmation:adminGrantConfirmation},false,'ssh-recovery');assert.equal(s.grantLog().find(g=>g.target.email==='recover@example.test').kind,'recovery');
 const maintenance=path.join(root,'maintenance'),configFile=path.join(root,'app.env');await fs.writeFile(configFile,`ARCHIVE_ORIGIN=${config.origin}\nARCHIVE_SESSION_KEY=${config.sessionKey}\nARCHIVE_DATA_DIR=${root}\nARCHIVE_MAINTENANCE_FILE=${maintenance}\n`);
 function recover(confirmation){return spawnSync(process.execPath,['scripts/linux-start.mjs','scripts/linux-recover-admin.mjs','ssh-admin@example.test','SSH Admin',confirmation],{env:{...process.env,ARCHIVE_CONFIG_FILE:configFile},encoding:'utf8'})}
 assert.notEqual(recover('wrong').status,0);await fs.writeFile(maintenance,'1');assert.notEqual(recover(adminGrantConfirmation).status,0);assert.ok(!s.pending().some(i=>i.email==='ssh-admin@example.test'));await fs.writeFile(maintenance,'0');const recovered=recover(adminGrantConfirmation);assert.equal(recovered.status,0,recovered.stderr);assert.match(recovered.stdout,/anmelden#einladung=/);assert.ok(s.pending().some(i=>i.email==='ssh-admin@example.test'));assert.equal(s.grantLog().find(g=>g.target.email==='ssh-admin@example.test').actor.id,'ssh-recovery');add('ssh-admin','user');assert.notEqual(recover(adminGrantConfirmation).status,0);
 console.log('PASS: manager promotion/invitations, confirmations, audit atomicity, protected existing admins and last active admin, preview restrictions and SSH recovery invitation.');
}finally{store.close();await fs.rm(root,{recursive:true,force:true,maxRetries:5})}
