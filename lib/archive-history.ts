export function historyFieldEqual(key:string,current:any,previous:any){
 if(key==='description')return (current.description||'')===(previous.description||'')&&JSON.stringify(current.descriptionLinks||[])===JSON.stringify(previous.descriptionLinks||[])&&JSON.stringify(current.personTags||[])===JSON.stringify(previous.personTags||[]);
 if(key==='files')return JSON.stringify(current.files||[])===JSON.stringify(previous.files||[]);
 return (current[key]||'')===(previous[key]||'');
}
export function restoreHistoryFields(current:any,previous:any,keys:string[]){const result={...current};for(const key of keys)result[key]=previous[key]??(key==='files'?[]:'');if(keys.includes('description')){result.descriptionLinks=previous.descriptionLinks||[];result.personTags=previous.personTags||[];}return result;}
/** Bound work for long descriptions; highlight the differing passage between shared edges. */
export function historyTextDiff(before:string,after:string){const a=before.match(/\s+|[^\s]+/g)||[],b=after.match(/\s+|[^\s]+/g)||[];let start=0,end=0;while(start<a.length&&start<b.length&&a[start]===b[start])start++;while(end<a.length-start&&end<b.length-start&&a[a.length-1-end]===b[b.length-1-end])end++;const parts=(tokens:string[])=>[{text:tokens.slice(0,start).join(''),changed:false},{text:tokens.slice(start,tokens.length-end).join(''),changed:true},{text:end?tokens.slice(-end).join(''):'',changed:false}].filter(p=>p.text);return {before:parts(a),after:parts(b)};}
