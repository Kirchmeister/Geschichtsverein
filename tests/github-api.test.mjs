import assert from 'node:assert/strict';
import {createGitHubFetch} from '../server/github-api.mjs';
import {releaseMetadata} from '../server/release-metadata.mjs';
let time=1000000,calls=0;const replies=[];
const client=createGitHubFetch({now:()=>time,ttl:300000,fetcher:async()=>{calls++;return replies.shift()||new Response('{"ok":true}')}});
const url='https://api.github.com/repos/Example/Archive/releases';
const results=await Promise.all([client(url),client(url),client(url)]);
assert.equal(calls,1);for(const result of results)assert.deepEqual(await result.json(),{ok:true});
await client(url);assert.equal(calls,1);time+=300001;await client(url);assert.equal(calls,2);
await client(url+'?page=2');assert.equal(calls,3);
replies.push(new Response('{}',{status:403,headers:{'x-ratelimit-remaining':'0','x-ratelimit-reset':String((time+120000)/1000)}}));
await assert.rejects(()=>client(url+'/limited'),/Anfragelimit.*Erneut versuchen ab/);const limitedCalls=calls;
await assert.rejects(()=>client(url+'/other'),/Anfragelimit/);assert.equal(calls,limitedCalls);
time+=120001;await client(url+'/limited');assert.equal(calls,limitedCalls+1);
replies.push(new Response('secret server body',{status:403}));await assert.rejects(()=>client(url+'/forbidden'),e=>e.githubRequestFailure&&/verweigert/.test(e.message)&&!e.message.includes('secret server body')&&!e.message.includes('Anfragelimit erreicht'));
await client(url+'/forbidden'); // Failed responses are not cached.
replies.push(new Response('{}',{status:401}));await assert.rejects(()=>client(url+'/token'),/Token prüfen/);
replies.push(new Response('{}',{status:429,headers:{'retry-after':'90'}}));await assert.rejects(()=>client(url+'/retry'),/Anfragelimit/);const retryCalls=calls;time+=60001;await assert.rejects(()=>client(url+'/retry'),/Anfragelimit/);assert.equal(calls,retryCalls);time+=30000;await client(url+'/retry');
const unavailable=createGitHubFetch({fetcher:async()=>{throw Error('private network detail')}});await assert.rejects(()=>unavailable(url),e=>/nicht erreichbar/.test(e.message)&&!e.message.includes('private'));
const limited=createGitHubFetch({fetcher:async()=>new Response('{}',{status:403,headers:{'x-ratelimit-remaining':'0'}})});
await assert.rejects(()=>releaseMetadata('Example/Archive',{tag:'v0.46.1',prerelease:false,draft:false},{},limited),/Anfragelimit/);
const secondary=createGitHubFetch({now:()=>time,fetcher:async()=>new Response(JSON.stringify({message:'You have exceeded a secondary rate limit.'}),{status:403})});await assert.rejects(()=>secondary(url),/Anfragelimit/);
// Validate the updater image's local import closure without needing a Docker daemon.
const fs=await import('node:fs/promises'),path=await import('node:path');
const docker=await fs.readFile('Dockerfile.updater','utf8'),files=new Set(docker.split('\n').filter(line=>line.startsWith('COPY ')).flatMap(line=>line.split(/\s+/).slice(1,-1))),visited=new Set();
async function inspect(file){if(visited.has(file))return;visited.add(file);assert.ok(files.has(file),'Updater image is missing '+file);const code=await fs.readFile(file,'utf8');for(const match of code.matchAll(/from ['"](\.[^'"]+)['"]/g))await inspect(path.posix.normalize(path.posix.join(path.posix.dirname(file),match[1])))}
await inspect('server/update-agent.mjs');
console.log('PASS: cache expiration/isolation, concurrent reads, confirmed limits and cooldown, safe non-limit diagnostics, failed-response retry, metadata failure propagation.');
