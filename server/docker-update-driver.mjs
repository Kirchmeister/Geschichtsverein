#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
export function dockerUpdateDriver(cfg,run=promisify(execFile)){
 const root=path.resolve(cfg.root),data=path.resolve(cfg.dataRoot),config=path.resolve(cfg.configRoot),name=cfg.container;
 if(!/^geschichtsarchiv-[a-z0-9-]+$/.test(name||'')||!Number.isInteger(cfg.appPort)||cfg.appPort<1024||cfg.appPort>65535||![cfg.uid,cfg.gid].every(n=>Number.isInteger(n)&&n>=1))throw Error('Docker-Treiber: Container, Port und Benutzerkennung prüfen.');
 const docker=(args,timeout=120000)=>run('docker',args,{timeout,maxBuffer:1024*1024});
 async function image(code){const p=await fs.realpath(code);if(!p.startsWith(root+'/releases/'))throw Error('Release außerhalb der verwalteten Ablage.');const v=JSON.parse(await fs.readFile(path.join(p,'version.json'),'utf8'));if(!/^[a-f0-9]{40}$/.test(v.codeCommit||''))throw Error('Code-Commit fehlt.');return {code:p,v,tag:'geschichtsarchiv-managed:'+v.codeCommit}}
 async function inspect(){try{return JSON.parse((await docker(['inspect',name])).stdout)[0]}catch(e){if(/No such (object|container)/i.test(e.stderr||''))return null;throw e}}
 async function owned(){const c=await inspect();if(!c)return null;const mounts=c.Mounts||[];if(!mounts.some(m=>m.Destination==='/data'&&m.Source===data)||!mounts.some(m=>m.Destination==='/config'&&m.Source===config||m.Destination==='/config/app.env'&&m.Source===config+'/app.env'))throw Error('Container gehört nicht zu den konfigurierten Archivablagen.');if(c.Config?.Labels?.['io.history-archive.managed']!=='true'&&c.Config?.Labels?.['com.docker.compose.service']!=='archive')throw Error('Fremder Container wird nicht verändert.');return c}
 async function marker(value){await fs.writeFile(path.join(config,'maintenance'),value,{mode:0o600});await run('chown',[cfg.uid+':'+cfg.gid,path.join(config,'maintenance')],{timeout:10000})}
 async function probe(code,action,d,c){const i=await image(code);return docker(['run','--rm','--network','none','--user','0:0','--mount','type=bind,src='+d+',dst=/data'+(action==='verify'?',readonly':''),'--mount','type=bind,src='+c+'/app.env,dst=/config/app.env,readonly',i.tag,'node','scripts/update-probe.mjs',action],900000)}
 return async function driver(action,code,d=data,c=config){
  const i=await image(code);if(action!=='verify-restore'&&(path.resolve(d)!==data||path.resolve(c)!==config))throw Error('Live-Ablagen stimmen nicht überein.');
  if(action==='prepare'){await docker(['build','--label','io.history-archive.managed=true','-t',i.tag,i.code],900000);return}
  if(action==='verify-restore'){const trial=path.resolve(d).startsWith(root+'/backups/')&&path.resolve(c).startsWith(root+'/backups/')&&path.dirname(path.resolve(d))===path.dirname(path.resolve(c))&&path.basename(d)==='data'&&path.basename(c)==='config';if(!trial&&(path.resolve(d)!==data||path.resolve(c)!==config))throw Error('Ungültige Probeablagen.');await probe(code,'verify',d,c);return}
  if(action==='stop'){const existing=await owned();await marker('1');if(existing)await docker(['stop','--time','60',name]);return}
  if(action==='migrate'){const existing=await owned();if(existing?.State?.Running)throw Error('Archiv muss vor der Migration angehalten sein.');await probe(code,'migrate',data,config);return}
  if(action==='start'){if((await fs.readFile(config+'/maintenance','utf8')).trim()!=='1')throw Error('Wartungsmodus fehlt.');const existing=await owned();if(existing?.State?.Running){if(existing.Config.Image===i.tag)return;throw Error('Ein anderer Programmstand läuft noch.')}if(existing)await docker(['rm',name]);await run('chown',['-R',cfg.uid+':'+cfg.gid,data],{timeout:900000});await fs.chown(config+'/app.env',cfg.uid,cfg.gid);await marker('1');await docker(['run','-d','--name',name,'--label','io.history-archive.managed=true','--restart','unless-stopped','--network','host','--user',cfg.uid+':'+cfg.gid,'--mount','type=bind,src='+data+',dst=/data','--mount','type=bind,src='+config+'/app.env,dst=/config/app.env,readonly','--mount','type=bind,src='+config+'/maintenance,dst=/config/maintenance,readonly','-e','ARCHIVE_CONFIG_FILE=/config/app.env','-e','ARCHIVE_BIND_HOST=127.0.0.1','-e','PORT='+cfg.appPort,i.tag]);return}
  if(action==='health'){const existing=await owned();if(!existing?.State?.Running||existing.Config.Image!==i.tag)throw Error('Falscher Archivcontainer aktiv.');const script="fetch('http://127.0.0.1:"+cfg.appPort+"/api/health').then(async r=>{const d=await r.json();if(!r.ok||!d.ok||d.version!=="+JSON.stringify(i.v.version)+"||d.schema!=="+i.v.databaseSchemaVersion+"||d.commit!=="+JSON.stringify(i.v.codeCommit)+")process.exit(1)}).catch(()=>process.exit(1))";let ok=false;for(let n=0;n<30;n++){try{await docker(['exec',name,'node','-e',script],5000);ok=true;break}catch{await new Promise(r=>setTimeout(r,1000))}}if(!ok)throw Error('Gesundheitsprüfung fehlgeschlagen.');await probe(code,'verify',data,config);return}
  if(action==='commit'){await marker('0');return}
  throw Error('Unbekannte Treiberaktion.');
 };
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const cfg=JSON.parse(await fs.readFile(process.env.ARCHIVE_UPDATER_CONFIG,'utf8'));try{await dockerUpdateDriver(cfg)(...process.argv.slice(2))}catch{console.error('Docker-Updateprüfung fehlgeschlagen; Wartungsmodus bleibt bestehen.');process.exitCode=1}}
