import {archiveDb} from '@/lib/archive-db';
export async function GET(){try{await archiveDb().prepare('SELECT 1 AS ok').first();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false},{status:503})}}
