import path from 'node:path';
import {spawn} from 'node:child_process';
// A kernel file lock survives PID namespaces and is released on process/container exit.
export async function acquireUpdateLock(root){
 const child=spawn('flock',['--exclusive','--nonblock',path.join(root,'agent.lock'),'sh','-c','printf "LOCKED\\n"; cat >/dev/null'],{stdio:['pipe','pipe','ignore']});
 await new Promise((resolve,reject)=>{child.once('error',()=>reject(Error('Dateisperre konnte nicht eingerichtet werden.')));child.once('exit',()=>reject(Error('Ein Updater läuft bereits oder die Dateisperre ist nicht verfügbar.')));let output='';child.stdout.on('data',data=>{output+=data;if(output.includes('LOCKED\n'))resolve()})});
 let released=false;const signal=()=>{release();process.exit(0)};
 function release(){if(released)return;released=true;child.stdin.end();process.removeListener('exit',release);process.removeListener('SIGTERM',signal);process.removeListener('SIGINT',signal)}
 child.once('exit',()=>{if(!released)process.exit(1)});process.once('exit',release);process.once('SIGTERM',signal);process.once('SIGINT',signal);return release;
}
