import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {compareVersions,updatePath,directCompatibility} from '../server/update-compatibility.mjs';
import {UpdateEngine} from '../server/update-engine.mjs';
const current={version:'0.20.0',databaseSchemaVersion:18,backupFormatVersion:2,prerelease:false};
const release=(tag,minimum='0.20.0',schema=19)=>({tag,draft:false,prerelease:tag.includes('-beta.'),commit:'a'.repeat(40),branchVerified:true,version:{version:tag.slice(1),databaseSchemaVersion:schema,backupFormatVersion:2,prerelease:tag.includes('-beta.')},compatibility:{policyVersion:1,minimumServiceVersion:'0.35.0',supportedSources:[{minimumVersion:minimum,maximumVersion:tag.slice(1),minimumSchema:18,maximumSchema:schema,backupFormatVersion:2}]}});
const stable=release('v0.35.0'),beta=release('v0.36.0-beta.1','0.35.0');
assert.equal(compareVersions('0.35.0','0.35.0-beta.2')>0,true);assert.equal(compareVersions('0.35.0-beta.10','0.35.0-beta.2')>0,true);
assert.equal(directCompatibility(current,stable,'0.35.0').ok,true);
for(const bad of [{...stable,compatibility:null},{...stable,branchVerified:false},{...stable,version:{...stable.version,databaseSchemaVersion:17}},{...stable,version:{...stable.version,backupFormatVersion:3}}])assert.equal(directCompatibility(current,bad,'0.35.0').ok,false);
assert.equal(directCompatibility(current,stable,'0.34.0').ok,false);assert.equal(directCompatibility({...current,version:'0.10.0'},stable,'0.35.0').ok,false);
const target=release('v0.36.0','0.35.0');assert.deepEqual(updatePath(current,target,[target,stable],{serviceVersion:'0.35.0'}).path,['v0.35.0','v0.36.0']);assert.equal(updatePath(current,target,[target],{serviceVersion:'0.35.0'}).path.length,0);
assert.equal(updatePath({...current,version:'0.35.0'},beta,[beta],{serviceVersion:'0.35.0'}).compatible,false);assert.equal(updatePath({...current,version:'0.35.0'},beta,[beta],{serviceVersion:'0.35.0',allowBeta:true}).compatible,true);
const back={...current,version:'0.35.0-beta.2',databaseSchemaVersion:19,prerelease:true};assert.equal(updatePath(back,stable,[stable],{serviceVersion:'0.35.0'}).compatible,true);
const root=await fs.mkdtemp(path.resolve('.update-policy-test-'));try{
 const code=root+'/manager/releases/current',next=root+'/manager/releases/next',dataRoot=root+'/data',configRoot=root+'/config';for(const p of [code,next+'/docs',dataRoot,configRoot])await fs.mkdir(p,{recursive:true});
 await fs.writeFile(code+'/version.json',JSON.stringify({...back,codeCommit:'b'.repeat(40)}));await fs.writeFile(next+'/version.json',JSON.stringify({...stable.version,codeCommit:stable.commit}));await fs.writeFile(next+'/docs/update-compatibility.json',JSON.stringify(stable.compatibility));await fs.symlink(code,root+'/manager/current');await fs.writeFile(dataRoot+'/records','unchanged');await fs.writeFile(configRoot+'/secret','test');
 const actions=[];let failTrial=true;const options={root:root+'/manager',dataRoot,configRoot,serviceVersion:'0.35.0',listReleases:async()=>[stable,beta],prepareRelease:async()=>next,validateRestore:async()=>{},driver:async(action,c,d)=>{actions.push(action);if(action==='verify-update'){assert.notEqual(d,dataRoot);assert.equal(await fs.readFile(d+'/records','utf8'),'unchanged');if(failTrial)throw Error('trial failure')}if(action==='migrate')await fs.writeFile(dataRoot+'/records','migrated')}};
 let e=await new UpdateEngine(options).init();await e.check();assert.equal((await e.status()).releases.some(r=>r.prerelease),false);await e.setBeta(true);e=await new UpdateEngine(options).init();assert.equal(e.state.allowBeta,true);await e.setBeta(false);assert.equal((await e.status()).currentVersion,back.version);await assert.rejects(()=>e.startUpdate(beta.tag),/Kanal/);assert.equal(actions.length,0);
 let s=await e.startUpdate(stable.tag);assert.equal(s.job.status,'rolled_back');assert.equal(actions.includes('migrate'),false);assert.equal(await fs.readFile(dataRoot+'/records','utf8'),'unchanged');failTrial=false;s=await e.startUpdate(stable.tag);assert.equal(s.job.status,'complete');assert.equal(actions.indexOf('verify-update')<actions.indexOf('migrate'),true);
 e.state.releases=[stable];await fs.writeFile(next+'/version.json',JSON.stringify({...back,version:'0.36.0-beta.1',codeCommit:'a'.repeat(40)}));s=await e.status();assert.match(s.betaNotice,/Beta-Updates sind deaktiviert/);assert.equal(s.latestStableVersion,'0.35.0');assert.equal(s.releases.length,0);
 console.log('PASS: semver beta order, direct/bridge/no-path checks, unknown metadata, durable channel, no downgrade, stable return and isolated migration before live writes.');
}finally{await fs.rm(root,{recursive:true,force:true})}
