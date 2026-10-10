export const archiveSortOptions=['Zuletzt bearbeitet','Datierung: älteste zuerst','Datierung: neueste zuerst','Forschungsstand','Titel A–Z','Titel Z–A','Neu angelegt'];
const states=['Offen','In Bearbeitung','Quellengeprüft','Unsicher'];
const collator=new Intl.Collator('de',{numeric:true,sensitivity:'base'});
const year=value=>typeof value==='string'&&/^-?\d{1,4}$/.test(value)?Number(value):null;
const timestamp=value=>{if(typeof value!=='string')return null;const n=Date.parse(value.slice(0,24));return Number.isFinite(n)?n:null};
function missingLast(a,b,descending=false){if(a===null||b===null)return a===b?0:a===null?1:-1;return descending?b-a:a-b}
export function sortArchive(entries,order='Zuletzt bearbeitet'){
 return [...entries].sort((a,b)=>{let result=0;
 if(order.startsWith('Datierung:'))result=missingLast(year(a.start)??year(a.end),year(b.start)??year(b.end),order==='Datierung: neueste zuerst');
 else if(order==='Forschungsstand')result=missingLast(states.includes(a.status)?states.indexOf(a.status):null,states.includes(b.status)?states.indexOf(b.status):null);
 else if(order==='Zuletzt bearbeitet'||order==='Neu angelegt')result=missingLast(timestamp(a[order==='Neu angelegt'?'created':'updated']),timestamp(b[order==='Neu angelegt'?'created':'updated']),true);
 else if(order==='Titel Z–A')result=collator.compare(b.title||'',a.title||'');
 return result||collator.compare(a.title||'',b.title||'')||collator.compare(a.id||'',b.id||'');
 });
}

export function matchesArchiveYears(entry,from='',to=''){
 if(!from&&!to)return true;const start=year(entry.start)??year(entry.end),end=year(entry.end)??year(entry.start);
 return start!==null&&end!==null&&(!from||end>=Number(from))&&(!to||start<=Number(to));
}
