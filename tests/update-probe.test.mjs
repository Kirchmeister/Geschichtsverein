import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {sqliteBinding} from '../server/linux-storage.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-probe-'));
try{const config=root+'/app.env';await fs.writeFile(config,['SESSION','SETTINGS','RUNNER'].map(k=>'ARCHIVE_'+k+'_KEY='+'a'.repeat(64)).join('\n')+'\nARCHIVE_ORIGIN=https://example.org\n');const env={...process.env,ARCHIVE_DATA_DIR:root,ARCHIVE_CONFIG_FILE:config};const run=action=>execFileSync(process.execPath,['scripts/update-probe.mjs',action],{env,stdio:'pipe'}).toString();assert.match(run('migrate'),/Probe erfolgreich/);assert.match(run('verify'),/Probe erfolgreich/);const storage=sqliteBinding(root+'/archive.sqlite',path.resolve('drizzle'));storage.database.prepare('INSERT INTO entries(id,data,updated) VALUES(?,?,?)').run('test',JSON.stringify({files:[{key:'missing-file'}]}),'2026-01-01');storage.close();assert.throws(()=>run('verify'));console.log('PASS: real SQLite migration and restore verification; missing referenced media blocks approval.');}finally{await fs.rm(root,{recursive:true,force:true})}
