import type {LegalPublication} from '@/lib/archive-legal';
import {introLinkParts} from '@/lib/archive-public-intro';
import {MarkdownText} from './markdown-text';
function Plain({text}:{text:string}){return <div className="legal-public-text">{introLinkParts(text).map((part,index)=>part.href?<a key={index} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>:part.text)}</div>}
export function LegalContent({publication}:{publication:LegalPublication}){const p=publication.privacy;return <>{p?<><Plain text={p.before}/>{p.markdown?<MarkdownText text={p.body}/>:<Plain text={p.body}/>}<Plain text={p.after}/></>:<Plain text={publication.text}/>} {publication.nearbyNotice&&<section id="umgebungssuche"><h2>Optionale Umgebungssuche auf der Karte</h2><Plain text={publication.nearbyNotice}/></section>}{publication.contactNotice&&<section id="kontaktformular"><h2>Kontaktformular und Spamschutz</h2><Plain text={publication.contactNotice}/></section>}</>}
