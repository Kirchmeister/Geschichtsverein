import {sessionIdentity} from '@/server/auth-security.mjs';
/** Signed Linux sessions additionally require a live server-side session record. */
export function serverSessionIdentity(req:Request,key:string|undefined,db?:any){return sessionIdentity(req,key,db)}
