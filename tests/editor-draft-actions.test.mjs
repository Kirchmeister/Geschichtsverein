import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const result=await esbuild.build({entryPoints:['lib/archive-editor-actions.ts'],bundle:true,platform:'node',format:'cjs',write:false});
const moduleScope={module:{exports:{}}};vm.runInNewContext(result.outputFiles[0].text,moduleScope);
const {focusEditorTitle,discardLocalDraft}=moduleScope.module.exports;
let prevented=false,focused=0;const title={focus(options){focused++;assert.equal(options.preventScroll,true)}};
focusEditorTitle({preventDefault(){prevented=true}},title);assert.equal(prevented,true);assert.equal(focused,1);assert.doesNotThrow(()=>focusEditorTitle({preventDefault(){}},null));
const page=readFileSync('app/page.tsx','utf8'),handler=page.match(/^function discardDraft\(\).*$/m)[0];
assert.ok(page.includes('onOpenAutoFocus={event=>focusEditorTitle(event,editorTitleRef.current)}'));assert.ok(page.includes('<DialogTitle ref={editorTitleRef} tabIndex={-1}>'));assert.ok(page.includes('onClick={discardDraft}>Entwurf verwerfen</button>'));
const keys=['history-archive-unsaved-entry-v1','bruchkoebel-unsaved-entry-v1'];
function run({confirmed=true,busy=false,audioWorking=false,storageError=false,edit={title:'Ungesichert'}}={}){
 const memory=new Map(keys.map(key=>[key,'draft']));memory.set('unrelated','keep');const changes={};let confirmations=0;
 const scope={edit,busy,audioWorking,DRAFT_KEY:keys[0],LEGACY_DRAFT_KEY:keys[1],discardLocalDraft,sessionStorage:{removeItem(key){if(storageError)throw Error('Storage unavailable');memory.delete(key)}},window:{confirm(message){confirmations++;assert.match(message,/gespeicherte Beitrag bleibt unverändert/);return confirmed}},archiveRequest(){throw Error('Discard must never call the server')}};
 for(const key of ['SaveChoiceOpen','Edit','Draft','DraftWarning','FormError','Notice'])scope['set'+key]=value=>changes[key]=value;
 vm.runInNewContext(handler+'\ndiscardDraft();',scope);return {memory,changes,confirmations};
}
let r=run({confirmed:false});assert.equal(r.confirmations,1);assert.equal(r.memory.size,3);assert.deepEqual(r.changes,{});
r=run();assert.equal(r.confirmations,1);assert.equal(r.memory.has(keys[0]),false);assert.equal(r.memory.has(keys[1]),false);assert.equal(r.memory.get('unrelated'),'keep');assert.equal(r.changes.Edit,null);assert.equal(r.changes.Draft,null);assert.equal(r.changes.SaveChoiceOpen,false);assert.match(r.changes.Notice,/nichts geändert/);
for(const guard of [{busy:true},{audioWorking:true},{edit:null}]){r=run(guard);assert.equal(r.confirmations,0);assert.equal(r.memory.size,3);assert.deepEqual(r.changes,{})}
r=run({storageError:true});assert.equal(r.memory.size,3);assert.equal(r.changes.Edit,undefined);assert.equal(r.changes.Draft,undefined);assert.match(r.changes.FormError,/Eingaben bleiben geöffnet/);
assert.ok(page.includes('onClick={()=>setEdit(null)}>Abbrechen</button>'),'Ordinary cancellation keeps the draft');
console.log('PASS: title-only initial focus, confirmed/cancelled discard, both draft keys cleared, unrelated storage retained, no server writes, busy/audio guards, storage failure retains editor and ordinary cancellation preserves draft.');
