// Run only through linux-start.mjs on the operator's own server.
import fs from 'node:fs';
import path from 'node:path';
import {sqliteBinding} from '../server/linux-storage.mjs';
import {authService} from '../server/auth-service.mjs';
import {adminGrantConfirmation} from '../server/account-management.mjs';
const [email,name,confirmation]=process.argv.slice(2);
if(confirmation!==adminGrantConfirmation)throw Error('Bestätigung fehlt: ADMINISTRATORRECHTE VERGEBEN');
try{if(fs.readFileSync(process.env.ARCHIVE_MAINTENANCE_FILE||'/config/maintenance','utf8').trim()==='1')throw Error('Update oder Wiederherstellung läuft. Erst abschließen.')}catch(e){if(e.code!=='ENOENT')throw e}
const filename=path.join(process.env.ARCHIVE_DATA_DIR||'/data','archive.sqlite');
if(!fs.existsSync(filename))throw Error('Bestehende Datenbank nicht gefunden. Keine neue Datenbank anlegen.');
const storage=sqliteBinding(filename,path.resolve('drizzle'));
try{const s=authService(storage.database,{origin:process.env.ARCHIVE_ORIGIN,sessionKey:process.env.ARCHIVE_SESSION_KEY}),token=s.invite({email,name,role:'admin',confirmation},false,'ssh-recovery');console.log('Vertraulicher einmaliger Wiederherstellungslink (7 Tage gültig):\n'+process.env.ARCHIVE_ORIGIN+'/anmelden#einladung='+token)}finally{storage.close()}
