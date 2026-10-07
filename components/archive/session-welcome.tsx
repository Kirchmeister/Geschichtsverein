"use client";
import {useEffect,useState} from 'react';
import {roleLabel,type ArchiveSession} from './session-ui';
import type {PreviewRole} from '@/lib/archive-api';
export function greetingAt(date:Date){const hour=Number(new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'numeric',hourCycle:'h23'}).formatToParts(date).find(part=>part.type==='hour')?.value);return hour<5?'Guten Abend':hour<11?'Guten Morgen':hour<18?'Guten Tag':'Guten Abend'}
export function SessionWelcome({session,role}:{session:ArchiveSession|null,role:PreviewRole}){
 const [greeting,setGreeting]=useState('Willkommen');
 useEffect(()=>{const update=()=>setGreeting(greetingAt(new Date()));update();const timer=setInterval(update,60000);return()=>clearInterval(timer)},[]);
 return <section className="session-welcome" aria-label="Begrüßung"><h2>{greeting}{session?.name?`, ${session.name}`:''}!</h2><p>{!session?'Profil wird geladen …':session.role==='public'?'Öffentliches Profil':<>Zugeordnete Rolle: <strong>{roleLabel(session.role)}</strong></>}</p></section>
}
