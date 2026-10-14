'use client';
import {useId,useRef,type ReactNode} from 'react';
import {Paperclip,Trash2} from 'lucide-react';
export function fileSizeLabel(size:number){
 const units=['Byte','KiB','MiB','GiB'];let unit=0;
 while(size>=1024&&unit<units.length-1){size/=1024;unit++}
 return new Intl.NumberFormat('de-DE',{maximumFractionDigits:unit?1:0}).format(size)+' '+units[unit];
}
export function FilePicker({label,buttonLabel='Dateien auswählen',hint,accept,multiple=false,disabled=false,count=0,onSelect}:{label:string,buttonLabel?:string,hint:string,accept:string,multiple?:boolean,disabled?:boolean,count?:number,onSelect:(files:File[])=>void}){
 const input=useRef<HTMLInputElement>(null),id=useId();
 return <div className="archive-file-picker"><div className="archive-file-picker-label">{label}</div>
  <input ref={input} hidden type="file" aria-label={label} aria-describedby={id} accept={accept} multiple={multiple} disabled={disabled} onChange={event=>{const files=Array.from(event.target.files||[]);event.target.value='';if(!disabled&&files.length)onSelect(multiple?files:files.slice(0,1))}}/>
  <button type="button" className="archive-file-picker-button" disabled={disabled} aria-describedby={id} onClick={()=>{if(!disabled)input.current?.click()}}><Paperclip size={19} aria-hidden="true"/>{buttonLabel}</button>
  <p className="archive-file-picker-status" role="status">{count?(count===1?'Eine Datei ausgewählt.':count+' Dateien ausgewählt.'):'Noch keine Datei ausgewählt.'}</p>
  <p id={id} className="archive-file-picker-hint">{hint}</p>
 </div>;
}
export function SelectedFile({file,disabled=false,onRemove,children}:{file:File,disabled?:boolean,onRemove:()=>void,children?:ReactNode}){
 return <div className="archive-selected-file"><div className="archive-selected-file-heading"><div><p className="archive-selected-file-name">{file.name}</p><small>{fileSizeLabel(file.size)}</small></div><button type="button" className="archive-selected-file-remove" disabled={disabled} aria-label={'Auswahl entfernen: '+file.name} title="Auswahl entfernen" onClick={onRemove}><Trash2 size={20} aria-hidden="true"/></button></div>{children}</div>;
}
