'use client';
import {useEffect,useState} from 'react';
export function LoginLinks(){const [auth,setAuth]=useState<any>(null);useEffect(()=>{fetch('/api/auth').then(r=>r.json()).then(setAuth).catch(()=>{})},[]);if(!auth?.enabled)return null;return <div className="comment-actions">{auth.authenticated?<button onClick={async()=>{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(r.ok)location.href='/'}}>Abmelden</button>:<a href="/anmelden">Anmelden</a>}</div>}
