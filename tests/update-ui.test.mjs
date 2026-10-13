import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
let values=[],cursor=0,refs=[],refCursor=0;const requests=[];
const state={enabled:true,lastCheck:'2026-10-13T07:00:00Z',appVersion:'0.42.0',currentVersion:'0.42.0',serviceVersion:'0.42.0',currentChannel:'stable',features:{compatibility:true,betaChannels:true,manualRollback:true,updateHistory:true},rollback:{available:true,currentVersion:'0.42.0',targetVersion:'0.41.0'},installedHistory:Array.from({length:5},(_,n)=>({id:'id-'+n,tag:'v0.4'+(2-n)+'.0',status:'complete',created:'2026-10-13T07:00:00Z',finished:'2026-10-13T07:01:00Z',releaseNotes:'Notes '+n})),releases:[]};
const mocks={'react':`export const useState=initial=>globalThis.hooks.state(initial);export const useRef=initial=>globalThis.hooks.ref(initial);export const useEffect=()=>{};`,
 'react/jsx-runtime':'export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment="Fragment";',
 'lucide-react':'export const ChevronDown="Chevron";',
 '@/components/ui/dialog':'export const Dialog=({open,children})=>open?children:null;export const DialogContent="Content",DialogTitle="Title",DialogDescription="Description";',
 './update-progress':'export const updateRunning=job=>!!job&&![["complete","rolled_back","error"]].flat().includes(job.status);export const updateLabels={complete:"Update erfolgreich"};export const UpdateProgress=()=>null;',
 './update-source':'export const UpdateSource=()=>null;',
 '@/lib/archive-api':'export const archiveRequest=(url,options)=>globalThis.request(url,options);'};
const result=await esbuild.build({entryPoints:['components/archive/server-updates.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,alias:{'@':process.cwd()},plugins:[{name:'mock',setup(build){build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'mock'}:undefined);build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js'}))}}]});
const scope={module:{exports:{}},Date,console,setTimeout,clearTimeout,Blob,URL,hooks:{state(initial){const i=cursor++;if(!(i in values))values[i]=i===7?{runtime:'linux'}:i===8?state:typeof initial==='function'?initial():initial;return [values[i],v=>{values[i]=typeof v==='function'?v(values[i]):v}]},ref(initial){const i=refCursor++;return refs[i]||=({current:initial})}},request:async(url,options)=>{if(options){const data=JSON.parse(options.body);requests.push(data);if(data.action==='rollback-inspect'){values[8]={...state,rollbackInspection:{status:'checking'},busy:true};return {inspectionQueued:true}}if(data.action==='beta-channel')return {...state,allowBeta:data.enabled};return state}return url.includes('hosting')?{runtime:'linux'}:values[8]}};
vm.runInNewContext(result.outputFiles[0].text,scope);
function expand(node){if(Array.isArray(node))return node.map(expand);if(!node||typeof node!=='object')return node;if(typeof node.type==='function')return expand(node.type(node.props));return {...node,props:{...node.props,children:expand(node.props?.children)}}}
function render(){cursor=0;refCursor=0;return expand(scope.module.exports.ServerUpdates())}
function nodes(n){if(Array.isArray(n))return n.flatMap(nodes);if(!n||typeof n!=='object')return [];return [n,...nodes(n.props?.children)]}
function text(n){if(Array.isArray(n))return n.map(text).join(' ');if(!n||typeof n==='boolean')return '';if(typeof n!=='object')return String(n);return text(n.props?.children)}
let tree=render(),all=nodes(tree),content=text(tree);
assert.match(content,/Status und Updates prüfen/);assert.match(content,/Hilfe/);assert.match(content,/SSH-Hilfe und KI-Begleitung/);assert.doesNotMatch(content,/Erneut prüfen/);assert.doesNotMatch(content,/Lokale Rückfallsicherung/);
assert.equal(all.filter(n=>n.props?.className==='update-history-card').length,5);
const beta=all.find(n=>n.type==='label'&&n.props.className==='update-beta-choice');assert.ok(beta);assert.equal(beta.props.children[0].type,'input');assert.equal(beta.props.children[1].type,'span');await beta.props.children[0].props.onChange({target:{checked:true}});assert.equal(requests.at(-1).action,'beta-channel');
tree=render();const card=nodes(tree).find(n=>n.props?.className==='update-history-card');card.props.onClick();assert.match(text(render()),/Notes 0/);
const inspect=nodes(render()).find(n=>n.type==='button'&&text(n)==='Rückfallsicherung prüfen …');assert.equal(inspect.props.disabled,false);inspect.props.onClick();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(requests.at(-1).action,'rollback-inspect');
tree=render();assert.match(text(tree),/Spätere Änderungen sind anschließend nicht mehr im aktiven Archiv/);assert.match(text(tree),/Bitte warten/);assert.equal(nodes(tree).find(n=>n.type==='button'&&text(n)==='Update verbindlich rückgängig machen').props.disabled,true);
values[0]=false;values[8]={...state,rollbackInspection:{status:'complete'},rollbackPreview:{token:'TOKEN',currentVersion:'0.42.0',targetVersion:'0.41.0',backupCreated:'2026-10-12T10:00:00Z'}};
tree=render();const confirmation=nodes(tree).find(n=>n.type==='input'&&n.props.autoComplete==='off');assert.ok(confirmation);confirmation.props.onChange({target:{value:'UPDATE RÜCKGÄNGIG MACHEN'}});tree=render();const rollback=nodes(tree).find(n=>n.type==='button'&&text(n)==='Update verbindlich rückgängig machen');assert.equal(rollback.props.disabled,false);await rollback.props.onClick();assert.equal(requests.at(-1).token,'TOKEN');assert.equal(requests.at(-1).confirmation,'UPDATE RÜCKGÄNGIG MACHEN');
values[5]=false;values[8]={...state,checkError:'GitHub-Prüfung fehlgeschlagen (HTTP 403).',latestStableVersion:'0.45.0'};
const failedText=text(render());assert.match(failedText,/Update-Prüfung derzeit nicht möglich/);assert.match(failedText,/Zuletzt bekannte stabile Version/);assert.doesNotMatch(failedText,/Keine neuen Updates/);
const css=await fs.readFile('app/globals.css','utf8'),settings=await fs.readFile('components/archive/system-settings.tsx','utf8'),intro=await fs.readFile('components/archive/public-intro-settings.tsx','utf8');
assert.match(css,/label\.update-beta-choice\{display:flex/);assert.match(css,/update-beta-choice input\{width:20px/);assert.match(settings,/useState\(3\)/);assert.match(settings,/\[1,3,7,14,31\]\.includes/);assert.match(settings,/backup-period-select/);assert.doesNotMatch(settings,/name="backup-days"/);assert.match(settings,/title="Gästeeinstellungen"[^>]*><FieldSettings guest/);assert.match(intro,/<FieldSettings\/>/);assert.doesNotMatch(intro,/note="Überschrift/);
console.log('PASS: five clickable history cards, aligned beta checkbox, help relocation, no redundant refresh/backup box, rollback warning and token/confirmation gate, nested fields and persistent three-day backup default.');
