export function EntryUpdated({updated}:{updated?:string}){
 const timestamp=updated?.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/)?.[0];
 const date=timestamp?new Date(timestamp):null;
 return <p className="entry-updated">Zuletzt bearbeitet: {date&&Number.isFinite(date.getTime())?<time dateTime={timestamp}>{date.toLocaleString('de-DE',{timeZone:'Europe/Berlin',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})} Uhr</time>:'Datum nicht erfasst'}</p>;
}
