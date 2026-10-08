import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const root=await fs.mkdtemp(path.resolve('.update-test-lock-'));
const module=new URL('../server/update-lock.mjs',import.meta.url).href;
function agent(){const child=spawn(process.execPath,['--input-type=module','-e',`import {acquireUpdateLock} from ${JSON.stringify(module)};try{await acquireUpdateLock(${JSON.stringify(root)});console.log('READY')}catch{process.exit(2)}`],{stdio:['ignore','pipe','pipe']});return child}
const waitExit=c=>new Promise(r=>c.exitCode!==null?r(c.exitCode):c.once('exit',r));
const waitReady=c=>new Promise((resolve,reject)=>{c.stdout.once('data',d=>String(d).includes('READY')?resolve():reject(Error('Not ready')));c.once('exit',()=>reject(Error('Exited before ready')))});
let first,third;
try{first=agent();await waitReady(first);const second=agent();assert.equal(await waitExit(second),2);first.kill('SIGKILL');await waitExit(first);await new Promise(r=>setTimeout(r,100));third=agent();await waitReady(third);third.kill('SIGTERM');assert.equal(await waitExit(third),0);console.log('PASS: concurrent agent blocked; lock reacquired after crash; graceful shutdown succeeds.');}finally{first?.kill('SIGKILL');third?.kill('SIGKILL');await fs.rm(root,{recursive:true,force:true})}
