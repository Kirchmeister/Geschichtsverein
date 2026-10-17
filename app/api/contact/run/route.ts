import {env} from '@/lib/runtime-env';
import {runContact} from '@/lib/archive-contact';
export async function POST(req:Request){const e=env as any;if(req.headers.has('origin')||!e.ARCHIVE_RUNNER_KEY||req.headers.get('authorization')!=='Bearer '+e.ARCHIVE_RUNNER_KEY)return new Response(null,{status:403});try{return Response.json(await runContact())}catch{return Response.json({error:'Versand derzeit nicht verfügbar.'},{status:503})}}
