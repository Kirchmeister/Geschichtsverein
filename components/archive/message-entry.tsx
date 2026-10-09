'use client';
import {useEffect,useState} from 'react';
import {archiveRequest} from '@/lib/archive-api';
export function ReviewMessageButton({id,disabled=false}:{id:string,disabled?:boolean}){
 const [available,setAvailable]=useState(false);useEffect(()=>{let live=true;archiveRequest('/api/messages?count=1').then(s=>{if(live)setAvailable(!!s.available)}).catch(()=>{});return()=>{live=false}},[]);
 return available?<a className={'review-message-button'+(disabled?' disabled':'')} aria-disabled={disabled} href={'/?ansicht=nachrichten&freigabe='+encodeURIComponent(id)} onClick={e=>{if(disabled)e.preventDefault()}}>Zum Beitrag schreiben</a>:null;
}
export function MessageEntry({entry}:{entry:any}){if(!entry)return null;return <div className="message-entry-reference">{entry.unavailable?<p>Der verknüpfte Beitrag ist gelöscht oder nicht mehr verfügbar.</p>:<><small>Verknüpfter Beitrag</small><a href={'/?ansicht=beitrag&eintrag='+encodeURIComponent(entry.id)} target="_blank" rel="noopener noreferrer"><strong>{entry.title}</strong><span>{entry.reference||entry.id}</span></a></>}</div>}
export function MessageEntryPicker({entry,onChange}:{entry:any,onChange:(entry:any)=>void}){
 const [open,setOpen]=useState(false),[rows,setRows]=useState<any[]>([]),[query,setQuery]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function show(){setOpen(v=>!v);if(rows.length)return;setLoading(true);try{setRows(await archiveRequest('/api/entries'))}catch(e:any){setError(e.message)}finally{setLoading(false)}}
 const matches=rows.filter(e=>[e.title,e.reference,e.id].some(v=>String(v||'').toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de')))).slice(0,20);
 return <section className="message-entry-picker"><MessageEntry entry={entry}/><div className="messages-actions"><button type="button" className="account-secondary" onClick={show}>{entry?'Beitragsreferenz ändern':'Beitrag verknüpfen'}</button>{entry&&<button type="button" className="account-secondary" onClick={()=>onChange(null)}>Referenz entfernen</button>}</div>{open&&<div className="message-entry-results"><label>Nach Titel oder ID suchen<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Titel oder Beitrags-ID"/></label>{loading&&<p role="status">Beiträge werden geladen …</p>}{error&&<p className="error" role="alert">{error}</p>}{matches.map(e=><button type="button" key={e.id} onClick={()=>{onChange({id:e.id,title:e.title,reference:e.reference});setOpen(false)}}><strong>{e.title}</strong><small>{e.reference||e.id}</small></button>)}{!loading&&!error&&!matches.length&&<p>Keine passenden Beiträge.</p>}</div>}</section>;
}
export function MessageReviewActions({entry,role,onChanged,onError}:{entry:any,role:string,onChanged:()=>Promise<void>,onError:(error:string)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');if(!entry?.pending||!['admin','manager'].includes(role))return null;
 async function decide(action:string){setBusy(true);setError('');try{await archiveRequest('/api/publication',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...entry.pending,action})});await onChanged()}catch(e:any){setError(e.message);await onChanged();onError(e.message)}finally{setBusy(false)}}
 return <section className="message-review-actions"><h3>Offene Veröffentlichungsanfrage</h3><p>Prüfen Sie den verknüpften Beitrag vor Ihrer Entscheidung.</p><div className="messages-actions"><button type="button" className="account-primary" disabled={busy} onClick={()=>decide('approve')}>Genehmigen</button><button type="button" className="account-secondary" disabled={busy} onClick={()=>decide('reject')}>Ablehnen</button></div>{error&&<p role="alert" className="error">{error}</p>}</section>;
}
