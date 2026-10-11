// Only the server driver calls this after stopping the live application.
import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {initializeAuth} from '../server/auth-service.mjs';
import {initializePush} from '../server/push-service.mjs';
export async function verifyRestoredFiles(root){
 const files=JSON.parse(fs.readFileSync(path.join(root,'objects.json'),'utf8'));
 for(const file of files){
  const base=path.join(root,'bucket',createHash('sha256').update(file.key).digest('hex')),meta=JSON.parse(fs.readFileSync(base+'.json','utf8'));
  if(meta.key!==file.key||meta.etag!==file.sha256||meta.size!==file.size)throw Error('Vorbereitete Datei-Metadaten stimmen nicht mit der geprüften Sicherung überein.');
  const hash=createHash('sha256');let size=0;for await(const chunk of fs.createReadStream(base+'.'+meta.etag)){hash.update(chunk);size+=chunk.length}
  if(size!==file.size||hash.digest('hex')!==file.sha256)throw Error('Vorbereitete Datei ist beschädigt; Wiederherstellung abgebrochen.');
 }
}
export function preserveLocal(sourceFile,targetFile){
 const source=new DatabaseSync(sourceFile,{readOnly:true}),target=new DatabaseSync(targetFile);
 const put=(table,row)=>{const keys=Object.keys(row);if(!/^[a-z_]+$/.test(table)||keys.some(k=>!/^\w+$/.test(k)))throw Error('Ungültige lokale Tabelle.');target.prepare('INSERT INTO '+table+'('+keys.join(',')+') VALUES('+keys.map(()=>'?').join(',')+') ON CONFLICT DO UPDATE SET '+keys.map(k=>k+'=excluded.'+k).join(',')).run(...Object.values(row));};
 try{
  initializeAuth(target);initializePush(target);target.exec('PRAGMA foreign_keys=ON; BEGIN IMMEDIATE');
  // Source SQL is from the trusted current database, never from the uploaded TAR.
  for(const table of source.prepare("SELECT name,sql FROM sqlite_schema WHERE type='table' AND name GLOB 'linux_*' ORDER BY CASE name WHEN 'linux_accounts' THEN 0 WHEN 'linux_credentials' THEN 1 ELSE 2 END,name").all()){
   if(!target.prepare('SELECT 1 FROM sqlite_schema WHERE name=?').get(table.name))target.exec(table.sql);
   if(['linux_challenges','linux_push_queue'].includes(table.name))continue;
   for(const row of source.prepare('SELECT * FROM '+table.name).iterate())put(table.name,row);
  }
  for(const row of source.prepare("SELECT * FROM archive_users WHERE identity_provider='linux'").iterate())put('archive_users',row);
  for(const row of source.prepare("SELECT * FROM archive_settings WHERE key LIKE 'deleted-account:%' OR key LIKE 'welcome:%' OR key LIKE 'profile-preview:%' OR key='installation' OR key='system_settings'").iterate()){
   if(row.key==='installation'){
    const imported=JSON.parse(target.prepare("SELECT data FROM archive_settings WHERE key='installation'").get().data);imported.completed=true;row.data=JSON.stringify(imported);
   }else if(row.key==='system_settings'){
    const live=JSON.parse(row.data),saved=target.prepare("SELECT data FROM archive_settings WHERE key='system_settings'").get();const settings=saved?JSON.parse(saved.data):{};
    // Keep the actual login/QR domain and encrypted service credentials, pause scheduling.
    settings.domain=live.domain;settings.webdav={...live.webdav,daily:false};settings.smtp=live.smtp;settings.invitations=live.invitations;row.data=JSON.stringify(settings);
   }
   put('archive_settings',row);
  }
  if(!target.prepare("SELECT 1 FROM linux_accounts a JOIN archive_users u ON u.identity_provider='linux' AND u.identity_subject=a.id WHERE a.disabled=0 AND u.role='admin'").get())throw Error('Aktiver lokaler Administrator fehlt.');
  if(target.prepare('PRAGMA foreign_key_check').all().length||target.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Zusammengeführte Konten sind nicht konsistent.');
  target.exec('COMMIT');
 }catch(e){try{target.exec('ROLLBACK')}catch{}throw e}finally{source.close();target.close()}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 await verifyRestoredFiles('/restore/staged');
 preserveLocal('/live/archive.sqlite','/restore/staged/archive.sqlite');
 // The CLI keeps an additional portable copy for offline use; the live bucket suffices here.
 fs.rmSync('/restore/staged/objects',{recursive:true,force:true});
 console.log('Lokale Konten, Passkeys und Dienstzugänge erhalten.');
}
