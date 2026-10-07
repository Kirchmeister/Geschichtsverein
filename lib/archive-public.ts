import {requireInstalled} from './archive-installation';
import {withPersonTags} from './archive-people';
import {validDescriptionLinks} from '@/lib/archive-description-links';
import {ensureReference} from '@/lib/archive-references';
import {archiveDb} from '@/lib/archive-db';
import {approvedEntriesQuery} from '@/lib/archive-permissions';
import {publicFieldLabels,defaultPublicFields} from '@/lib/archive-public-fields';
export {publicFieldLabels};
export async function publicFields(){const saved=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='public_fields'").first<{data:string}>();return saved?JSON.parse(saved.data) as string[]:defaultPublicFields}
export function projectPublicEntry(data:any,fields:string[]){data=withPersonTags(data);const out:any={id:data.id};for(const key of fields)if(!['images','documents','audio'].includes(key)&&typeof data[key]==='string')out[key]=data[key];if(fields.includes('description')&&validDescriptionLinks(data.descriptionLinks,data.description||''))out.descriptionLinks=data.descriptionLinks;out.files=(data.files||[]).filter((f:any)=>fields.includes(f.type.startsWith('audio/')?'audio':f.type.startsWith('image/')?'images':'documents')).map((f:any)=>({key:f.key,name:f.name,type:f.type}));return out}
export async function publicEntries(){await requireInstalled();const fields=await publicFields(),rows=await archiveDb().prepare(approvedEntriesQuery).all();return {fields,entries:rows.results.map((r:any)=>projectPublicEntry(JSON.parse(r.data),fields))}}
export async function publicFileAllowed(key:string){const data=await publicEntries();return data.entries.some(e=>e.files.some((f:any)=>f.key===key))}

export async function publicTimeline(){await requireInstalled();
 const fields=await publicFields();const rows=await archiveDb().prepare("SELECT e.id,v.data,r.reference FROM entries e JOIN entry_versions v ON v.version=e.approved_version AND v.entry_id=e.id LEFT JOIN entry_references r ON r.entry_id=e.id WHERE e.deleted=0 AND e.timeline_visible=1 AND e.publication_status='approved' AND e.approved_by IS NOT NULL AND e.approved_at IS NOT NULL AND v.action<>'Gelöscht'").all();
 const entries=await Promise.all(rows.results.map(async(row:any)=>{const data=JSON.parse(row.data),reference=row.reference||await ensureReference(row.id);return {data,reference}}));
 entries.sort((a,b)=>timelineYear(a.data)-timelineYear(b.data));
 return {entries:entries.map(({data,reference})=>({id:data.id,reference,title:fields.includes('title')?data.title||'Beitrag':'Beitrag',excerpt:publicTimelineExcerpt(data,fields),date:publicTimelineDate(data,fields),media:publicTimelineMedia(data,fields)}))};
}
export function publicTimelineExcerpt(data:any,fields:string[]){if(!fields.includes('description')||typeof data.description!=='string')return '';const text=data.description.replace(/\s+/gu,' ').trim(),characters=Array.from(text);return characters.length>200?characters.slice(0,200).join('').trimEnd()+'...':text}
function timelineYear(data:any){const year=data.start||data.end;return typeof year==='string'&&/^-?\d{1,4}$/.test(year)?Number(year):Number.POSITIVE_INFINITY}
export function publicTimelineDate(data:any,fields:string[]){return fields.includes('period')&&data.period||[fields.includes('start')&&data.start,fields.includes('end')&&data.end].filter(Boolean).join('–')||'Undatiert'}

export function publicTimelineMedia(data:any,fields:string[]){const files=projectPublicEntry(data,fields).files;return {images:files.some((f:any)=>f.type.startsWith('image/')),audio:files.some((f:any)=>f.type.startsWith('audio/')),documents:files.some((f:any)=>!f.type.startsWith('image/')&&!f.type.startsWith('audio/'))}}
