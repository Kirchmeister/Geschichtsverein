'use client';
import {formatDateField} from '@/lib/archive-date';
import {EntryImage} from './entry-image';
import {EntryLocationView} from './entry-location';
import {guestFieldLabels} from '@/lib/archive-public-fields';
import {MarkdownText} from './markdown-text';
import {LinkedDescription} from './linked-description';
import {AudioPlayer} from './audio';
export function GuestEntry({entry}:{entry:any}){
 const fields:string[]=entry.visibleFields||[];
 return <div className="detail"><EntryLocationView value={entry.location}/>{fields.filter(key=>!['location','title','images','documents','audio','people'].includes(key)).map(key=>{const value=key==='storagePlaceId'?entry.storagePlace:key==='updated'?entry.updated&&new Date(entry.updated.slice(0,24)).toLocaleString('de-DE'):entry[key];return value?<section key={key}><h3>{guestFieldLabels[key as keyof typeof guestFieldLabels]}</h3><div className="pre">{key==='description'?<LinkedDescription markdown={entry.fieldFormats?.description==='markdown'} text={value} links={entry.descriptionLinks}/>:entry.fieldFormats?.[key]==='markdown'?<MarkdownText text={value}/>:<p className="pre">{formatDateField(key,value,entry)}</p>}</div></section>:null})}{fields.includes('people')&&entry.personTags?.length>0&&<section><h3>Personen & Familien</h3><p>{[...new Set(entry.personTags.map((t:any)=>t.name))].join(', ')}</p></section>}{fields.some(key=>['images','documents','audio'].includes(key))&&<section className="entry-reader-media"><h3>Bilder, Dokumente & Audio</h3>{entry.files.length?entry.files.map((f:any)=>f.type.startsWith('audio/')?<AudioPlayer key={f.key} file={f}/>:f.type.startsWith('image/')?<EntryImage key={f.key} file={f}/>:<a className="file-link" key={f.key} href={'/api/files?key='+f.key} target="_blank" rel="noreferrer"><span>{f.name}</span></a>):<p>Keine freigegebenen Dateien.</p>}</section>}<p className="detail-muted">Lesezugriff als Gast · Die sichtbaren Felder legt der Administrator fest.</p></div>;
}
