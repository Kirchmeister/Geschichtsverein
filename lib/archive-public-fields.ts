export const publicFieldLabels:Record<string,string>={title:'Titel',category:'Bereich',period:'Zeitraum / Datierung',start:'Beginn (Jahr)',end:'Ende (Jahr)',place:'Ort',description:'Beschreibung',sources:'Quellen und Fundstellen',interpretation:'Eigene Interpretation',uncertainty:'Offene Fragen',rights:'Rechte und Nutzungsbedingungen',tags:'Schlagwörter',status:'Forschungsstatus',images:'Bilder',documents:'Dokumente',audio:'Tonaufnahmen'};
export const defaultPublicFields=['title','category','period','place','description','sources'];

export const guestFieldLabels={...publicFieldLabels,updated:'Bearbeitungsdatum',storagePlaceId:'Aufbewahrungsort',people:'Personen & Familien'};
export const defaultGuestFields=['title','category','period','description'];
