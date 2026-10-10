import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const mocks={
 'react':`export const createContext=()=>({Provider:'BrandingProvider'});export const useContext=()=>null;export const useEffect=()=>{};export const useState=initial=>[stateIndex++===0?config:initial,()=>{}];`,
 'react/jsx-runtime':`export const jsx=(type,props)=>({type,props});export const jsxs=jsx;export const Fragment="Fragment";`,
 '@/lib/archive-api':`export const archiveRequest=()=>{};`,
 '@/lib/archive-title':`export const defaultArchiveSubtitle='Digitale Heimatforschung';export const archiveTitle=config=>config.title;`
};
const result=await esbuild.build({entryPoints:['components/archive/installation.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,plugins:[{name:'mock',setup(build){build.onResolve({filter:/^(react|@\/)/},args=>({path:args.path,namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js'}))}}]});
const config={place:'Bruchköbel',association:'Testverein',title:'Bruchköbel Damals',subtitle:'Unterzeile',completed:true};
const scope={module:{exports:{}},stateIndex:0,config,window:{location:{pathname:'/anmelden'}}};
vm.runInNewContext(result.outputFiles[0].text,scope);
const child={publicProfile:true},rendered=scope.module.exports.InstallationGate({children:child});
assert.equal(rendered.type,'BrandingProvider');assert.equal(rendered.props.value.title,config.title);assert.equal(rendered.props.value.association,config.association);assert.equal(rendered.props.children,child);
console.log('PASS: anonymous login profile receives the complete configured archive title and association.');
