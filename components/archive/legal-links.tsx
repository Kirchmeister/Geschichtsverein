'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {archiveRequest} from '@/lib/archive-api';
type Links={imprint:boolean,privacy:boolean};
const LegalLinks=createContext<Links>({imprint:false,privacy:false});
export function useLegalLinks(){return useContext(LegalLinks)}
export function LegalLinksProvider({initial,children}:{initial:Links,children:React.ReactNode}){
 const [links,setLinks]=useState(initial);
 useEffect(()=>{let alive=true;const load=()=>archiveRequest('/api/legal?public=1').then(d=>{if(alive)setLinks({imprint:!!d.imprint,privacy:!!d.privacy})}).catch(()=>{});load();window.addEventListener('archive-legal-changed',load);window.addEventListener('focus',load);return()=>{alive=false;window.removeEventListener('archive-legal-changed',load);window.removeEventListener('focus',load)}},[]);
 return <LegalLinks.Provider value={links}>{children}</LegalLinks.Provider>;
}
