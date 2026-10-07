import {NextResponse,type NextRequest} from 'next/server';
import {env} from '@/lib/runtime-env';
import {readFile} from 'node:fs/promises';
export async function proxy(req:NextRequest){if((env as any).ARCHIVE_HOSTING_RUNTIME==='linux'&&!['/api/health','/api/updates'].includes(req.nextUrl.pathname)){try{if((await readFile((env as any).ARCHIVE_MAINTENANCE_FILE||'/config/maintenance','utf8')).trim()==='1')return new NextResponse('Das Archiv wird gerade aktualisiert. Bitte versuchen Sie es in wenigen Minuten erneut.',{status:503,headers:{'Retry-After':'30','Cache-Control':'no-store'}})}catch(e:any){if(e.code!=='ENOENT')return new NextResponse('Wartungsstatus konnte nicht geprüft werden.',{status:503})}}return NextResponse.next()}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)']};
