import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {constants} from 'node:fs';
const stage=await fs.mkdtemp(path.resolve('.update-test-package-'));
try{
 const copy={recursive:true,verbatimSymlinks:true,mode:constants.COPYFILE_FICLONE};
 await fs.cp('.next-linux/standalone',stage,copy);
 await fs.cp('.next-linux/static',path.join(stage,'.next-linux/static'),copy);
 for(const dir of ['server','scripts','drizzle','public'])await fs.cp(dir,path.join(stage,dir),copy);
 await fs.copyFile('version.json',path.join(stage,'version.json'));
 const child=spawn(process.execPath,['tests/linux-http.test.mjs'],{env:{...process.env,ARCHIVE_TEST_STANDALONE_ROOT:stage,HOSTNAME:'invalid-container-hostname'},stdio:'inherit'});
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve)});if(code!==0)throw Error('Packaged Linux runtime test failed.');
 console.log('PASS: isolated standalone package starts through the Docker entry script; packaged configuration, health, roles and backup export work.');
}finally{await fs.rm(stage,{recursive:true,force:true})}
