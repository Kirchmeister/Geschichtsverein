export const entryDateFields=['period','start','end'] as const;
export function normalizeApproximateDate(value:unknown):boolean{
 if(value===undefined)return false;
 if(typeof value!=='boolean')throw Error('Bitte die Option für eine ungefähre Datierung prüfen.');
 return value;
}
export function formatApproximateDate(value:unknown,approximate=false):string{
 const text=typeof value==='string'?value.trim():'';
 if(!text||!approximate||/^(?:ca\.|circa\b)/iu.test(text))return text;
 return 'ca. '+text;
}
export function formatDateField(key:string,value:unknown,data:{isApproximateDate?:boolean}){
 return entryDateFields.includes(key as typeof entryDateFields[number])?formatApproximateDate(value,data.isApproximateDate===true):typeof value==='string'?value:'';
}
export function hasVisibleDate(data:any,fields:readonly string[]){
 return entryDateFields.some(key=>fields.includes(key)&&typeof data[key]==='string'&&!!data[key].trim());
}
export function entryDateText(data:any,fields:readonly string[]=entryDateFields,fallback='Undatiert'){
 const period=fields.includes('period')&&typeof data.period==='string'?data.period.trim():'';
 const years=['start','end'].filter(key=>fields.includes(key)).map(key=>typeof data[key]==='string'?data[key].trim():'').filter(Boolean).join('–');
 return formatApproximateDate(period||years,data.isApproximateDate===true)||fallback;
}
