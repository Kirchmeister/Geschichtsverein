import {isIP} from 'node:net';
import {createHmac,timingSafeEqual} from 'node:crypto';
export function authSource(req,key){const raw=req.headers.get('x-archive-auth-source');if(!key||!raw||raw.length>200)return 'unknown';const [source,signature,...extra]=raw.split('|');if(extra.length||!source||!signature||source!=='unknown'&&!isIP(source)||!/^[a-f0-9]{64}$/.test(signature))return 'unknown';const expected=createHmac('sha256',key).update(source).digest();return timingSafeEqual(expected,Buffer.from(signature,'hex'))?source:'unknown'}
