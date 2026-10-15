import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const result=await esbuild.build({entryPoints:['lib/archive-push-browser.ts'],bundle:true,platform:'node',format:'cjs',write:false,plugins:[{name:'api',setup(b){b.onResolve({filter:/archive-api$/},()=>({path:'api',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const archiveRequest=(...args)=>globalThis.request(...args);'}))}}]});
let state,sub,registered,fail,blocked,subscribeCount,registerCount,permissionCalls,events;const memory=new Map(),requests=[];
const subscription=()=>({endpoint:'https://push.test/current',toJSON(){return {endpoint:this.endpoint}},async unsubscribe(){sub=null;return true}});
const registration={pushManager:{async getSubscription(){return sub},async subscribe(){subscribeCount++;sub=subscription();return sub}}};
const scope={module:{exports:{}},Uint8Array,atob,Event,Notification:{permission:'granted',requestPermission(){permissionCalls++;throw Error('must not prompt')}},window:{isSecureContext:true,PushManager:{},Notification:{},dispatchEvent(){events++}},navigator:{serviceWorker:{async getRegistration(){return registration},async register(){registerCount++;return registration}}},localStorage:{getItem(k){if(blocked)throw Error();return memory.get(k)??null},setItem(k,v){if(blocked)throw Error();memory.set(k,v)},removeItem(k){if(blocked)throw Error();memory.delete(k)}},async request(url,options){requests.push({url,options});if(fail)throw Error('offline');if(!options)return {...state};const data=JSON.parse(options.body);if(data.action==='device-status')return {registered};if(data.action==='restore-device'){registered=true;return state}throw Error(data.action)}};
vm.runInNewContext(result.outputFiles[0].text,scope);const m=scope.module.exports;
function reset(){memory.clear();requests.length=0;state={available:true,enabled:true,accountId:'A',deviceRevision:'0',publicKey:'AQ'};sub=null;registered=false;fail=false;blocked=false;subscribeCount=0;registerCount=0;permissionCalls=0;events=0;scope.Notification.permission='granted'}
reset();assert.equal(await m.recoverPushBrowser(),'');assert.equal(subscribeCount,0,'account opt-in alone never subscribes a new browser');
m.rememberPushBrowser(state);assert.equal(await m.recoverPushBrowser(),'');assert.equal(subscribeCount,1);assert.equal(events,1);assert.equal(requests.filter(r=>r.options&&JSON.parse(r.options.body).action==='restore-device').length,1);assert.equal(permissionCalls,0);
sub=null;registered=false;await m.recoverPushBrowser();assert.equal(subscribeCount,2,'lost browser subscription repaired');
registered=false;await m.recoverPushBrowser();assert.equal(subscribeCount,2,'existing subscription re-synchronized without duplication');
state.accountId='B';sub=null;await m.recoverPushBrowser();assert.equal(subscribeCount,2,'another account never inherits opt-in');state.accountId='A';
state.enabled=false;await m.recoverPushBrowser();assert.equal(memory.size,0);state.enabled=true;sub=null;await m.recoverPushBrowser();assert.equal(subscribeCount,2,'disabled choice cannot silently return');
m.rememberPushBrowser(state);state.deviceRevision='new';await m.recoverPushBrowser();assert.equal(subscribeCount,2);assert.equal(memory.size,0,'server reset clears stale marker');
reset();sub=subscription();registered=false;await m.recoverPushBrowser();assert.equal(memory.size,0,'foreign or unknown browser endpoint cannot be adopted');registered=true;await m.recoverPushBrowser();assert.equal(memory.size,1,'verified existing device migrates');assert.equal(subscribeCount,0);
for(const permission of ['denied','default']){scope.Notification.permission=permission;assert.match(await m.recoverPushBrowser(),/Browserfreigabe/);assert.equal(permissionCalls,0)}
reset();m.rememberPushBrowser(state);fail=true;await assert.rejects(m.recoverPushBrowser());assert.equal(memory.size,1,'temporary network failure preserves decision');fail=false;await m.recoverPushBrowser();assert.equal(subscribeCount,1);
reset();blocked=true;await m.recoverPushBrowser();assert.equal(subscribeCount,0,'blocked storage is safe');
reset();m.rememberPushBrowser(state);const queued=m.recoverPushBrowser();let explicit=false;await m.changePushBrowser(async()=>{explicit=true});await queued;assert.ok(explicit);assert.equal(requests.length,0,'explicit logout/disable invalidates queued recovery');
reset();m.rememberPushBrowser(state);m.forgetPushBrowser(state);await m.recoverPushBrowser();assert.equal(subscribeCount,0);assert.equal(permissionCalls,0);
console.log('PASS: account-bound persistent opt-in, safe migration, missing subscriptions/server records repaired, no duplicate subscription, disabled/reset/foreign-account guards, denied/default never prompted, offline retry, storage failure and explicit-action cancellation.');
