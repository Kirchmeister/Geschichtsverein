import {createHmac,randomUUID} from 'node:crypto';
import {createChallenge,verifySolution} from 'altcha-lib';
import {deriveKey} from 'altcha-lib/algorithms/sha';
import {validMailbox} from './smtp-service.mjs';
const error=(message,status=400,retryAfter)=>Object.assign(Error(message),{publicMessage:message,status,retryAfter});
const transaction=(db,fn)=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}};
export function cleanContact(db,now){
 db.prepare('DELETE FROM archive_contact_challenges WHERE expires<=?').run(now);
 db.prepare('DELETE FROM archive_contact_limits WHERE expires<=?').run(now);
 db.prepare("DELETE FROM archive_contact_outbox WHERE created<? OR (state='sent' AND next_at<?)").run(now-7*86400,now-86400);
}
export function contactService(db,{secret,source='unknown',now=()=>Math.floor(Date.now()/1000)}){
 if(!/^[a-f0-9]{64}$/.test(secret||''))throw error('Kontaktformular derzeit nicht verfügbar.',503);
 const hash=value=>createHmac('sha256',secret).update('contact:'+value).digest('hex');
 function limit(kind,max,period){transaction(db,()=>{const time=now();cleanContact(db,time);const key=hash(kind+':'+source+':'+Math.floor(time/86400)),row=db.prepare('SELECT * FROM archive_contact_limits WHERE id=?').get(key);if(row&&row.attempts>=max)throw error('Zu viele Kontaktversuche. Bitte später erneut versuchen.',429,row.expires-time);if(!row&&db.prepare('SELECT count(*) n FROM archive_contact_limits').get().n>=4096)throw error('Kontaktformular stark ausgelastet. Bitte später erneut versuchen.',429,60);if(row)db.prepare('UPDATE archive_contact_limits SET attempts=attempts+1 WHERE id=?').run(key);else db.prepare('INSERT INTO archive_contact_limits VALUES(?,?,1)').run(key,time+period)})}
 return {
  async challenge(){limit('challenge',20,900);const id=randomUUID(),time=now(),sourceHash=hash(source+':'+Math.floor(time/86400));
   const challenge=await createChallenge({algorithm:'SHA-256',cost:1,keyPrefix:'0000',expiresAt:time+300,data:{id},deriveKey,hmacSignatureSecret:hash('signing')});
   transaction(db,()=>{cleanContact(db,time);if(db.prepare('SELECT count(*) n FROM archive_contact_challenges').get().n>=1000||db.prepare('SELECT count(*) n FROM archive_contact_challenges WHERE source=?').get(sourceHash).n>=20)throw error('Bitte vor einer neuen Prüfung kurz warten.',429,60);db.prepare('INSERT INTO archive_contact_challenges VALUES(?,?,?,?)').run(id,JSON.stringify(challenge),sourceHash,time+300)});return challenge;
  },
  async submit(input,recipient){limit('submit',8,900);if(!validMailbox(recipient))throw error('Kontaktformular derzeit nicht verfügbar.',503);
   const text=(key,max,required=true)=>{const v=input[key];if(typeof v!=='string'||v.length>max||(required&&!v.trim())||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v))throw error('Bitte die Formularfelder prüfen.');return v.trim()};
   const name=text('name',150,false),email=text('email',250),topic=text('topic',30),message=text('message',10000);if(!validMailbox(email)||/[\r\n]/.test(name)||!['Allgemeine Anfrage','Impressum','Datenschutz'].includes(topic)||input.website)throw error('Die Nachricht konnte nicht angenommen werden. Bitte die Angaben prüfen.');
   if(typeof input.altcha!=='string'||input.altcha.length>12000)throw error('Bitte den Spamschutz erneut bestätigen.');let payload;try{payload=JSON.parse(Buffer.from(input.altcha,'base64').toString('utf8'))}catch{throw error('Bitte den Spamschutz erneut bestätigen.')}
   const id=payload?.challenge?.parameters?.data?.id,row=typeof id==='string'?db.prepare('SELECT * FROM archive_contact_challenges WHERE id=?').get(id):null;
   // Only verify our exact, bounded challenge: never execute attacker-selected work factors.
   if(!row||row.expires<=now()||row.source!==hash(source+':'+Math.floor(now()/86400))||JSON.stringify(payload.challenge)!==row.data)throw error('Spamschutz abgelaufen oder ungültig. Bitte erneut prüfen.');
   let valid=false;try{valid=(await verifySolution({challenge:JSON.parse(row.data),solution:payload.solution,deriveKey,hmacSignatureSecret:hash('signing')})).verified}catch{}if(!valid)throw error('Bitte den Spamschutz erneut bestätigen.');
   return transaction(db,()=>{const time=now();cleanContact(db,time);if(db.prepare('SELECT count(*) n FROM archive_contact_outbox WHERE created>?').get(time-3600).n>=300||db.prepare('SELECT count(*) n FROM archive_contact_outbox').get().n>=500)throw error('Kontaktformular stark ausgelastet. Bitte später erneut versuchen.',429,900);
    if(!db.prepare('DELETE FROM archive_contact_challenges WHERE id=? AND expires>?').run(id,time).changes)throw error('Diese Prüfung wurde bereits verwendet. Bitte erneut prüfen.');
    const job=randomUUID(),data={to:recipient,replyTo:email,subject:'Kontaktformular: '+topic,text:[topic,'Name: '+(name||'Nicht angegeben'),'Antwortadresse: '+email,'',message].join('\n')};
    db.prepare("INSERT INTO archive_contact_outbox(id,data,state,next_at,created) VALUES(?,?,'pending',?,?)").run(job,JSON.stringify(data),time,time);return {accepted:true};
   });
  }
 };
}
export function contactDeliveryStatus(db){return db.prepare('SELECT id,state,attempts,created FROM archive_contact_outbox ORDER BY created DESC LIMIT 50').all()}
export async function deliverContact(db,{send,ready,now=()=>Math.floor(Date.now()/1000),limit=2}){
 cleanContact(db,now());let sent=0;
 for(let i=0;i<limit;i++){
  const job=transaction(db,()=>{const time=now(),row=db.prepare("SELECT * FROM archive_contact_outbox WHERE state IN ('pending','retry','sending') AND next_at<=? ORDER BY created LIMIT 1").get(time);if(!row)return null;if(!ready)return null;if(row.attempts>=5){db.prepare("UPDATE archive_contact_outbox SET state='failed',lease=NULL WHERE id=?").run(row.id);return null}const lease=randomUUID();db.prepare("UPDATE archive_contact_outbox SET state='sending',attempts=attempts+1,lease=?,next_at=? WHERE id=?").run(lease,time+120,row.id);return {...row,lease,attempts:row.attempts+1}});if(!job)break;
  const data=JSON.parse(job.data);let state='sent';try{await send(data.to,data.subject,data.text,data.replyTo);sent++}catch{state=job.attempts>=5?'failed':'retry'}
  db.prepare('UPDATE archive_contact_outbox SET state=?,data=?,lease=NULL,next_at=? WHERE id=? AND lease=?').run(state,state==='sent'?'{}':job.data,now()+(state==='sent'?0:60*2**job.attempts),job.id,job.lease);
 }return {sent};
}
