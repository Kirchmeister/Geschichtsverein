export function backupFilename(id,manifest={}){
 const version=/^\d+\.\d+\.\d+$/.test(manifest.applicationVersion||'')?'v'+manifest.applicationVersion:'version-unbekannt';
 const schema=Number.isInteger(manifest.databaseSchemaVersion)?'_schema'+manifest.databaseSchemaVersion:'';
 if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Ungültige Sicherungskennung.');
 return 'geschichtsarchiv-backup-'+id+'_'+version+schema+'.tar';
}
export function visibleBackups(rows,days=7,now=Date.now(),all=false){
 const period=[7,14,31].includes(days)?days:7;
 const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-period+1);
 return rows.filter(row=>all||['copying','verifying','uploading'].includes(row.status)||Date.parse(row.created)>=start.getTime());
}
