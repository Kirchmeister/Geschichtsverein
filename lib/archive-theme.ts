export const archiveThemes = [
 {id:'sage',name:'Salbeigrün',description:'Das bisherige Design · ruhig und natürlich',colors:['#294e3e','#dfe7da','#fafaf7']},
 {id:'coastal',name:'Küstenblau',description:'Tiefes Blau mit hellen, luftigen Flächen',colors:['#29374e','#dae1e7','#f7f8fa']},
 {id:'petrol',name:'Petrol & Sand',description:'Gedämpftes Petrol mit warmen Sandtönen',colors:['#29464e','#dae6e7','#faf9f7']},
 {id:'plum',name:'Pflaume & Creme',description:'Sanftes Violett mit einem warmen Hintergrund',colors:['#4a294e','#e3dae7','#faf9f7']},
 {id:'wine',name:'Weinrot & Porzellan',description:'Dezentes Weinrot mit hellen Rosétönen',colors:['#4e292d','#e7dade','#faf7f8']},
 {id:'ochre',name:'Ocker & Schiefer',description:'Warmes Ocker mit zurückhaltenden dunklen Tönen',colors:['#4e4729','#e7e2da','#faf9f7']},
] as const;
export type ArchiveTheme = typeof archiveThemes[number]['id'];
export const defaultArchiveTheme:ArchiveTheme='sage';
export function isArchiveTheme(value:unknown):value is ArchiveTheme{return archiveThemes.some(t=>t.id===value)}
