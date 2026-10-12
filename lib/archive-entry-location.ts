import type {EntryMapProvider} from './archive-entry-map';
export type EntryLocation={lat:number,lon:number,label:string,approximate:boolean,mapProvider?:EntryMapProvider};
export function normalizeEntryLocation(value:any):EntryLocation|null{
 if(value===undefined||value===null||value==='')return null;
 if(typeof value!=='object'||Array.isArray(value)||typeof value.lat!=='number'||!Number.isFinite(value.lat)||Math.abs(value.lat)>80||typeof value.lon!=='number'||!Number.isFinite(value.lon)||Math.abs(value.lon)>180||typeof value.label!=='string'||value.label.length>200||/[\u0000-\u001f]/u.test(value.label)||typeof value.approximate!=='boolean')throw Error('Bitte Standort, Lagebeschreibung und Genauigkeit prüfen.');
 if(value.mapProvider!==undefined&&!['default','osm','ohm'].includes(value.mapProvider))throw Error('Bitte eine gültige Karte für den Beitrag auswählen.');
 return {lat:value.lat,lon:value.lon,label:value.label.trim(),approximate:value.approximate,...(value.mapProvider!==undefined?{mapProvider:value.mapProvider}:{})};
}
export function locationText(value:any){if(!value)return '';return [value.label,value.lat+', '+value.lon,value.approximate?'Lage ungefähr':''].filter(Boolean).join(' · ')}
