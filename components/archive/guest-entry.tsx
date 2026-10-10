'use client';
import {guestFieldLabels} from '@/lib/archive-public-fields';
import {LinkedDescription} from './linked-description';
import {AudioPlayer} from './audio';
export function GuestEntry({entry}:{entry:any}){
 const fields:string[]=entry.visibleFields||[];
 return <div className="detail">{fields.filter(key=>!['title','images','documents','audio','people'].includes(key)).map(key=>{const value=key==='storagePlaceId'?entry.storagePlace:key==='updated'?entry.updated&&new Date(entry.updated.slice(0,24)).toLocaleString('de-DE'):entry[key];return value?<section key={key}><h3>{guestFieldLabels[key as keyof typeof guestFieldLabels]}</h3><p className="pre">{key==='description'?<LinkedDescription text={value} links={entry.descriptionLinks}/>:value}</p></section>:null})}{fields.includes('people')&&entry.personTags?.length>0&&<section><h3>Personen & Familien</h3><p>{[...new Set(entry.personTags.map((t:any)=>t.name))].join(', ')}</p></section>}{fields.some(key=>['images','documents','audio'].includes(key))&&<section className="entry-reader-media"><h3>Bilder, Dokumente & Audio</h3>{entry.files.length?entry.files.map((f:any)=>f.type.startsWith('audio/')?<AudioPlayer key={f.key} file={f}/>:<a className="file-link" key={f.key} href={'/api/files?key='+f.key} target="_blank" rel="noreferrer">{f.type.startsWith('image/')&&<img src={'/api/files?key='+f.key} alt={f.name}/>}<span>{f.name}</span></a>):<p>Keine freigegebenen Dateien.</p>}</section>}<p className="detail-muted">Lesezugriff als Gast · Die sichtbaren Felder legt der Administrator fest.</p></div>;
}
