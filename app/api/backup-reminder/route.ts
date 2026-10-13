import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
import {archiveDb} from '@/lib/archive-db';
import {systemSettings} from '@/lib/archive-system-settings';
import {backupReminder} from '@/lib/backup-reminder';
export async function GET(req:Request){try{
 const access=await requireArchiveAction(req,'manageSettings');if(access.actualRole!=='admin')return Response.json({error:'Nur Administratoren.'},{status:403});
 const now=Date.now(),settings=await systemSettings();
 const row=await archiveDb().prepare("SELECT status,created,finished FROM archive_backups WHERE status IN ('complete','expired') AND julianday(COALESCE(finished,created)) <= julianday(?) ORDER BY julianday(COALESCE(finished,created)) DESC LIMIT 1").bind(new Date(now).toISOString()).first<{status:string,created:string,finished:string|null}>();
 // New automatic storage providers add their readiness adapter here; the reminder itself stays provider-independent.
 const providers=[{enabled:settings.webdav?.daily===true,ready:!!(settings.webdav?.tested&&settings.webdav?.url&&settings.webdav?.username&&settings.webdav?.password)}];
 const stored=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='backup_reminder_state'").first<{data:string}>();
 const previous=stored?JSON.parse(stored.data):null;
 const result=backupReminder(row?[row]:[],providers,now,previous);
 if(result.show&&!previous)await archiveDb().prepare("INSERT INTO archive_settings(key,data,updated,updated_by) VALUES('backup_reminder_state',?,?, 'backup-reminder') ON CONFLICT(key) DO NOTHING").bind(JSON.stringify({lastSuccessfulAt:result.lastSuccessfulAt,activated:new Date(now).toISOString()}),new Date(now).toISOString()).run();
 else if(!result.show&&previous)await archiveDb().prepare("DELETE FROM archive_settings WHERE key='backup_reminder_state'").run();
 return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(e){return accessResponse(e)||Response.json({error:'Der Sicherungsstatus konnte nicht geprüft werden.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
