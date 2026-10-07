import {env} from '@/lib/runtime-env';
/** Linux runs behind a port mapping/proxy. Trust the operator's configured origin,
 * never an incoming Host or forwarded header, for CSRF and generated links. */
export function archiveRequestOrigin(req:Request){const e=env as unknown as {ARCHIVE_HOSTING_RUNTIME?:string,ARCHIVE_ORIGIN?:string};if(e.ARCHIVE_HOSTING_RUNTIME==='linux'){if(!e.ARCHIVE_ORIGIN)throw Error('Anmeldeadresse ist nicht konfiguriert.');return new URL(e.ARCHIVE_ORIGIN).origin}return new URL(req.url).origin}
