import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const modules=[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))];
const mf=new Miniflare({modules,modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{ARCHIVE_BOOTSTRAP_ADMIN_EMAIL:'admin@example.test',ARCHIVE_INITIAL_PLACE:'Testort',ARCHIVE_INITIAL_ASSOCIATION:'Testverein'},d1Databases:['DB'],r2Buckets:['BUCKET']});
const admin={'oai-authenticated-user-id':'admin','oai-authenticated-user-email':'admin@example.test'},user={'oai-authenticated-user-id':'visitor','oai-authenticated-user-email':'visitor@example.test'},manager={'oai-authenticated-user-id':'manager','oai-authenticated-user-email':'manager@example.test'};
const call=(identity={},data,origin='https://archive.test')=>mf.dispatchFetch('https://archive.test/api/design',{method:data?'POST':'GET',headers:{...identity,...(data?{Origin:origin,'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
try{
 const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const s of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(s.trim())await db.prepare(s).run();
 let publicConfig=await (await call()).json();assert.deepEqual(publicConfig,{theme:'sage',version:'0.2.0'});
 await db.prepare('INSERT INTO archive_users(id,identity_provider,identity_subject,display_name,role,created) VALUES(?,?,?,?,?,?)').bind('manager','chatgpt','manager','Test Manager','manager',new Date().toISOString()).run();
 for(const role of [{},user,manager,{...admin,'x-archive-preview-role':'manager'}])assert.ok([401,403].includes((await call(role,{theme:'wine',expectedTheme:'sage'})).status));
 assert.equal((await call(admin,{theme:'wine',expectedTheme:'sage'},'https://other.test')).status,403);
 assert.equal((await call(admin,{theme:'invalid',expectedTheme:'sage'})).status,400);
 const systemData='{"domain":"https://example.org","smtp":{"password":"encrypted-private"}}';await db.prepare('INSERT INTO archive_settings VALUES(?,?,?,?)').bind('system_settings',systemData,new Date().toISOString(),'admin').run();
 let r=await call(admin,{theme:'wine',expectedTheme:'sage'});assert.equal(r.status,200);publicConfig=await (await call()).json();assert.deepEqual(publicConfig,{theme:'wine',version:'0.2.0'});assert.equal((await db.prepare("SELECT data FROM archive_settings WHERE key='system_settings'").first()).data,systemData);
 assert.equal((await call(admin,{theme:'coastal',expectedTheme:'sage'})).status,409);
 r=await mf.dispatchFetch('https://archive.test/');assert.equal(r.status,200);assert.match(await r.text(),/data-archive-theme="wine"/);
 for(const theme of ['coastal','petrol','plum','ochre','sage']){r=await call(admin,{theme,expectedTheme:publicConfig.theme});assert.equal(r.status,200);publicConfig=await (await call()).json();assert.equal(publicConfig.theme,theme);}
 console.log('PASS: default theme, admin-only mutation, preview/origin guards, stale-write rejection, secret isolation, all presets and initial server-rendered palette.');
}finally{await mf.dispose()}
