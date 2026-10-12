import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {rm} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]})),file='.image-captions-test.mjs';
try{
 await esbuild.build({stdin:{contents:"export * from './lib/archive-image-caption';export * from './lib/archive-file-upload';export * from './lib/archive-history';export * from './components/archive/entry-image';export * from './components/archive/guest-entry';export * from './components/archive/public-profile';export * from './components/archive/review-version';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,external:['react','react/jsx-runtime'],alias:{'@':process.cwd()},plugins:[{name:'worker-url',setup(build){build.onResolve({filter:/\?worker&url$/},()=>({path:'worker-url',namespace:'worker-url'}));build.onLoad({filter:/.*/,namespace:'worker-url'},()=>({contents:'export default "/mp3-worker.js"'}))}}]});
 const m=await import('../'+file+'?'+Date.now());
 for(const value of [undefined,null,'',' \n\t ',42,'x'.repeat(501)])assert.throws(()=>m.imageCaption(value));
 assert.equal(m.imageCaption('  Rathaus um 1900  '),'Rathaus um 1900');assert.equal(m.imageCaption('x'.repeat(500)).length,500);
 const image={key:'11111111-1111-4111-8111-111111111111',name:'PRIVATE_FILENAME.png',type:'image/png',caption:'Rathaus <script>alert(1)</script>'};
 const entry={id:'entry',title:'Beitrag',files:[image],visibleFields:['title','images']};
 for(const [Component,props] of [[m.EntryImage,{file:image}],[m.EntryImage,{file:image,publicOnly:true}],[m.GuestEntry,{entry}],[m.PublicEntry,{entry,fields:['title','images']}],[m.ReviewVersion,{data:entry}]]){
  const html=renderToStaticMarkup(createElement(Component,props));const figure=html.match(/<figure[\s\S]*?<\/figure>/)?.[0];assert.ok(figure);assert.ok(figure.includes('<figcaption>Rathaus &lt;script&gt;'));assert.ok(!figure.includes('<a'));assert.ok(!figure.includes('href'));assert.ok(!figure.includes('PRIVATE_FILENAME'));assert.ok(!figure.includes('<script>'));
 }
 const old=renderToStaticMarkup(createElement(m.EntryImage,{file:{...image,caption:undefined}}));assert.ok(old.includes('<img'));assert.ok(!old.includes('<figcaption'));assert.ok(!old.includes('PRIVATE_FILENAME'));
 m.validateImageCaptions([{type:'application/pdf'}]);assert.throws(()=>m.validateImageCaptions([image,{...image,caption:' '}]),/jedes Bild/);
 const before={files:[{...image,caption:'Früher'}]},after={files:[image]};assert.equal(m.historyFieldEqual('files',before,after),false);assert.equal(m.restoreHistoryFields(after,before,['files']).files[0].caption,'Früher');
 const pending=[{id:'first',file:new File(['one'],'1.png',{type:'image/png'}),caption:'Erstes Bild'},{id:'second',file:new File(['two'],'2.png',{type:'image/png'}),caption:' '}];
 let attached=[],done=[];
 await assert.rejects(m.uploadFileBatch(pending,async f=>attached.push(f.name),id=>done.push(id)),/jedes Bild/);assert.deepEqual(attached,[]);assert.deepEqual(done,[]);
 pending[1].caption='Zweites Bild';
 await assert.rejects(m.uploadFileBatch(pending,async(f,caption)=>{if(f.name==='2.png')throw Error('Uploadfehler');attached.push([f.name,caption])},id=>done.push(id)),/Uploadfehler/);assert.deepEqual(done,['first']);assert.deepEqual(attached,[['1.png','Erstes Bild']]);
 await m.uploadFileBatch(pending.filter(p=>!done.includes(p.id)),async(f,caption)=>attached.push([f.name,caption]),id=>done.push(id));assert.deepEqual(done,['first','second']);assert.deepEqual(attached,[['1.png','Erstes Bild'],['2.png','Zweites Bild']]);
 let pdfCaption='unset';await m.uploadFileBatch([{id:'pdf',file:new File(['pdf'],'d.pdf',{type:'application/pdf'}),caption:''}],async(_f,caption)=>pdfCaption=caption,()=>{});assert.equal(pdfCaption,undefined);
 console.log('PASS: required individual captions, length/whitespace guards, preflight validation, retry without duplicate uploads, caption-only unlinked images in all readers, legacy images, escaping and version restore.');
}finally{await Promise.all([file,'.image-captions-test.css'].map(path=>rm(path,{force:true})))}
