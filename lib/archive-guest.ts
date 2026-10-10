import {archiveDb} from './archive-db';
import {defaultGuestFields,guestFieldLabels} from './archive-public-fields';
import {projectPublicEntry} from './archive-public';
export async function guestFields():Promise<string[]>{
 const row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='guest_fields'").first<{data:string}>();
 if(!row)return defaultGuestFields;
 const value=JSON.parse(row.data);
 return Array.isArray(value)?value.filter(k=>typeof k==='string'&&Object.hasOwn(guestFieldLabels,k)):[];
}
export function projectGuestEntry(data:any,fields:string[],reference:string,storagePlace=''){
 const projected=projectPublicEntry(data,fields);
 // Empty placeholders keep the shared search UI usable without exposing hidden values.
 const out:any={id:data.id,reference,files:projected.files,visibleFields:fields};
 for(const key of Object.keys(guestFieldLabels))if(!['images','documents','audio','people'].includes(key))out[key]=fields.includes(key)&&typeof data[key]==='string'?data[key]:'';
 if(!out.title)out.title='Beitrag';
 out.personTags=fields.includes('people')?data.personTags||[]:[];
 out.descriptionLinks=fields.includes('description')?projected.descriptionLinks||[]:[];
 out.storagePlace=fields.includes('storagePlaceId')?storagePlace:'';
 return out;
}
export async function guestFileAllowed(key:string){
 const fields=await guestFields(),rows=await archiveDb().prepare('SELECT data FROM entries WHERE deleted=0').all();
 return rows.results.some((row:any)=>projectPublicEntry(JSON.parse(row.data),fields).files.some((file:any)=>file.key===key));
}
