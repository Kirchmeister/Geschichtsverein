import {env} from 'cloudflare:workers';
import {archiveDb} from './archive-db';
export type ArchiveInstallation={place:string,association:string,completed:boolean,restored?:boolean,sourceCreated?:string};
export async function installation():Promise<ArchiveInstallation>{
 const row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='installation'").first<{data:string}>();
 if(row)return JSON.parse(row.data);
 const configured=env as unknown as {ARCHIVE_INITIAL_PLACE?:string,ARCHIVE_INITIAL_ASSOCIATION?:string};
 return {place:configured.ARCHIVE_INITIAL_PLACE||'',association:configured.ARCHIVE_INITIAL_ASSOCIATION||'',completed:!!(configured.ARCHIVE_INITIAL_PLACE&&configured.ARCHIVE_INITIAL_ASSOCIATION)};
}
export async function requireInstalled(){if(!(await installation()).completed)throw Error('Die Ersteinrichtung muss zuerst abgeschlossen werden.');}
