import {archiveDb} from './archive-db';
import {installation} from './archive-installation';
import {emptyMapConfig,normalizeMapConfig,legacyMapConfig} from './archive-map-config.mjs';
export async function mapSettings(){let row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='map'").first<{data:string}>();const branding=await installation();if(!row){const legacy=legacyMapConfig(branding);if(legacy){await archiveDb().prepare("INSERT OR IGNORE INTO archive_settings(key,data,updated,updated_by) VALUES('map',?,?,'Migration')").bind(JSON.stringify(legacy),new Date().toISOString()).run();row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='map'").first<{data:string}>()}}const value=row?JSON.parse(row.data):{...emptyMapConfig(branding.place),revision:null};return {row,value}}

export function mapValue(input:any){return {...normalizeMapConfig(input),revision:crypto.randomUUID()}}
