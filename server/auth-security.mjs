import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
export const sessionLifetime=43200;
export const hashToken=value=>createHash('sha256').update(value).digest('hex');
export function initializeAuthSecurity(db){db.exec(`CREATE TABLE IF NOT EXISTS linux_sessions(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_linux_sessions_expiry ON linux_sessions(expires);
CREATE INDEX IF NOT EXISTS idx_linux_sessions_account ON linux_sessions(account_id);
CREATE TABLE IF NOT EXISTS linux_auth_limits(id TEXT PRIMARY KEY,expires INTEGER NOT NULL,attempts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_linux_auth_limits_expiry ON linux_auth_limits(expires);
CREATE TABLE IF NOT EXISTS linux_challenge_context(hash TEXT PRIMARY KEY,owner TEXT NOT NULL,source TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_linux_challenge_context_source ON linux_challenge_context(source);
CREATE INDEX IF NOT EXISTS idx_linux_challenge_context_owner ON linux_challenge_context(owner);`)}
export function cleanAuth(db,now=Math.floor(Date.now()/1000)){db.prepare('DELETE FROM linux_sessions WHERE expires<=?').run(now);db.prepare('DELETE FROM linux_auth_limits WHERE expires<=?').run(now);db.prepare('DELETE FROM linux_challenges WHERE expires<=?').run(now);db.prepare('DELETE FROM linux_challenge_context WHERE expires<=? OR hash NOT IN(SELECT hash FROM linux_challenges)').run(now)}
export function authLimitError(retry=60){const message='Zu viele Anmeldeversuche. Bitte '+Math.max(1,Math.ceil(retry))+' Sekunden warten und erneut versuchen.';return Object.assign(Error(message),{publicMessage:message,status:429,retryAfter:Math.max(1,Math.ceil(retry))})}
export function limitAuth(db,source,authenticated=false,now=Math.floor(Date.now()/1000)){
 db.exec('BEGIN IMMEDIATE');try{
 cleanAuth(db,now);const id=(authenticated?'a:':'s:')+hashToken(source),row=db.prepare('SELECT * FROM linux_auth_limits WHERE id=?').get(id);
 if(row){if(row.attempts>=120)throw authLimitError(row.expires-now);db.prepare('UPDATE linux_auth_limits SET attempts=attempts+1 WHERE id=?').run(id)}else{
 if(db.prepare('SELECT count(*) n FROM linux_auth_limits').get().n>=4096||!authenticated&&db.prepare("SELECT count(*) n FROM linux_auth_limits WHERE id LIKE 's:%'").get().n>=3584)throw authLimitError((db.prepare('SELECT min(expires) t FROM linux_auth_limits').get().t||now+60)-now);
 db.prepare('INSERT INTO linux_auth_limits VALUES(?,?,1)').run(id,now+300)}db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e}
}
export function issueSession(db,key,account,now=Math.floor(Date.now()/1000)){
 cleanAuth(db,now);if(!db.prepare('SELECT 1 FROM linux_accounts WHERE id=? AND disabled=0').get(account.id))throw Error('Konto nicht verfügbar.');
 if(db.prepare('SELECT count(*) n FROM linux_sessions WHERE account_id=?').get(account.id).n>=500||db.prepare('SELECT count(*) n FROM linux_sessions').get().n>=50000)throw authLimitError(300);
 const sid=randomBytes(32).toString('base64url'),payload={issuer:'archive-linux-session-v2',sid,subject:account.id,email:account.email,name:account.name,iat:now,exp:now+sessionLifetime};
 db.prepare('INSERT INTO linux_sessions VALUES(?,?,?,?)').run(hashToken(sid),account.id,now,payload.exp);const p=Buffer.from(JSON.stringify(payload)).toString('base64url');return p+'.'+createHmac('sha256',key).update(p).digest('base64url');
}
export function activeSession(db,id,actor,now=Math.floor(Date.now()/1000)){return typeof id==='string'&&!!db.prepare('SELECT 1 FROM linux_sessions s JOIN linux_accounts a ON a.id=s.account_id WHERE s.id=? AND s.account_id=? AND s.expires>? AND a.disabled=0').get(id,actor,now)}
export function revokeSessions(db,actor,id=null){if(id)db.prepare('DELETE FROM linux_sessions WHERE account_id=? AND id=?').run(actor,id);else db.prepare('DELETE FROM linux_sessions WHERE account_id=?').run(actor)}
export function sessionIdentity(req,key,db,now=Math.floor(Date.now()/1000)){
 if(!db||!/^[a-f0-9]{64}$/.test(key||''))return null;const token=req.headers.get('cookie')?.split(';').map(p=>p.trim()).find(p=>p.startsWith('archive_session='))?.slice(16);if(!token||token.length>8192)return null;
 try{const [p,s,...rest]=token.split('.');if(rest.length||!p||!s||!/^[A-Za-z0-9_-]+$/.test(p)||!/^[A-Za-z0-9_-]+$/.test(s))return null;const expected=createHmac('sha256',key).update(p).digest(),provided=Buffer.from(s,'base64url');if(provided.length!==expected.length||!timingSafeEqual(provided,expected))return null;
 const d=JSON.parse(Buffer.from(p,'base64url').toString('utf8'));if(d.issuer!=='archive-linux-session-v2'||typeof d.sid!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(d.sid)||!Number.isInteger(d.iat)||!Number.isInteger(d.exp)||d.exp<=now||d.iat>now+60||d.exp<=d.iat||d.exp-d.iat>sessionLifetime||d.iat<now-sessionLifetime||typeof d.subject!=='string'||!d.subject||d.subject.length>200||typeof d.email!=='string'||d.email.length>250||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))return null;
 cleanAuth(db,now);const id=hashToken(d.sid),row=db.prepare('SELECT s.*,a.disabled FROM linux_sessions s JOIN linux_accounts a ON a.id=s.account_id WHERE s.id=?').get(id);if(!row||row.disabled||row.account_id!==d.subject||row.expires!==d.exp||row.created!==d.iat)return null;
 return {provider:'linux',subject:d.subject,email:d.email,name:typeof d.name==='string'&&d.name.length<=200?d.name:d.email,sessionId:id};
 }catch{return null}
}
