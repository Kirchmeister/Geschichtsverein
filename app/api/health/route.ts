import version from '@/version.json';
import {archiveDb} from '@/lib/archive-db';
export async function GET(){try{await archiveDb().prepare('SELECT 1 AS ok').first();return Response.json({ok:true,version:version.version,schema:version.databaseSchemaVersion,commit:version.codeCommit},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false},{status:503})}}
