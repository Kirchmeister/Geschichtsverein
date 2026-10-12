export function focusEditorTitle(event:{preventDefault:()=>void},title:{focus:(options?:FocusOptions)=>void}|null){
 event.preventDefault();
 title?.focus({preventScroll:true});
}
export function discardLocalDraft(storage:Pick<Storage,'removeItem'>,keys:readonly string[],confirm:(message:string)=>boolean){
 if(!confirm('Entwurf wirklich verwerfen? Ungesicherte Änderungen werden gelöscht. Der gespeicherte Beitrag bleibt unverändert.'))return false;
 for(const key of keys)storage.removeItem(key);
 return true;
}
