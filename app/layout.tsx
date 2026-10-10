export const dynamic='force-dynamic';
import type {Metadata,Viewport} from "next";import "./globals.css";
import {DesignSync} from '@/components/archive/design';
import {archiveDesign} from '@/lib/archive-design';
import {installation} from '@/lib/archive-installation';
import {archiveTitle} from '@/lib/archive-title';
import {InstallationGate} from '@/components/archive/installation';
export const viewport:Viewport={width:'device-width',initialScale:1};
export async function generateMetadata():Promise<Metadata>{const title=archiveTitle(await installation());return {manifest:"/manifest.webmanifest",title,applicationName:title,appleWebApp:{capable:true,title,statusBarStyle:'default'},description:"Digitales Vereinsarchiv für Geschichte, Quellen und Erinnerungen.",robots:{index:false,follow:false},icons:{icon:"/archive-icon-192.png",apple:"/archive-icon-180.png"}};}

export default async function Layout({children}:{children:React.ReactNode}){const {theme}=await archiveDesign();return <html lang="de" data-archive-theme={theme}><body><DesignSync/><InstallationGate>{children}</InstallationGate></body></html>}