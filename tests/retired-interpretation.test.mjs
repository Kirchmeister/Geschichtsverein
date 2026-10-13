import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {rm,readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {registerArchiveSearch,archiveSearchPlan} from '../server/archive-search.mjs';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]})),file='.retired-interpretation-test.mjs';
try{
 await esbuild.build({stdin:{contents:"export * from './lib/archive-retired-fields';export * from './lib/archive-history';export * from './lib/archive-order.mjs';export * from './lib/archive-query';export * from './lib/archive-public-fields';export {projectPublicEntry} from './lib/archive-public';export {projectGuestEntry} from './lib/archive-guest';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:file,alias:{'@':process.cwd()},plugins:[{name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const env={};'}))}}]});
 const m=await import('../'+file+'?'+Date.now()),old={id:'entry',title:'Visible',description:'Visible text',interpretation:'UNIQUE_HIDDEN_INTERPRETATION',fieldFormats:{interpretation:'markdown',description:'markdown'},files:[]},original=JSON.stringify(old);
 for(const fields of [['title','interpretation'],['interpretation'],['title','description','interpretation']])for(const projected of [m.projectPublicEntry(old,fields),m.projectGuestEntry(old,fields,'ref')]){assert.equal(projected.interpretation,undefined);assert.equal(projected.fieldFormats.interpretation,undefined);assert.ok(!JSON.stringify(projected).includes('UNIQUE_HIDDEN_INTERPRETATION'));assert.ok(!projected.visibleFields?.includes('interpretation'))}
 assert.equal(m.publicFieldLabels.interpretation,undefined);assert.equal(m.guestFieldLabels.interpretation,undefined);
 for(const input of [{title:'Changed',fieldFormats:{}},{title:'Changed',interpretation:'',fieldFormats:{}},{title:'Changed',interpretation:'Replacement',fieldFormats:{interpretation:'plain'}}]){const preserved=m.preserveInterpretation(input,old);assert.equal(preserved.interpretation,old.interpretation);assert.equal(preserved.fieldFormats.interpretation,'markdown')}
 const fresh=m.preserveInterpretation({title:'New',interpretation:'Hidden input',fieldFormats:{interpretation:'markdown'}},null);assert.equal(fresh.interpretation,undefined);assert.equal(fresh.fieldFormats.interpretation,undefined);
 const restored=m.restoreHistoryFields(old,{...old,title:'Older',interpretation:'Different old text'},['title','interpretation']);assert.equal(restored.title,'Older');assert.equal(restored.interpretation,old.interpretation);
 assert.ok(!m.archiveSearchText(old).includes('unique_hidden_interpretation'));assert.ok(m.archiveSearchText(old).includes('visible text'));assert.equal(JSON.stringify(old),original);
 const db=new DatabaseSync(':memory:');try{db.exec('CREATE TABLE entries(id TEXT,data TEXT,deleted INTEGER,updated TEXT);CREATE TABLE entry_references(entry_id TEXT,reference TEXT);CREATE TABLE storage_places(id TEXT,name TEXT);');registerArchiveSearch(db);db.prepare('INSERT INTO entries VALUES(?,?,0,?)').run('entry',JSON.stringify(old),'now');
  for(const fields of [null,['title','interpretation']]){const plan=archiveSearchPlan(m.readArchiveQuery('?suche=UNIQUE_HIDDEN_INTERPRETATION'),fields);assert.equal(db.prepare(`SELECT count(*) AS n ${plan.from} WHERE ${plan.where}`).get(...plan.args).n,0)}
  const plan=archiveSearchPlan(m.readArchiveQuery('?suche=visible'));assert.equal(db.prepare(`SELECT count(*) AS n ${plan.from} WHERE ${plan.where}`).get(...plan.args).n,1);
 }finally{db.close()}
 const page=await readFile('app/page.tsx','utf8'),history=await readFile('components/archive/history.tsx','utf8');assert.ok(!page.includes('Eigene Interpretation'));assert.ok(!page.includes('eigene Deutung'));assert.ok(!history.includes("interpretation:'Interpretation'"));
 console.log('PASS: retired field and format absent from public/guest data and labels, immutable stored value/format on save, no new hidden values or history takeover, both search engines ignore hidden text and source data unchanged.');
}finally{await rm(file,{force:true})}
