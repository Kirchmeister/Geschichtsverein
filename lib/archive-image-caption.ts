export const imageCaptionLimit=500;
export function imageCaption(value:unknown):string{
 if(typeof value!=='string'||!value.trim())throw Error('Bitte für jedes Bild eine eigene Beschriftung eingeben.');
 const caption=value.trim();
 if(caption.length>imageCaptionLimit)throw Error('Bildbeschriftungen dürfen höchstens 500 Zeichen enthalten.');
 return caption;
}
export function validateImageCaptions(files:{type:string,caption?:unknown}[]){
 for(const file of files)if(file.type.startsWith('image/'))imageCaption(file.caption);
}
