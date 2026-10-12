export const versionPattern=/^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-beta\.([1-9]\d*))?$/;
export function compareVersions(a,b){const x=String(a).match(versionPattern),y=String(b).match(versionPattern);if(!x||!y)throw Error('Ungültige Versionsnummer.');for(let i=1;i<=3;i++)if(+x[i]!==+y[i])return +x[i]-+y[i];if(!x[4]&&!y[4])return 0;if(!x[4])return 1;if(!y[4])return -1;return +x[4]-+y[4]}
export function releaseChannel(r){return /-beta\.[1-9]\d*$/.test(r.tag)&&r.prerelease===true?'beta':/^v\d+\.\d+\.\d+$/.test(r.tag)&&r.prerelease===false?'stable':null}
export function directCompatibility(current,target,serviceVersion){
 const p=target.compatibility,v=target.version;
 if(target.metadataError)return {ok:false,reason:target.metadataError};
 if(!p||p.policyVersion!==1||!Array.isArray(p.supportedSources)||!v||!target.commit||target.branchVerified!==true)return {ok:false,reason:'Geprüfte Kompatibilitätsangaben oder Branch-Zuordnung fehlen.'};
 if(!versionPattern.test(v.version)||v.version!==target.tag.slice(1)||v.prerelease!==(releaseChannel(target)==='beta'))return {ok:false,reason:'Kanal oder Versionsmetadaten passen nicht.'};
 if(compareVersions(v.version,current.version)<=0)return {ok:false,reason:'Kein neuerer Versionsstand; Downgrades sind gesperrt.'};
 if(!Number.isInteger(v.databaseSchemaVersion)||v.databaseSchemaVersion<current.databaseSchemaVersion||v.backupFormatVersion!==current.backupFormatVersion)return {ok:false,reason:'Schema oder Backupformat ist nicht kompatibel.'};
 if(!versionPattern.test(p.minimumServiceVersion||'')||compareVersions(serviceVersion,p.minimumServiceVersion)<0)return {ok:false,reason:'Separaten Update-Dienst zuerst auf mindestens '+p.minimumServiceVersion+' aktualisieren.'};
 const supported=p.supportedSources.some(s=>s&&versionPattern.test(s.minimumVersion||'')&&versionPattern.test(s.maximumVersion||'')&&compareVersions(current.version,s.minimumVersion)>=0&&compareVersions(current.version,s.maximumVersion)<=0&&Number.isInteger(s.minimumSchema)&&Number.isInteger(s.maximumSchema)&&current.databaseSchemaVersion>=s.minimumSchema&&current.databaseSchemaVersion<=s.maximumSchema&&current.backupFormatVersion===s.backupFormatVersion&&(!s.sourceChannel||s.sourceChannel===(current.prerelease?'beta':'stable')));
 return supported?{ok:true,reason:'Kompatibler Ausgangsstand; Migration wird vorab isoliert geprüft.'}:{ok:false,reason:'Dieser Ausgangsstand ist nicht als unterstützter Migrationspfad freigegeben.'};
}
export function updatePath(current,target,releases,{allowBeta=false,serviceVersion='0.0.0'}={}){
 const allowed=releases.filter(r=>!r.draft&&releaseChannel(r)&&(!r.prerelease||allowBeta));
 if(target.prerelease&&!allowBeta)return {compatible:false,path:[],reason:'Beta-Updates sind deaktiviert.'};
 const queue=[{version:current,path:[]}],seen=new Set([current.version]);
 while(queue.length){const step=queue.shift();for(const r of allowed){if(compareVersions(r.tag,target.tag)>0||!directCompatibility(step.version,r,serviceVersion).ok)continue;const next=[...step.path,r.tag];if(r.tag===target.tag)return {compatible:next.length===1,path:next,reason:next.length===1?'Direktes Update nach isolierter Migrationsprüfung möglich.':'Zwischenversionen erforderlich: '+next.join(' → ')};if(!seen.has(r.tag)){seen.add(r.tag);queue.push({version:r.version,path:next})}}}
 return {compatible:false,path:[],reason:directCompatibility(current,target,serviceVersion).reason};
}
