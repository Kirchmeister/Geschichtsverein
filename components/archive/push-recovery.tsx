'use client';
import {useEffect,useState} from 'react';
import {recoverPushBrowser} from '@/lib/archive-push-browser';
export function PushRecovery(){const [notice,setNotice]=useState('');useEffect(()=>{let active=true,running=false;
 async function check(){if(running||document.visibilityState==='hidden')return;running=true;try{const hint=await recoverPushBrowser();if(active)setNotice(hint)}catch{}finally{running=false}}
 function message(event:MessageEvent){if(event.data?.type==='archive-push-subscription-changed')check()}
 check();window.addEventListener('focus',check);window.addEventListener('online',check);document.addEventListener('visibilitychange',check);navigator.serviceWorker?.addEventListener('message',message);
 return()=>{active=false;window.removeEventListener('focus',check);window.removeEventListener('online',check);document.removeEventListener('visibilitychange',check);navigator.serviceWorker?.removeEventListener('message',message)}
 },[]);return notice?<p className="account-info" role="status">{notice}</p>:null}
