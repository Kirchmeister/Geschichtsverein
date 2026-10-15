export const archiveCategories={'ereignisse':'Ereignis','orte':'Ort / Gebäude','themen':'Thema','bilder-dokumente':'Bild / Dokument','artefakte':'Artefakt'} as const;
export const archivePublicationLabels={'veroeffentlicht':'Veröffentlicht','nicht-veroeffentlicht':'Nicht veröffentlicht','angefragt':'Freigabe angefragt'} as const;
export const archiveStatuses=['Offen','In Bearbeitung','Quellengeprüft','Unsicher'];
export const archiveSortLabels={'zuletzt':'Zuletzt bearbeitet','datum-auf':'Datierung: älteste zuerst','datum-ab':'Datierung: neueste zuerst','forschungsstand':'Forschungsstand','titel-auf':'Titel A–Z','titel-ab':'Titel Z–A','neu':'Neu angelegt'} as const;
export const archiveLimits=[10,20,50,100];
export const archiveLimitKey='history-archive-page-size-v1';
export type ArchiveQuery={q:string,category:string,status:string,publication:string,from:string,to:string,storage:string,media:string[],people:boolean,person:string,sources:boolean,sort:string,page:number,limit:number,layout:string};
const uuid=(value:string)=>/^[a-f0-9-]{36}$/i.test(value);
export function readArchiveQuery(search:string,storedLimit=10):ArchiveQuery{
 const p=new URLSearchParams(search),year=(key:string)=>{const v=p.get(key)||'';return /^-?\d{1,4}$/.test(v)?v:''},candidate=Number(p.get('limit')),page=Number(p.get('seite'));
 return {publication:Object.hasOwn(archivePublicationLabels,p.get('veroeffentlichung')||'')?p.get('veroeffentlichung')!:'',q:(p.get('suche')||'').slice(0,500),category:Object.hasOwn(archiveCategories,p.get('kategorie')||'')?p.get('kategorie')!:'',status:archiveStatuses.includes(p.get('status')||'')?p.get('status')!:'',from:year('von'),to:year('bis'),storage:uuid(p.get('aufbewahrung')||'')?p.get('aufbewahrung')!:'',media:[...new Set((p.get('medien')||'').split(',').filter(v=>['bilder','dokumente','audio'].includes(v)))].sort(),people:p.get('personen')==='1',person:uuid(p.get('person')||'')?p.get('person')!:'',sources:p.get('quellen')==='1',sort:Object.hasOwn(archiveSortLabels,p.get('sortierung')||'')?p.get('sortierung')!:'zuletzt',page:Number.isSafeInteger(page)&&page>0?Math.min(page,1000000):1,limit:archiveLimits.includes(candidate)?candidate:archiveLimits.includes(storedLimit)?storedLimit:10,layout:p.get('darstellung')==='zeitleiste'?'zeitleiste':'liste'};
}
export function archiveHref(query:ArchiveQuery){
 const p=new URLSearchParams();for(const [key,value] of [['suche',query.q],['kategorie',query.category],['status',query.status],['veroeffentlichung',query.publication],['von',query.from],['bis',query.to],['aufbewahrung',query.storage],['medien',query.media.join(',')],['personen',query.people?'1':''],['person',query.person],['quellen',query.sources?'1':''],['sortierung',query.sort==='zuletzt'?'':query.sort],['darstellung',query.layout==='zeitleiste'?'zeitleiste':'']] as const)if(value)p.set(key,value);
 if(query.page>1)p.set('seite',String(query.page));p.set('limit',String(query.limit));return '/archiv?'+p.toString();
}
export function archivePreset(title:string,limit=10):ArchiveQuery{
 const query=readArchiveQuery('',limit);
 if(title==='Zeitleiste'){query.sort='datum-auf';query.layout='zeitleiste'}
 if(title==='Orte & Gebäude')query.category='orte';if(title==='Themenbereiche')query.category='themen';if(title==='Artefakte')query.category='artefakte';if(title==='Bild- & Dokumentenarchiv')query.media=['bilder','dokumente'];if(title==='Personen & Familien')query.people=true;if(title==='Quellenverzeichnis')query.sources=true;
 return query;
}
export function archivePageNumbers(page:number,pages:number):(number|'…')[]{
 const selected=new Set([1,pages,page-1,page,page+1]);if(page<3){selected.add(2);selected.add(3)}if(page>pages-2){selected.add(pages-1);selected.add(pages-2)}
 const sorted=[...selected].filter(n=>n>=1&&n<=pages).sort((a,b)=>a-b),out:(number|'…')[]=[];
 for(const n of sorted){const previous=out.at(-1);if(typeof previous==='number'&&n>previous+1){if(n===previous+2)out.push(previous+1);else out.push('…')}out.push(n)}return out;
}
