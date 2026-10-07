import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const source=readFileSync('dist/client/_next/static/'+readdirSync('dist/client/_next/static').find(p=>p.startsWith('mp3-worker-')),'utf8');
for(const count of [1,2]){let result;const self={postMessage:r=>result=r};runInNewContext(source,{self,console,Float32Array,Int16Array,Int32Array,Uint8Array,Uint16Array,Uint32Array,Int8Array,Float64Array,ArrayBuffer});self.onmessage({data:{channels:Array.from({length:count},()=>Float32Array.from({length:44100},(_,i)=>Math.sin(i*2*Math.PI*440/44100)*.2))}});assert.ok(!result.error);const path='/workspace/scratch/5c79ac5eb2e8/worker-test-'+count+'.mp3';writeFileSync(path,Buffer.concat(result.chunks.map(b=>Buffer.from(b))));const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,sample_rate,channels','-of','json',path]));assert.equal(metadata.streams[0].codec_name,'mp3');assert.equal(metadata.streams[0].channels,count);assert.equal(metadata.streams[0].sample_rate,'44100');}
console.log('PASS: built MP3 worker produces decodable mono and stereo MP3 files.');
// Exercise the emitted converter itself: the original bug only appeared after bundling.
const client=readdirSync('dist/client/_next/static/chunks').filter(p=>p.startsWith('page-')).map(p=>readFileSync('dist/client/_next/static/chunks/'+p,'utf8')).find(s=>s.includes('new AudioContext'));
const workerVariable=/new Worker\(new URL\((\w+),window\.location\.origin\)/.exec(client)?.[1];
assert.ok(workerVariable,'The published worker must resolve against the website origin, never a build-time file URL.');
const workerPath=new RegExp(workerVariable+'=[`"\']([^`"\']+)[`"\']').exec(client)?.[1];
assert.ok(workerPath);assert.ok(readFileSync('dist/client'+workerPath).length);
const start=client.search(/async function \w+\(\w+\)\{let \w+=new AudioContext/),end=client.indexOf('}function ',start)+1;
assert.ok(start>=0&&end>start);
let loadedUrl,terminated=false;
class TestWorker {
 constructor(url){loadedUrl=url;assert.equal(url.origin,'https://archive.test');assert.equal(url.pathname,workerPath);this.self={postMessage:data=>queueMicrotask(()=>this.onmessage({data}))};runInNewContext(source,{self:this.self,console,Float32Array,Int16Array,Int32Array,Uint8Array,Uint16Array,Uint32Array,Int8Array,Float64Array,ArrayBuffer});}
 postMessage(data){this.self.onmessage({data})}
 terminate(){terminated=true}
}
class TestAudioContext {
 async decodeAudioData(){return {duration:1,numberOfChannels:1,getChannelData:()=>Float32Array.from({length:44100},(_,i)=>Math.sin(i*2*Math.PI*440/44100)*.2)}}
 async close(){}
}
const converter=runInNewContext('('+client.slice(start,end)+')',{[workerVariable]:workerPath,Worker:TestWorker,AudioContext:TestAudioContext,window:{location:{origin:'https://archive.test'}},URL,Blob,setTimeout,clearTimeout,Float32Array});
const mp3=await converter(new Blob(['test audio']));assert.equal(mp3.type,'audio/mpeg');assert.ok(mp3.size>1000);assert.ok(loadedUrl);assert.ok(terminated);
console.log('PASS: published converter loads its worker from the HTTPS site and completes MP3 conversion.');
