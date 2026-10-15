import {archiveRequest} from './archive-api';
const prefix='history-archive-push-browser-v1:';
let pending:Promise<unknown>=Promise.resolve(),epoch=0;
export const pushSend=(data:any)=>archiveRequest('/api/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
export function pushSupported(){return window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
export function pushKeyBytes(key:string){return Uint8Array.from(atob((key+'='.repeat((4-key.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
function read(account:string):string|null{try{return localStorage.getItem(prefix+account)}catch{return null}}
export function rememberPushBrowser(state:any){try{localStorage.setItem(prefix+state.accountId,state.deviceRevision)}catch{}}
export function forgetPushBrowser(state:any){if(!state?.accountId)return;try{localStorage.removeItem(prefix+state.accountId)}catch{}}
/** Serialize explicit actions with recovery; an explicit action invalidates queued recovery. */
export function changePushBrowser<T>(action:()=>Promise<T>):Promise<T>{epoch++;const result=pending.catch(()=>{}).then(action);pending=result.catch(()=>{});return result}
export async function currentPushDevice(){if(!pushSupported())return false;const sub=await (await navigator.serviceWorker.getRegistration('/'))?.pushManager.getSubscription();return !!sub&&(await pushSend({action:'device-status',endpoint:sub.endpoint})).registered===true}
export function recoverPushBrowser(){const ticket=epoch;const result=pending.catch(()=>{}).then(async()=>{
 if(ticket!==epoch||!pushSupported())return '';
 const state=await archiveRequest('/api/push');if(ticket!==epoch||!state.available)return '';
 if(!state.enabled){forgetPushBrowser(state);return ''}
 const remembered=read(state.accountId);
 if(remembered!==null&&remembered!==state.deviceRevision){forgetPushBrowser(state);return ''}
 if(Notification.permission!=='granted')return remembered===state.deviceRevision?'Push benötigt eine erneute Browserfreigabe. Öffnen Sie im Profil „Benachrichtigungen“.':'';
 let registration=await navigator.serviceWorker.getRegistration('/'),sub=await registration?.pushManager.getSubscription();
 const registered=!!sub&&(await pushSend({action:'device-status',endpoint:sub.endpoint})).registered===true;
 if(ticket!==epoch)return '';
 // Adopt only an existing subscription owned by this signed-in account.
 if(remembered===null){if(registered)rememberPushBrowser(state);return ''}
 try{
  registration=await navigator.serviceWorker.register('/push-worker.js',{scope:'/'});
  if(ticket!==epoch)return '';
  sub=await registration.pushManager.getSubscription();
  if(!sub)sub=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKeyBytes(state.publicKey)});
  if(ticket!==epoch)return '';
  await pushSend({action:'restore-device',subscription:sub.toJSON(),revision:state.deviceRevision});
  window.dispatchEvent(new Event('archive-push-device-changed'));return '';
 }catch{return 'Push konnte für diesen Browser nicht wiederhergestellt werden. Öffnen Sie im Profil „Benachrichtigungen“ und aktivieren Sie diesen Browser erneut.'}
 });pending=result.catch(()=>{});return result}
