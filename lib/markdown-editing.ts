import {markdownTree} from './archive-markdown';
export type TextEdit={start:number,end:number,text:string};
export type MarkdownAction='bold'|'italic'|'heading'|'list'|'quote'|'link'|'table';
export type TextRange={start:number,end:number};
function bounds(n:any){return {start:n.position?.start.offset??0,end:n.position?.end.offset??0}}
function enclosing(tree:any,type:string,range:TextRange){const found:any[]=[];function walk(n:any){const p=bounds(n);if(n.type===type&&p.start<=range.start&&p.end>=range.end&&(range.start!==range.end||range.start<p.end))found.push(n);for(const child of n.children||[])walk(child)}walk(tree);return found.sort((a,b)=>(bounds(a).end-bounds(a).start)-(bounds(b).end-bounds(b).start))[0]}
function inlineNodes(tree:any,type:string,value:string,range:TextRange){const single=enclosing(tree,type,range);if(single)return [single];if(range.start===range.end)return [];const found:any[]=[];function walk(n:any){const p=bounds(n);if(n.type===type&&p.start<range.end&&p.end>range.start)found.push(n);else for(const child of n.children||[])walk(child)}walk(tree);found.sort((a,b)=>bounds(a).start-bounds(b).start);let at=range.start;for(const n of found){const p=bounds(n);if(p.start>at&&value.slice(at,p.start).trim())return [];at=Math.max(at,p.end)}return found.length&&(!value.slice(at,range.end).trim()||at>=range.end)?found:[]}
function lines(value:string,range:TextRange){const start=range.start===0?0:value.lastIndexOf('\n',range.start-1)+1;let end=range.end;if(end>range.start&&value[end-1]==='\n')end--;const stop=value.indexOf('\n',end);let at=start;return value.slice(start,stop<0?value.length:stop).split('\n').map(text=>{const line={text,start:at};at+=text.length+1;return line})}
const prefixes={heading:/^( {0,3})(#{1,6}(?:[\t ]+|$))/,list:/^(\s*)((?:[-+*]|\d+[.)])[\t ]+)/,quote:/^( {0,3})(>[\t ]?)/};
export function markdownFormatState(value:string,range:TextRange,tree:any=markdownTree(value)){
 const selected=lines(value,range).filter(l=>l.text.trim());return {bold:!!inlineNodes(tree,'strong',value,range).length,italic:!!inlineNodes(tree,'emphasis',value,range).length,heading:!!selected.length&&selected.every(l=>prefixes.heading.test(l.text)),list:!!selected.length&&selected.every(l=>prefixes.list.test(l.text)),quote:!!selected.length&&selected.every(l=>prefixes.quote.test(l.text)),link:!!inlineNodes(tree,'link',value,range).length,table:!!enclosing(tree,'table',range)};
}
export function mapTextOffset(offset:number,edits:TextEdit[],side:'start'|'end'){
 let delta=0;for(const e of edits){if(e.start===e.end){if(e.start<offset||e.start===offset&&side==='start')delta+=e.text.length;continue}if(offset>=e.end){delta+=e.text.length-(e.end-e.start);continue}if(offset>e.start||offset===e.start&&side==='start')return e.start+delta+(side==='start'?e.text.length:0);if(e.start>=offset)break}return offset+delta;
}
export function mapFormattingSpan<T extends {start:number|null,end:number|null}>(span:T,edits:TextEdit[]):T{return span.start===null||span.end===null?span:{...span,start:mapTextOffset(span.start,edits,'start'),end:mapTextOffset(span.end,edits,'end')}}
function apply(value:string,edits:TextEdit[],range:TextRange){edits.sort((a,b)=>a.start-b.start||a.end-b.end);let text='',at=0;for(const e of edits){if(e.start<at)throw Error('Überlappende Textänderung.');text+=value.slice(at,e.start)+e.text;at=e.end}text+=value.slice(at);const start=mapTextOffset(range.start,edits,'start'),end=mapTextOffset(range.end,edits,'end');return {text,edits,selection:{start,end:Math.max(start,end)}}}
export function toggleMarkdown(value:string,range:TextRange,action:MarkdownAction){
 const tree=markdownTree(value),state=markdownFormatState(value,range,tree),edits:TextEdit[]=[];
 if(['heading','list','quote'].includes(action)){
  const kind=action as 'heading'|'list'|'quote',prefix=kind==='heading'?'## ':kind==='list'?'- ':'> ';
  for(const line of lines(value,range)){if(!line.text.trim()&&range.start!==range.end)continue;const match=line.text.match(prefixes[kind]);if(state[kind]&&match){const a=line.start+match[1].length;edits.push({start:a,end:a+match[2].length,text:''});if(kind==='heading'){const closing=line.text.match(/[\t ]+#+[\t ]*$/);if(closing&&closing.index!>=match[0].length)edits.push({start:line.start+closing.index!,end:line.start+line.text.length,text:''})}}else if(!match){const indent=line.text.match(/^ */)?.[0].length||0;edits.push({start:line.start+indent,end:line.start+indent,text:prefix})}}
  return apply(value,edits,range);
 }
 const type=action==='bold'?'strong':action==='italic'?'emphasis':action==='link'?'link':'table';
 if(action==='bold'||action==='italic'){const nodes=inlineNodes(tree,type,value,range);if(nodes.length){const size=action==='bold'?2:1;for(const node of nodes){const p=bounds(node);edits.push({start:p.start,end:p.start+size,text:''},{start:p.end-size,end:p.end,text:''})}return apply(value,edits,range)}}
 if(action==='link'){const nodes=inlineNodes(tree,'link',value,range);if(nodes.length){for(const node of nodes){const p=bounds(node),labelEnd=node.children?.at(-1)?.position?.end.offset??p.start+1;edits.push({start:p.start,end:p.start+1,text:''},{start:labelEnd,end:p.end,text:''})}return apply(value,edits,range)}}
 const node=enclosing(tree,type,range);
 if(node){const p=bounds(node);
  if(action==='bold'||action==='italic'){const size=action==='bold'?2:1;edits.push({start:p.start,end:p.start+size,text:''},{start:p.end-size,end:p.end,text:''})}
  else if(action==='link'){const labelEnd=node.children?.at(-1)?.position?.end.offset??p.start+1;edits.push({start:p.start,end:p.start+1,text:''},{start:labelEnd,end:p.end,text:''})}
  else{
   // Preserve cell source text (including inline Markdown); remove only table structure.
   const cells:{start:number,end:number,separator:string}[]=[];for(const [rowIndex,row] of node.children.entries())for(const [cellIndex,cell] of row.children.entries()){const children=cell.children||[],start=children[0]?.position?.start.offset??bounds(cell).end,end=children.at(-1)?.position?.end.offset??start;cells.push({start,end,separator:cellIndex?'\t':rowIndex?'\n':''})}
   let at=p.start;for(const cell of cells){edits.push({start:at,end:cell.start,text:cell.separator});for(const escaped of value.slice(cell.start,cell.end).matchAll(/\\\|/g)){const slash=cell.start+escaped.index!;edits.push({start:slash,end:slash+1,text:''})}at=cell.end}edits.push({start:at,end:p.end,text:''});
  }
  return apply(value,edits,range);
 }
 let {start,end}=range;
 if(start===end){const word=[...value.matchAll(/[\p{L}\p{N}_-]+/gu)].find(m=>m.index!<=start&&m.index!+m[0].length>=start);if(word){start=word.index!;end=start+word[0].length}}
 const selected=value.slice(start,end)||'Text';
 if(action==='table'){
  const before=(start&&value[start-1]!=='\n'?'\n':'')+'| Spalte 1 | Spalte 2 |\n| --- | --- |\n| ',after=' | Wert |'+(value[end]==='\n'?'':'\n');
  edits.push({start,end:start,text:before});
  for(let i=start;i<end;i++){if(value[i]==='\n')edits.push({start:i,end:i+1,text:' | Wert |\n| '});if(value[i]==='|'){let slash=i-1;while(slash>=start&&value[slash]==='\\')slash--;if((i-1-slash)%2===0)edits.push({start:i,end:i,text:'\\'})}}
  if(start===end)edits.push({start,end,text:selected});edits.push({start:end,end,text:after});
  const result=apply(value,edits,{start,end});if(start===end)result.selection={start:start+before.length,end:start+before.length+selected.length};return result;
 }
 const before=action==='bold'?'**':action==='italic'?'*':'[',after=action==='link'?'](https://example.org)':before;
 if((action==='bold'||action==='italic'||action==='link')&&start!==end&&/\n[\t ]*\n/.test(selected)){let at=start;for(const block of selected.split(/(\n[\t ]*\n)/)){if(block&&!/^\n[\t ]*\n$/.test(block))edits.push({start:at,end:at,text:before},{start:at+block.length,end:at+block.length,text:after});at+=block.length}return apply(value,edits,{start,end})}
 if(start===end){const result=apply(value,[{start,end,text:before+selected+after}],{start,end});result.selection={start:start+before.length,end:start+before.length+selected.length};return result}
 return apply(value,[{start,end:start,text:before},{start:end,end,text:after}],{start,end});
}
