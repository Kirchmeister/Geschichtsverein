import assert from 'node:assert/strict';
import {invokeUpdateDriver,updateBuildTimeout,updateDriverTimeout,updateOutputLimit,updateFailureKind} from '../server/update-process.mjs';
const cfg={driver:'/app/server/docker-update-driver.mjs',dataRoot:'/data',configRoot:'/config'};
const calls=[];await invokeUpdateDriver(cfg,'prepare','/release',undefined,undefined,async(...args)=>{calls.push(args);return {stdout:''}});
assert.equal(calls[0][2].timeout,61*60*1000);assert.ok(calls[0][2].timeout>updateBuildTimeout);assert.equal(calls[0][2].maxBuffer,updateOutputLimit);assert.equal(updateDriverTimeout('migrate'),16*60*1000);
for(const [error,match] of [[{killed:true,signal:'SIGTERM'},/Zeitlimit.*60 Minuten/],[{code:'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'},/Prozessausgabe/],[{stderr:'ARCHIVE_UPDATE_ERROR:TIMEOUT\npassword SECRET'},/Zeitlimit/],[{stderr:'no space left on device SECRET'},/Speicherplatz/],[{code:1,stderr:'password SECRET'},/Docker-Build fehlgeschlagen/]]){
 await assert.rejects(invokeUpdateDriver(cfg,'prepare','/release',undefined,undefined,async()=>{throw error}),e=>{assert.match(e.message,match);assert.ok(!e.message.includes('SECRET'));return true});
}
assert.equal(updateFailureKind({code:1,stderr:'build failed'}),'COMMAND_FAILED');
for(const [stderr,message] of [['Backup uses a newer database schema',/neueres/],['Integrity check failed: files/0',/beschädigt/],['Unsupported or unsafe archive member',/unterstützte/]])await assert.rejects(invokeUpdateDriver(cfg,'restore-stage','/release',undefined,undefined,async()=>{throw {stderr}}),message);
console.log('PASS: Build/supervisor deadlines coordinated; timeout, output limit, disk-full and generic failures classified without leaking raw process output.');
