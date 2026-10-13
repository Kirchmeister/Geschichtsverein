'use client';
import {useEffect,useState} from 'react';
import type {MouseEvent} from 'react';
import {archiveRequest} from '@/lib/archive-api';
export function BackupReminder({onOpen}:{onOpen:(event:MouseEvent<HTMLAnchorElement>)=>void}){
 const [state,setState]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true,sequence=0;async function load(){const current=++sequence;try{const result=await archiveRequest('/api/backup-reminder');if(active&&current===sequence){setState(result);setError('')}}catch{if(active&&current===sequence)setError('Der Sicherungsstatus konnte nicht aktualisiert werden.')}}
  load();const timer=setInterval(load,60000);const visible=()=>{if(document.visibilityState==='visible')load()};window.addEventListener('focus',load);window.addEventListener('archive-backups-changed',load);document.addEventListener('visibilitychange',visible);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',load);window.removeEventListener('archive-backups-changed',load);document.removeEventListener('visibilitychange',visible)};
 },[]);
 if(!state?.show&&!error)return null;
 return <section className="backup-reminder" aria-label="Erinnerung an eine Sicherung" role="status"><div><strong>{state?.show?state.message:'Sicherungsstatus prüfen'}</strong>{state?.show&&<p>{state.automaticConfigured?'Die automatische Sicherung ist inzwischen aktiviert.':'Es ist keine einsatzbereite automatische Sicherung aktiviert.'} Bitte erstellen Sie ein Backup. Die Erinnerung bleibt bis zum erfolgreichen Abschluss bestehen.</p>}{error&&<p>{error}</p>}</div><a href="/?ansicht=einstellungen&abschnitt=backups" onClick={onOpen}>Jetzt Backup erstellen</a></section>;
}
