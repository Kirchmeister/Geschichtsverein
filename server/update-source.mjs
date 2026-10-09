import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
export const SOURCE_CONFIRMATION='ICH VERTRAUE DER NEUEN UPDATE-QUELLE';
const PROJECT='history-archive-93898d63-9fa0-46d9-b31d-e9af7736f2d6';
const required=['docs/update-contract.json','version.json','package.json','Dockerfile','scripts/linux-start.mjs','scripts/update-probe.mjs','scripts/restore-backup.mjs','server/docker-update-driver.mjs'];
export function repositoryName(input){
 if(typeof input!=='string')throw Error('Bitte Eigentümer/Repository angeben.');
 let name=input.trim();if(name.startsWith('https://github.com/'))name=name.slice(19).replace(/\/$/,'').replace(/\.git$/,'');
 if(!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(name)||name.split('/').some(v=>v==='.'||v==='..'))throw Error('Nur GitHub-Repositorynamen oder https://github.com/Eigentümer/Repository sind zulässig.');
 return name;
}
export function checkContract(contract,version,pkg,current,tag){
 if(contract?.projectId!==PROJECT||contract.updateProtocol!==1||contract.backupFormatVersion!==current.backupFormatVersion||version.backupFormatVersion!==current.backupFormatVersion)throw Error('Projektkennung oder Update-/Sicherungsformat passt nicht.');
 if(!/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(tag)||version.version!==tag.slice(1)||pkg.version!==version.version||version.prerelease!==false||!Number.isInteger(version.databaseSchemaVersion)||version.databaseSchemaVersion<current.databaseSchemaVersion)throw Error('Release-Version oder Datenbankschema passt nicht.');
}
export async function checkLocalRelease(directory,current,tag){
 const values={};for(const name of required){const file=path.join(directory,name);const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Projektdatei fehlt oder ist ungültig.');if(name.endsWith('.json'))values[name]=JSON.parse(await fs.readFile(file,'utf8'));}
 checkContract(values[required[0]],values['version.json'],values['package.json'],current,tag);
}
export function createSourceManager({cfg,configFile,engine,headers,fetcher=fetch}){
 const tickets=new Map();let changing=false;
 async function api(repository,suffix){const r=await fetcher('https://api.github.com/repos/'+repository+suffix,{headers,redirect:'error',signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('GitHub-Quellenprüfung fehlgeschlagen (HTTP '+r.status+').');const text=await r.text();if(text.length>2*1024*1024)throw Error('GitHub-Antwort zu groß.');return JSON.parse(text);}
 function idle(){if(changing||engine.busy||engine.state.job?.recoveryError)throw Error('Quellenwechsel ist während eines Updates oder einer offenen Wiederherstellung gesperrt.');}
 async function validate(input){
 const repository=repositoryName(input),from=repositoryName(cfg.repository);if(repository.toLowerCase()===from.toLowerCase())throw Error('Dieses Repository ist bereits eingestellt.');
 const candidate=await api(repository,'');
 if(candidate.archived||candidate.disabled||!candidate.fork||candidate.parent?.full_name?.toLowerCase()!==from.toLowerCase())throw Error('Die neue Quelle muss ein aktiver, direkter Fork des aktuell eingestellten Repositorys sein.');
 const canonical=repositoryName(candidate.full_name);const release=await api(canonical,'/releases/latest');
 if(release.draft||release.prerelease)throw Error('Keine stabile Release-Version vorhanden.');
 const commit=await api(canonical,'/commits/'+encodeURIComponent(release.tag_name));if(!/^[a-f0-9]{40}$/.test(commit.sha))throw Error('Release-Commit fehlt.');
 const values={};for(const name of required){const file=await api(canonical,'/contents/'+name+'?ref='+commit.sha);if(file.type!=='file'||file.encoding!=='base64'||file.size>1024*1024)throw Error('Erforderliche Projektdatei fehlt oder ist ungültig.');if(name.endsWith('.json'))values[name]=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));}
 checkContract(values[required[0]],values['version.json'],values['package.json'],await engine.current(),release.tag_name);
 return {from,repository:canonical,tag:release.tag_name,commit:commit.sha};
 }
 return {
  get changing(){return changing;},
  info(){return {repository:cfg.repository,sourceChangeSupported:true,sourceHistory:engine.state.sourceHistory||[]};},
  async forks(){idle();const rows=await api(repositoryName(cfg.repository),'/forks?per_page=100&sort=newest');if(!Array.isArray(rows))throw Error('Ungültige Fork-Liste.');return {repository:cfg.repository,forks:rows.filter(v=>!v.archived&&!v.disabled).map(v=>({repository:repositoryName(v.full_name)})),note:'Bis zu 100 Forks; direkte Herkunft wird bei Auswahl zusätzlich geprüft.'};},
  async inspect(repository){idle();const candidate=await validate(repository);idle();if(candidate.from!==cfg.repository)throw Error('Update-Quelle wurde zwischenzeitlich geändert.');for(const [key,t] of tickets)if(t.expires<Date.now())tickets.delete(key);if(tickets.size>=20)tickets.clear();const token=crypto.randomUUID();tickets.set(token,{...candidate,expires:Date.now()+5*60*1000});return {...candidate,token};},
  async change({token,confirmation,actor}){
   idle();if(confirmation!==SOURCE_CONFIRMATION)throw Error('Bitte den Bestätigungstext exakt eingeben.');const ticket=tickets.get(token);if(!ticket||ticket.expires<Date.now()||ticket.from!==cfg.repository)throw Error('Prüfung abgelaufen. Bitte die Quelle erneut prüfen.');
   changing=true;try{
    const checked=await validate(ticket.repository);if(checked.commit!==ticket.commit||checked.tag!==ticket.tag||checked.from!==ticket.from)throw Error('Release oder Quelle hat sich geändert. Bitte erneut prüfen.');
    const disk=JSON.parse(await fs.readFile(configFile,'utf8'));if(disk.repository!==cfg.repository)throw Error('Serverkonfiguration wurde zwischenzeitlich geändert.');
    // Config is authoritative. Preserve unrelated keys and never expose credentials.
    disk.repository=checked.repository;disk.requireProjectContract=true;disk.sourceHistory=[...(disk.sourceHistory||[]),{from:checked.from,to:checked.repository,tag:checked.tag,commit:checked.commit,at:new Date().toISOString(),actor:String(actor||'Administrator').slice(0,120)}].slice(-50);
    const tmp=configFile+'.'+crypto.randomUUID();const h=await fs.open(tmp,'wx',0o600);try{await h.writeFile(JSON.stringify(disk,null,2)+'\n');await h.sync()}finally{await h.close()}await fs.rename(tmp,configFile);
    Object.assign(cfg,disk);tickets.clear();engine.state.skippedByRepository={...(engine.state.skippedByRepository||{}),[checked.from]:engine.state.skipped};engine.state.skipped=engine.state.skippedByRepository[checked.repository]||[];engine.state.releases=[];engine.state.lastCheck=null;engine.state.checkError=null;engine.state.updateError=null;engine.state.sourceRepository=cfg.repository;engine.state.sourceHistory=disk.sourceHistory;await engine.persist();return {...await engine.status(),...this.info()};
   }finally{changing=false;}
  },
  async reconcile(){if(engine.state.sourceRepository&&engine.state.sourceRepository!==cfg.repository){engine.state.skippedByRepository={...(engine.state.skippedByRepository||{}),[engine.state.sourceRepository]:engine.state.skipped};engine.state.skipped=engine.state.skippedByRepository[cfg.repository]||[];engine.state.releases=[];engine.state.lastCheck=null;}engine.state.sourceRepository=cfg.repository;engine.state.sourceHistory=cfg.sourceHistory||[];await engine.persist();}
 };
}
