import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const mocks={
 './legal-links':`export const useLegalLinks=()=>({imprint:true,privacy:true});`,
 '@/lib/archive-date':`export const formatDateField=value=>value;`,
 react:`export const useState=initial=>{const n=cursor++;if(!(n in states))states[n]=initial;return [states[n],v=>states[n]=v]};export const useEffect=f=>{effects.push(f)};export const useLayoutEffect=()=>{};export const useRef=initial=>({current:initial});`,
 'react/jsx-runtime':`export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment='Fragment';`,
 './nearby-explorer':`export const useNearbyExplorer=()=>({point:null,radius:100,references:[],controls:null,results:null});`,
 './public-zoom':`export const usePublicZoomLock=()=>{};`,
 './entry-location':`export const EntryLocationView='EntryLocationView';`,
 '@/components/archive/installation':`export const useBranding=()=>({title:'Testarchiv',association:'Testverein'});`,
 '@/lib/archive-title':`export const archiveTitle=b=>b.title;`,
 '@/lib/archive-public-intro':`export const publicIntroDefaults=()=>({heading:'Historie',text:'Einführung'});export const introLinkParts=text=>[{text}];`,
 '@/lib/archive-api':`export const archiveRequest=path=>Promise.resolve(path==='/api/public-profile'?{entries:[]}:path==='/api/map'?{enabled:true,provider:'ohm'}:null);`,
 '@/lib/archive-timeline-navigation':`export const readTimelinePosition=()=>null;export const rememberTimelinePosition=()=>{};`,
 './markdown-text':`export const MarkdownText='Markdown';`,
 './public-profile.module.css':`export default {};`
};
const result=await esbuild.build({entryPoints:['components/archive/public-profile.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,plugins:[{name:'mock',setup(build){build.onResolve({filter:/^(react|lucide-react|@\/|\.\/legal-links|\.\/nearby-explorer|\.\/public-zoom|\.\/entry-location|\.\/markdown-text|\.\/public-profile.module.css)/},args=>({path:args.path,namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path]||'export const PublicPageView="PageView",LinkedDescription="Description",EntryComments="Comments",AudioPlayer="Audio",publicFieldLabels={},entryReferencePath=()=>"/",Image="Image",Volume2="Audio",FileText="File";',loader:'js'}))}}]});
const location={href:'https://archive.test/?ansicht=oeffentlich&tab=zeitkarte'},scope={module:{exports:{}},cursor:0,states:[],effects:[],URL,window:{location,addEventListener(){},removeEventListener(){},history:{state:null,replaceState(_,__,url){location.href=new URL(url,location.href).href},pushState(_,__,url){location.href=new URL(url,location.href).href}}}};
vm.runInNewContext(result.outputFiles[0].text,scope);
function render(){scope.cursor=0;scope.effects=[];return scope.module.exports.PublicProfile({footer:{type:'LoginFooter',props:{}}})}
function nodes(tree){if(!tree||typeof tree!=='object')return [];return [tree,...[tree.props?.children].flat(Infinity).flatMap(nodes)]}
let tree=render();const footers=nodes(tree).filter(n=>typeof n.type==='function'&&n.type.name==='ArchiveFooter');assert.equal(footers.length,1);const footerTree=footers[0].type(footers[0].props);assert.equal(footerTree.type,'footer');assert.ok(nodes(footerTree).some(n=>n.type==='span'&&n.props.children==='Testverein'));assert.deepEqual(nodes(footerTree).filter(n=>n.type==='a').map(n=>n.props.href),['/impressum','/datenschutz']);assert.ok(!nodes(tree).some(n=>n.type==='PageView'),'map deep link must not count a timeline view before URL initialization');for(const effect of scope.effects)effect();await new Promise(resolve=>setImmediate(resolve));tree=render();
assert.ok(nodes(tree).some(n=>typeof n.type==='function'&&n.type.name==='TimeMap'));
const links=nodes(tree).filter(n=>n.type==='a');assert.equal(links.find(n=>n.props.children==='Historische Karte').props['aria-current'],'page');assert.ok(nodes(tree).some(n=>n.type==='LoginFooter'));assert.ok(links.some(n=>n.props.href==='https://github.com/Kirchmeister/Geschichtsverein'));assert.ok(!links.some(n=>n.props.href==='/experimente/bruchkoebel-zeitkarte.html'));
links.find(n=>n.props.children==='Zeitleiste').props.onClick({button:0,preventDefault(){}});tree=render();assert.equal(new URL(location.href).searchParams.get('tab'),null);assert.ok(!nodes(tree).some(n=>typeof n.type==='function'&&n.type.name==='TimeMap'));assert.ok(nodes(tree).some(n=>n.type==='PageView'));assert.ok(nodes(tree).some(n=>n.type==='LoginFooter'));
scope.states[6]={enabled:true,provider:'osm'};tree=render();assert.ok(nodes(tree).some(n=>n.type==='a'&&n.props.children==='Heutige Karte'));scope.states[6]={enabled:false};scope.states[0]='ohm';location.href='https://archive.test/?ansicht=oeffentlich&tab=zeitkarte';tree=render();scope.effects.at(-1)();tree=render();assert.equal(new URL(location.href).searchParams.get('tab'),null);assert.ok(!nodes(tree).some(n=>typeof n.type==='function'&&n.type.name==='TimeMap'));assert.ok(!nodes(tree).some(n=>n.type==='a'&&['Heutige Karte','Historische Karte'].includes(n.props.children)));
console.log('PASS: directly linkable map/timeline tabs preserve login and GitHub footer; map view does not count as timeline view.');

scope.states[6]={enabled:true,provider:'both',osmTitle:'Heute',ohmTitle:'Damals'};scope.states[0]='osm';tree=render();assert.equal(nodes(tree).filter(n=>n.type==='a'&&['Heutige Karte','Historische Karte','Zeitleiste'].includes(n.props.children)).length,3);let m=nodes(tree).find(n=>typeof n.type==='function'&&n.type.name==='TimeMap');assert.equal(m.props.provider,'osm');assert.equal(m.props.title,'Heute');nodes(tree).find(n=>n.type==='a'&&n.props.children==='Historische Karte').props.onClick({button:0,preventDefault(){}});tree=render();m=nodes(tree).find(n=>typeof n.type==='function'&&n.type.name==='TimeMap');assert.equal(m.props.provider,'ohm');assert.equal(m.props.title,'Damals');assert.equal(new URL(location.href).searchParams.get('tab'),'zeitkarte');

const mapped=m.type(m.props);const iframe=nodes(mapped).find(n=>n.type==='iframe');assert.ok(iframe.props.src.includes('eingebettet=1&fluechtig=1'));assert.ok(!iframe.props.src.includes('lat='));assert.ok(!iframe.props.src.includes('lon='));
