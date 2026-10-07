/** Server-side policy. Admins and managers approve publication. */
export type ArchiveRole='admin'|'manager'|'user';
export type ArchiveAction='create'|'edit'|'invite'|'approve'|'delete'|'manageRoles'|'moderateComments'|'qrSingle'|'qrBulk'|'manageTimeline'|'managePublicFields'|'readStatistics'|'manageSettings';
const actions:Record<ArchiveRole,ReadonlyArray<ArchiveAction>>={admin:['manageSettings','readStatistics','managePublicFields','create','edit','invite','approve','delete','manageRoles','moderateComments','qrSingle','qrBulk','manageTimeline'],manager:['managePublicFields','readStatistics','qrBulk','create','edit','invite','approve','moderateComments','qrSingle','manageTimeline'],user:['create','edit','qrBulk']};
export function canArchive(role:ArchiveRole|null,action:ArchiveAction){return role!==null&&(actions[role]?.includes(action)??false)}
/** A public reader must load the approved snapshot, never entries.data. No public endpoint is enabled yet. */
export const approvedEntriesQuery="SELECT v.data FROM entries e JOIN entry_versions v ON v.version=e.approved_version AND v.entry_id=e.id WHERE e.deleted=0 AND e.publication_status='approved' AND e.approved_by IS NOT NULL AND e.approved_at IS NOT NULL AND v.action <> 'Gelöscht'";
