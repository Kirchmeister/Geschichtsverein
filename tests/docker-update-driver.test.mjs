import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {dockerUpdateDriver} from '../server/docker-update-driver.mjs';
const root=await fs.mkdtemp(path.resolve('.update-test-driver-'));
try{
 const cfg={root:root+'/manager',dataRoot:root+'/data',configRoot:root+'/config',container:'geschichtsarchiv-test',appPort:8080,uid:process.getuid(),gid:process.getgid()};
 if(!cfg.uid)cfg.uid=cfg.gid=1000;
 const code=cfg.root+'/releases/test';await fs.mkdir(code,{recursive:true});await fs.mkdir(cfg.configRoot);await fs.writeFile(code+'/version.json',JSON.stringify({version:'0.10.0',codeCommit:'a'.repeat(40),databaseSchemaVersion:16}));
 const calls=[];let running=true,foreign=false;const run=async(cmd,args)=>{calls.push([cmd,args]);if(args[0]==='inspect')return {stdout:JSON.stringify([{State:{Running:running},Config:{Image:'test',Labels:{'com.docker.compose.service':'archive'}},Mounts:[{Destination:'/data',Source:foreign?'/other':cfg.dataRoot},{Destination:'/config',Source:cfg.configRoot}]}])};return {stdout:''}};
 const driver=dockerUpdateDriver(cfg,run);
 await assert.rejects(driver('migrate',code),/angehalten/);assert.equal(calls.some(c=>c[1][0]==='run'),false);
 foreign=true;await assert.rejects(driver('stop',code),/Archivablagen/);assert.equal(calls.some(c=>c[1][0]==='stop'),false);
 foreign=false;await driver('stop',code);assert.deepEqual(calls.at(-1),['docker',['stop','--time','60','geschichtsarchiv-test']]);
 running=false;await driver('migrate',code);const probe=calls.at(-1)[1];assert.equal(probe.includes('none'),true);assert.equal(probe.at(-1),'migrate');
 await assert.rejects(driver('verify-restore',code,'/outside/data','/outside/config'),/Probeablagen/);
 console.log('PASS: Docker driver confines mutations to the configured archive and refuses live migrations and foreign containers.');
}finally{await fs.rm(root,{recursive:true,force:true})}
