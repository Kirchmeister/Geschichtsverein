import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export async function publishReleases({repository,sha,token,request=fetch,version=JSON.parse(fs.readFileSync('version.json','utf8')),changelog=fs.readFileSync('CHANGELOG.md','utf8'),baseline=JSON.parse(fs.readFileSync('releases/baseline.json','utf8'))}){
 if(!/^[\w.-]+\/[\w.-]+$/.test(repository)||!/^[a-f0-9]{40}$/.test(sha)||!token)throw Error('Missing release environment.');
 const base='https://api.github.com/repos/'+repository;
 async function api(path,method='GET',data){const r=await request(base+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'},...(data?{body:JSON.stringify(data)}:{})});if(r.status===404&&method==='GET')return null;if(!r.ok)throw Error('GitHub release request failed: HTTP '+r.status);return r.json();}
 function notes(v){const marker='## ['+v+']',start=changelog.indexOf(marker);if(start<0)throw Error('Missing release notes.');const end=changelog.indexOf('\n## [',start+marker.length);return changelog.slice(start,end<0?undefined:end).trim();}
 for(const r of [{...baseline,prerelease:true},{version:version.version,sha,prerelease:version.prerelease}]){
  const tag='v'+r.version,existing=await api('/releases/tags/'+tag);if(existing){console.log('Release '+tag+' exists; preserved.');continue;}
  // Never move an existing tag to a different commit.
  const ref=await api('/git/ref/tags/'+tag);if(ref&&ref.object.sha!==r.sha)throw Error('Tag '+tag+' points to another commit; no release changed.');
  const result=await api('/releases','POST',{tag_name:tag,target_commitish:r.sha,name:tag,body:notes(r.version),draft:false,prerelease:r.prerelease,make_latest:r.prerelease?'false':'true'});
  console.log('Published '+result.html_url);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await publishReleases({repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA,token:process.env.GITHUB_TOKEN});
