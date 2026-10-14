'use client';
import {ArchiveFooter} from './archive-footer';
import {useBranding} from './installation';
import {useEffect,useState} from 'react';
import {archiveRequest} from '@/lib/archive-api';
import type {LegalPublication} from '@/lib/archive-legal';
import {introLinkParts} from '@/lib/archive-public-intro';
export function LegalPublicPage({target}:{target:'imprint'|'privacy'}){
 const branding=useBranding();
 const [publication,setPublication]=useState<LegalPublication|null>(null),[loaded,setLoaded]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let alive=true;archiveRequest('/api/legal?public=1').then(data=>{if(alive){setPublication(data[target]);setLoaded(true)}}).catch(()=>{if(alive)setError('Die rechtlichen Angaben konnten nicht geladen werden. Bitte später erneut versuchen.')});return()=>{alive=false}},[target]);
 return <main className="legal-public-page"><a href="/">Zur Startseite</a><h1>{target==='imprint'?'Impressum':'Datenschutz'}</h1>{error?<p role="alert">{error}</p>:!loaded?<p role="status">Angaben werden geladen …</p>:!publication?<p>Der Betreiber hat für diese Seite noch keine Angaben veröffentlicht.</p>:<><div className="legal-public-text">{introLinkParts(publication.text).map((part,index)=>part.href?<a key={index} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>:part.text)}</div><p className="legal-public-date">Veröffentlicht: {new Date(publication.publishedAt).toLocaleDateString('de-DE')}</p></>}<ArchiveFooter association={branding.association}/></main>;
}
