type BackupRecord={status:string,created:string,finished?:string|null};
type AutomaticBackupProvider={enabled:boolean,ready:boolean};
const day=86400000;
function berlinDay(time:number){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(time);const value=(key:string)=>Number(parts.find(p=>p.type===key)?.value);return Date.UTC(value('year'),value('month')-1,value('day'))/day}
export function automaticBackupConfigured(providers:AutomaticBackupProvider[]){return providers.some(provider=>provider.enabled&&provider.ready)}
export function backupReminder(backups:BackupRecord[],providers:AutomaticBackupProvider[],now=Date.now(),previous?:{lastSuccessfulAt:string|null}|null){
 const automaticConfigured=automaticBackupConfigured(providers);
 const last=backups.filter(b=>['complete','expired'].includes(b.status)).map(b=>Date.parse(b.finished||b.created)).filter(t=>Number.isFinite(t)&&t<=now).sort((a,b)=>b-a)[0];
 const daysWithoutBackup=last===undefined?null:Math.max(0,berlinDay(now)-berlinDay(last));
 const newerBackup=last!==undefined&&previous&&(previous.lastSuccessfulAt===null||last>Date.parse(previous.lastSuccessfulAt));
 const show=!!previous&&!newerBackup||!automaticConfigured&&(daysWithoutBackup===null||daysWithoutBackup>=31);
 return {automaticConfigured,lastSuccessfulAt:last===undefined?null:new Date(last).toISOString(),daysWithoutBackup,show,message:daysWithoutBackup===null?'Es wurde noch keine erfolgreiche Sicherung erstellt.':`Seit ${daysWithoutBackup} Tagen wurde keine erfolgreiche Sicherung erstellt.`};
}
