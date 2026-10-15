import {env} from '@/lib/runtime-env';
import {systemSettings} from './archive-system-settings';
import {mailAvailable,sendArchiveMail} from './archive-mail';
import {deliverSecurityMail} from '@/server/admin-security-notices.mjs';
export async function securityMailReady(){if(!mailAvailable())return false;const s=(await systemSettings()).smtp;return !!(s.host&&s.from&&s.port&&(!s.username||s.password))}
export async function runSecurityMail(){return deliverSecurityMail((env as any).DB.database,{ready:await securityMailReady(),send:sendArchiveMail,limit:2})}
