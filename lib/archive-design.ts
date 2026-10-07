import {archiveDb} from './archive-db';
import {defaultArchiveTheme,isArchiveTheme,type ArchiveTheme} from './archive-theme';
export async function archiveDesign():Promise<{theme:ArchiveTheme}>{
 const row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='design'").first<{data:string}>();
 if(!row)return {theme:defaultArchiveTheme};
 const data=JSON.parse(row.data);return {theme:isArchiveTheme(data.theme)?data.theme:defaultArchiveTheme};
}
