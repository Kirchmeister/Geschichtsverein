/** German default for place names; administrators can override exceptional names. */
export function suggestedArchiveTitle(place:string):string {
 const name=place.trim();
 if(!name)return 'Digitales Geschichtsarchiv';
 return /(?:s|ß|x|z|ce|[’'])$/iu.test(name)?`Geschichte von ${name}`:`Geschichte ${name}s`;
}
export function archiveTitle(config:{place:string,title?:string}):string {
 return config.title?.trim()||suggestedArchiveTitle(config.place);
}
