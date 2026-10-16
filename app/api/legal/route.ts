import {randomUUID} from 'node:crypto';
import {archiveDb} from '@/lib/archive-db';
import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
import {sameOrigin} from '@/lib/archive-comments';
import {emptyLegalSettings,validateLegalData,legalMissing,legalPublication,type LegalSettings} from '@/lib/archive-legal';
import {nearbyPrivacyNotice} from '@/lib/archive-nearby-privacy';
const headers={'Cache-Control':'no-store'};
async function saved(){const row=await archiveDb().prepare("SELECT data FROM archive_settings WHERE key='legal_settings'").first<{data:string}>();return {row,value:row?JSON.parse(row.data) as LegalSettings:emptyLegalSettings()}}
export async function GET(req:Request){try{if(new URL(req.url).searchParams.get('public')==='1'){const {value}=await saved();return Response.json({imprint:value.published.imprint?{text:value.published.imprint.text,publishedAt:value.published.imprint.publishedAt}:null,privacy:value.published.privacy?{nearbyNotice:nearbyPrivacyNotice,text:value.published.privacy.text,publishedAt:value.published.privacy.publishedAt,...(value.published.privacy.privacy?{privacy:value.published.privacy.privacy}:{})}:null},{headers})}await requireArchiveAction(req,'managePortalSettings');const {value}=await saved();return Response.json(value,{headers})}catch(e){return accessResponse(e)||Response.json({error:'Rechtliche Angaben konnten nicht geladen werden.'},{status:503,headers})}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return Response.json({error:'Bitte die Website direkt öffnen.'},{status:403});
 const access=await requireArchiveAction(req,'managePortalSettings');const text=await req.text();if(text.length>100000)return Response.json({error:'Anfrage zu groß.'},{status:413});const input=JSON.parse(text);
 if(!['save','publish-imprint','publish-privacy','withdraw-imprint','withdraw-privacy'].includes(input.action))return Response.json({error:'Unbekannte Aktion.'},{status:400});
 const {row,value}=await saved();if(input.expectedRevision!==value.revision)return Response.json({error:'Die Angaben wurden inzwischen geändert. Bitte neu laden.'},{status:409});
 const withdrawing=input.action.startsWith('withdraw-');let draft;try{draft=withdrawing?value.draft:validateLegalData(input.draft)}catch(e){return Response.json({error:(e as Error).message},{status:400})}
 const next:LegalSettings={revision:randomUUID(),draft,published:{...value.published}};
 if(withdrawing){if(input.confirmation!=='VERÖFFENTLICHUNG ZURÜCKNEHMEN')return Response.json({error:'Rücknahme bitte ausdrücklich bestätigen.'},{status:400});next.published[input.action==='withdraw-imprint'?'imprint':'privacy']=null}else if(input.action!=='save'){const target=input.action==='publish-imprint'?'imprint':'privacy';if(input.confirmation!=='RECHTLICHE ANGABEN VERÖFFENTLICHEN')return Response.json({error:'Veröffentlichung bitte ausdrücklich bestätigen.'},{status:400});const missing=legalMissing(draft,target);if(missing.length)return Response.json({error:'Noch auszufüllen: '+missing.join(', ')},{status:400});next.published[target]=legalPublication(draft,target,new Date().toISOString())}
 const serialized=JSON.stringify(next),result=row?await archiveDb().prepare("UPDATE archive_settings SET data=?,updated=?,updated_by=? WHERE key='legal_settings' AND data=?").bind(serialized,new Date().toISOString(),access.identity.subject,row.data).run():await archiveDb().prepare("INSERT OR IGNORE INTO archive_settings(key,data,updated,updated_by) VALUES('legal_settings',?,?,?)").bind(serialized,new Date().toISOString(),access.identity.subject).run();
 if(!result.meta.changes)return Response.json({error:'Die Angaben wurden inzwischen geändert. Bitte neu laden.'},{status:409});return Response.json(next,{headers});
 }catch(e){return accessResponse(e)||Response.json({error:'Rechtliche Angaben konnten nicht gespeichert werden.'},{status:503,headers})}}
