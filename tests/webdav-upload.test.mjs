import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {createHash,webcrypto} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const files=new Map();
const server=createServer(async(req,res)=>{
 const key=req.url;
 if(req.method==='MKCOL'){res.writeHead(201);res.end();return}
 if(req.method==='PUT'){const chunks=[];for await(const chunk of req)chunks.push(chunk);files.set(key,Buffer.concat(chunks));res.writeHead(201);res.end();return}
 if(req.method==='GET'){if(!files.has(key)){res.writeHead(404);res.end();return}res.end(files.get(key));return}
 if(req.method==='DELETE'){files.delete(key);res.writeHead(204);res.end();return}
 res.writeHead(405);res.end();
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const exports={};
const localFetch=(url,options)=>fetch('http://127.0.0.1:'+server.address().port+new URL(url).pathname,options);
vm.runInNewContext(ts.transpileModule(readFileSync('lib/archive-system-settings.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({env:{ARCHIVE_SETTINGS_KEY:'ab'.repeat(32)}}),crypto:webcrypto,Uint8Array,TextEncoder,TextDecoder,URL,ReadableStream,AbortSignal,fetch:localFetch,btoa,unescape,encodeURIComponent,structuredClone});
try{
 const settings={url:'https://cloud.example.test/remote.php/dav/files/test/',folder:'Backup Ordner',username:'test',password:await exports.sealSecret('test-password')};
 assert.ok(await exports.testWebdav(settings));assert.equal(files.size,0);
 const value=Buffer.from('Archive file data\n'.repeat(100000));
 const stream=new ReadableStream({start(c){for(let i=0;i<value.length;i+=4096)c.enqueue(value.subarray(i,i+4096));c.close()}});
 assert.equal((await exports.davRequest(settings,'files/0','PUT',stream)).status,201);
 const response=await exports.davRequest(settings,'files/0','GET');
 const restored=Buffer.from(await response.arrayBuffer());assert.equal(restored.length,value.length);assert.equal(createHash('sha256').update(restored).digest('hex'),createHash('sha256').update(value).digest('hex'));
 const table=JSON.stringify([{id:'entry-test'}]);assert.equal((await exports.davRequest(settings,'tables/entries.json','PUT',new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(table));c.close()}}))).status,201);assert.equal(await (await exports.davRequest(settings,'tables/entries.json','GET')).text(),table);
 console.log('PASS: WebDAV connection test, streamed file and table upload, real Node HTTP transport, byte count and SHA-256 readback.');
}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
