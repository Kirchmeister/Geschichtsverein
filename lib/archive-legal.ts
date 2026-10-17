export type LegalData={operator:string,form:string,street:string,postcode:string,city:string,country:string,email:string,phone:string,representatives:{name:string,role:string}[],representation:string,court:string,register:string,vat:string,editorialName:string,editorialAddress:string,dpoName:string,dpoContact:string,host:string,hostCountry:string,services:string,privacyText:string,privacyFormat:string};
export type LegalPublication={text:string,publishedAt:string,nearbyNotice?:string,contactNotice?:string,privacy?:{before:string,body:string,after:string,markdown:boolean}};
export type LegalSettings={revision:string,draft:LegalData,published:{imprint:LegalPublication|null,privacy:LegalPublication|null}};
export const emptyLegalData:LegalData={operator:'',form:'',street:'',postcode:'',city:'',country:'Deutschland',email:'',phone:'',representatives:[],representation:'',court:'',register:'',vat:'',editorialName:'',editorialAddress:'',dpoName:'',dpoContact:'',host:'',hostCountry:'',services:'',privacyText:'',privacyFormat:'plain'};
export function emptyLegalSettings():LegalSettings{return {revision:'',draft:structuredClone(emptyLegalData),published:{imprint:null,privacy:null}}}
export function validateLegalData(input:unknown):LegalData{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Bitte gültige rechtliche Angaben angeben.');
 const source=input as Record<string,unknown>,result=structuredClone(emptyLegalData);
 for(const key of Object.keys(emptyLegalData).filter(k=>k!=='representatives') as (Exclude<keyof LegalData,'representatives'>)[]){const value=key==='privacyFormat'?(source[key]??'plain'):source[key],limit=key==='privacyText'?40000:['services','representation','editorialAddress','dpoContact'].includes(key)?4000:500;if(typeof value!=='string'||value.length>limit||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value))throw Error('Ungültiges oder zu langes Feld: '+key);result[key]=value.trim()}
 if(!['plain','markdown'].includes(result.privacyFormat))throw Error('Ungültiges Datenschutzformat.');
 if(!Array.isArray(source.representatives)||source.representatives.length>30)throw Error('Höchstens 30 Vertretungsberechtigte angeben.');
 result.representatives=source.representatives.map(row=>{if(!row||typeof row!=='object'||typeof row.name!=='string'||typeof row.role!=='string'||row.name.length>200||row.role.length>200||/[\x00-\x1f]/.test(row.name+row.role))throw Error('Ungültige Vorstandsangaben.');return {name:row.name.trim(),role:row.role.trim()}});
 if(result.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))throw Error('Bitte eine gültige Kontakt-E-Mail angeben.');return result;
}
export function legalMissing(data:LegalData,target:'imprint'|'privacy'){
 const missing:string[]=[];for(const [key,label] of [['operator','Betreibername'],['street','Straße und Hausnummer'],['postcode','Postleitzahl'],['city','Ort'],['country','Land'],['email','Kontakt-E-Mail']] as const)if(!data[key])missing.push(label);
 if(target==='imprint'){if(!data.form)missing.push('Rechtsform');if(!data.representatives.some(row=>row.name))missing.push('Vertretungsberechtigte Person');if(data.representatives.some(row=>!row.name||!row.role))missing.push('Name und Funktion aller Vertretungsberechtigten');if(/e\.?\s*v\.?|eingetragener verein/i.test(data.form)&&(!data.court||!data.register))missing.push('Registergericht und Vereinsregisternummer');if(!!data.court!==!!data.register)missing.push('Registergericht und Registernummer gemeinsam');if(!!data.editorialName!==!!data.editorialAddress)missing.push('Redaktionell Verantwortlicher: Name und Anschrift gemeinsam')}
 else {if(!data.privacyText)missing.push('Geprüfter Text der Datenschutzerklärung');if(!!data.dpoName!==!!data.dpoContact)missing.push('Datenschutzbeauftragter: Name und Kontakt gemeinsam')}
 return missing;
}
export function legalText(data:LegalData,target:'imprint'|'privacy'){
 const address=[data.operator,target==='imprint'?data.form:'',data.street,[data.postcode,data.city].filter(Boolean).join(' '),data.country].filter(Boolean).join('\n');
 if(target==='imprint')return [address,'Kontakt\nE-Mail: '+data.email+(data.phone?'\nTelefon: '+data.phone:''),'Vertretungsberechtigt\n'+data.representatives.map(row=>[row.name,row.role].filter(Boolean).join(' – ')).join('\n'),data.representation&&'Vertretungsregel\n'+data.representation,data.court&&'Registerangaben\n'+data.court+'\n'+data.register,data.vat&&'Umsatzsteuer-Identifikationsnummer\n'+data.vat,data.editorialName&&'Redaktionell verantwortlich\n'+data.editorialName+'\n'+data.editorialAddress].filter(Boolean).join('\n\n');
 return ['Verantwortlicher und Kontakt\n'+address+'\nE-Mail: '+data.email+(data.phone?'\nTelefon: '+data.phone:''),data.dpoName&&'Datenschutzbeauftragter\n'+data.dpoName+'\n'+data.dpoContact,data.privacyText,data.host&&'Hosting\n'+data.host+(data.hostCountry?'\nStandort: '+data.hostCountry:''),data.services&&'Verwendete Dienste\n'+data.services].filter(Boolean).join('\n\n');
}

export function legalPublication(data:LegalData,target:'imprint'|'privacy',publishedAt:string):LegalPublication{
 const text=legalText(data,target);if(target==='imprint')return {text,publishedAt};
 const before=legalText({...data,privacyText:'',host:'',hostCountry:'',services:''},'privacy');
 const after=[data.host&&'Hosting\n'+data.host+(data.hostCountry?'\nStandort: '+data.hostCountry:''),data.services&&'Verwendete Dienste\n'+data.services].filter(Boolean).join('\n\n');
 return {text,publishedAt,privacy:{before,body:data.privacyText,after,markdown:data.privacyFormat==='markdown'}};
}
