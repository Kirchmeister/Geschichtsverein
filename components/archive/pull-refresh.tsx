'use client';
import {useEffect,useState} from 'react';
import {ArrowDown,RefreshCw} from 'lucide-react';
import {installPullRefresh} from '@/lib/archive-pull-refresh.mjs';
export function PullRefresh(){const [state,setState]=useState({phase:'idle',distance:0});useEffect(()=>installPullRefresh({onChange:setState,onRefresh:()=>window.location.reload()}),[]);const visible=state.phase!=='idle';return <div className={'archive-pull-refresh '+(visible?'is-visible ':'')+(state.phase==='refreshing'?'is-refreshing':'')} role="status" aria-live="polite" aria-hidden={!visible}>{state.phase==='pulling'?<ArrowDown size={17} aria-hidden="true"/>:<RefreshCw size={17} aria-hidden="true"/>}<span>{state.phase==='ready'?'Loslassen zum Aktualisieren':state.phase==='refreshing'?'Wird aktualisiert …':'Zum Aktualisieren herunterziehen'}</span></div>}
