 'use client';
import {useState} from 'react';
import {archiveRequest} from '@/lib/archive-api';
import {useBranding} from './installation';
import {archiveTitle,suggestedArchiveTitle} from '@/lib/archive-title';
export function ArchiveTitleSettings(){
 const config=useBranding(),[title,setTitle]=useState(archiveTitle(config)),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(){setBusy(true);setError('');try{await archiveRequest('/api/installation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save-title',title})});window.location.reload()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <section><h2>Archivname</h2><p>Der Titel wird aus dem Ort vorgeschlagen. Für besondere Ortsnamen oder eine eigene Bezeichnung können Sie ihn anpassen.</p><label>Titel des Archivs<input maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} placeholder={suggestedArchiveTitle(config.place)}/></label><p>Automatischer Vorschlag: {suggestedArchiveTitle(config.place)}. Ein leeres Feld verwendet diesen Vorschlag.</p>{error&&<p className="error" role="alert">{error}</p>}<div className="comment-actions"><button disabled={busy} onClick={()=>setTitle('')}>Automatischen Titel verwenden</button><button className="primary" disabled={busy} onClick={save}>Archivname speichern</button></div></section>
}
