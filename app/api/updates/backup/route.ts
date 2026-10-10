import {env} from '@/lib/runtime-env';
import {archiveDb} from '@/lib/archive-db';
import {systemSettings} from '@/lib/archive-system-settings';
import {createBackup,advanceBackup} from '@/lib/archive-backups';
import {verifyBackupRequest} from '@/server/update-backup-protocol.mjs';
const nonces=new Map<string,number>(),headers={'Cache-Control':'no-store'};
async function authorized(req:Request,body:string){return (env as any).ARCHIVE_HOSTING_RUNTIME==='linux'&&verifyBackupRequest((env as any).ARCHIVE_UPDATER_SECRET,req.method,body,req.headers,nonces)}
export async function GET(req:Request){if(!await authorized(req,''))return new Response(null,{status:403});const s=await systemSettings();return Response.json({available:!!(s.webdav.tested&&s.webdav.url&&s.webdav.password)}, {headers})}
export async function POST(req:Request){
 if(Number(req.headers.get('content-length')||0)>512)return new Response(null,{status:413});
 let body='';const reader=req.body?.getReader(),decoder=new TextDecoder();let bytes=0;if(reader)while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.byteLength;if(bytes>512){await reader.cancel();return new Response(null,{status:413})}body+=decoder.decode(r.value,{stream:true})}body+=decoder.decode();if(!await authorized(req,body))return new Response(null,{status:403});
 try{const {jobId}=JSON.parse(body);if(typeof jobId!=='string'||!/^[-a-f0-9]{36}$/.test(jobId))return new Response(null,{status:400});
 const db=archiveDb(),key='update_backup:'+jobId;let saved=await db.prepare('SELECT data FROM archive_settings WHERE key=?').bind(key).first<{data:string}>();
 let id=saved?JSON.parse(saved.data).id:null;
 if(!id){const s=await systemSettings();if(!s.webdav.tested||!s.webdav.password||!s.webdav.url)return Response.json({error:'Nextcloud bitte zuerst erfolgreich einrichten und testen.'},{status:409,headers});id=await createBackup('webdav','Sicherung vor Serverupdate');await db.prepare('INSERT INTO archive_settings(key,data,updated,updated_by) VALUES(?,?,?,?)').bind(key,JSON.stringify({id}),new Date().toISOString(),'Serverupdate').run();}
 try{await advanceBackup(id)}catch{/* The recorded backup error is returned below. */}
 const row=await db.prepare('SELECT id,status,error,verified,data FROM archive_backups WHERE id=?').bind(id).first<any>();if(!row)return new Response(null,{status:409});const data=JSON.parse(row.data),total=data.items?.length||0;
 return Response.json({id:row.id,status:row.status,error:row.error,verified:row.status==='complete'?row.verified:null,version:data.applicationVersion,completed:row.status==='uploading'?data.uploadIndex||0:row.status==='verifying'?data.verifyIndex||0:data.index||0,total:row.status==='copying'?null:total},{headers});
 }catch{return Response.json({error:'Nextcloud-Sicherung konnte nicht gestartet werden.'},{status:503,headers})}
}
