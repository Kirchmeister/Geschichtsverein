import type {MetadataRoute} from 'next';
import {installation} from '@/lib/archive-installation';
import {archiveTitle} from '@/lib/archive-title';
export const dynamic='force-dynamic';
export default async function manifest():Promise<MetadataRoute.Manifest>{const name=archiveTitle(await installation());return {id:'/',name,short_name:name,start_url:'/',scope:'/',display:'standalone',background_color:'#f7f8f4',theme_color:'#34563c',icons:[{src:'/archive-icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/archive-icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]}}
