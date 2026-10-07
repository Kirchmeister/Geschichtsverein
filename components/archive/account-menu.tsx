 'use client';
import {PasskeySettings} from './passkeys';
import {useState,type ReactNode} from 'react';
import {UserRound,LogOut,ChevronUp} from 'lucide-react';
import {archiveRequest,type PreviewRole} from '@/lib/archive-api';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SidebarMenuButton,useSidebar} from '@/components/ui/sidebar';
import {roleLabel,sessionPermissions,type ArchiveSession} from './session-ui';
export function ArchiveNavigationButton({children,onClick,isActive=false,footer=false}:{children:ReactNode,onClick:()=>void,isActive?:boolean,footer?:boolean}){
 const {isMobile,setOpenMobile}=useSidebar();function choose(){onClick();if(isMobile)setOpenMobile(false)}
 return footer?<button type="button" className="settings-nav" aria-current={isActive?'page':undefined} onClick={choose}>{children}</button>:<SidebarMenuButton isActive={isActive} onClick={choose}>{children}</SidebarMenuButton>;
}
export function AccountControls({session,onOpen}:{session:ArchiveSession|null,onOpen:()=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function logout(){setBusy(true);setError('');try{await archiveRequest('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});location.assign('/anmelden')}catch(e:any){setError(e.message);setBusy(false)}}
 if(!session)return <div className="sidebar-account"><span>Profil wird geladen …</span></div>;
 if(session.role==='public')return null;
 return <div className="sidebar-account"><button type="button" className="sidebar-account-name" aria-haspopup="dialog" onClick={onOpen}><UserRound size={18} aria-hidden="true"/><span>{session.name||'Angemeldet'}</span><ChevronUp size={15} aria-hidden="true"/></button>{session.canLogout&&<button type="button" className="sidebar-account-logout" disabled={busy} onClick={logout}><LogOut size={15} aria-hidden="true"/>{busy?'Wird abgemeldet …':'Abmelden'}</button>}{error&&<p role="alert" className="error">{error}</p>}</div>;
}
export function SidebarAccount({session,onOpen}:{session:ArchiveSession|null,onOpen:()=>void}){
 const {isMobile,setOpenMobile}=useSidebar();return <AccountControls session={session} onOpen={()=>{if(isMobile)setOpenMobile(false);onOpen()}}/>;
}
export function AccountPermissions({session,previewRole,open,onOpenChange}:{session:ArchiveSession|null,previewRole:PreviewRole,open:boolean,onOpenChange:(open:boolean)=>void}){
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="account-permissions"><DialogTitle>{session?.name||'Ihr Konto'}</DialogTitle><DialogDescription>Zugeordnete Rolle: {session?roleLabel(session.role):'Wird geladen …'}</DialogDescription>{session&&<><h3>Ihre Berechtigungen</h3><ul>{sessionPermissions(session.role).map(p=><li key={p}>{p}</li>)}</ul>{session.canPreview&&session.role!==previewRole&&<p className="account-preview-note">Aktuelle Profilvorschau: <strong>{roleLabel(previewRole)}</strong>. Ihre zugeordnete Rolle bleibt {roleLabel(session.role)}; die Vorschau verwendet die Berechtigungen der gewählten Ansicht.</p>}{session.canLogout&&<PasskeySettings/>}</>}</DialogContent></Dialog>;
}
