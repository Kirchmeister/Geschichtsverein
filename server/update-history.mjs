// Deliberately exclude host paths, configuration, credentials and raw driver output.
export function publicUpdateJob(job){
 return {id:job.id,kind:job.kind||'update',tag:job.tag||null,previousVersion:job.previousVersion||null,status:job.status,created:job.created,finished:job.finished||null,failedPhase:job.failedPhase||null,sourceJobId:job.sourceJobId||null,releaseNotes:typeof job.releaseNotes==='string'?job.releaseNotes.slice(0,20000):null,releaseCommit:job.releaseCommit||null,releaseRepository:job.releaseRepository||null,events:(job.events||[]).map(e=>({status:e.status,at:e.at})),backupVerified:!!job.backup};
}
export function updateHistory(state){
 const jobs=new Map();for(const job of [...(state.history||[]),...(state.job?[state.job]:[])])if(job.id)jobs.set(job.id,publicUpdateJob(job));
 return [...jobs.values()].sort((a,b)=>String(b.created||'').localeCompare(String(a.created||'')));
}
export function updateLog(rows){
 return ['Geschichtsarchiv – vollständiges gespeichertes Update-Protokoll','Enthält auch fehlgeschlagene Vorgänge, Wiederherstellungen und manuelle Rücknahmen. Keine Zugangsdaten oder Hostpfade.',...rows.map(j=>[
  '\n------------------------------------------------------------',j.kind+' · '+(j.tag||j.id),'Kennung: '+j.id,'Gestartet: '+(j.created||'unbekannt'),'Beendet: '+(j.finished||'noch nicht beendet'),'Ergebnis: '+j.status,'Vorherige Version: '+(j.previousVersion||'unbekannt'),j.failedPhase?'Fehler in Schritt: '+j.failedPhase:'',j.sourceJobId?'Zurückgenommenes Update: '+j.sourceJobId:'',j.releaseRepository?'Release-Quelle: '+j.releaseRepository:'',j.releaseCommit?'Release-Commit: '+j.releaseCommit:'','Änderungsnotizen:\n'+(j.releaseNotes||'Für diesen Vorgang sind keine Änderungsnotizen gespeichert.'),'Ablauf:',...(j.events||[]).map(e=>e.at+' · '+e.status)
 ].filter(Boolean).join('\n'))].join('\n')+'\n';
}
