import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const mocks={
 'react':`export const useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]};export const useRef=initial=>{const i=cursor++;return slots[i]??=( {current:initial})};export const useEffect=(fn,deps)=>{const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){slots[i]={deps};pending.push(()=>{old?.cleanup?.();slots[i].cleanup=fn()})}};`,
 'react/jsx-runtime':`export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment='Fragment';`,
 './confirm-action':`export const ConfirmAction='ConfirmAction';`,
 './legal-links':`export const useLegalLinks=()=>({privacy:privacy});`,
 './nearby-explorer.module.css':`export default {};`
};
const output=await esbuild.build({stdin:{contents:"export * from './components/archive/nearby-explorer';export * from './lib/archive-nearby';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',plugins:[{name:'mocks',setup(build){build.onResolve({filter:/^(react|\.\/confirm-action|\.\/legal-links|\.\/nearby-explorer.module.css)/},args=>({path:args.path,namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js'}))}}]});
const area={lat:50,lon:8,radius:2,place:'Testort'},callbacks=[],requests=[],events={},entries=[{reference:'BK-2345-6789-ABCD',title:'Nah',location:{lat:50.0001,lon:8}},{reference:'BK-2345-6789-ABCE',title:'Weiter',location:{lat:50.0008,lon:8}},{reference:'BK-2345-6789-ABCF',title:'Außerhalb',location:{lat:50.1,lon:8}}];
const scope={module:{exports:{}},cursor:0,slots:[],pending:[],privacy:true,navigator:{userAgent:'Mozilla/5.0 (iPhone)',geolocation:{getCurrentPosition(success,error,options){callbacks.push({success,error,options})}}},window:{isSecureContext:true,addEventListener(name,fn){events[name]=fn},removeEventListener(){}},fetch:async(...args)=>{requests.push(args);return {ok:true,json:async()=>({entries})}},localStorage:{setItem(){throw Error('location storage forbidden')}},sessionStorage:{setItem(){throw Error('location storage forbidden')}}};
vm.runInNewContext(output.outputFiles[0].text,scope);const m=scope.module.exports;
function render(config=area){scope.cursor=0;scope.pending=[];let result=m.useNearbyExplorer(config);const effects=scope.pending.splice(0);if(effects.length){effects.forEach(f=>f());scope.cursor=0;scope.pending=[];result=m.useNearbyExplorer(config)}return result}
function nodes(tree){if(!tree||typeof tree!=='object')return [];return [tree,...[tree.props?.children].flat(Infinity).flatMap(nodes)]}
const consent=r=>nodes(r.controls).find(n=>n.type==='ConfirmAction');
const start=r=>{nodes(r.controls).find(n=>n.type==='button'&&n.props.className==='primary').props.onClick();r=render();assert.equal(consent(r).props.open,true);consent(r).props.onConfirm();return render()};
const position=(lat=50,lon=8,accuracy=5)=>({coords:{latitude:lat,longitude:lon,accuracy}});
let r=render();assert.equal(callbacks.length,0);nodes(r.controls).find(n=>n.type==='button'&&n.props.className==='primary').props.onClick();r=render();consent(r).props.onOpenChange(false);r=render();assert.equal(callbacks.length,0,'opening/cancelling consent must not locate');
r=start(r);assert.equal(callbacks.length,1);assert.equal(callbacks[0].options.maximumAge,0);assert.equal(callbacks[0].options.timeout,15000);assert.equal(r.point,null);
await callbacks[0].success(position());r=render();assert.equal(r.point.lat,50);assert.equal(r.references.length,2);assert.equal(requests.length,1);assert.equal(requests[0][0],'/api/map-entries');assert.deepEqual(Object.keys(requests[0][1]),['cache']);
nodes(r.controls).find(n=>n.type==='select').props.onChange({target:{value:'50'}});r=render();assert.equal(r.references.length,1);assert.ok(nodes(r.results).some(n=>n.type==='a'&&n.props.href==='/beitrag/BK-2345-6789-ABCD'));
nodes(r.controls).find(n=>n.type==='button'&&n.props.children==='Umgebungssuche beenden').props.onClick();r=render();assert.equal(r.point,null);assert.equal(r.results,null);
r=start(r);const late=callbacks.at(-1);nodes(r.controls).find(n=>n.type==='button'&&n.props.children==='Abbrechen').props.onClick();r=render();await late.success(position());r=render();assert.equal(r.point,null,'cancelled callback must not restore position');
r=start(r);callbacks.at(-1).error({code:1});r=render();assert.match(JSON.stringify(r.controls),/nicht erteilt/);assert.equal(r.point,null);
r=start(r);await callbacks.at(-1).success(position(51));r=render();assert.match(JSON.stringify(r.controls),/außerhalb/);assert.equal(r.point,null);
r=start(r);await callbacks.at(-1).success(position(50,8,500));r=render();assert.match(JSON.stringify(r.controls),/ungenau/);assert.equal(r.point,null);
r=start(r);const stale=callbacks.at(-1);scope.privacy=false;r=render();await stale.success(position());r=render();assert.equal(r.point,null);assert.equal(consent(r).props.open,false);assert.equal(nodes(r.controls).find(n=>n.type==='button'&&n.props.className==='primary').props.disabled,true);
scope.privacy=true;r=render();r=start(r);const changed=callbacks.at(-1);r=render({...area,place:'Neuer Ort'});await changed.success(position());r=render({...area,place:'Neuer Ort'});assert.equal(r.point,null);
// A fresh desktop mount never offers or executes geolocation.
scope.slots=[];scope.navigator.userAgent='Mozilla/5.0 (Windows NT 10.0)';r=render();assert.ok(!nodes(r.controls).some(n=>n.type==='button'&&n.props.className==='primary'));const count=callbacks.length;consent(r).props.onConfirm();assert.equal(callbacks.length,count);
scope.slots=[];scope.navigator.userAgent='iPhone';scope.window.isSecureContext=false;r=render();assert.ok(!nodes(r.controls).some(n=>n.type==='button'&&n.props.className==='primary'));consent(r).props.onConfirm();assert.equal(callbacks.length,count);
scope.slots=[];scope.window.isSecureContext=true;r=render();r=start(r);callbacks.at(-1).error({code:3});r=render();assert.match(JSON.stringify(r.controls),/zu lange/);
r=start(r);await callbacks.at(-1).success(position());r=render();assert.ok(r.point);events.pagehide();r=render();assert.equal(r.point,null);
r=start(r);await callbacks.at(-1).success(position());r=render();nodes(r.controls).find(n=>n.type==='select').props.onChange({target:{value:'100'}});r=render();assert.equal(r.references.length,2);
assert.equal(m.nearbyPhone({userAgent:'Android Mobile'}),true);assert.equal(m.nearbyPhone({userAgent:'Android Tablet'}),false);assert.equal(m.nearbyPhone({userAgent:'iPad'}),false);assert.equal(m.nearbyPhone({userAgent:'Desktop',userAgentData:{mobile:true}}),true);
assert.equal(m.nearbyPositionStatus({lat:50,lon:8,accuracy:10},area,100),'inside');assert.equal(m.nearbyPositionStatus({lat:50.018,lon:8,accuracy:10},area,100),'boundary');assert.equal(m.nearbyPositionStatus({lat:NaN,lon:8,accuracy:10},area,100),'invalid');assert.equal(m.nearbyPositionStatus({lat:50,lon:8,accuracy:150},area,100),'inaccurate');
assert.ok(Math.abs(m.distanceMeters({lat:0,lon:0},{lat:0,lon:1})-111195)<1);
const matches=m.nearbyEntries([entries[1],entries[0],entries[0],{reference:'bad',location:{lat:NaN,lon:8}},entries[2]],{lat:50,lon:8,accuracy:5},area,100);assert.deepEqual([...matches.map(e=>e.title)],['Nah','Weiter']);
console.log('PASS: explicit consent, one-shot fresh lookup, sorted public-only local distances, no coordinates in requests/storage, desktop/privacy guards, denied/outside/inaccurate locations, cancellation and stale callback/config rejection.');
