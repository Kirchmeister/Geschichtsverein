import {archiveDb} from '@/lib/archive-db';
import {mapSettings,mapValue} from '@/lib/archive-map';
import {archiveAccess,accessResponse} from '@/lib/archive-access';
import {sameOrigin} from '@/lib/archive-comments';
import {installation} from '@/lib/archive-installation';
import {photonPlaces} from '@/lib/archive-map-config.mjs';
import {env} from '@/lib/runtime-env';
const headers={'Cache-Control':'no-store'};
async function admin(req:Request){const access=await archiveAccess(req);return access?.actualRole==='admin'&&access.role==='admin'?access:null}
export async function GET(req:Request){try{if(new URL(req.url).searchParams.has('settings')&&!await admin(req))return Response.json({error:'Nur Administratoren dürfen die Karte einrichten.'},{status:403});const {value}=await mapSettings();return Response.json(new URL(req.url).searchParams.has('settings')?value:value.enabled?{enabled:true,provider:value.provider,place:value.place,lat:value.lat,lon:value.lon,radius:value.radius,title:value.title}:{enabled:false},{headers})}catch{return Response.json({error:'Die Kartenkonfiguration konnte nicht geladen werden.'},{status:503,headers})}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return Response.json({error:'Bitte die Website direkt öffnen.'},{status:403});const access=await admin(req);if(!access)return Response.json({error:'Nur Administratoren dürfen die Karte einrichten.'},{status:403});const input=await req.json() as any;
 if(input.action==='search'){
  if(typeof input.query!=='string'||input.query.trim().length<2||input.query.length>150)return Response.json({error:'Bitte einen Ortsnamen mit 2 bis 150 Zeichen eingeben.'},{status:400});
  const url=new URL((env as any).ARCHIVE_GEOCODER_URL||'https://photon.komoot.io/api/');if(url.protocol!=='https:'||url.username||url.password)throw Error('Ungültiger Ortssuchdienst.');url.searchParams.set('q',input.query.trim());url.searchParams.set('lang','de');url.searchParams.set('limit','8');
  let result;try{const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Geschichtsarchiv/0.29 place-search'},signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)throw Error('unavailable');result=photonPlaces(await r.json())}catch{return Response.json({error:'Die Ortssuche ist gerade nicht erreichbar. Bitte später erneut suchen oder den Mittelpunkt über Koordinaten angeben.'},{status:503,headers})}
  return Response.json({places:result,attribution:'Ortssuche: Photon · Daten: OpenStreetMap-Mitwirkende'},{headers});
 }
 if(input.action!=='save')return Response.json({error:'Ungültige Kartenaktion.'},{status:400});if(!(await installation()).completed)return Response.json({error:'Bitte die Karte zusammen mit der Ersteinrichtung speichern.'},{status:409});
 const {row,value}=await mapSettings();if(input.expectedRevision!==value.revision)return Response.json({error:'Die Karte wurde inzwischen geändert. Bitte neu laden.'},{status:409});const next=mapValue(input.config),data=JSON.stringify(next),now=new Date().toISOString();
 const result=row?await archiveDb().prepare("UPDATE archive_settings SET data=?,updated=?,updated_by=? WHERE key='map' AND data=?").bind(data,now,access.identity.subject,row.data).run():await archiveDb().prepare("INSERT OR IGNORE INTO archive_settings(key,data,updated,updated_by) VALUES('map',?,?,?)").bind(data,now,access.identity.subject).run();if(!result.meta.changes)return Response.json({error:'Die Karte wurde inzwischen geändert. Bitte neu laden.'},{status:409});return Response.json(next,{headers});
 }catch(e:any){return accessResponse(e)||Response.json({error:e.message||'Die Karte konnte nicht gespeichert werden.'},{status:400,headers})}}
