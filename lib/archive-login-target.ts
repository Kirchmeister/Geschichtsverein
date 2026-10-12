import {archiveHref,readArchiveQuery} from './archive-query';
export function archiveLoginTarget(target:string|null){
 if(!target||target.length>4000||/[\u0000-\u001f\\]/u.test(target))return '/';
 if(/^\/\?ansicht=nachrichten(?:&unterhaltung=[a-f0-9-]{36})?$/.test(target))return target;
 if(!/^\/archiv(?:\?|$)/.test(target))return '/';
 const url=new URL(target,'https://archive.invalid');if(url.origin!=='https://archive.invalid'||url.pathname!=='/archiv')return '/';
 const href=archiveHref(readArchiveQuery(url.search)),id=url.searchParams.get('eintrag');return href+(id&&/^[a-f0-9-]{36}$/i.test(id)?'&eintrag='+id:'');
}
