import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,rm} from 'node:fs/promises';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const file='.review-version-test.mjs',stubFile='.review-location-test.mjs';
const workerUrl={name:'worker-url',setup(build){build.onResolve({filter:/\?worker&url$/},()=>({path:'worker-url',namespace:'worker-url'}));build.onLoad({filter:/.*/,namespace:'worker-url'},()=>({contents:'export default "/mp3-worker.js"'}))}};
const data={title:'Eingereichter Beitrag',location:{lat:50.18,lon:8.92,label:'Altes Rathaus',approximate:false},description:'**Richard**',descriptionLinks:[{start:2,end:9,reference:'BK-2345-6789-ABCD'}],personTags:[{start:2,end:9,entityId:'11111111-1111-1111-1111-111111111111',name:'Richard',kind:'person'}],sources:'- Archiv\n- Zeitung',interpretation:'*Vermutung*',uncertainty:'> Frage',rights:'[Lizenz](https://example.test/license)',fieldFormats:{description:'markdown',sources:'markdown',interpretation:'markdown',uncertainty:'markdown',rights:'markdown'},files:[{key:'document',name:'Beleg.pdf',type:'application/pdf'}]};
const original=JSON.stringify(data);
try{
 const options={entryPoints:['components/archive/review-version.tsx'],bundle:true,platform:'node',format:'esm',external:['react','react/jsx-runtime'],alias:{'@':process.cwd()},plugins:[workerUrl]};
 await esbuild.build({...options,outfile:file});
 const {ReviewVersion}=await import('../'+file+'?'+Date.now());
 const render=value=>renderToStaticMarkup(createElement(ReviewVersion,{data:value}));
 const html=render(data); // Real location object previously crashed React as an invalid child.
 for(const expected of ['<strong><a','person-tag','/beitrag/BK-2345-6789-ABCD','<ul>','<blockquote>','href="https://example.test/license"','Beleg.pdf'])assert.ok(html.includes(expected),expected);
 assert.ok(!html.includes('Vermutung'));assert.ok(!html.includes('Eigene Interpretation'));
 assert.ok(!/<p[^>]*>\s*<(?:div|p|ul|blockquote)/.test(html),'No block elements nested in paragraphs');
 const plain=render({...data,fieldFormats:undefined,location:null,files:undefined});
 assert.ok(plain.includes('**'));assert.ok(!plain.includes('<strong>'));assert.ok(plain.includes('- Archiv'));assert.ok(!plain.includes('<ul>'));
 assert.doesNotThrow(()=>render({description:'Ohne Standort',files:[]}));
 assert.equal(JSON.stringify(data),original,'Rendering must not modify the submitted data');
 // Verify the exact snapshot location reaches the shared map renderer, even though
 // its real SSR output stays empty until the client loads the map configuration.
 await esbuild.build({...options,outfile:stubFile,plugins:[workerUrl,{name:'location-props',setup(build){build.onResolve({filter:/^\.\/entry-location$/},()=>({path:'location',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'import {createElement} from "react";export function EntryLocationView({value}){return createElement("output",null,JSON.stringify(value))}'}))}}]});
 const stub=await import('../'+stubFile+'?'+Date.now());
 const locationHtml=renderToStaticMarkup(createElement(stub.ReviewVersion,{data}));
 for(const value of ['50.18','8.92','Altes Rathaus','approximate'])assert.ok(locationHtml.includes(value),value);
 const queue=await readFile('components/archive/publication.tsx','utf8');
 assert.ok(queue.includes('<ReviewVersion data={item.data}/>'),'Review uses publication response data');
 console.log('PASS: review opens with location objects; submitted map data, Markdown fields, annotations, files and legacy plain text render without invalid paragraph nesting or mutation.');
}finally{await Promise.all([file,stubFile].map(path=>rm(path,{force:true})))}
