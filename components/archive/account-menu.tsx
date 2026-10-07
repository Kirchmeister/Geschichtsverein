 'use client';
import {PushSettings} from './push-settings';
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
 async function logout(){setBusy(true);setError('');try{let pushEndpoint;try{const registration=await navigator.serviceWorker?.getRegistration('/'),subscription=await registration?.pushManager.getSubscription();pushEndpoint=subscription?.endpoint;await subscription?.unsubscribe()}catch{}await archiveRequest('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout',pushEndpoint})});location.assign('/anmelden')}catch(e:any){setError(e.message);setBusy(false)}}
 if(!session)return <div className="sidebar-account"><span>Profil wird geladen …</span></div>;
 if(session.role==='public')return null;
 return <div className="sidebar-account"><button type="button" className="sidebar-account-name" aria-haspopup="dialog" onClick={onOpen}><UserRound size={18} aria-hidden="true"/><span>{session.name||'Angemeldet'}</span><ChevronUp size={15} aria-hidden="true"/></button>{session.canLogout&&<button type="button" className="sidebar-account-logout" disabled={busy} onClick={logout}><LogOut size={15} aria-hidden="true"/>{busy?'Wird abgemeldet …':'Abmelden'}</button>}{error&&<p role="alert" className="error">{error}</p>}</div>;
}
export function SidebarAccount({session,onOpen}:{session:ArchiveSession|null,onOpen:()=>void}){
 const {isMobile,setOpenMobile}=useSidebar();return <AccountControls session={session} onOpen={()=>{if(isMobile)setOpenMobile(false);onOpen()}}/>;
}
export function AccountPermissions({session,previewRole,open,onOpenChange}:{session:ArchiveSession|null,previewRole:PreviewRole,open:boolean,onOpenChange:(open:boolean)=>void}){
 const [tab,setTab]=useState('permissions');
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="account-permissions"><header className="account-dialog-header"><span className="account-avatar"><UserRound size={25}/></span><div><DialogTitle>{session?.name||'Ihr Konto'}</DialogTitle><DialogDescription>Zugeordnete Rolle: {session?roleLabel(session.role):'Wird geladen …'}</DialogDescription></div></header><div className="account-tabs" role="tablist" aria-label="Kontoeinstellungen">{[['permissions','Berechtigungen'],['push','Benachrichtigungen'],...(session?.canLogout?[['passkeys','Passkeys']]:[])].map(([id,label])=><button key={id} id={'account-tab-'+id} role="tab" aria-selected={tab===id} aria-controls={'account-panel-'+id} tabIndex={tab===id?0:-1} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const ids=session?.canLogout?['permissions','push','passkeys']:['permissions','push'];const next=e.key==='Home'?ids[0]:e.key==='End'?ids[ids.length-1]:ids[(ids.indexOf(id)+(e.key==='ArrowRight'?1:ids.length-1))%ids.length];setTab(next);document.getElementById('account-tab-'+next)?.focus()}}} onClick={()=>setTab(id)}>{label}</button>)}</div>{session&&<div className="account-dialog-body" role="tabpanel" id={'account-panel-'+tab} aria-labelledby={'account-tab-'+tab} tabIndex={0}>{tab==='permissions'?<><h3>Ihre Berechtigungen</h3><p className="account-help">Diese Rechte sind Ihrer Rolle zugeordnet.</p><ul className="account-permission-list">{sessionPermissions(session.role).map(p=><li key={p}>{p}</li>)}</ul>{session.canPreview&&session.role!==previewRole&&<p className="account-info">Aktuelle Profilvorschau: <strong>{roleLabel(previewRole)}</strong>. Ihre zugeordnete Rolle bleibt {roleLabel(session.role)}.</p>}</>:tab==='push'?<PushSettings/>:<PasskeySettings/>}</div>}</DialogContent></Dialog>;
}
