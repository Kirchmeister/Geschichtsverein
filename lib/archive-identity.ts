import {env} from '@/lib/runtime-env';
import {serverSessionIdentity} from './archive-server-session';
import {archiveDb} from '@/lib/archive-db';
/** Sites dispatch supplies these headers; replace only this adapter on migration.
 * Never accept identities from the request JSON or a name input. */
export function authenticatedIdentity(req:Request){
 const runtime=env as unknown as {ARCHIVE_HOSTING_RUNTIME?:string,ARCHIVE_SESSION_KEY?:string};
 if(runtime.ARCHIVE_HOSTING_RUNTIME==='linux')return serverSessionIdentity(req,runtime.ARCHIVE_SESSION_KEY);

 const subject=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email');
 if(!subject||!email)return null;
 let name:string|null=null;
 if(req.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8')try{name=decodeURIComponent(req.headers.get('oai-authenticated-user-full-name')||'').trim()||null}catch{}
 return {provider:'chatgpt',subject,email,name:name||email};
}
export async function resolveArchiveActor(req:Request){
 const identity=authenticatedIdentity(req);if(!identity)return null;const db=archiveDb();if((env as any).ARCHIVE_HOSTING_RUNTIME==='linux'){const a=await db.prepare('SELECT name FROM linux_accounts WHERE id=? AND disabled=0').bind(identity.subject).first<{name:string}>();if(!a)return null;identity.name=a.name;}
 await db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,created) VALUES(?,?,?,?,?) ON CONFLICT(identity_provider,identity_subject) DO UPDATE SET display_name=excluded.display_name').bind(crypto.randomUUID(),identity.provider,identity.subject,identity.name,new Date().toISOString()).run();
 const user=await db.prepare('SELECT id,display_name FROM archive_users WHERE identity_provider=? AND identity_subject=?').bind(identity.provider,identity.subject).first<{id:string,display_name:string}>();
 if(!user)throw Error('Authenticated author could not be resolved');return {id:user.id,name:user.display_name};
}
