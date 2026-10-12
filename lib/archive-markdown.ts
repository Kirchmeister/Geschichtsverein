import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import {decodeNamedCharacterReference} from 'decode-named-character-reference';
export const markdownFields=['description','sources','interpretation','uncertainty','rights'] as const;
export function fieldFormats(value:any){const out:Record<string,'markdown'>={};if(value!==undefined&&(!value||typeof value!=='object'||Array.isArray(value)))throw Error('Ungültige Textformate.');for(const key of Object.keys(value||{})){if(!(markdownFields as readonly string[]).includes(key)||value[key]!=='markdown')throw Error('Ungültiges Textformat.');out[key]='markdown'}return out}
export const markdownTree=(text:string)=>unified().use(remarkParse).use(remarkGfm).parse(text);
export function markdownPlain(text:string){const walk=(n:any):string=>n.type==='html'?'':typeof n.value==='string'?n.value:(n.children||[]).map(walk).join(['root','list','table','tableRow'].includes(n.type)?' ':'');return walk(markdownTree(text))}
export function safeMarkdownUrl(value:string){try{if(/[\u0000-\u0020\u007f]/.test(value)||(value.startsWith('//')||value.includes('\\\\')))return null;const u=new URL(value,'https://archive.invalid');return ['https:','http:','mailto:'].includes(u.protocol)?value:null}catch{return null}}
// Map displayed characters back to their original source spans, including escapes/entities.
export function markdownCharacterSpans(raw:string,offset:number){const spans:{value:string,start:number,end:number}[]=[];const pattern=/\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~])|&(#x[\da-f]+|#\d+|[a-z][\da-z]+);|\r\n|[\s\S]/gi;for(const m of raw.matchAll(pattern)){let value=m[0];if(m[1])value=m[1];else if(m[2]){if(m[2][0]==='#'){const n=parseInt(m[2].slice(m[2][1]?.toLowerCase()==='x'?2:1),m[2][1]?.toLowerCase()==='x'?16:10);value=n>0&&n<=0x10ffff?String.fromCodePoint(n):'�'}else value=decodeNamedCharacterReference(m[2])||value}else if(value==='\r\n')value='\n';for(const c of value)spans.push({value:c,start:offset+m.index!,end:offset+m.index!+m[0].length})}return spans}
