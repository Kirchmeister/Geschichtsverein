import {authSource} from '@/server/auth-source.mjs';
import {guestFieldLabels} from '@/lib/archive-public-fields';
import {authService} from '@/server/auth-service.mjs';
import {env} from '@/lib/runtime-env';
export function service(managementRole?:string,req?:Request):any{const e=env as any;const row=e.DB.database.prepare("SELECT data FROM archive_settings WHERE key='system_settings'").get();return authService(e.DB.database,{origin:e.ARCHIVE_ORIGIN,sessionKey:e.ARCHIVE_SESSION_KEY,guestFieldLabels,managementRole,source:req?authSource(req,e.ARCHIVE_AUTH_TRANSPORT_KEY):'unknown',inviteDays:row?JSON.parse(row.data).invitations?.expiryDays:7})}
