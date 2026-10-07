import {env} from 'cloudflare:workers';
import {authenticatedIdentity} from '@/lib/archive-identity';
import {archiveDb} from '@/lib/archive-db';
import {canArchive,type ArchiveAction,type ArchiveRole} from '@/lib/archive-permissions';
export type PreviewRole=ArchiveRole|'public';
// Temporary preview switch: only the verified, current Site owner's identity may use it.
// Replace this bootstrap with the target server's explicit admin membership during migration.
function bootstrapAdminEmail(){return String((env as unknown as {ARCHIVE_BOOTSTRAP_ADMIN_EMAIL?:string}).ARCHIVE_BOOTSTRAP_ADMIN_EMAIL||'').trim().toLowerCase();}
export async function archiveAccess(req:Request){
 const identity=authenticatedIdentity(req);if(!identity)return null;
 const isBootstrapAdmin=identity.email.toLowerCase()===bootstrapAdminEmail();
 const stored=await archiveDb().prepare('SELECT role FROM archive_users WHERE identity_provider=? AND identity_subject=?').bind(identity.provider,identity.subject).first<{role:ArchiveRole}>();
 const actualRole:ArchiveRole=isBootstrapAdmin?'admin':stored?.role||'user';
 const canPreview=actualRole==='admin';
 const requested=req.headers.get('x-archive-preview-role');
 if(requested&&!canPreview)throw new AccessError('Die Rollen-Vorschau ist nur für den Eigentümer verfügbar.',403);
 if(requested&&!['admin','manager','user','public'].includes(requested))throw new AccessError('Ungültige Rollen-Vorschau.',400);
 return {identity,canPreview,actualRole,role:(canPreview&&requested?requested:actualRole) as PreviewRole};
}
export class AccessError extends Error {constructor(message:string,public status=403){super(message)}}
export async function requireArchiveAction(req:Request,action?:ArchiveAction){const access=await archiveAccess(req);if(!access)throw new AccessError('Bitte die Website direkt öffnen und anmelden.',401);if(access.role==='public'||action&&!canArchive(access.role,action))throw new AccessError('Diese Aktion ist in der gewählten Rolle nicht erlaubt.',403);return access}
export function accessResponse(e:unknown){return e instanceof AccessError?Response.json({error:e.message},{status:e.status}):null}
