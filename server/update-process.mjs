import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
// Build timeout is deliberately shorter than the supervising driver's deadline.
export const updateBuildTimeout=60*60*1000;
export const updateOutputLimit=16*1024*1024;
export const updateDriverTimeout=action=>(action==='prepare'?updateBuildTimeout:15*60*1000)+60*1000;
export function updateFailureKind(error){
 const marker=String(error?.stderr||'').match(/ARCHIVE_UPDATE_ERROR:(TIMEOUT|OUTPUT_LIMIT|DISK_FULL|COMMAND_FAILED)/);
 if(marker)return marker[1];
 if(error?.code==='ERR_CHILD_PROCESS_STDIO_MAXBUFFER')return 'OUTPUT_LIMIT';
 if(error?.code==='ETIMEDOUT'||error?.killed&&['SIGTERM','SIGKILL'].includes(error?.signal))return 'TIMEOUT';
 if(/no space left on device|disk quota exceeded|ENOSPC/i.test(String(error?.stderr||'')))return 'DISK_FULL';
 return 'COMMAND_FAILED';
}
export function updateFailureMessage(action,kind){
 const step=action==='prepare'?'Docker-Build':'Serverprüfung „'+action+'“';
 if(kind==='TIMEOUT')return step+' hat das Zeitlimit überschritten ('+(action==='prepare'?60:15)+' Minuten).';
 if(kind==='OUTPUT_LIMIT')return step+' abgebrochen: Die Prozessausgabe hat das zulässige Limit überschritten.';
 if(kind==='DISK_FULL')return step+' fehlgeschlagen: Auf dem Server fehlt freier Speicherplatz.';
 return step+' fehlgeschlagen. Bitte das Docker-/Dienstprotokoll auf dem Server prüfen.';
}
export async function invokeUpdateDriver(cfg,action,code,dataRoot=cfg.dataRoot,configRoot=cfg.configRoot,run=promisify(execFile)){
 try{return await run(cfg.driver,[action,code,dataRoot,configRoot],{timeout:updateDriverTimeout(action),maxBuffer:updateOutputLimit});}
 catch(error){throw Error(updateFailureMessage(action,updateFailureKind(error)));}
}
