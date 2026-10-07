import path from 'node:path';
import {initializeAuth} from './auth-service.mjs';
import {sqliteBinding,fileBucket} from './linux-storage.mjs';
let db:any,bucket:any;
export const env=new Proxy({} as Record<string,any>,{get(_target,key:string){if(key==='DB'){if(!db){db=sqliteBinding(path.join(process.env.ARCHIVE_DATA_DIR||'/data','archive.sqlite'),path.join(process.cwd(),'drizzle'));initializeAuth(db.database);}return db;}if(key==='BUCKET')return bucket??=fileBucket(path.join(process.env.ARCHIVE_DATA_DIR||'/data','bucket'));if(key==='ARCHIVE_HOSTING_RUNTIME')return 'linux';return process.env[key]}});
