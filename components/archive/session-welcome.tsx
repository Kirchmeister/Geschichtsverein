"use client";
import {useEffect,useState} from 'react';
import {canArchive,type ArchiveAction} from '@/lib/archive-permissions';
import type {PreviewRole} from '@/lib/archive-api';
const labels:Partial<Record<ArchiveAction,string>>={create:'Beiträge anlegen',edit:'Beiträge bearbeiten',approve:'Veröffentlichungen genehmigen',delete:'Beiträge löschen und wiederherstellen',moderateComments:'Kommentare moderieren',qrSingle:'Einzelne QR-Codes erstellen',qrBulk:'QR-Sammeldruck',manageTimeline:'Öffentliche Zeitleiste verwalten',managePublicFields:'Öffentliche Felder festlegen',readStatistics:'Statistiken ansehen',manageSettings:'Einstellungen und Sicherungen verwalten'};
export function greetingAt(date:Date){const hour=Number(new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'numeric',hourCycle:'h23'}).formatToParts(date).find(part=>part.type==='hour')?.value);return hour<5?'Guten Abend':hour<11?'Guten Morgen':hour<18?'Guten Tag':'Guten Abend'}
export function SessionWelcome({session,role}:{session:{name:string|null,role:PreviewRole,canPreview:boolean}|null,role:PreviewRole}){
 const [greeting,setGreeting]=useState('Willkommen');
 useEffect(()=>{const update=()=>setGreeting(greetingAt(new Date()));update();const timer=setInterval(update,60000);return()=>clearInterval(timer)},[]);
 const roleName=role==='admin'?'Admin':role==='manager'?'Verwalter':role==='user'?'Nutzer':'Öffentliches Profil';
 const preview=session?.canPreview&&session.role!==role;
 return <section className="session-welcome" aria-label="Begrüßung und Berechtigungen"><h2>{greeting}{session?.name?`, ${session.name}`:''}!</h2><p>{!session?'Profil wird geladen …':preview?<>Angemeldet als <strong>Admin</strong> · Geprüfte Ansicht: <strong>{roleName}</strong></>:<>Aktuelles Profil: <strong>{roleName}</strong></>}</p>{session&&<p><strong>{preview?'Berechtigungen dieser Vorschau':'Ihre Berechtigungen'}:</strong> {role==='public'?'Freigegebene Beiträge lesen und moderierte Kommentare einreichen. Kein Zugriff auf interne Bestände oder MP3-Downloads.':['Interne Beiträge und Dateien ansehen',...Object.entries(labels).filter(([action])=>canArchive(role,action as ArchiveAction)).map(([,label])=>label)].join(' · ')}</p>}</section>
}
