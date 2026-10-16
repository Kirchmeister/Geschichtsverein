'use client';
import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
export function ConfirmAction({open,onOpenChange,title,description,children,confirmLabel,destructive=false,initialFocus='cancel',onConfirm}:{open:boolean,onOpenChange:(open:boolean)=>void,title:string,description:string,children?:ReactNode,confirmLabel:string,destructive?:boolean,initialFocus?:'cancel'|'title',onConfirm:()=>void|Promise<void>}){
 const cancel=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null),locked=useRef(false);const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(open)setError('')},[open]);
 async function confirm(){if(locked.current)return;locked.current=true;setBusy(true);setError('');try{await onConfirm();onOpenChange(false)}catch(e:any){setError(e.message||'Die Aktion konnte nicht abgeschlossen werden.')}finally{locked.current=false;setBusy(false)}}
 return <Dialog open={open} onOpenChange={value=>{if(!locked.current)onOpenChange(value)}}><DialogContent className="confirm-entry-action" showCloseButton={!busy} onOpenAutoFocus={event=>{event.preventDefault();(initialFocus==='title'?heading.current:cancel.current)?.focus()}} onEscapeKeyDown={event=>{if(locked.current)event.preventDefault()}} onInteractOutside={event=>{if(locked.current)event.preventDefault()}}><DialogTitle ref={heading} tabIndex={initialFocus==='title'?-1:undefined}>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>{children}{error&&<p className="error" role="alert">{error}</p>}<div className="confirm-entry-buttons"><button ref={cancel} type="button" disabled={busy} onClick={()=>onOpenChange(false)}>Abbrechen</button><button type="button" className={destructive?'entry-danger-button':'primary'} disabled={busy} onClick={confirm}>{busy?'Bitte warten …':confirmLabel}</button></div></DialogContent></Dialog>;
}
