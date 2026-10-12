import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,rm} from 'node:fs/promises';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]})),file='.entry-map-reader-test.mjs';
try{
 await esbuild.build({stdin:{contents:"export * from './lib/archive-entry-map';export * from './lib/archive-entry-location';export * from './lib/archive-history';export * from './components/archive/entry-reader-toolbar';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:file});
 const m=await import('../'+file+'?'+Date.now());
 for(const preference of [undefined,'default','osm','ohm']){
  assert.equal(m.entryMapProvider(preference,{enabled:false,provider:'both'}),null);
  assert.equal(m.entryMapProvider(preference,{enabled:true,provider:'osm'}),'osm');
  assert.equal(m.entryMapProvider(preference,{enabled:true,provider:'ohm'}),'ohm');
  assert.equal(m.entryMapProvider(preference,{enabled:true,provider:'both'}),preference==='ohm'?'ohm':'osm');
 }
 assert.equal(m.entryMapProvider('ohm',null),null);assert.equal(m.entryMapProvider('osm',{enabled:true,provider:'unknown'}),null);
 const location={lat:50,lon:8,label:'Fundort',approximate:false};
 assert.equal(m.normalizeEntryLocation(location).mapProvider,undefined);
 for(const mapProvider of ['default','osm','ohm'])assert.equal(m.normalizeEntryLocation({...location,mapProvider}).mapProvider,mapProvider);
 for(const mapProvider of [null,42,'both','invalid'])assert.throws(()=>m.normalizeEntryLocation({...location,mapProvider}));
 assert.equal(m.historyFieldEqual('location',{location},{location:{...location,mapProvider:'ohm'}}),false);
 assert.equal(m.restoreHistoryFields({location},{location:{...location,mapProvider:'ohm'}},['location']).location.mapProvider,'ohm');
 let edited=0,closed=0;const props={canEdit:true,busy:false,onEdit:()=>edited++,onClose:()=>closed++};
 const toolbar=m.EntryReaderToolbar(props);toolbar.props.children[0].props.onClick();toolbar.props.children[1].props.onClick();assert.equal(edited,1);assert.equal(closed,1);
 const html=renderToStaticMarkup(createElement(m.EntryReaderToolbar,props));assert.match(html,/Eintrag bearbeiten/);assert.match(html,/aria-label="Beitrag schließen"/);
 const guest=renderToStaticMarkup(createElement(m.EntryReaderToolbar,{...props,canEdit:false}));assert.ok(!guest.includes('Eintrag bearbeiten'));assert.ok(guest.includes('Beitrag schließen'));
 const busy=m.EntryReaderToolbar({...props,busy:true});assert.equal(busy.props.children[0].props.disabled,true);assert.equal(busy.props.children[1].props.disabled,undefined);
 const page=await readFile('app/page.tsx','utf8'),css=await readFile('app/globals.css','utf8');
 assert.ok(page.includes('showCloseButton={false}><EntryReaderToolbar'));assert.ok(page.includes('onEdit={editDetail} onClose={()=>setDetail(null)}/><div className="entry-reader-scroll" tabIndex={0}'));
 assert.ok(page.includes('onClick={editDetail}>Eintrag bearbeiten</button>'));
 assert.match(css,/\.editor\.entry-reader\{display:flex;flex-direction:column;overflow:hidden!important/);assert.match(css,/\.entry-reader-toolbar\{[^}]*flex:0 0 auto/);assert.match(css,/\.entry-reader-scroll\{overflow-y:auto;min-height:0/);
 console.log('PASS: provider availability/default/fallback matrix, legacy/validated storage and history, reader close/edit actions, guest and busy guards, toolbar outside the scrolling body.');
}finally{await rm(file,{force:true})}
