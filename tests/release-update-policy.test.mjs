import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {directCompatibility,updatePath} from '../server/update-compatibility.mjs';
const version=JSON.parse(await fs.readFile('version.json','utf8'));
const policy=JSON.parse(await fs.readFile('docs/update-compatibility.json','utf8'));
const target={tag:'v'+version.version,prerelease:version.prerelease,draft:false,commit:'a'.repeat(40),branchVerified:true,version,compatibility:policy};
for(const source of ['0.49.0','0.49.1','0.49.2','0.49.3']){
 const current={version:source,databaseSchemaVersion:20,backupFormatVersion:2,prerelease:false};
 assert.equal(directCompatibility(current,target,'0.46.1').ok,true);
 assert.deepEqual(updatePath(current,target,[target],{serviceVersion:'0.46.1'}).path,[target.tag]);
 const broken={...target,compatibility:{...policy,supportedSources:policy.supportedSources.map(s=>({...s,maximumVersion:'0.48.1'}))}};
 assert.equal(directCompatibility(current,broken,'0.46.1').ok,false);
 for(const bad of [{...current,databaseSchemaVersion:21},{...current,backupFormatVersion:3},{...current,version:'0.19.0'}])assert.equal(directCompatibility(bad,target,'0.46.1').ok,false);
 assert.equal(directCompatibility(current,target,'0.34.0').ok,false);
}
// The release check must fail before publication when source coverage regresses.
const root=await fs.mkdtemp(path.resolve('.release-policy-test-'));
try{
 await fs.mkdir(path.join(root,'docs'));await fs.mkdir(path.join(root,'drizzle'));
 for(const file of ['version.json','package.json','CHANGELOG.md'])await fs.copyFile(file,path.join(root,file));
 for(const file of (await fs.readdir('drizzle')).filter(f=>f.endsWith('.sql')))await fs.copyFile(path.join('drizzle',file),path.join(root,'drizzle',file));
 const check=()=>spawnSync(process.execPath,[path.resolve('scripts/check-version.mjs')],{cwd:root,encoding:'utf8'});
 await fs.writeFile(path.join(root,'docs/update-compatibility.json'),JSON.stringify({...policy,supportedSources:policy.supportedSources.map(s=>({...s,maximumVersion:'0.48.1'}))}));
 let result=check();assert.notEqual(result.status,0);assert.match(result.stderr,/must explicitly support the previous stable release/);
 await fs.writeFile(path.join(root,'docs/update-compatibility.json'),JSON.stringify(policy));result=check();assert.equal(result.status,0,result.stderr);
}finally{await fs.rm(root,{recursive:true,force:true})}
console.log('PASS: actual release supports 0.49.0/0.49.1/0.49.2/0.49.3 with update service 0.46.1; incompatible sources stay blocked; publication gate rejects stale source coverage.');
