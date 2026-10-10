import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const imports={react:'export const useState=x=>hooks.useState(x);export const useEffect=fn=>hooks.useEffect(fn);','react/jsx-runtime':'export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment="Fragment";','lucide-react':'export const MessageSquare="MessageSquare";','@/lib/archive-api':'export const archiveRequest=(...args)=>request(...args);','./settings-panel':'export const SettingsPanel="SettingsPanel";'};
const result=await esbuild.build({entryPoints:['components/archive/comments.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,plugins:[{name:'test-dependencies',setup(build){build.onResolve({filter:/^(react|lucide-react|@\/|\.\/)/},args=>args.kind==='entry-point'?null:({path:args.path,namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:imports[args.path],loader:'js'}))}}]});
let states=[],cursor=0,effects=[],calls=[];
const data={mode:'open',more:true,comments:[{id:'pending',entryTitle:'Testbeitrag',authorName:'Testautor',created:'2026-10-10T07:00:00Z',body:'Text zur Prüfung',status:'pending',parentId:'parent',parentAuthor:'Andere Person',parentBody:'Ursprünglicher Text'},{id:'approved',entryTitle:'Freigegebener Beitrag',authorName:'Testautor',created:'2026-10-10T07:00:00Z',body:'Freigegebener Text',status:'approved'},{id:'rejected',entryTitle:'Abgelehnter Beitrag',authorName:'Testautor',created:'2026-10-10T07:00:00Z',body:'Abgelehnter Text',status:'rejected'}]};
const scope={module:{exports:{}},hooks:{useState(x){const i=cursor++;if(!(i in states))states[i]=x;return [states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v}]},useEffect(fn){effects.push(fn)}},request:async(url,options)=>{calls.push({url,options});return data}};
vm.runInNewContext(result.outputFiles[0].text,scope);const render=()=>{cursor=0;effects=[];return scope.module.exports.CommentAdmin()};
function all(node){if(Array.isArray(node))return node.flatMap(all);if(!node||typeof node!=='object')return [];return [node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flatMap(all)]}
render();effects[0]();await new Promise(r=>setImmediate(r));let nodes=all(render());
assert.equal(nodes.filter(n=>n.type==='article').length,3);assert.deepEqual(nodes.filter(n=>n.props.className?.startsWith('comment-moderation-status')).map(n=>n.props.children),['Wartet auf Freigabe','Freigegeben','Abgelehnt']);
assert.equal(nodes.find(n=>n.type==='SettingsPanel').props.title,'Kommentarfunktion einstellen');assert.equal(nodes.find(n=>n.type==='SettingsPanel').props.note,'Aktiv');
assert.equal(nodes.find(n=>n.props.className==='comment-moderation-context').props.children[1].props.children,'Ursprünglicher Text');
await nodes.find(n=>n.type==='button'&&n.props.children==='Freigeben').props.onClick();let last=calls.filter(c=>c.options)[0];assert.deepEqual(JSON.parse(last.options.body),{action:'approve',id:'pending'});
nodes=all(render());await nodes.find(n=>n.type==='button'&&n.props.children==='Freigabe zurücknehmen').props.onClick();last=calls.filter(c=>c.options).at(-1);assert.deepEqual(JSON.parse(last.options.body),{action:'reject',id:'approved'});
nodes=all(render());await nodes.find(n=>n.type==='input'&&n.props.value===undefined&&n.props.checked===false).props.onChange();last=calls.filter(c=>c.options).at(-1);assert.deepEqual(JSON.parse(last.options.body),{action:'mode',mode:'closed'});
console.log('PASS: moderation statuses, reply context, settings panel, approval/rejection and mode actions preserved.');
