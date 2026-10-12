import {compareVersions,versionPattern} from '../server/update-compatibility.mjs';
export const minimumUpdaterVersion='0.35.0';
export function updateReadiness(state:any,target?:any){
 const appVersion=state?.appVersion||state?.currentVersion||null,serviceVersion=state?.serviceVersion||null;
 let required=minimumUpdaterVersion;const specified=target?.compatibility?.minimumServiceVersion;
 if(typeof specified==='string'&&versionPattern.test(specified)&&compareVersions(specified,required)>0)required=specified;
 const base={appVersion,serviceVersion,requiredServiceVersion:required,canInstall:false};
 if(!state)return {...base,status:'loading',label:'Status wird geprüft',message:'App und Update-Dienst werden getrennt geprüft.'};
 if(state.connectionStatus==='unreachable')return {...base,status:'unreachable',label:'Update-Dienst nicht erreichbar',message:'Verbindung zuerst prüfen. Nicht auf Verdacht Container oder Daten löschen.'};
 if(!state.enabled)return {...base,status:'unconfigured',label:'Update-Dienst noch nicht eingerichtet',message:state.reason||'Die App kann laufen, bevor der separate Update-Dienst eingerichtet ist.'};
 if(state.job?.recoveryError||state.job?.status==='error')return {...base,status:'recovery',label:'Wiederherstellung zuerst abschließen',message:'Kein Dienstwechsel und kein neues Update, solange die Wiederherstellung offen ist.'};
 if(state.busy||state.job&&!['complete','rolled_back'].includes(state.job.status))return {...base,status:'running',label:'Ein Vorgang läuft',message:'Update-Dienst jetzt nicht ersetzen. Fortschritt oder Wiederherstellung abwarten.'};
 if(typeof serviceVersion!=='string'||!versionPattern.test(serviceVersion))return {...base,status:'unknown',label:'Dienstversion nicht ermittelbar',message:'Die Dienstversion über SSH ermitteln. Eine fehlende Versionsangabe bedeutet nicht, dass der Dienst aktuell ist.'};
 if(compareVersions(serviceVersion,required)<0||!state.features?.compatibility||!state.features?.betaChannels)return {...base,status:'upgrade',label:'Update-Dienst zuerst erneuern',message:'Installiert: '+serviceVersion+'. Erforderlich: mindestens '+required+'. Ein App-Update erneuert diesen Dienst nicht.'};
 if(target&&target.compatible!==true)return {...base,status:'blocked',label:target.path?.length>1?'Zwischenversionen erforderlich':'Direktes App-Update gesperrt',message:target.reason||'Kompatibilität noch nicht bestätigt.'};
 return {...base,status:'ready',label:'Bereit',message:'Der Update-Dienst erfüllt die Anforderungen'+(target?' für '+target.tag:' der aktuellen Oberfläche')+'. Unterschiedliche App- und Dienstversionen sind zulässig.',canInstall:true};
}
export function operatorGuideUrl(state:any){const repository=typeof state?.repository==='string'&&/^[\w.-]+\/[\w.-]+$/.test(state.repository)?state.repository:'Kirchmeister/Geschichtsverein';const version=state?.appVersion;const ref=typeof version==='string'&&versionPattern.test(version)?'v'+version:'main';return 'https://github.com/'+repository+'/blob/'+ref+'/docs/betreiber-anleitung.md'}
export function operatorPrompt(state:any,target?:any){const r=updateReadiness(state,target);return `Begleite mich Schritt für Schritt beim Betrieb des digitalen Geschichtsarchivs aus https://github.com/${state?.repository&&/^[\w.-]+\/[\w.-]+$/.test(state.repository)?state.repository:'Kirchmeister/Geschichtsverein'}.
Ich habe SSH-Zugriff, aber wenig Linux- und Docker-Erfahrung. Lies zuerst die aktuelle README und docs/betreiber-anleitung.md sowie docs/server-updates.md dieses Repositorys.
Ermittelter Stand: Archiv-App ${r.appVersion||'unbekannt'}, Update-Dienst ${r.serviceVersion||'unbekannt'}, erforderlicher Dienst mindestens ${r.requiredServiceVersion}${target?' für '+target.tag:''}.
Erkläre App und Update-Dienst getrennt. Prüfe zunächst Betriebssystem, vorhandene Dienste, Container, Pfade, Sicherungen und den Update-Status mit ausschließlich lesenden Befehlen. Errate keine Container- oder Mountnamen.
Gib mir jeweils nur einen kleinen Befehlsblock, erkläre Zweck und erwartete Ausgabe und warte auf meine Rückmeldung. Fordere keine Passwörter, privaten SSH-Schlüssel, Tokens oder vollständigen Konfigurationsdateien an.
Lass bestehende Serverdienste unverändert. Vor Änderungen brauche ich eine vollständige Sicherung, einen geprüften Rückweg und die Bestätigung, dass kein Update oder Restore läuft. Beachte erforderliche Dienst- und Zwischenversionen. Ersetze einen Updater nur mit überprüfter Konfiguration und behalte den alten Container als Rückfallmöglichkeit. Kein automatisches Downgrade und keine automatische Selbsterneuerung des Updaters.
Hilf mir abschließend, beide Versionen, Anmeldung, Beiträge, Dateien und Sicherungen zu prüfen.`}
