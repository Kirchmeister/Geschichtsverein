'use client';
import {formatDateField} from '@/lib/archive-date';
import {EntryImage} from './entry-image';
import {publicFieldLabels} from '@/lib/archive-public-fields';
import {AudioPlayer} from './audio';
import {EntryLocationView} from './entry-location';
import {LinkedDescription} from './linked-description';
import {MarkdownText} from './markdown-text';

/** Render only the data supplied by the publication request, without refetching the entry. */
export function ReviewVersion({data}:{data:any}){
 return <div className="review-fields">
  <EntryLocationView value={data.location}/>
  {Object.entries(publicFieldLabels).filter(([key])=>!['location','title','images','documents','audio'].includes(key)).map(([key,label])=>{
   const value=data[key];
   if(!value)return null;
   return <section key={key}><h3>{label}</h3>{key==='description'?<div className={data.fieldFormats?.description==='markdown'?undefined:'pre'}><LinkedDescription text={value} links={data.descriptionLinks} tags={data.personTags} markdown={data.fieldFormats?.description==='markdown'}/></div>:data.fieldFormats?.[key]==='markdown'?<MarkdownText text={value}/>:<p className="pre">{formatDateField(key,value,data)}</p>}</section>;
  })}
  {(data.files||[]).map((file:any)=>file.type.startsWith('audio/')?<AudioPlayer key={file.key} file={file}/>:file.type.startsWith('image/')?<EntryImage key={file.key} file={file}/>:<a className="file-link" key={file.key} href={'/api/files?key='+file.key} target="_blank" rel="noreferrer">{file.name}</a>)}
 </div>;
}
