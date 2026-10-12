'use client';
import {useEffect,useState} from 'react';
import {imageCaptionLimit} from '@/lib/archive-image-caption';
import {uploadFileBatch,type PendingFile} from '@/lib/archive-file-upload';
export function FileUpload({disabled,onAttach,onWorking,onPending,onError}:{disabled:boolean,onAttach:(file:File,caption?:string)=>Promise<void>,onWorking:(value:boolean)=>void,onPending:(value:boolean)=>void,onError:(message:string)=>void}){
 const [pending,setPending]=useState<PendingFile[]>([]);
 useEffect(()=>{onPending(pending.length>0)},[pending.length,onPending]);
 useEffect(()=>()=>onPending(false),[onPending]);
 async function upload(){
  if(disabled||!pending.length)return;
  onError('');
  onWorking(true);
  try{await uploadFileBatch(pending,onAttach,id=>setPending(old=>old.filter(p=>p.id!==id)))}
  catch(error:any){onError(error.message)}finally{onWorking(false)}
 }
 return <div className="full file-upload"><label>Bilder, Dokumente &amp; Audio<input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac" disabled={disabled} onChange={event=>{const files=Array.from(event.target.files||[]);setPending(old=>[...old,...files.map(file=>({id:crypto.randomUUID(),file,caption:''}))]);event.target.value=''}}/><small>Audio bis 50 MB · JPG, PNG, WebP oder PDF bis 10 MB. Jedes Bild benötigt vor dem Hochladen eine eigene Beschriftung.</small></label>
  {pending.map((item,index)=><div className="pending-file" key={item.id}><p>{index+1}. {item.file.name}</p>{item.file.type.startsWith('image/')&&<label>Bildbeschriftung für {item.file.name} *<input required maxLength={imageCaptionLimit} value={item.caption} disabled={disabled} placeholder="Was zeigt dieses Bild?" onChange={event=>setPending(old=>old.map(p=>p.id===item.id?{...p,caption:event.target.value}:p))}/></label>}<button type="button" disabled={disabled} onClick={()=>setPending(old=>old.filter(p=>p.id!==item.id))}>Auswahl entfernen</button></div>)}
  {pending.length>0&&<><p>Die ausgewählten Dateien sind noch nicht hochgeladen. Erst beschriften und hochladen, danach den Beitrag speichern.</p><button type="button" className="primary" disabled={disabled} onClick={upload}>Ausgewählte Dateien hochladen ({pending.length})</button></>}
 </div>;
}
