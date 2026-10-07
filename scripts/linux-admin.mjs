import {sqliteBinding} from '../server/linux-storage.mjs';
import {authService} from '../server/auth-service.mjs';
import path from 'node:path';
const [email,name]=process.argv.slice(2);const storage=sqliteBinding(path.join(process.env.ARCHIVE_DATA_DIR||'/data','archive.sqlite'),path.resolve('drizzle'));try{const s=authService(storage.database,{origin:process.env.ARCHIVE_ORIGIN,sessionKey:process.env.ARCHIVE_SESSION_KEY}),token=s.invite({email,name,role:'admin'},true);console.log('Einmaliger Administrator-Einladungslink (vertraulich):\n'+process.env.ARCHIVE_ORIGIN+'/anmelden#einladung='+token)}finally{storage.close()}
