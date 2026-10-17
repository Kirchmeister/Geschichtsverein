import {env} from '@/lib/runtime-env';
import {archiveDb} from './archive-db';
import {systemSettings} from './archive-system-settings';
import {sendArchiveMail} from './archive-mail';
import {deliverContact} from '@/server/contact-service.mjs';
import {cleanExports} from '@/server/export-jobs.mjs';
export async function contactSettings(){const row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='contact_settings'").first<{data:string}>();return row?JSON.parse(row.data):{enabled:false,recipient:''}}
export async function contactReady(){const [settings,system,legal]=await Promise.all([contactSettings(),systemSettings(),archiveDb().prepare("SELECT data FROM archive_settings WHERE key='legal_settings'").first<{data:string}>()]);return !!(settings.enabled&&settings.recipient&&system.smtp.host&&system.smtp.from&&(!system.smtp.username||system.smtp.password)&&legal&&JSON.parse(legal.data).published?.privacy)}
export async function runContact(){await cleanExports();return deliverContact((env as any).DB.database,{ready:await contactReady(),send:sendArchiveMail})}
