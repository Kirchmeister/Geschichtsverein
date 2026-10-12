'use client';
import {XIcon} from 'lucide-react';
export function EntryReaderToolbar({canEdit,busy,onEdit,onClose}:{canEdit:boolean,busy:boolean,onEdit:()=>void,onClose:()=>void}){
 return <div className="entry-reader-toolbar">{canEdit&&<button type="button" className="primary" disabled={busy} onClick={onEdit}>Eintrag bearbeiten</button>}<button type="button" className="entry-reader-close" aria-label="Beitrag schließen" onClick={onClose}><XIcon aria-hidden="true"/></button></div>;
}
