import {Fragment,type ReactNode} from 'react';
import {markdownTree,markdownCharacterSpans,safeMarkdownUrl} from '@/lib/archive-markdown';
import {validDescriptionLinks} from '@/lib/archive-description-links';
import {validPersonTags} from '@/lib/archive-people';
import {entryReferencePath} from '@/lib/archive-reference-path';
export function MarkdownText({text,links,tags,onPersonClick}:{text:string,links?:unknown,tags?:unknown,onPersonClick?:(id:string)=>void}){
 const tree=markdownTree(text);
 const ls=validDescriptionLinks(links,text)?links:[],ts=validPersonTags(tags,text)?tags.filter(t=>t.start!==null):[];
 function render(n:any,key:string,inLink=false):ReactNode{const children=()=>n.children?.map((c:any,i:number)=>render(c,key+'.'+i,inLink));
 switch(n.type){
 case 'root':return <Fragment key={key}>{children()}</Fragment>;
 case 'text':{const start=n.position?.start.offset??0,end=n.position?.end.offset??start;const spans=markdownCharacterSpans(text.slice(start,end),start);if(spans.map(s=>s.value).join('')!==n.value)return n.value;const groups:{content:string,link:any,tag:any}[]=[];for(const s of spans){const link=inLink?null:ls.find(l=>l.start<=s.start&&l.end>=s.end),tag=ts.find(t=>t.start!<=s.start&&t.end!>=s.end),last=groups.at(-1);if(last&&last.link===link&&last.tag===tag)last.content+=s.value;else groups.push({content:s.value,link,tag})}return <Fragment key={key}>{groups.map((g,i)=>{let c:ReactNode=g.content;if(g.tag)c=<span className="person-tag" title={g.tag.name}>{c}</span>;if(g.link)return <a key={i} href={entryReferencePath(g.link.reference)} target="_blank" rel="noopener noreferrer">{c}</a>;if(g.tag&&onPersonClick&&!inLink)return <button key={i} type="button" className="person-tag-button" onClick={()=>onPersonClick(g.tag.entityId)}>{c}</button>;return <Fragment key={i}>{c}</Fragment>})}</Fragment>}
 case 'paragraph':return <p key={key}>{children()}</p>;
 case 'heading':{const Tag=('h'+Math.min(6,n.depth+1)) as 'h2';return <Tag key={key}>{children()}</Tag>}
 case 'strong':return <strong key={key}>{children()}</strong>;
 case 'emphasis':return <em key={key}>{children()}</em>;
 case 'delete':return <del key={key}>{children()}</del>;
 case 'blockquote':return <blockquote key={key}>{children()}</blockquote>;
 case 'list':return n.ordered?<ol key={key} start={n.start||1}>{children()}</ol>:<ul key={key}>{children()}</ul>;
 case 'listItem':return <li key={key}>{typeof n.checked==='boolean'&&<input type="checkbox" checked={n.checked} disabled aria-label="Aufgabenstatus"/>}{children()}</li>;
 case 'inlineCode':return <code key={key}>{n.value}</code>;
 case 'code':return <pre key={key}><code>{n.value}</code></pre>;
 case 'break':return <br key={key}/>;
 case 'thematicBreak':return <hr key={key}/>;
 case 'link':{const href=safeMarkdownUrl(n.url);return href?<a key={key} href={href} title={n.title||undefined} target="_blank" rel="noopener noreferrer">{n.children.map((c:any,i:number)=>render(c,key+'.'+i,true))}</a>:<Fragment key={key}>{children()}</Fragment>}
 case 'linkReference':{const d=(tree as any).children.find((c:any)=>c.type==='definition'&&c.identifier===n.identifier),href=d&&safeMarkdownUrl(d.url);return href?<a key={key} href={href} target="_blank" rel="noopener noreferrer">{n.children.map((c:any,i:number)=>render(c,key+'.'+i,true))}</a>:<Fragment key={key}>{children()}</Fragment>}
 case 'table':return <div className="markdown-table" key={key}><table><thead><tr>{n.children[0].children.map((c:any,i:number)=><th key={i}>{c.children.map((x:any,j:number)=>render(x,key+'.h'+i+j))}</th>)}</tr></thead><tbody>{n.children.slice(1).map((row:any,i:number)=><tr key={i}>{row.children.map((c:any,j:number)=><td key={j}>{c.children.map((x:any,k:number)=>render(x,key+'.r'+i+j+k))}</td>)}</tr>)}</tbody></table></div>;
 case 'html':return <span key={key}>{n.value}</span>;
 case 'image':case 'imageReference':return <span key={key}>{n.alt}</span>;
 default:return null;
 }}return <div className="markdown-content">{render(tree,'root')}</div>
}
