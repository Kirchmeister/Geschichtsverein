import {versionPattern,releaseChannel} from './update-compatibility.mjs';
const project='history-archive-93898d63-9fa0-46d9-b31d-e9af7736f2d6';
export async function releaseMetadata(repository,release,headers,fetcher=fetch){
 async function api(suffix){const r=await fetcher('https://api.github.com/repos/'+repository+suffix,{headers,redirect:'error',signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Kompatibilitätsprüfung nicht verfügbar (HTTP '+r.status+').');const text=await r.text();if(text.length>2*1024*1024)throw Error('Metadatenantwort zu groß.');return JSON.parse(text)}
 try{if(!releaseChannel(release)||!versionPattern.test(release.tag))throw Error('Kein gültiges versioniertes Release.');const commit=await api('/commits/'+encodeURIComponent(release.tag));if(!/^[a-f0-9]{40}$/.test(commit.sha))throw Error('Release-Commit fehlt.');
 const values={};for(const file of ['version.json','docs/update-contract.json','docs/update-compatibility.json']){const data=await api('/contents/'+file+'?ref='+commit.sha);if(data.type!=='file'||data.encoding!=='base64'||data.size>100000)throw Error('Kompatibilitätsdatei fehlt oder ist ungültig.');values[file]=JSON.parse(Buffer.from(data.content,'base64').toString('utf8'))}
 const contract=values['docs/update-contract.json'];if(contract.projectId!==project||contract.updateProtocol!==1)throw Error('Projektkennung oder Updateprotokoll ist unbekannt.');
 const branch=release.prerelease?'development':'main',comparison=await api('/compare/'+commit.sha+'...'+branch);if(!['ahead','identical'].includes(comparison.status))throw Error('Release gehört nicht zum vorgesehenen '+branch+'-Branch.');
 return {...release,commit:commit.sha,branchVerified:true,version:values['version.json'],compatibility:values['docs/update-compatibility.json']};
 }catch(e){if(e.githubRequestFailure)throw e;return {...release,metadataError:String(e.message).slice(0,300)}}
}
