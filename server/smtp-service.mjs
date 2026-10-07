import nodemailer from 'nodemailer';
export function validMailbox(value){return typeof value==='string'&&value.length<=250&&/^[^\s@<>;,\r\n]+@[^\s@<>;,\r\n]+\.[^\s@<>;,\r\n]+$/.test(value)}
export async function sendSmtp(settings,message){
 if(!settings||typeof settings.host!=='string'||!settings.host.trim()||/[\s\/@\x00-\x1f]/.test(settings.host)||!Number.isInteger(settings.port)||settings.port<1||settings.port>65535||!['tls','starttls'].includes(settings.tls)||!validMailbox(settings.from)||!validMailbox(message.to)||/[\r\n]/.test(settings.sender||'')||/[\r\n]/.test(message.subject||''))throw Error('Bitte SMTP-Server, Port, Absender und Zieladresse prüfen.');
 if(settings.username&&!settings.password)throw Error('Bitte das SMTP-Passwort hinterlegen.');
 const transport=nodemailer.createTransport({host:settings.host.trim(),port:settings.port,secure:settings.tls==='tls',requireTLS:settings.tls==='starttls',auth:settings.username?{user:settings.username,pass:settings.password}:undefined,tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:8000,disableFileAccess:true,disableUrlAccess:true,logger:false,debug:false});
 let timer;try{
 const result=await Promise.race([transport.sendMail({from:{name:settings.sender||'',address:settings.from},to:message.to,subject:message.subject,text:message.text,disableFileAccess:true,disableUrlAccess:true}),new Promise((_,reject)=>{timer=setTimeout(()=>{transport.close();reject(Object.assign(Error('timeout'),{code:'ETIMEDOUT'}))},22000)})]);
 if(!result.accepted?.length||result.rejected?.length)throw Object.assign(Error('rejected'),{code:'EENVELOPE'});
 return {accepted:true};
 }catch(e){const messages={EAUTH:'SMTP-Anmeldung fehlgeschlagen. Benutzername und Passwort prüfen.',ETIMEDOUT:'SMTP-Verbindung hat zu lange gedauert. Server, Port und Firewall prüfen.',ECONNECTION:'SMTP-Server nicht erreichbar. Adresse und Port prüfen.',ESOCKET:'Die sichere SMTP-Verbindung konnte nicht aufgebaut werden. TLS-Modus und Zertifikat prüfen.',ETLS:'Der Server bietet die erforderliche TLS-Verschlüsselung nicht an.',EENVELOPE:'Der SMTP-Server hat Absender oder Zieladresse abgewiesen.',EMESSAGE:'Der SMTP-Server hat die Nachricht abgewiesen.'};throw Error(messages[e.code]||'SMTP-Versand fehlgeschlagen. Serverkonfiguration und TLS-Zertifikat prüfen.');
 }finally{clearTimeout(timer);transport.close()}
}
