import fs from 'node:fs';
const part=process.argv[2];if(!['major','minor','patch'].includes(part))throw Error('Usage: node scripts/bump-version.mjs major|minor|patch');
const v=JSON.parse(fs.readFileSync('version.json','utf8')),p=JSON.parse(fs.readFileSync('package.json','utf8')),a=v.version.split('.').map(Number),i=['major','minor','patch'].indexOf(part);a[i]++;for(let j=i+1;j<3;j++)a[j]=0;v.version=a.join('.');p.version=v.version;
for(const [name,value] of [['version.json',v],['package.json',p]])fs.writeFileSync(name,JSON.stringify(value,null,2)+'\n');
const file='CHANGELOG.md',text=fs.readFileSync(file,'utf8'),date=new Date().toISOString().slice(0,10);fs.writeFileSync(file,text.replace('## [Unreleased]','## [Unreleased]\n\n## ['+v.version+'] – '+date+'\n\n- Änderungen und Migrationshinweise vor Veröffentlichung ergänzen.'));
console.log('Prepared '+v.version+'. Update release notes, validate, build and commit before publishing.');
