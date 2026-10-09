type Backup={status:string,created:string,finished?:string|null,applicationVersion?:string|null};
export function backupSummary(backups:Backup[],now=Date.now()){
 const complete=backups.filter(b=>b.status==='complete').map(b=>({backup:b,date:Date.parse(b.finished||b.created)})).filter(b=>Number.isFinite(b.date)).sort((a,b)=>b.date-a.date)[0];
 if(!complete)return {warning:true,label:'Noch keine erfolgreiche Sicherung'};
 const old=now-complete.date>14*86400000;
 const date=new Date(complete.date).toLocaleString('de-DE',{timeZone:'Europe/Berlin',dateStyle:'short',timeStyle:'short'});
 return {warning:old,label:(complete.backup.applicationVersion?'Version '+complete.backup.applicationVersion:'Version nicht erfasst')+' · '+date+(old?' · Achtung: Sicherung älter als 14 Tage':'')};
}
