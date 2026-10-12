export function EntryImage({file,publicOnly=false}:{file:{key:string,caption?:string},publicOnly?:boolean}){
 const caption=typeof file.caption==='string'?file.caption.trim():'';
 return <figure className="entry-image"><img src={'/api/files?'+(publicOnly?'public=1&':'')+'key='+encodeURIComponent(file.key)} alt={caption||'Beitragsbild'}/>{caption&&<figcaption>{caption}</figcaption>}</figure>;
}
