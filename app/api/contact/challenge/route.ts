import {POST as submit} from '../route';
import {env} from '@/lib/runtime-env';
export async function GET(req:Request){if(req.headers.get('sec-fetch-site')==='cross-site')return new Response(null,{status:403});const headers=new Headers(req.headers);headers.set('origin',(env as any).ARCHIVE_ORIGIN);return submit(new Request(req.url,{method:'POST',headers,body:JSON.stringify({action:'challenge'})}))}
