import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {randomUUID} from 'node:crypto';
import {ZipFile} from 'yazl';
import {pipeline} from 'node:stream/promises';
import {createWriteStream} from 'node:fs';
import {entryPdf} from './entry-pdf.mjs';
import {pdfFilename} from './export-names.mjs';
export const exportRoot=()=>path.join(os.tmpdir(),'history-archive-exports');
const valid=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
const folder=id=>{if(!valid(id))throw Error('Ungültiger Export.');return path.join(exportRoot(),id)};
const write=async(dir,name,value)=>{const temp=path.join(dir,name+'.tmp');await fs.writeFile(temp,JSON.stringify(value),{mode:0o600});await fs.rename(temp,path.join(dir,name))};
export async function cleanExports(){await fs.mkdir(exportRoot(),{recursive:true,mode:0o700});for(const name of await fs.readdir(exportRoot())){if(!valid(name))continue;const dir=folder(name);try{if((await fs.stat(dir)).mtimeMs<Date.now()-3600000)await fs.rm(dir,{recursive:true,force:true})}catch(e){if(e.code!=='ENOENT')throw e}}}
export async function createExport(owner,role,fields,entries,options){await cleanExports();const all=await fs.readdir(exportRoot());if(all.length>=10)throw Error('Zu viele aktive Exporte. Bitte später erneut versuchen.');if(!entries.length||entries.length>5000)throw Error('Bitte 1 bis 5000 Beiträge auswählen. Größere Bestände in Teilmengen exportieren.');let own=0;for(const id of all){if(!valid(id))continue;try{if(JSON.parse(await fs.readFile(path.join(folder(id),'job.json'),'utf8')).owner===owner)own++}catch{}}if(own>=2)throw Error('Bitte einen laufenden Export zuerst beenden.');const id=randomUUID(),dir=folder(id);await fs.mkdir(dir,{mode:0o700});const job={id,owner,role,fields,options,created:new Date().toISOString(),total:entries.length,done:0,files:[],errors:[],warnings:[],state:'running'};await write(dir,'entries.json',entries);await write(dir,'job.json',job);return job}
export async function exportJob(id,owner,role,fields){await cleanExports();const dir=folder(id);let job;try{job=JSON.parse(await fs.readFile(path.join(dir,'job.json'),'utf8'))}catch{throw Error('Export abgelaufen oder nicht verfügbar.')}if(job.owner!==owner||job.role!==role||JSON.stringify(job.fields)!==JSON.stringify(fields))throw Error('Dieser Export ist für die aktuelle Anmeldung nicht verfügbar.');return {job,dir}}
export const publicJob=job=>({id:job.id,state:job.state,total:job.total,done:job.done,errors:job.errors,warnings:job.warnings,created:job.created,files:job.files.length});
export async function advanceExport(context,{loadImage,validate=()=>{}}){const {job,dir}=context;if(job.state!=='running')return publicJob(job);let lock;try{lock=await fs.open(path.join(dir,'lock'),'wx',0o600)}catch{throw Error('Export wird bereits verarbeitet. Bitte kurz warten.')}
 try{Object.assign(job,JSON.parse(await fs.readFile(path.join(dir,'job.json'),'utf8')));if(job.state!=='running')return publicJob(job);const entries=JSON.parse(await fs.readFile(path.join(dir,'entries.json'),'utf8'));if(job.done<job.total){const e=entries[job.done];try{await validate(e);const {buffer,warnings}=await entryPdf(e,{...job.options,exportedAt:job.created,loadImage});const filename=pdfFilename(e.title,job.files.map(file=>file.name));const sizes=await Promise.all((await fs.readdir(dir)).map(async name=>(await fs.stat(path.join(dir,name))).size));if(sizes.reduce((a,b)=>a+b,0)+buffer.length>512*1024*1024)throw Error('Export überschreitet 512 MB. Bitte kleinere Teilmengen wählen.');await fs.writeFile(path.join(dir,filename),buffer,{mode:0o600});job.files.push({name:filename,title:e.title,reference:e.reference});job.warnings.push(...warnings.map(message=>({title:e.title,message})))}catch{job.errors.push({reference:e.reference,title:e.title,message:'Beitrag konnte nicht vollständig exportiert werden. Bitte einzeln prüfen.'})}job.done++;await write(dir,'job.json',job)}
  if(job.done===job.total){if(!job.files.length)job.state='failed';else if(job.total===1)job.state='complete';else{
    const index=['Archivexport',job.created,'Stand: '+(job.options.mode==='published'?'Veröffentlichte Fassung':'Aktueller Bearbeitungsstand'),'','Beiträge:',...job.files.map(f=>[f.reference,f.title,f.name].join('\t')),'','Fehler:',...job.errors.map(e=>e.title+': '+e.message),'','Hinweise:',...job.warnings.map(w=>w.title+': '+w.message)].join('\n');
    const listing={title:'Inhaltsverzeichnis des Archivexports',reference:'Inhaltsverzeichnis',description:index,files:[]},overview=await entryPdf(listing,{...job.options,maxPages:1000,exportedAt:job.created});await fs.writeFile(path.join(dir,'Inhaltsverzeichnis.pdf'),overview.buffer,{mode:0o600});await fs.writeFile(path.join(dir,'Inhaltsverzeichnis.txt'),index,{mode:0o600});
    const zip=new ZipFile();for(const f of job.files)zip.addFile(path.join(dir,f.name),f.name);zip.addFile(path.join(dir,'Inhaltsverzeichnis.pdf'),'Inhaltsverzeichnis.pdf');zip.addFile(path.join(dir,'Inhaltsverzeichnis.txt'),'Inhaltsverzeichnis.txt');const output=pipeline(zip.outputStream,createWriteStream(path.join(dir,'Archivexport.zip'),{mode:0o600}));zip.end();await output;job.state='complete';
   }await write(dir,'job.json',job)}return publicJob(job);
 }finally{await lock.close();await fs.unlink(path.join(dir,'lock')).catch(()=>{})}
}
export async function cancelExport(context){await fs.rm(context.dir,{recursive:true,force:true})}
export function exportFilename(job){return job.total===1?job.files[0]?.name:'Archivexport.zip'}
