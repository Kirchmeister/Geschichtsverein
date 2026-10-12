import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import vm from 'node:vm';
import {writeFile,rm} from 'node:fs/promises';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const file='.markdown-test-module.mjs';
try{
 await esbuild.build({stdin:{contents:`export * from './lib/archive-markdown';export * from './lib/archive-history';export * from './components/archive/markdown-text';export * from './components/archive/linked-description';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:file,external:['react','react/jsx-runtime'],alias:{'@':process.cwd()}});
 const m=await import('../'+file+'?v='+Date.now());
 const html=text=>renderToStaticMarkup(require('react').createElement(m.MarkdownText,{text}));
 const rendered=html('## Titel\n\n**Fett** und *kursiv*\n\n- Eins\n- Zwei\n\n> Zitat\n\n| A | B |\n| --- | --- |\n| 1 | 2 |');for(const tag of ['h3','strong','em','ul','blockquote','table','th','td'])assert.ok(rendered.includes('<'+tag),tag);
 const unsafe=html('[X](javascript:alert(1))\n\n<script>alert(1)</script>\n\n![Bild](https://example.test/private.png)');assert.ok(!unsafe.includes('href="javascript:'));assert.ok(!unsafe.includes('<script>'));assert.ok(!unsafe.includes('<img'));assert.ok(unsafe.includes('&lt;script&gt;'));
 for(const url of ['javascript:alert(1)','data:text/html,x','//evil.test','\\\\evil.test','https://example.test/\n'])assert.equal(m.safeMarkdownUrl(url),null);assert.equal(m.safeMarkdownUrl('https://example.test/path'),'https://example.test/path');
 const text='**Richard** &amp; Familie',reference='BK-2345-6789-ABCD';let linked=renderToStaticMarkup(require('react').createElement(m.MarkdownText,{text,links:[{start:2,end:9,reference}],tags:[{start:2,end:9,entityId:'11111111-1111-1111-1111-111111111111',name:'Richard',kind:'person'}]}));assert.match(linked,/<strong><a/);assert.match(linked,/person-tag/);assert.match(linked,/&amp; Familie/);assert.match(linked,/\/beitrag\/BK-/);
 linked=renderToStaticMarkup(require('react').createElement(m.LinkedDescription,{text:'**bleibt Klartext**',markdown:false}));assert.ok(linked.includes('**bleibt Klartext**'));assert.ok(!linked.includes('<strong>'));
 assert.deepEqual(m.fieldFormats(undefined),{});assert.throws(()=>m.fieldFormats({title:'markdown'}));assert.equal(m.markdownPlain('**Text** und [Link](https://example.test)'),'Text und Link');
 const old={description:'Text',sources:'Quelle',fieldFormats:{}},now={...old,fieldFormats:{description:'markdown',sources:'markdown'}};assert.equal(m.historyFieldEqual('description',old,now),false);const restored=m.restoreHistoryFields(now,old,['description']);assert.deepEqual(restored.fieldFormats,{sources:'markdown'});
 console.log('PASS: Markdown blocks/GFM tables, safe links, escaped HTML/no images, source-position annotations, legacy plain text, format validation and targeted history restore.');
}finally{await rm(file,{force:true})}
