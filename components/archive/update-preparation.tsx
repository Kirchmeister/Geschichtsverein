'use client';
import {updateReadiness} from '@/lib/update-readiness';
export function openOperatorHelp(){const panel=document.querySelector<HTMLDetailsElement>('#settings-help');if(panel){panel.open=true;panel.scrollIntoView({behavior:'smooth',block:'start'})}}
export function UpdatePreparation({state,target}:{state:any,target?:any,onRecheck?:()=>void,disabled?:boolean}){
 const readiness=updateReadiness(state,target);
 return <section className={'update-readiness '+(readiness.status==='ready'?'is-ready':'')} aria-label="Update-Voraussetzungen" role="status"><strong>{readiness.label}</strong><p>{readiness.message}</p>{!['ready','loading','running'].includes(readiness.status)&&<button type="button" onClick={openOperatorHelp}>Passende Hilfe öffnen</button>}</section>;
}
