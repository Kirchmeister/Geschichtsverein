import {env} from '@/lib/runtime-env';
import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
import {sameOrigin} from '@/lib/archive-comments';
import {updateAgent} from '@/lib/archive-update-agent';
import fs from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function admin(req:Request){const a=await requireArchiveAction(req,'manageSettings');if(a.actualRole!=='admin'||(env as any).ARCHIVE_HOSTING_RUNTIME!=='linux')throw Error('Wiederherstellung ist nur für Linux-Administratoren verfügbar.');}
async function service(){if(!(env as any).ARCHIVE_UPDATER_URL||!(env as any).ARCHIVE_UPDATER_SECRET)throw Error('Für die Wiederherstellung muss zuerst der separate Server-Update-Dienst eingerichtet werden.');const r=await updateAgent('GET'),d:any=await r.json();if(!r.ok||!d.features?.restore)throw Error('Der separate Server-Update-Dienst muss mindestens Version 0.32.0 verwenden.');return d;}
export async function GET(req:Request){try{await admin(req);const d=await service();return Response.json({enabled:true,preview:d.restorePreview,inspection:d.restoreInspection,job:d.job?.kind==='restore'?d.job:null,busy:!!d.busy,updateError:d.updateError},{headers:{'Cache-Control':'no-store'}})}catch(e:any){return accessResponse(e)||Response.json({enabled:false,error:e.message||'Wiederherstellungsdienst nicht erreichbar.'},{status:503})}}
export async function POST(req:Request){let file:string|undefined;try{
 if(!sameOrigin(req))return Response.json({error:'Bitte die Website direkt öffnen.'},{status:403});await admin(req);const current=await service();if(current.busy)throw Error('Ein Servervorgang läuft bereits.');
 if(req.headers.get('content-type')?.startsWith('application/json')){
  const d:any=await req.json();if(d.action!=='restore-start'||!/^[-a-f0-9]{36}$/.test(d.id||'')||d.confirmation!=='ARCHIV WIEDERHERSTELLEN')throw Error('Bitte die Wiederherstellung ausdrücklich bestätigen.');
  const r=await updateAgent('POST',JSON.stringify({action:d.action,id:d.id,confirmation:d.confirmation}));return Response.json(await r.json(),{status:r.status});
 }
 if(req.headers.get('content-type')!=='application/x-tar'||!req.body)throw Error('Bitte eine TAR-Sicherungsdatei auswählen.');
 const root=path.resolve((env as any).ARCHIVE_DATA_DIR||'/data'),inbox=path.join(root,'restore-inbox');await fs.mkdir(inbox,{recursive:true,mode:0o700});if(await fs.realpath(inbox)!==inbox)throw Error('Uploadablage ist ungültig.');
 const id=crypto.randomUUID();file=path.join(inbox,id+'.tar');const handle=await fs.open(file,'wx',0o600);let size=0;
 try{for await(const chunk of req.body as any){size+=chunk.byteLength;if(size>2*1024**3)throw Error('Die Web-Wiederherstellung unterstützt TAR-Dateien bis 2 GiB. Größere Dateien bitte über die Konsole importieren.');await handle.writeFile(chunk)}if(size<1024)throw Error('Die Datei ist keine vollständige Sicherung.');await handle.sync()}finally{await handle.close()}
 const r=await updateAgent('POST',JSON.stringify({action:'restore-inspect',id})),d:any=await r.json();if(!r.ok)throw Error(d.error||'Prüfung konnte nicht gestartet werden.');file=undefined;return Response.json(d,{status:r.status});
 }catch(e:any){if(file)await fs.rm(file,{force:true}).catch(()=>{});return accessResponse(e)||Response.json({error:e.message||'Wiederherstellung fehlgeschlagen.'},{status:400})}}
