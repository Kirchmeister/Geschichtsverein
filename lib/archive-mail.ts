import {env} from '@/lib/runtime-env';
import {systemSettings,openSecret} from './archive-system-settings';
export function mailAvailable(){return (env as any).ARCHIVE_HOSTING_RUNTIME==='linux'&&typeof (env as any).ARCHIVE_SMTP_SEND==='function'}
export async function sendArchiveMail(to:string,subject:string,text:string){
 if(!mailAvailable())throw Error('SMTP-Versand steht auf dem eigenen Linux-Server zur Verfügung. In Sites ist er nicht verfügbar.');
 const s=(await systemSettings()).smtp;
 return (env as any).ARCHIVE_SMTP_SEND({...s,password:await openSecret(s.password)},{to,subject,text});
}
