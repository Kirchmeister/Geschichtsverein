import {publicTimeline} from '@/lib/archive-public';
export async function GET(){try{return Response.json(await publicTimeline(),{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return Response.json({error:'Das öffentliche Profil ist gerade nicht erreichbar.'},{status:503})}}
