'use client';
import {useLegalLinks} from './legal-links';
export function ArchiveFooter({association=''}:{association?:string}){
 const links=useLegalLinks();return <footer className="archive-footer"><span>{association}</span>{(links.imprint||links.privacy)&&<nav className="legal-footer" aria-label="Rechtliche Informationen">{links.imprint&&<a href="/impressum">Impressum</a>}{links.privacy&&<a href="/datenschutz">Datenschutz</a>}</nav>}</footer>;
}
