export const dynamic='force-dynamic';
import type {Metadata} from "next";import "./globals.css";
import {DesignSync} from '@/components/archive/design';
import {archiveDesign} from '@/lib/archive-design';
import {InstallationGate} from '@/components/archive/installation';
export const metadata:Metadata={title:"Digitales Geschichtsarchiv",description:"Digitales Vereinsarchiv für Geschichte, Quellen und Erinnerungen.",robots:{index:false,follow:false},icons:{icon:"/favicon.svg"}};
export default async function Layout({children}:{children:React.ReactNode}){const {theme}=await archiveDesign();return <html lang="de" data-archive-theme={theme}><body><DesignSync/><InstallationGate>{children}</InstallationGate></body></html>}