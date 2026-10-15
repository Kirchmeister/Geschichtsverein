import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {archiveAccess} from '@/lib/archive-access';
import {archiveThemes} from '@/lib/archive-theme';
import {SettingsPanel} from '@/components/archive/settings-panel';
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Alert,AlertDescription,AlertTitle} from '@/components/ui/alert';
import {Separator} from '@/components/ui/separator';

export const dynamic='force-dynamic';
export const metadata={title:'GADS – Geschichtsarchiv Designsystem',robots:{index:false,follow:false}};

const specimens=[
 {label:'Seitentitel / H1',detail:'Georgia · 32–48 px · normal · responsiv',className:'gads-h1',text:'Digitales Geschichtsarchiv'},
 {label:'Hauptabschnitt / H2',detail:'Georgia · 26 px · normal',className:'gads-h2',text:'Nextcloud / WebDAV'},
 {label:'Unterabschnitt / H3',detail:'Arial · 20 px · halbfett',className:'gads-h3',text:'Verbindungseinstellungen'},
 {label:'Redaktioneller Lesetext',detail:'Arial · 18 px · Zeilenhöhe 1,7',className:'gads-reading',text:'Geschichte, Quellen und Erinnerungen werden im Archiv dauerhaft auffindbar und verständlich dokumentiert.'},
 {label:'Formular- und Bedienungstext',detail:'Arial · 16 px',className:'gads-ui',text:'Verwenden Sie ein App-Passwort für diesen Zugang.'},
 {label:'Hilfetext / Fußnote',detail:'Arial · 14 px · gedämpfte Farbe',className:'gads-caption',text:'Quelle: Musterarchiv · Stand: 15.10.2026'},
] as const;

export default async function DesignsystemPage(){
 const original=await headers();
 const request=new Request('http://internal.local/designsystem',{headers:original});
 try{
  const access=await archiveAccess(request);
  if(access?.actualRole!=='admin'&&access?.actualRole!=='manager')notFound();
 }catch{notFound()}
 return <main className="gads-main">
  <style>{`
   .gads-main{width:min(1060px,calc(100% - 32px));margin:0 auto;padding:30px 0 60px;color:var(--foreground);font:16px/1.6 Arial,Helvetica,sans-serif}
   .gads-main *{box-sizing:border-box}
   .gads-main .gads-top{display:flex;gap:18px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:24px;margin-bottom:30px}
   .gads-main .gads-kicker{color:var(--muted-foreground);font-size:13px;letter-spacing:.1em;text-transform:uppercase}
   .gads-main h1,.gads-main h2{font-family:Georgia,'Times New Roman',serif;font-weight:400;line-height:1.2}
   .gads-main h1{font-size:clamp(32px,4vw,48px);letter-spacing:-.025em;margin:8px 0 12px}
   .gads-main h2{font-size:26px;margin:0 0 12px}
   .gads-main h3{font:600 20px/1.4 Arial,Helvetica,sans-serif;margin:0 0 8px}
   .gads-main p{margin:0}
   .gads-main section{margin-top:34px}
   .gads-main .gads-lead{max-width:800px;font-size:18px;line-height:1.7;color:var(--muted-foreground)}
   .gads-main .gads-subtitle{font-size:14px;color:var(--muted-foreground);margin-bottom:18px}
   .gads-main .gads-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
   .gads-main .gads-panel{border:1px solid var(--border);border-radius:8px;background:var(--card);padding:20px;min-width:0}
   .gads-main .gads-sample{border-bottom:1px solid var(--border);padding:17px 0}
   .gads-main .gads-sample:last-child{border-bottom:0}
   .gads-main .gads-label{display:block;font-size:13px;font-weight:600;color:var(--muted-foreground);margin-bottom:8px}
   .gads-main .gads-detail{display:block;font-size:13px;color:var(--muted-foreground);margin-top:7px}
   .gads-main .gads-h1{font:400 clamp(32px,4vw,48px)/1.16 Georgia,serif;letter-spacing:-.025em;overflow-wrap:anywhere}
   .gads-main .gads-h2{font:400 26px/1.3 Georgia,serif}
   .gads-main .gads-h3{font:600 20px/1.4 Arial,sans-serif}
   .gads-main .gads-reading{font:400 18px/1.7 Arial,sans-serif}
   .gads-main .gads-ui{font:400 16px/1.6 Arial,sans-serif}
   .gads-main .gads-caption{font:400 14px/1.6 Arial,sans-serif;color:var(--muted-foreground)}
   .gads-main .gads-field{display:grid;gap:6px;font-size:15px;font-weight:500}
   .gads-main .gads-field :is(input,textarea,select){min-height:44px;font-size:16px;background:var(--card)}
   .gads-main .gads-field select{border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--foreground);width:100%}
   .gads-main .gads-field textarea{min-height:96px}
   .gads-main .gads-check{display:flex;gap:12px;align-items:center;min-height:44px;font-size:16px}
   .gads-main .gads-check input{width:20px;height:20px;accent-color:var(--primary)}
   .gads-main .gads-steps{display:grid;gap:12px}
   .gads-main .gads-actions{display:flex;gap:10px;flex-wrap:wrap}
   .gads-main .gads-actions>*{min-height:44px}
   .gads-main .gads-dummy-dialog{border:1px solid var(--border);border-radius:8px;padding:24px;background:var(--card);max-width:540px;box-shadow:0 8px 20px #0000000a}
   .gads-main .gads-dummy-dialog h3{font-size:21px}
   .gads-main .gads-dummy-dialog p{font-size:15px;color:var(--muted-foreground);margin:8px 0 20px}
   .gads-main .gads-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
   .gads-main .gads-swatches{display:flex;gap:0;height:34px;border:1px solid var(--border);border-radius:4px;overflow:hidden;margin:0 0 10px}
   .gads-main .gads-swatches span{flex:1}
   .gads-main .gads-token{display:grid;grid-template-columns:100px 1fr;gap:10px;align-items:center}
   .gads-main .gads-token-chip{height:34px;border-radius:5px;border:1px solid var(--border)}
   .gads-main .gads-muted{font-size:14px;color:var(--muted-foreground)}
   .gads-main .settings-panel{border-top:1px solid var(--border);padding:16px 0}
   .gads-main .settings-panel>summary h2{font-size:26px}
   .gads-main .settings-panel-content>p{font-size:16px}
   .gads-main a{color:var(--primary);text-decoration:underline;text-underline-offset:3px}
   .gads-main :is(a,input,select,textarea,summary):focus-visible{outline:2px solid var(--ring);outline-offset:3px}
   .gads-main .gads-table-wrap{overflow-x:auto}
   .gads-main table{width:100%;border-collapse:collapse;font-size:14px}
   .gads-main :is(th,td){padding:12px 14px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}
   .gads-main th{background:var(--muted)}
   @media(max-width:720px){.gads-main .gads-grid,.gads-main .gads-presets{grid-template-columns:1fr}.gads-main{padding-top:20px}.gads-main .gads-dummy-dialog{padding:18px}.gads-main h1{font-size:32px}.gads-main .settings-panel>summary h2{font-size:23px}}
  `}</style>
  <div className="gads-top">
   <div><span className="gads-kicker">Interne Gestaltungsreferenz · GADS 1.0</span><h1>Geschichtsarchiv Designsystem</h1><p className="gads-lead">Der einheitliche Maßstab für neue Oberflächen: typografische Rollen, Farben, Formulare, Bedienelemente und Gestaltungsmuster – auf Basis des bereits vorhandenen Archivs.</p></div>
   <a href="/">Zurück zum Archiv</a>
  </div>
  <Alert><AlertTitle>Referenz, keine Änderungsmaske</AlertTitle><AlertDescription>Diese Seite speichert keine Archivdaten. Musterfelder dürfen ausprobiert werden; Dialog- und Aktionsschaltflächen werden hier nur als nicht auslösende Ansichten gezeigt. Bestehende Seiten wurden nicht verändert.</AlertDescription></Alert>

  <section aria-labelledby="gads-type"><h2 id="gads-type">01 · Typografie</h2><p className="gads-subtitle">Rollen sind verbindlich; Schriftgrößen müssen nicht für jede Ansicht identisch sein.</p><div className="gads-panel">{specimens.map(s=><div className="gads-sample" key={s.label}><span className="gads-label">{s.label}</span><div className={s.className}>{s.text}</div><span className="gads-detail">{s.detail}</span></div>)}</div></section>

  <section aria-labelledby="gads-colors"><h2 id="gads-colors">02 · Farben und Oberflächen</h2><p className="gads-subtitle">Die bereits vorhandenen sechs Farbvorlagen bleiben erhalten. Neue Flächen nutzen semantische CSS-Tokens.</p><div className="gads-presets">{archiveThemes.map(t=><div className="gads-panel" key={t.id}><div className="gads-swatches" aria-hidden="true">{t.colors.map(c=><span key={c} style={{background:c}}/>)}</div><strong>{t.name}</strong><p className="gads-muted">{t.description}</p></div>)}</div><div className="gads-grid" style={{marginTop:16}}>{(['--background','--card','--muted','--primary','--border','--ring'] as const).map(token=><div className="gads-panel gads-token" key={token}><span className="gads-token-chip" style={{background:`var(${token})`}}/><code>{token}</code></div>)}</div></section>

  <section aria-labelledby="gads-controls"><h2 id="gads-controls">03 · Formulare und Auswahl</h2><p className="gads-subtitle">Bestehende UI-Grundkomponenten, hier mit definierten Mindesthöhen und Schriftrollen. Die Eingaben bleiben lokal im Browser.</p><div className="gads-grid"><div className="gads-panel gads-steps">
   <label className="gads-field">Textfeld<Input defaultValue="Geschichtsverein" aria-label="Beispiel Textfeld" /></label>
   <label className="gads-field">Mehrzeiliges Feld<Textarea defaultValue="Historische Angaben und Quellenangaben." aria-label="Beispiel mehrzeiliges Feld" /></label>
   <span className="gads-detail">Mindesthöhe 44 px · 16-px-Eingabetext · sichtbarer Fokus</span>
  </div><div className="gads-panel gads-steps">
   <label className="gads-field">Dropdown<select defaultValue="user" aria-label="Beispiel Dropdown"><option value="user">Nutzer</option><option value="manager">Verwalter</option><option value="admin">Administrator</option></select></label>
   <label className="gads-check"><input type="checkbox" defaultChecked/>Täglich automatisch sichern</label>
   <label className="gads-check"><input type="radio" name="gads-kind" defaultChecked/>Eintrag anzeigen</label>
   <label className="gads-check"><input type="radio" name="gads-kind"/>Eintrag bearbeiten</label>
   <span className="gads-detail">Beschriftete native Auswahl; künftig vorhandene Select-/Checkbox-Bausteine bevorzugen</span>
  </div></div></section>

  <section aria-labelledby="gads-actions"><h2 id="gads-actions">04 · Schaltflächen und Status</h2><div className="gads-grid"><div className="gads-panel gads-steps"><h3>Aktionen</h3><p className="gads-muted">Reine Anzeigemuster; keine Archivaktion ausführbar.</p><div className="gads-actions"><span className="primary" aria-label="Muster Primäraktion">Speichern</span><span style={{display:'inline-flex',alignItems:'center',padding:'10px 16px',border:'1px solid var(--border)',borderRadius:6,background:'var(--card)'}}>Abbrechen</span><Badge variant="destructive">Löschen</Badge></div><p className="gads-muted">Für echte Aktionen bitte <code>Button</code> und die vorhandenen Archiv-Schaltflächen einsetzen.</p><Button disabled>Deaktivierte Aktion</Button></div><div className="gads-panel gads-steps"><h3>Mitteilungen</h3><Alert><AlertTitle>Hinweis</AlertTitle><AlertDescription>Eine Information ohne Handlungsbedarf.</AlertDescription></Alert><Alert variant="destructive"><AlertTitle>Fehler</AlertTitle><AlertDescription>Der Vorgang konnte nicht abgeschlossen werden.</AlertDescription></Alert><div role="status" className="gads-muted">Erfolgreich gespeichert – Mustertext, keine tatsächliche Speicherung.</div></div></div></section>

  <section aria-labelledby="gads-sections"><h2 id="gads-sections">05 · Aufklappbereiche und Inhaltskarten</h2><div className="gads-grid"><div className="gads-panel"><SettingsPanel title="Nextcloud / WebDAV" note="Noch nicht eingerichtet"><p>Dies ist die vorhandene <code>SettingsPanel</code>-Komponente. Titel, Beschreibung und Inhalt sollen in neuen Einstellungsgruppen genauso angeordnet werden.</p><label className="gads-field">Zielordner<input readOnly value="Geschichtsarchiv" /></label></SettingsPanel></div><Card><CardHeader><CardTitle style={{fontFamily:'Georgia,serif',fontSize:22,fontWeight:400,lineHeight:1.3}}>Orte &amp; Gebäude</CardTitle><CardDescription>Eine Sammlungskarte mit Titel und Kurzbeschreibung.</CardDescription></CardHeader><CardContent><p className="gads-ui">Bauwerke, Plätze und ihre Geschichte.</p><Separator style={{margin:'14px 0'}}/><span className="gads-caption">12 Einträge · Beispielwert</span></CardContent></Card></div></section>

  <section aria-labelledby="gads-dialogs"><h2 id="gads-dialogs">06 · Dialogfenster und Pop-ups</h2><p className="gads-subtitle">Schematische Vorschau. Echte Dialoge müssen das bestehende <code>Dialog</code>- bzw. <code>ConfirmAction</code>-System verwenden.</p><div className="gads-grid"><div className="gads-dummy-dialog"><h3>Eintrag löschen?</h3><p>Ein kritischer Vorgang wird erklärt und benötigt eine bewusste Bestätigung.</p><div className="gads-actions"><span style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--border)',padding:'9px 14px',borderRadius:6}}>Abbrechen</span><Badge variant="destructive">Eintrag löschen</Badge></div></div><div className="gads-dummy-dialog"><div className="gads-h2">Beitrag ansehen</div><p>Lesedialog: redaktioneller Titel, verständliche Metadaten und genügend Raum für historische Inhalte.</p><div className="gads-caption">Datierung · Ort · Quelle</div></div></div></section>

  <section aria-labelledby="gads-metadata"><h2 id="gads-metadata">07 · Tabellen, Fußnoten und Seitenfuß</h2><div className="gads-panel"><div className="gads-table-wrap"><table><thead><tr><th scope="col">Eintrag</th><th scope="col">Datierung</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Historisches Gebäude</td><td>um 1900</td><td>Geprüft</td></tr><tr><td>Alte Ortsansicht</td><td>1920</td><td>Entwurf</td></tr></tbody></table></div><p className="gads-caption" style={{marginTop:14}}>¹ Quellenhinweis: Name der Sammlung, Signatur und Jahr – gut lesbar vom Haupttext getrennt.</p><Separator style={{margin:'20px 0'}}/><div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12}}><span className="gads-caption">Geschichtsverein · Beispielseitenfuß</span><span className="gads-caption">Impressum · Datenschutz</span></div></div></section>

  <section aria-labelledby="gads-deviations"><h2 id="gads-deviations">08 · Festgestellte Abweichungen</h2><p className="gads-subtitle">Dokumentierte Bestandsaufnahme, noch keine Anpassungen am vorhandenen Layout.</p><div className="gads-panel gads-table-wrap"><table><thead><tr><th scope="col">Thema</th><th scope="col">Beobachtung</th><th scope="col">Ziel</th></tr></thead><tbody>
   <tr><td>Fließtext</td><td>Globale Regeln 18/20 px, Einstellungen stellenweise 14 px</td><td>Semantische Textrollen</td></tr>
   <tr><td>Überschriften</td><td>Lokale Festgrößen und unterschiedliche Schriftgewichte</td><td>H1/H2/H3-Rollen</td></tr>
   <tr><td>Formulare</td><td>Teilweise verschiedene Höhe, Rundung und Schriftgröße</td><td>Gemeinsame Bedienelemente</td></tr>
   <tr><td>Pop-ups</td><td>Serif- und Sans-Titel ohne einheitliche Rollendefinition</td><td>Lesedialog vs. Bestätigungsdialog</td></tr>
  </tbody></table><p className="gads-caption" style={{marginTop:16}}>Ausgeschlossen als Designvorbild: „Änderungsprotokoll“ und „Zeitleiste verwalten“. Diese Bereiche werden nicht als Soll-Zustand herangezogen.</p></div></section>

  <section aria-labelledby="gads-rule"><h2 id="gads-rule">09 · Pflichtregel für neue Funktionen</h2><div className="gads-panel"><p>Vor einer neuen Oberfläche <strong><code>docs/designsystem.md</code></strong> und diese Referenz prüfen, vorhandene Komponenten und semantische Farbvariablen verwenden. Keine willkürlichen neuen Schriftgrößen, Rahmen, Sonderbuttons oder punktuellen CSS-Überschreibungen. Desktop-, Mobil- und Tastaturansicht prüfen.</p><p className="gads-caption" style={{marginTop:12}}>Diese Seite dokumentiert den Standard, verändert jedoch keine vorhandene Archivoberfläche.</p></div></section>
  <footer style={{display:'flex',gap:16,justifyContent:'space-between',flexWrap:'wrap',fontSize:14,color:'var(--muted-foreground)'}}><span>GADS 1.0 · 15.10.2026</span><a href="/">Zurück zum Archiv</a></footer>
 </main>;
}
