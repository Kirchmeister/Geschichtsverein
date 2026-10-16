'use client';
import {useEffect,useRef,useState} from 'react';
import {ConfirmAction} from './confirm-action';
import {useLegalLinks} from './legal-links';
import {nearbyEntries,nearbyPhone,nearbyPositionStatus,nearbyRadii,type NearbyArea,type NearbyEntry,type NearbyPoint} from '@/lib/archive-nearby';
import {entryReferencePath} from '@/lib/archive-reference-path';
import styles from './nearby-explorer.module.css';
export function useNearbyExplorer(area:NearbyArea){
 const legal=useLegalLinks(),[phone,setPhone]=useState<boolean|null>(null),[supported,setSupported]=useState(false),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[point,setPoint]=useState<NearbyPoint|null>(null),[radius,setRadius]=useState(100),[entries,setEntries]=useState<NearbyEntry[]|null>(null),[message,setMessage]=useState(''),[loadError,setLoadError]=useState(false);
 const generation=useRef(0),current=useRef({area,radius,privacy:legal.privacy});current.current={area,radius,privacy:legal.privacy};
 const areaKey=JSON.stringify([area.lat,area.lon,area.radius,area.place]);
 function clear(){generation.current++;setPoint(null);setBusy(false);setOpen(false);setMessage('');setLoadError(false)}
 useEffect(()=>{setPhone(nearbyPhone(navigator));setSupported(window.isSecureContext&&!!navigator.geolocation);return()=>{generation.current++}},[]);
 useEffect(()=>{clear();setEntries(null)},[areaKey]);
 useEffect(()=>{if(!legal.privacy)clear()},[legal.privacy]);
 useEffect(()=>{function forget(){clear()}window.addEventListener('pagehide',forget);return()=>window.removeEventListener('pagehide',forget)},[]);
 function locate(){
  if(!phone||!supported||!current.current.privacy||busy)return;
  const id=++generation.current;setBusy(true);setPoint(null);setMessage('Standort wird ermittelt …');setLoadError(false);
  try{navigator.geolocation.getCurrentPosition(async position=>{
   if(id!==generation.current||!current.current.privacy)return;
   const p={lat:position.coords.latitude,lon:position.coords.longitude,accuracy:position.coords.accuracy};
   const status=nearbyPositionStatus(p,current.current.area,current.current.radius);
   if(status!=='inside'){
    setBusy(false);setMessage(status==='outside'?`Ihr Standort liegt außerhalb des Kartenbereichs von ${current.current.area.place}. Hier ist keine Umgebungssuche möglich.`:status==='boundary'?'Ihr Standort liegt möglicherweise am Rand des Kartenbereichs. Bitte ermitteln Sie den Standort erneut.':status==='inaccurate'?`Die Ortung ist für diesen Umkreis zu ungenau (etwa ± ${Math.ceil(p.accuracy)} m). Wählen Sie einen größeren Umkreis oder ermitteln Sie den Standort erneut.`:'Der Browser hat keinen verwendbaren Standort geliefert.');return;
   }
   try{
    let data=entries;if(data===null){const response=await fetch('/api/map-entries',{cache:'no-store'});if(!response.ok)throw Error('entries');const body=await response.json() as {entries:NearbyEntry[]};if(!Array.isArray(body.entries))throw Error('entries');data=body.entries}
    if(id!==generation.current||!current.current.privacy)return;
    setEntries(data);setPoint(p);setMessage('');setBusy(false);
   }catch{if(id===generation.current){setBusy(false);setLoadError(true);setMessage('Die öffentlichen Einträge konnten nicht geladen werden. Bitte versuchen Sie es erneut.')}}
  },error=>{if(id!==generation.current)return;setBusy(false);setMessage(error.code===1?'Die Standortfreigabe wurde nicht erteilt. Sie können die Karte weiterhin normal nutzen.':error.code===3?'Die Standortermittlung hat zu lange gedauert. Bitte versuchen Sie es erneut.':'Der Standort konnte nicht ermittelt werden. Prüfen Sie die Standortdienste und versuchen Sie es erneut.')},{enableHighAccuracy:true,timeout:15000,maximumAge:0})}catch{if(id===generation.current){setBusy(false);setMessage('Die Standortermittlung konnte nicht gestartet werden. Prüfen Sie die Standortfreigabe Ihres Browsers.')}}
 }
 const valid=legal.privacy&&phone&&supported&&point&&nearbyPositionStatus(point,area,radius)==='inside';
 const matches=valid?nearbyEntries(entries||[],point,area,radius):[];
 const controls=<div className={styles.tools}>
  <strong>Meine Umgebung entdecken</strong><p className={styles.help}>Für Smartphones im Kartenbereich von {area.place} · Gebietsradius {area.radius.toLocaleString('de-DE')} km. Außerhalb dieses Bereichs ist keine Umgebungssuche verfügbar.</p>
  {phone===false?<p className={styles.help}>Diese Funktion steht auf Smartphones zur Verfügung. Sie können die Karte hier weiterhin normal nutzen.</p>:phone===null?<p className={styles.help}>Gerät wird geprüft …</p>:!supported?<p className={styles.help}>Die Standortermittlung ist hier nicht verfügbar. Öffnen Sie das Archiv über HTTPS in einem Browser mit Standortunterstützung.</p>:<>
   {!legal.privacy&&<p className={styles.help}>Die Umgebungssuche ist erst verfügbar, wenn der Betreiber eine Datenschutzerklärung veröffentlicht hat.</p>}
   <div className={styles.actions}><label className={styles.field}>Umkreis<select value={radius} disabled={busy} onChange={event=>setRadius(Number(event.target.value))}>{nearbyRadii.map(r=><option key={r} value={r}>{r} Meter</option>)}</select></label><button type="button" className="primary" disabled={busy||!legal.privacy} onClick={()=>setOpen(true)}>{busy?'Standort wird ermittelt …':point||message?'Standort erneut ermitteln':'Meine Umgebung entdecken'}</button>{(point||busy||message)&&<button type="button" onClick={clear}>{busy?'Abbrechen':'Umgebungssuche beenden'}</button>}</div>
  </>}
  {message&&<p className={loadError?'error':styles.help} role="status">{message}</p>}
  {point&&!valid&&<p className={styles.help} role="status">Für diesen Umkreis ist die Ortung zu ungenau. Wählen Sie einen größeren Umkreis oder ermitteln Sie den Standort erneut.</p>}
  <ConfirmAction initialFocus="title" open={open} onOpenChange={setOpen} title="Standort einmalig verwenden?" description={`Die Umgebungssuche ist nur im eingestellten Kartenbereich von ${area.place} verfügbar. Erst nach Ihrer Zustimmung fragen wir den Browser nach Ihrem aktuellen Standort.`} confirmLabel="Zustimmen und Standort ermitteln" onConfirm={locate}>
   <p>Die Position wird nur im Browser für die Karte und die Suche nach nahen Einträgen verwendet. Sie bleibt während der geöffneten Kartenansicht im Arbeitsspeicher, wird nicht an unseren Archivserver gesendet und nicht dauerhaft gespeichert. Keine laufende Verfolgung.</p>
   <p>Externe Kartenanbieter erhalten beim Laden der Karte Ihre IP-Adresse und Anfragen für die betrachtete Gegend. Daraus kann die Umgebung abgeleitet werden. Browser und Betriebssystem können eigene Standortdienste verwenden.</p>
   <p>Sie können die Suche jederzeit beenden. Ohne Zustimmung bleibt die normale Karte nutzbar. {legal.privacy&&<a href="/datenschutz#umgebungssuche" target="_blank" rel="noopener noreferrer">Weitere Informationen im Datenschutz</a>}</p>
  </ConfirmAction>
 </div>;
 const results=valid?<section className={styles.results} aria-label="Einträge in Ihrer Nähe" aria-live="polite"><h3>{matches.length} {matches.length===1?'Eintrag':'Einträge'} im Umkreis von {radius} Metern</h3><p className={styles.help}>Standortgenauigkeit etwa ± {Math.ceil(point.accuracy)} m. Entfernungen sind Luftlinien und können abweichen. Auch auf der historischen Karte ist Ihr Standort der heutige; Einträge werden nicht nach ihrem Alter ausgefiltert.</p>{!matches.length?<p>Keine öffentlich freigegebenen Einträge in diesem Umkreis. {radius<250?'Wählen Sie oben einen größeren Umkreis.':''}</p>:<ul>{matches.map(entry=><li key={entry.reference}><a href={entryReferencePath(entry.reference)}>{entry.title||'Beitrag'}</a><small>Etwa {Math.round(entry.distance)} m{entry.location.approximate?' · Lage des Eintrags ungefähr':''}{entry.location.label?' · '+entry.location.label:''}</small></li>)}</ul>}</section>:null;
 return {point:valid?point:null,radius,references:matches.map(entry=>entry.reference),controls,results};
}
