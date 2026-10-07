import type {Metadata} from "next";import "./globals.css";
import {InstallationGate} from '@/components/archive/installation';
export const metadata:Metadata={title:"Digitales Geschichtsarchiv",description:"Digitales Vereinsarchiv für Geschichte, Quellen und Erinnerungen.",robots:{index:false,follow:false},icons:{icon:"/favicon.svg"}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="de"><body><InstallationGate>{children}</InstallationGate></body></html>}