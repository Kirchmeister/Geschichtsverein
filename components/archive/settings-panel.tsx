 'use client';
import {ChevronDown} from 'lucide-react';
import type {ReactNode} from 'react';
export function SettingsPanel({title,note,children,className='',id}:{title:string,note?:ReactNode,children:ReactNode,className?:string,id?:string}){
 return <details id={id} className={'settings-panel '+className}><summary><h2>{title}</h2>{note&&<span className="settings-panel-note">{note}</span>}<ChevronDown aria-hidden="true"/></summary><div className="settings-panel-content">{children}</div></details>
}
