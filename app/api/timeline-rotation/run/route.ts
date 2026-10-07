import {env} from '@/lib/runtime-env';
import {runDueRotation,rotationPlan} from '@/lib/archive-timeline-rotation';
import {authenticatedIdentity} from '@/lib/archive-identity';
import {requireArchiveAction,accessResponse} from '@/lib/archive-access';
// Owner-private Sites dispatch authenticates unattended calls with its service credential.
// This fixed operation accepts no filters, IDs or timestamps from the caller: it only runs a due saved plan.
async function authorize(req:Request){const e=env as any;if(e.ARCHIVE_HOSTING_RUNTIME==='linux'&&(!/^[a-f0-9]{64}$/.test(e.ARCHIVE_RUNNER_KEY||'')||req.headers.get('authorization')!=='Bearer '+e.ARCHIVE_RUNNER_KEY))return Response.json({error:'Servicezugang erforderlich.'},{status:403});if(req.headers.has('origin'))return Response.json({error:'Nur für die Hintergrundausführung.'},{status:403});if(authenticatedIdentity(req))await requireArchiveAction(req,'manageTimeline');return null}
export async function GET(req:Request){try{const denied=await authorize(req);if(denied)return denied;const p=await rotationPlan();return Response.json({enabled:p.enabled,nextRun:p.next_run,lastRun:p.last_run,lastResult:p.last_result},{headers:{'Cache-Control':'no-store'}})}catch(e){return accessResponse(e)||Response.json({error:'Status nicht verfügbar.'},{status:503})}}
export async function POST(req:Request){try{const denied=await authorize(req);if(denied)return denied;return Response.json(await runDueRotation(),{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return accessResponse(e)||Response.json({error:'Rotation nicht abgeschlossen; beim nächsten Durchlauf erneut versuchen.'},{status:503})}}
