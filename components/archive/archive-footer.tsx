export function ArchiveFooter({association=''}:{association?:string}){
 return <footer className="archive-footer"><span>{association}</span><nav className="legal-footer" aria-label="Rechtliche Informationen"><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a></nav></footer>;
}
