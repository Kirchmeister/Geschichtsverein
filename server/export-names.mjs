// Keep names portable across Linux, macOS, Windows and ZIP extraction.
// Only the download name is shortened; the stored contribution title stays intact.
export function pdfFilename(title,used=[]){
 let stem=String(title||'').toWellFormed().normalize('NFC').replace(/[<>:"/\\|?*\p{Cc}\p{Cf}]/gu,' ').replace(/\s+/gu,' ').trim().replace(/^[. ]+|[. ]+$/g,'');
 if(!stem)stem='Beitrag';
 if(/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem))stem='Beitrag '+stem;
 let shortened='';for(const char of stem){if(Buffer.byteLength(shortened+char,'utf8')>160)break;shortened+=char}stem=shortened.trim().replace(/[. ]+$/g,'')||'Beitrag';
 const taken=new Set(['Inhaltsverzeichnis.pdf',...used].map(name=>name.normalize('NFC').toLowerCase()));
 let suffix=1,name=stem+'.pdf';while(taken.has(name.toLowerCase()))name=stem+' ('+(++suffix)+').pdf';
 return name;
}
export function downloadDisposition(name,inline=false){
 const fallback=name.normalize('NFKD').replace(/[^\x20-\x7e]|["\\]/g,'_');
 const encoded=encodeURIComponent(name).replace(/['()*]/g,char=>'%'+char.charCodeAt(0).toString(16).toUpperCase());
 return (inline?'inline':'attachment')+'; filename="'+fallback+'"; filename*=UTF-8\'\''+encoded;
}
