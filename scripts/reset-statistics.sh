#!/usr/bin/env bash
# Aufruf: bash scripts/reset-statistics.sh [--preview|--reset] [Container]
# Nur Linux-Instanz. Keine Änderungen an Beiträgen oder QR-Fehlerhinweisen.
set -euo pipefail
mode=${1:---preview}
container=${2:-geschichtsarchiv-archive-1}
if [[ $# -gt 2 || ( "$mode" != --preview && "$mode" != --reset ) ]]; then
  echo 'Verwendung: bash scripts/reset-statistics.sh [--preview|--reset] [Container]' >&2
  exit 2
fi
command -v docker >/dev/null || { echo 'Docker fehlt.' >&2; exit 1; }
docker inspect --format '{{.State.Running}}' "$container" | grep -qx true || {
  echo 'Archivcontainer läuft nicht. Zuerst prüfen.' >&2; exit 1;
}
if [[ "$mode" == --reset ]]; then
  echo "Aufrufstatistik von Container $container zurücksetzen."
  echo 'Beitrags-, Zeitleisten- und QR-Aufrufe werden auf null gesetzt.'
  echo 'Die bisherigen Zählwerte werden vorher im Datenverzeichnis gesichert.'
  read -r -p 'Zum Bestätigen exakt STATISTIK ZURÜCKSETZEN eingeben: ' answer
  [[ "$answer" == 'STATISTIK ZURÜCKSETZEN' ]] || { echo 'Abgebrochen.'; exit 1; }
fi
# Kein -t: JavaScript wird über stdin übertragen; keine Zugangsdaten ausgegeben.
docker exec -i "$container" node --input-type=module - "$mode" <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const mode=process.argv[2];
const config=process.env.ARCHIVE_CONFIG_FILE||'/config/app.env';
let dataRoot=process.env.ARCHIVE_DATA_DIR||'/data';
for(const line of fs.readFileSync(config,'utf8').split('\n')) {
  if(line.startsWith('ARCHIVE_DATA_DIR=')) dataRoot=line.slice('ARCHIVE_DATA_DIR='.length);
}
if(!path.isAbsolute(dataRoot)) throw Error('Datenpfad muss absolut sein.');
const maintenance=path.join(path.dirname(config),'maintenance');
if(fs.existsSync(maintenance)&&fs.readFileSync(maintenance,'utf8').trim()==='1')
  throw Error('Wartungsmodus aktiv. Kein Zurücksetzen während eines Updates.');
const filename=path.join(dataRoot,'archive.sqlite');
if(!fs.statSync(filename).isFile()) throw Error('Archivdatenbank fehlt.');
const db=new DatabaseSync(filename,{readOnly:mode!=='--reset'});
let transaction=false;
try {
  db.exec('PRAGMA busy_timeout=5000');
  const columns=db.prepare('PRAGMA table_info(public_page_views)').all().map(x=>x.name);
  // Backup enthält sämtliche vorhandenen Spalten, auch bei späteren Erweiterungen.
  for(const field of ['day','entry_id','source','views','authenticated_views'])
    if(!columns.includes(field)) throw Error('Statistikschema passt nicht. Abbruch.');
  if(mode==='--reset') {db.exec('BEGIN IMMEDIATE');transaction=true;}
  const rows=db.prepare('SELECT * FROM public_page_views ORDER BY day,entry_id,source').all();
  let views=0,authenticated=0;
  for(const row of rows){views+=Number(row.views);authenticated+=Number(row.authenticated_views);}
  console.log(`Statistik: ${rows.length} Zeilen, ${views} Aufrufe (${authenticated} angemeldet, ${views-authenticated} unangemeldet).`);
  if(mode!=='--reset') console.log('Vorschau: Nichts verändert. Zum Zurücksetzen mit --reset starten.');
  else {
    const directory=path.join(dataRoot,'statistics-reset-backups');
    fs.mkdirSync(directory,{recursive:true,mode:0o700});
    const backup=path.join(directory,`statistics-${new Date().toISOString().replace(/[:.]/g,'-')}-${crypto.randomUUID()}.json`);
    const payload=JSON.stringify({format:'archive-statistics-snapshot-v1',created:new Date().toISOString(),table:'public_page_views',columns,rows},null,2)+'\n';
    const fd=fs.openSync(backup,'wx',0o600);
    try{fs.writeFileSync(fd,payload);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    if(fs.readFileSync(backup,'utf8')!==payload) throw Error('Statistiksicherung konnte nicht geprüft werden.');
    db.exec('DELETE FROM public_page_views');
    if(db.prepare('SELECT COUNT(*) AS n FROM public_page_views').get().n!==0) throw Error('Zurücksetzen fehlgeschlagen.');
    db.exec('COMMIT');transaction=false;
    console.log(`Zurückgesetzt. Geprüfte Sicherung der Zählwerte: ${backup}`);
    console.log('Neue Seitenaufrufe werden ab jetzt wieder gezählt.');
  }
} finally {
  if(transaction) db.exec('ROLLBACK');
  db.close();
}
NODE
