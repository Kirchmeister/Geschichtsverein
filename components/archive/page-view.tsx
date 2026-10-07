'use client';
import {useEffect,useRef} from 'react';
import {archiveRequest} from '@/lib/archive-api';
export function PublicPageView({page,reference}:{page:'timeline'|'entry',reference?:string}){const sent=useRef(false);useEffect(()=>{if(sent.current)return;sent.current=true;archiveRequest('/api/analytics/record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page,reference,source:page==='entry'&&new URLSearchParams(window.location.search).get('quelle')==='qr'?'qr':'direct'}),keepalive:true}).catch(()=>{})},[page,reference]);return null}
