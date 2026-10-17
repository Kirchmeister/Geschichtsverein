import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const mocks={react:'export const useState=x=>globalThis.state(x);export const useRef=x=>globalThis.ref(x);export const useEffect=f=>globalThis.effect(f);','react/jsx-runtime':'export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment="Fragment";','./contact.module.css':'export default {};','./confirm-action':'export const ConfirmAction="ConfirmAction";','@/components/ui/dialog':'export const Dialog="Dialog",DialogContent="DialogContent",DialogTitle="DialogTitle",DialogDescription="DialogDescription";','@/lib/archive-api':'export const archiveRequest=(...args)=>globalThis.request(...args);'};
const out=await esbuild.build({stdin:{contents:"export * from './components/archive/archive-exporter';export {readArchiveQuery} from './lib/archive-query';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':process.cwd()},plugins:[{name:'mock',setup(b){b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path]}))}}]});
const hooks=[],requests=[],cleanups=[];let cursor=0,tree,selection={scope:'selected',ids:['entry-a'],excluded:[]};
const scope={module:{exports:{}},URLSearchParams,fetch:async()=>({}),state(initial){const i=cursor++;if(!(i in hooks))hooks[i]=initial;return [hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v]},ref(initial){const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i]},effect(fn){const i=cursor++;if(!(i in hooks)){hooks[i]=true;cleanups.push(fn())}},request(url,options){return new Promise((resolve,reject)=>requests.push({url,body:JSON.parse(options.body),resolve,reject}))}};
vm.runInNewContext(out.outputFiles[0].text,scope);const m=scope.module.exports;
assert.equal(m.selectedForExport(selection,'entry-a'),true);selection=m.toggleExportSelection(selection,'entry-b');assert.equal(selection.ids.length,2);selection=m.toggleExportSelection(selection,'entry-a');assert.equal(m.selectedForExport(selection,'entry-a'),false);
let broad=m.toggleExportSelection({scope:'filtered',ids:[],excluded:[]},'entry-a');assert.equal(m.selectedForExport(broad,'entry-a'),false);assert.equal(m.selectedForExport(broad,'entry-b'),true);broad=m.toggleExportSelection(broad,'entry-a');assert.equal(broad.excluded.length,0);
selection={scope:'selected',ids:['entry-a'],excluded:[]};
function nodes(n){if(Array.isArray(n))return n.flatMap(nodes);if(!n||typeof n!=='object')return [];return [n,...nodes(n.props?.children)]}
function text(n){if(Array.isArray(n))return n.map(text).join('');if(typeof n==='string')return n;if(n&&typeof n==='object')return text(n.props?.children);return ''}
function render(){cursor=0;tree=m.ArchiveExporter({selection,onSelection:s=>selection=s,query:m.readArchiveQuery(''),data:{items:[{id:'entry-a'}],total:1}})}
function button(label){return nodes(tree).find(n=>n.type==='button'&&text(n)===label)}
const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();render()};
render();button('Export vorbereiten').props.onClick();await flush();assert.equal(requests[0].body.action,'create');requests[0].resolve({id:'job-a',state:'running',total:1,done:0,files:0});await flush();
let confirmation=nodes(tree).find(n=>n.type==='ConfirmAction');assert.equal(confirmation.props.open,true);confirmation.props.onConfirm();confirmation.props.onOpenChange(false);await flush();
assert.equal(requests[1].body.action,'advance','closing confirmation must not cancel the newly started export');requests[1].resolve({id:'job-a',state:'complete',total:1,done:1,files:1});await flush();assert.ok(nodes(tree).some(n=>n.type==='a'&&n.props.href==='/api/exports?id=job-a&download=1'));
const cancelling=button('Export schließen und löschen').props.onClick();await flush();assert.equal(requests[2].body.action,'cancel');requests[2].resolve({cancelled:true});await cancelling;await flush();assert.ok(!nodes(tree).some(n=>n.type==='a'&&n.props.href?.includes('job-a')));
button('PDF-Vorschau (ein Beitrag)').props.onClick();await flush();requests[3].resolve({id:'job-b',state:'running',total:1,done:0,files:0});await flush();requests[4].resolve({id:'job-b',state:'complete',total:1,done:1,files:1});await flush();assert.ok(nodes(tree).some(n=>n.type==='iframe'&&n.props.src.includes('job-b')));
for(const cleanup of cleanups)cleanup?.();
console.log('PASS: selection/exclusions, exact confirmation-to-run ordering, progress/download, server cancellation and authenticated PDF preview.');
