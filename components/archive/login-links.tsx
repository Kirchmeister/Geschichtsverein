'use client';
import {useEffect,useState} from 'react';
import {startAuthentication} from '@simplewebauthn/browser';
import {KeyRound} from 'lucide-react';
import {archiveRequest} from '@/lib/archive-api';
export function LoginLinks({showLogout=false}:{showLogout?:boolean}={}){
 const [auth,setAuth]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{archiveRequest('/api/auth').then(setAuth).catch(()=>{})},[]);
 async function login(){if(busy)return;setBusy(true);setError('');try{if(!window.isSecureContext)throw Error('Passkeys benötigen eine vertrauenswürdige HTTPS-Adresse.');const data=await archiveRequest('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login-options'})});const response=await startAuthentication({optionsJSON:data.options});await archiveRequest('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',challenge:data.challenge,response})});location.assign('/')}catch(e:any){setError(e.name==='NotAllowedError'?'Anmeldung abgebrochen. Sie können die öffentliche Zeitleiste weiterhin ansehen.':e.message||'Anmeldung nicht möglich.')}finally{setBusy(false)}}
 if(!auth?.enabled||auth.authenticated&&!showLogout)return null;
 return <div className="public-access">{auth.authenticated?<button type="button" className="public-login-button" disabled={busy} onClick={async()=>{setBusy(true);try{await archiveRequest('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});location.assign('/')}catch(e:any){setError(e.message);setBusy(false)}}}>Abmelden</button>:<button type="button" className="public-login-button" disabled={busy} onClick={login}><KeyRound size={16} aria-hidden="true"/>{busy?'Passkey bestätigen …':'Mit Passkey anmelden'}</button>}{error&&<p className="error" role="alert">{error}</p>}</div>
}
