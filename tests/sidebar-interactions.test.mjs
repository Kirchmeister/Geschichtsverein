import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
async function component(file,imports,context){
 const result=await esbuild.build({entryPoints:[file],bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,plugins:[{name:'test-dependencies',setup(build){build.onResolve({filter:/^(react|react\/jsx-runtime|lucide-react|@\/|\.\/)/},args=>args.kind==='entry-point'?null:({path:args.path,namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:imports[args.path]||'export const PushSettings=()=>null;export const PasskeySettings=()=>null;',loader:'js'}))}}]});
 const scope={module:{exports:{}},...context};vm.runInNewContext(result.outputFiles[0].text,scope);return scope.module.exports;
}
const jsx='export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment="Fragment";';
let states=[],cursor=0,requests=[],destination=null;
const context={hooks:{useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return [states[i],value=>{states[i]=value}]},useRef(){return {current:null}}},requests,navigator:{},location:{assign(url){destination=url}}};
const imports={'@/components/ui/switch':'export const Switch="Switch";','react':'export const useState=(x)=>hooks.useState(x);export const useRef=()=>hooks.useRef();export const useEffect=()=>{};','react/jsx-runtime':jsx,'lucide-react':'export const UserRound="UserRound",LogOut="LogOut";','@/lib/archive-api':'export const archiveRequest=async(...args)=>{requests.push(args);return {}};','@/components/ui/dialog':'export const Dialog="Dialog",DialogContent="DialogContent",DialogTitle="DialogTitle",DialogDescription="DialogDescription";','@/components/ui/sidebar':'export const SidebarMenuButton="SidebarMenuButton";export const useSidebar=()=>({isMobile:false,setOpenMobile(){}});','./session-ui':'export const roleLabel=x=>x;export const sessionPermissions=()=>[];'};
const {AccountControls,AccountPermissions}=await component('components/archive/account-menu.tsx',imports,context);
const render=session=>{cursor=0;return AccountControls({session,onOpen:()=>{opened++}})};
function all(node){if(!node||typeof node!=='object')return [];return [node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flatMap(all)]}
let opened=0;const session={name:'Testkonto',role:'admin',canLogout:true};
let nodes=all(render(session));assert.equal(nodes.filter(n=>n.type==='button').length,4); // name, icon, cancel, confirm in controlled dialog
const icon=nodes.find(n=>n.props.className==='sidebar-account-logout-icon');assert.equal(icon.props['aria-label'],'Abmelden');assert.equal(nodes.find(n=>n.props.className==='sidebar-account-name').props.children[1].props.children,'Testkonto');
icon.props.onClick();nodes=all(render(session));assert.equal(nodes.find(n=>n.type==='Dialog').props.open,true);assert.equal(requests.length,0);
nodes.find(n=>n.type==='button'&&n.props.children==='Abbrechen').props.onClick();nodes=all(render(session));assert.equal(nodes.find(n=>n.type==='Dialog').props.open,false);assert.equal(requests.length,0);assert.equal(destination,null);
nodes.find(n=>n.props.className==='sidebar-account-name').props.onClick();assert.equal(opened,1);
nodes.find(n=>n.props.className==='sidebar-account-logout-icon').props.onClick();nodes=all(render(session));await nodes.find(n=>n.type==='button'&&n.props.children==='Abmelden').props.onClick();assert.equal(requests.length,1);assert.equal(JSON.parse(requests[0][1].body).action,'logout');assert.equal(destination,'/anmelden');
states=[];assert.equal(all(render({...session,canLogout:false})).filter(n=>n.props.className==='sidebar-account-logout-icon').length,0);assert.equal(render({...session,role:'public'}),null);
states=[];cursor=0;let previewValue=null;const permissions=extra=>{cursor=0;return all(AccountPermissions({session:{...session,canPreview:true,previewEnabled:false,...extra},previewRole:'admin',previewBusy:false,previewError:'',onPreviewChange:v=>previewValue=v,open:true,onOpenChange(){}}))};let switches=permissions().filter(n=>n.type==='Switch');assert.equal(switches.length,1);assert.equal(switches[0].props.checked,false);switches[0].props.onCheckedChange(true);assert.equal(previewValue,true);assert.equal(permissions({previewEnabled:true}).find(n=>n.type==='Switch').props.checked,true);assert.equal(permissions({role:'user',canPreview:false}).filter(n=>n.type==='Switch').length,0);
// Exercise actual effect/observer wiring without a browser layout engine.
let effect,cleanup,resizeCallback,mutationCallback,rafCallback,available=700,menuSize={normal:400,compact:300,tight:220};
const root={dataset:{density:'normal'},clientHeight:available,getClientRects:()=>[{}],querySelector(selector){return selector.includes('header')?header:selector.includes('footer')?footer:selector.includes('content')?content:menu},querySelectorAll:()=>[header,footer,menu]};
const header={getBoundingClientRect:()=>({height:root.dataset.density==='normal'?120:60})},footer={getBoundingClientRect:()=>({height:100})},content={},menu={getBoundingClientRect:()=>({height:menuSize[root.dataset.density]})};
const win={addEventListener(){},removeEventListener(){},visualViewport:{addEventListener(){},removeEventListener(){}}};
const adaptive=await component('components/archive/adaptive-sidebar.tsx',{'react':'export const useRef=()=>({current:root});export const useLayoutEffect=fn=>{capture(fn)};','react/jsx-runtime':jsx},{root,capture(fn){effect=fn},requestAnimationFrame(fn){rafCallback=fn;return 1},cancelAnimationFrame(){},getComputedStyle:()=>({paddingTop:'0',paddingBottom:'0'}),ResizeObserver:class{constructor(fn){resizeCallback=fn}observe(){}disconnect(){}},MutationObserver:class{constructor(fn){mutationCallback=fn}observe(){}disconnect(){}},window:win,document:{}});
adaptive.AdaptiveSidebar({children:null});cleanup=effect();assert.equal(root.dataset.density,'normal');
root.clientHeight=480;resizeCallback();rafCallback();assert.equal(root.dataset.density,'compact');
root.clientHeight=350;resizeCallback();rafCallback();assert.equal(root.dataset.density,'tight');
root.clientHeight=200;resizeCallback();rafCallback();assert.equal(root.dataset.density,'tight'); // scrolling fallback
root.clientHeight=700;resizeCallback();rafCallback();assert.equal(root.dataset.density,'normal');
menuSize={normal:650,compact:400,tight:300};mutationCallback();rafCallback();assert.equal(root.dataset.density,'compact'); // changed role/menu, same viewport
root.clientHeight=0;resizeCallback();rafCallback();assert.equal(root.dataset.density,'compact');cleanup();
console.log('PASS: role-dependent density, resizing, restore standard size, hidden menu; logout requires confirmation, cancellation is inert, account access preserved and Sites icon absent.');
