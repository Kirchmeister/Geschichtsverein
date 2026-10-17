import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import path from 'node:path';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
const parser=unified().use(remarkParse).use(remarkGfm);
export async function entryPdf(entry,{brand='Geschichtsarchiv',exportedAt=new Date().toISOString(),mode='current',maxPages=200,loadImage=async()=>null}={}){
 const doc=new PDFDocument({size:'A4',margins:{top:56,bottom:58,left:54,right:54},bufferPages:true,autoFirstPage:true,info:{Title:entry.title||'Beitrag',Author:brand,Subject:'Archivexport - '+(mode==='published'?'veröffentlichte Fassung':'aktueller Bearbeitungsstand')}});
 const root=path.resolve('server/assets/fonts');doc.registerFont('body',path.join(root,'DejaVuSans.ttf')).registerFont('bold',path.join(root,'DejaVuSans-Bold.ttf')).registerFont('italic',path.join(root,'DejaVuSans.ttf')).registerFont('title',path.join(root,'DejaVuSerif.ttf'));
 const chunks=[];let bytes=0;const output=new Promise((resolve,reject)=>{doc.on('data',c=>{bytes+=c.length;if(bytes>40*1024*1024)doc.destroy(Error('PDF überschreitet 40 MB.'));else chunks.push(c)});doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});output.catch(()=>{});
 let pages=1;doc.on('pageAdded',()=>{if(++pages>maxPages)throw Error('Beitrag überschreitet 200 PDF-Seiten.')});
 const warnings=[],width=doc.page.width-108;
 const ensure=(height=60)=>{if(doc.y+height>doc.page.height-62)doc.addPage()};
 const paragraph=(text,size=10)=>{doc.fillColor('#263a30').font('body').fontSize(size).text(String(text||''),{width,lineGap:3});doc.moveDown(.6)};
 const heading=(text)=>{ensure(70);doc.moveDown(.5).font('bold').fontSize(13).fillColor('#294e3e').text(text,{width});doc.moveDown(.4)};
 const plain=node=>node.value??(node.children||[]).map(plain).join('');
 function inline(nodes,style={}){const runs=[];function visit(n,fmt){if(n.type==='strong')fmt={...fmt,bold:true};if(n.type==='emphasis')fmt={...fmt,italic:true};if(n.type==='link'&&/^https?:\/\//i.test(n.url||''))fmt={...fmt,link:n.url};if(n.type==='image'){runs.push({text:'[Bildverweis: '+(n.alt||'Bild')+']',...fmt});return}if(n.value!==undefined){if(n.type!=='html')runs.push({text:n.value,...fmt});return}if(n.type==='break'){runs.push({text:'\n',...fmt});return}(n.children||[]).forEach(child=>visit(child,fmt))}nodes.forEach(n=>visit(n,style));if(!runs.length)return;doc.fontSize(10).fillColor('#263a30');runs.forEach((r,i)=>doc.font(r.bold?'bold':r.italic?'italic':'body').text(r.text,{continued:i<runs.length-1,width,lineGap:3,...(r.link?{link:r.link,underline:true}:{})}));doc.moveDown(.6)}
 function block(node){if(node.type==='heading'){heading(plain(node));return}if(node.type==='paragraph'){inline(node.children);return}if(node.type==='table'){node.children.forEach((row,index)=>{ensure(35);inline(row.children.flatMap((cell,i)=>[...(i?[{type:'text',value:'  |  '}]:[]),...cell.children]),{bold:index===0})});return}if(node.type==='list'){node.children.forEach((item,index)=>{ensure(40);paragraph((node.ordered?(index+1)+'. ':'• ')+plain(item))});return}if(node.type==='code'){paragraph(node.value,9);return}if(node.type==='html')return;if(node.type==='blockquote'){paragraph('„'+plain(node)+'“');return}(node.children||[]).forEach(block)}
 try{
  doc.font('body').fontSize(9).fillColor('#526050').text(brand,{width});doc.moveDown(1);doc.font('title').fontSize(24).fillColor('#263a30').text(entry.title||'Beitrag',{width});doc.moveDown(.7);
  paragraph([entry.reference,mode==='published'?'Veröffentlichte Fassung':'Aktueller Bearbeitungsstand'].filter(Boolean).join(' · '),9);
  const date=[entry.period,entry.start&&'Beginn: '+entry.start,entry.end&&'Ende: '+entry.end].filter(Boolean).join(' · ');const meta=[date&&'Datierung: '+(entry.isApproximateDate?'ca. ':'')+date,entry.category&&'Bereich: '+entry.category,entry.place&&'Ort: '+entry.place,entry.status&&'Forschungsstand: '+entry.status,entry.storagePlace&&'Aufbewahrungsort: '+entry.storagePlace,entry.updated&&'Bearbeitet: '+entry.updated.slice(0,24),entry.location&&'Standort: '+[entry.location.label,entry.location.lat,entry.location.lon,entry.location.approximate?'ungefähre Lage':''].filter(v=>v!==undefined&&v!=='').join(' · ')].filter(Boolean);if(meta.length)paragraph(meta.join('\n'),9);
  for(const [key,label] of [['description','Beschreibung'],['sources','Quellen und Fundstellen'],['uncertainty','Unsichere Angaben'],['rights','Rechte und Nutzungsbedingungen'],['tags','Schlagwörter']])if(entry[key]){heading(label);if(entry.fieldFormats?.[key]==='markdown')block(parser.parse(String(entry[key])));else paragraph(entry[key])}
  if(entry.personTags?.length){heading('Personen und Familien');paragraph([...new Set(entry.personTags.map(p=>p.name))].join(', '))}
  const files=entry.files||[],images=files.filter(f=>f.type?.startsWith('image/'));
  for(const [imageIndex,image] of images.entries()){const imageLabel=image.caption||'Bild '+(imageIndex+1);ensure(70);doc.moveDown(.5);let bytes;try{bytes=await loadImage(image.key);if(!bytes)throw Error('missing');const resized=await sharp(bytes,{limitInputPixels:40000000}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();const dimensions=await sharp(resized).metadata(),height=Math.min(300,width*dimensions.height/dimensions.width);ensure(height+35);doc.image(resized,54,doc.y,{fit:[width,height],align:'center'});doc.y+=height+8;paragraph(image.caption||'Keine Bildunterschrift hinterlegt.',9)}catch{warnings.push('Bild konnte nicht eingebettet werden: '+imageLabel);paragraph('Bild nicht verfügbar: '+imageLabel,9)}}
  const other=files.filter(f=>!f.type?.startsWith('image/'));if(other.length){heading('Zugehörige Medien und Anhänge');for(const f of other)paragraph((f.type?.startsWith('audio/')?'Audioaufnahme (nicht eingebettet): ':'Anhang (nicht eingebettet): ')+f.name+' · '+(f.type||'Datei'),9)}
  if(warnings.length){heading('Exporthinweise');warnings.forEach(w=>paragraph(w,9))}
  ensure(60);doc.moveDown(.5);paragraph('Exportvermerk · Exportiert am '+new Date(exportedAt).toLocaleString('de-DE',{timeZone:'Europe/Berlin'})+'. Diese PDF dokumentiert den ausgewählten Beitragsstand. Audio und Originalanhänge sind nur referenziert. Sie ersetzt keine vollständige Archivsicherung.',9);
  const range=doc.bufferedPageRange();for(let n=range.start;n<range.start+range.count;n++){doc.switchToPage(n);doc.font('body').fontSize(8).fillColor('#526050');doc.text((entry.reference||'Archivexport')+' · Seite '+(n+1)+' von '+range.count,54,doc.page.height-38,{width,height:20,lineBreak:false})}
  doc.end();return {buffer:await output,warnings};
 }catch(e){doc.destroy();throw e}
}
