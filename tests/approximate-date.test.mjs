import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {rm,readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]})),file='.approximate-date-test.mjs';
try{
 await esbuild.build({stdin:{contents:"export * from './lib/archive-date';export * from './lib/archive-order.mjs';export * from './lib/archive-history';export {projectPublicEntry,publicTimelineDate} from './lib/archive-public';export {projectGuestEntry} from './lib/archive-guest';export * from './components/archive/public-profile';export * from './components/archive/guest-entry';export * from './components/archive/review-version';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,alias:{'@':process.cwd()},plugins:[{name:'browser-dependencies',setup(build){build.onResolve({filter:/\?worker&url$/},()=>({path:'worker',namespace:'fixture'}));build.onResolve({filter:/^cloudflare:workers$/},()=>({path:'cloudflare',namespace:'fixture'}));build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='worker'?'export default "/mp3-worker.js"':'export const env={};'}))}}]});
 const m=await import('../'+file+'?'+Date.now());
 assert.equal(m.normalizeApproximateDate(undefined),false);assert.equal(m.normalizeApproximateDate(false),false);assert.equal(m.normalizeApproximateDate(true),true);
 for(const value of [null,'true','false',0,1,[],{}])assert.throws(()=>m.normalizeApproximateDate(value));
 for(const text of ['1520','0','-100','1520–1530','16. Jahrhundert']){assert.equal(m.formatApproximateDate(text,true),'ca. '+text);assert.equal(m.formatApproximateDate(text,false),text)}
 for(const text of ['ca. 1520','ca.1520','CA. 1520','circa 1520'])assert.equal(m.formatApproximateDate(text,true),text);
 for(const value of ['',undefined,null,'  '])assert.equal(m.formatApproximateDate(value,true),'');
 const data={id:'date',title:'Beitrag',category:'Ereignis',period:'',start:'1520',end:'1530',isApproximateDate:true,files:[]};
 const original=JSON.stringify(data);assert.equal(m.entryDateText(data),'ca. 1520–1530');assert.equal(m.entryDateText({...data,period:'ca. 16. Jahrhundert'}),'ca. 16. Jahrhundert');assert.equal(m.entryDateText({...data,start:'',end:''}),'Undatiert');assert.equal(m.entryDateText(data,[]),'Undatiert');assert.equal(m.entryDateText(data,['end']),'ca. 1530');
 assert.equal(m.formatDateField('start','1520',data),'ca. 1520');assert.equal(m.formatDateField('title','1520',data),'1520');assert.equal(m.publicTimelineDate(data,['start','end']),'ca. 1520–1530');assert.equal(m.publicTimelineDate(data,['title']),'Undatiert');
 const projected=m.projectPublicEntry(data,['title','start']);assert.equal(projected.start,'1520');assert.equal(projected.end,undefined);assert.equal(projected.isApproximateDate,true);
 for(const fields of [[],['title'],['period']]){assert.equal(m.projectPublicEntry(data,fields).isApproximateDate,undefined);assert.equal(m.projectGuestEntry(data,fields,'ref').isApproximateDate,undefined)}
 assert.equal(m.projectGuestEntry(data,['start','end'],'ref').isApproximateDate,true);
 const legacy={...data,isApproximateDate:undefined};assert.equal(m.projectPublicEntry(legacy,['start']).isApproximateDate,false);assert.equal(m.publicTimelineDate(legacy,['start','end']),'1520–1530');
 for(const [Component,props] of [[m.PublicEntry,{entry:data,fields:['title','start','end']}],[m.GuestEntry,{entry:{...data,visibleFields:['title','start','end']}}],[m.ReviewVersion,{data}]]){const html=renderToStaticMarkup(createElement(Component,props));assert.ok(html.includes('ca. 1520'));assert.ok(html.includes('ca. 1530'));assert.ok(!html.includes('ca. ca.'));}
 const noDate=renderToStaticMarkup(createElement(m.ReviewVersion,{data:{...data,start:'',end:''}}));assert.ok(!noDate.includes('ca.'));
 assert.equal(m.historyFieldEqual('isApproximateDate',legacy,{...data,isApproximateDate:false}),true);assert.equal(m.historyFieldEqual('start',data,legacy),false);
 const restored=m.restoreHistoryFields(data,legacy,['start']);assert.equal(restored.isApproximateDate,false);assert.equal(restored.start,'1520');assert.equal(restored.end,'1530');assert.equal(m.restoreHistoryFields(data,legacy,['title']).isApproximateDate,true);assert.equal(m.restoreHistoryFields(legacy,data,['isApproximateDate']).isApproximateDate,true);
 const dates=[{id:'1',title:'A',start:'1520'},{id:'2',title:'B',start:'1521',isApproximateDate:true},{id:'3',title:'C',start:'1522'}];
 for(const direction of ['Datierung: älteste zuerst','Datierung: neueste zuerst'])assert.deepEqual(m.sortArchive(dates,direction).map(d=>d.id),m.sortArchive(dates.map(d=>({...d,isApproximateDate:!d.isApproximateDate})),direction).map(d=>d.id));
 assert.deepEqual(m.sortArchive(dates,'Datierung: älteste zuerst').map(d=>d.id),['1','2','3']);
 for(const range of [['1521','1521'],['1522',''],['','1519']])assert.equal(m.matchesArchiveYears(dates[1],...range),m.matchesArchiveYears({...dates[1],isApproximateDate:false},...range));assert.equal(m.matchesArchiveYears(dates[1],'1522','1522'),false);
 assert.equal(m.archiveSearchText(dates[1]),m.archiveSearchText({...dates[1],isApproximateDate:false}));assert.ok(m.archiveSearchText(dates[1]).includes('1521'));assert.ok(!m.archiveSearchText(dates[1]).includes('isapproximatedate'));
 assert.equal(JSON.stringify(data),original);assert.deepEqual(JSON.parse(original),data);
 const page=await readFile('app/page.tsx','utf8');assert.ok(page.includes('checked={edit.isApproximateDate===true}'));assert.ok(page.includes('entryDateText(detail'));assert.ok((await readFile('components/archive/archive-browser.tsx','utf8')).includes('entryDateText(entry)'));
 console.log('PASS: strict/default flag, single circa prefix, empty/negative/zero/range dates, all readers, field privacy, approved timeline display, history/restore, raw search and unchanged chronological sorting/filtering.');
}finally{await Promise.all([file,'.approximate-date-test.css'].map(path=>rm(path,{force:true})))}
