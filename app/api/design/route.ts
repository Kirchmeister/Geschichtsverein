import {archiveDesign} from '@/lib/archive-design';
import {isArchiveTheme} from '@/lib/archive-theme';
import {archiveDb} from '@/lib/archive-db';
import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
import {sameOrigin} from '@/lib/archive-comments';
import version from '@/version.json';
export async function GET(){try{return Response.json({...await archiveDesign(),version:version.version},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Design konnte nicht geladen werden.'},{status:503})}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return Response.json({error:'Bitte die Website direkt öffnen.'},{status:403});
 const access=await requireArchiveAction(req,'manageSettings');
 if(access.actualRole!=='admin')return Response.json({error:'Nur Administratoren dürfen das Design ändern.'},{status:403});
 const d=await req.json() as any;if(!isArchiveTheme(d.theme)||!isArchiveTheme(d.expectedTheme))return Response.json({error:'Bitte eine gültige Farbvorlage wählen.'},{status:400});
 const db=archiveDb(),row=await db.prepare("SELECT data FROM archive_settings WHERE key='design'").first<{data:string}>();
 if((await archiveDesign()).theme!==d.expectedTheme)return Response.json({error:'Die Farbvorlage wurde inzwischen geändert. Bitte neu laden.'},{status:409});
 const result=await db.prepare("INSERT INTO archive_settings(key,data,updated,updated_by) VALUES('design',?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated=excluded.updated,updated_by=excluded.updated_by WHERE archive_settings.data IS ?").bind(JSON.stringify({theme:d.theme}),new Date().toISOString(),access.identity.subject,row?.data??null).run();
 if(!result.meta.changes)return Response.json({error:'Die Farbvorlage wurde inzwischen geändert. Bitte neu laden.'},{status:409});
 return Response.json({theme:d.theme});
 }catch(e){return accessResponse(e)||Response.json({error:'Design konnte nicht gespeichert werden.'},{status:400})}}
