import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {initializeAuth} from '../server/auth-service.mjs';
import {initializePush} from '../server/push-service.mjs';
const action=process.argv[2],root=process.env.ARCHIVE_DATA_DIR||'/data',config=process.env.ARCHIVE_CONFIG_FILE||'/config/app.env',version=JSON.parse(fs.readFileSync('version.json','utf8'));
if(!['verify','migrate'].includes(action))throw Error('Ungültige Probeaktion.');
const settings=Object.fromEntries(fs.readFileSync(config,'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>{const n=l.indexOf('=');return [l.slice(0,n),l.slice(n+1)]}));for(const key of ['ARCHIVE_SESSION_KEY','ARCHIVE_SETTINGS_KEY','ARCHIVE_RUNNER_KEY'])if(!/^[a-f0-9]{64}$/.test(settings[key]||''))throw Error('Konfigurationsprüfung fehlgeschlagen.');new URL(settings.ARCHIVE_ORIGIN);
if(action==='migrate'){const storage=sqliteBinding(path.join(root,'archive.sqlite'),path.resolve('drizzle'));try{initializeAuth(storage.database);initializePush(storage.database)}finally{storage.close()}}
const db=new DatabaseSync(path.join(root,'archive.sqlite'),{readOnly:true});try{
 if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw Error('Datenbankprüfung fehlgeschlagen.');
 const ledger=db.prepare('SELECT name,hash FROM _linux_migrations ORDER BY name').all(),expected=fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort();if(ledger.length!==version.databaseSchemaVersion||expected.length!==ledger.length)throw Error('Schema stimmt nicht mit dem Programmstand überein.');for(const [n,row] of ledger.entries())if(row.name!==expected[n]||row.hash!==createHash('sha256').update(fs.readFileSync('drizzle/'+row.name)).digest('hex'))throw Error('Migrationsprüfung fehlgeschlagen.');
 for(const table of ['entries','entry_versions'])for(const row of db.prepare('SELECT data FROM '+table).iterate()){const entry=JSON.parse(row.data);for(const f of entry.files||[]){if(typeof f.key!=='string')throw Error('Ungültige Dateireferenz.');const base=path.join(root,'bucket',createHash('sha256').update(f.key).digest('hex')),meta=JSON.parse(fs.readFileSync(base+'.json','utf8'));if(meta.key!==f.key||!/^[a-f0-9]{64}$/.test(meta.etag)||fs.statSync(base+'.'+meta.etag).size!==meta.size)throw Error('Dateiprüfung fehlgeschlagen.')}}
 if(db.prepare("SELECT e.id FROM entries e WHERE e.publication_status='approved' AND NOT EXISTS(SELECT 1 FROM entry_versions v WHERE v.entry_id=e.id AND v.version=e.approved_version) LIMIT 1").get())throw Error('Freigegebener Stand fehlt.');
 console.log('Probe erfolgreich: Version, Schema, Schlüssel und referenzierte Dateien.');
}finally{db.close()}
