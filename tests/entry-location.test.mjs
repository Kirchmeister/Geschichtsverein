import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
async function load(file){const b=await esbuild.build({entryPoints:[file],bundle:true,platform:'node',format:'cjs',write:false});const s={module:{exports:{}}};vm.runInNewContext(b.outputFiles[0].text,s);return s.module.exports}
const {normalizeEntryLocation,locationText}=await load('lib/archive-entry-location.ts'),{historyFieldEqual,restoreHistoryFields}=await load('lib/archive-history.ts');
const location={lat:50,lon:8,label:' Fundort ',approximate:true};assert.equal(normalizeEntryLocation(null),null);assert.equal(normalizeEntryLocation(undefined),null);assert.equal(normalizeEntryLocation(location).label,'Fundort');assert.equal(normalizeEntryLocation({...location,secret:'discard'}).secret,undefined);
for(const bad of [{...location,lat:NaN},{...location,lon:Infinity},{...location,lat:91},{...location,lon:181},{...location,lat:'50'},{...location,label:'a\n'},{...location,approximate:'true'},[]])assert.throws(()=>normalizeEntryLocation(bad));
assert.match(locationText(location),/Lage ungefähr/);assert.equal(historyFieldEqual('location',{location},{location:{...location}}),true);assert.equal(historyFieldEqual('location',{location},{location:{...location,approximate:false}}),false);assert.equal(restoreHistoryFields({location,title:'Aktuell'},{},['location']).location,null);const restored=restoreHistoryFields({location:null,title:'Aktuell'},{location,title:'Früher'},['location']);assert.equal(restored.title,'Aktuell');assert.equal(restored.location.label,location.label);
console.log('PASS: strict location validation, unknown-field removal, meaningful history comparison and targeted restore/removal.');
