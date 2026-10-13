'use client';
import {FileText,Trash2} from 'lucide-react';
import {EntryImage} from './entry-image';
export function EntryAttachmentEditor({file,disabled,onCaptionChange,onRemove}:{file:{key:string,type:string,name:string,caption?:string},disabled:boolean,onCaptionChange:(caption:string)=>void,onRemove:()=>void}){
 return <div className="attachment full entry-attachment-editor">
  {file.type.startsWith('image/')?<div className="image-caption-editor"><EntryImage file={file}/><label>Bildbeschriftung *<input required maxLength={500} disabled={disabled} value={file.caption||''} onChange={event=>onCaptionChange(event.target.value)}/></label>{!file.caption?.trim()&&<small>Bitte die fehlende Beschriftung vor dem Speichern ergänzen.</small>}</div>:<div className="entry-attachment-name"><FileText size={16} aria-hidden="true"/><span>{file.name}</span></div>}
  <button type="button" className="entry-attachment-remove" aria-label="Zuordnung zum Beitrag entfernen" title="Zuordnung zum Beitrag entfernen" disabled={disabled} onClick={onRemove}><Trash2 size={20} aria-hidden="true"/></button>
 </div>;
}
