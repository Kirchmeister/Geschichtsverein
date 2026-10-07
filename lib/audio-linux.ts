// Native Webpack worker entry. Keep conversion behavior aligned with audio.ts.

export async function toMp3(blob:Blob){
 const context=new AudioContext({sampleRate:44100});
 let decoded:AudioBuffer;
 try{decoded=await context.decodeAudioData(await blob.arrayBuffer())}catch{throw Error('Dieses Audioformat kann der Browser nicht umwandeln. Bitte eine MP3- oder WAV-Datei hochladen.')}finally{await context.close()}
 if(decoded.duration>900)throw Error('Der MP3-Export unterstützt bis zu 15 Minuten. Die Originaldatei können Sie weiterhin herunterladen.');
 const channels=Array.from({length:Math.min(decoded.numberOfChannels,2)},(_,i)=>decoded.getChannelData(i).slice());
 return new Promise<Blob>((resolve,reject)=>{const worker=new Worker(new URL('./mp3-worker.ts',import.meta.url),{type:'module'});const timer=setTimeout(()=>{worker.terminate();reject(Error('Die Umwandlung dauert zu lange. Bitte eine kürzere Aufnahme verwenden.'))},120000);worker.onmessage=e=>{clearTimeout(timer);worker.terminate();if(e.data.error)reject(Error(e.data.error));else resolve(new Blob(e.data.chunks,{type:'audio/mpeg'}))};worker.onerror=()=>{clearTimeout(timer);worker.terminate();reject(Error('Die MP3-Umwandlung konnte nicht gestartet werden.'))};worker.postMessage({channels},channels.map(c=>c.buffer))});
}
export function downloadAudio(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
