 'use client';
import {useState} from 'react';
import {archiveRequest} from '@/lib/archive-api';
import {useBranding} from './installation';
import {archiveTitle,suggestedArchiveTitle} from '@/lib/archive-title';
import {SettingsPanel} from './settings-panel';
export function ArchiveTitleSettings(){
 const config=useBranding(),[title,setTitle]=useState(config.title||''),[saved,setSaved]=useState(config.title||''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const dirty=title.trim()!==saved;
 async function save(){setBusy(true);setError('');setNotice('');try{const d=await archiveRequest('/api/installation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save-title',title})});setTitle(d.title||'');setSaved(d.title||'');setNotice('Archivname gespeichert.');window.dispatchEvent(new Event('archive-branding-changed'))}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <SettingsPanel title="Archivname" note={archiveTitle({...config,title:saved})}><p>Den vorgeschlagenen Titel verwenden oder eine eigene Bezeichnung für Ihr Archiv festlegen.</p><div className="settings-panel-fields"><label>Titel des Archivs<input maxLength={200} value={title} disabled={busy} onChange={e=>{setTitle(e.target.value);setNotice('')}} placeholder={suggestedArchiveTitle(config.place)}/></label></div><p className="settings-panel-help">Automatischer Vorschlag: <strong>{suggestedArchiveTitle(config.place)}</strong>. Ein leeres Feld übernimmt diesen Titel.</p>{error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}<div className="comment-actions"><button className="settings-panel-secondary" disabled={busy||!title} onClick={()=>{setTitle('');setNotice('')}}>Automatischen Titel verwenden</button><button className="primary" disabled={busy||!dirty} onClick={save}>Änderungen speichern</button></div></SettingsPanel>
}
