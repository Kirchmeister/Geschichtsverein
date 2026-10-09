export const pushTopics=[
 {id:'message',label:'Neue interne Nachricht',detail:'Wenn Ihnen eine Nachricht, eine Veröffentlichungsanfrage oder eine Mitteilung an alle zugestellt wird.',roles:['user','manager','admin'],default:true},
 {id:'qr',label:'QR-Codes nicht erreichbar',detail:'Nur wenn erstmals ein Problem besteht oder wieder alle Probleme behoben sind.',roles:['user','manager','admin'],default:true},
 {id:'comment',label:'Neue Kommentaranfrage',roles:['manager','admin'],default:true},
 {id:'backup',label:'Fehlerhafte Sicherung',roles:['admin'],default:true},
 {id:'account',label:'Eingeladener Nutzer hat seinen Passkey aktiviert',roles:['admin'],default:true},
 {id:'update',label:'Neues Update verfügbar',roles:['admin'],default:false}
];
export function topicsFor(role){return pushTopics.filter(t=>t.roles.includes(role))}
export function defaultPreferences(role){return Object.fromEntries(topicsFor(role).map(t=>[t.id,t.default]))}
export function canReceive(role,topic){return topicsFor(role).some(t=>t.id===topic)}
