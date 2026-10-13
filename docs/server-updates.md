# Updates auf dem eigenen Server

Für Betreiber mit wenig Linux-Erfahrung: **[Einsteigeranleitung mit KI-Begleitung](betreiber-anleitung.md)**. App- und Dienstversion werden getrennt angezeigt. Ab App 0.42.0 liegen Anleitung und SSH-/KI-Hilfe unter Einstellungen → Hilfe; die Update-Seite konzentriert sich auf Status, verfügbare Releases und die letzten fünf Installationen. Normale App-Updates benötigen weiterhin mindestens Dienst 0.35.0; manuelles Zurückrollen und vollständiger Protokoll-Export benötigen Dienst 0.42.0.

## Stand

Der Update-Dienst und die Admin-Oberfläche sind implementiert und mit separaten Testbeständen geprüft. Passkey-Anmeldung und ein konkreter Docker-Treiber sind vorhanden. **Der Docker-Treiber muss vor Aktivierung auf einer isolierten Linux-Instanz geprüft werden.** Es gibt daher noch keinen gefahrlosen Ein-Klick-Installer. Eine vorhandene Serverinstallation wird durch diese Änderungen nicht umgestellt.

Entwicklung und geprüfte Veröffentlichungen erfolgen auf Wunsch des Betreibers ab jetzt auf `main`; der bisherige Branch `development` bleibt erhalten. Stabile Releases werden auf `main`, ausdrücklich versionierte Betas auf `development` veröffentlicht. Die bisherigen Vorab-Releases bleiben erhalten.

## Verhalten

- Der eigenständige Dienst prüft GitHub beim Start und alle sechs Stunden. Er installiert nichts automatisch.
- Standardmäßig werden nur stabile Main-Releases angeboten. Ab Dienst 0.35.0 kann der Betreiber zusätzlich nummerierte Development-Betas aktivieren; gewöhnliche Development-Commits sind keine Updateziele.
- „Version überspringen“ blendet die Version in automatischen Ergebnissen aus. „Jetzt nach Updates suchen“ zeigt sie mit Kennzeichnung wieder an und erlaubt Installation oder Rücknahme des Überspringens.
- Vor einer Installation verlangt die Admin-Oberfläche `UPDATE MIT GEPRÜFTER SICHERUNG`.
- Ein nur vom Betreiber eingerichteter lokaler Dienst führt die Arbeiten aus. Eine Browseranfrage kann keine Shellbefehle oder Programme vorgeben.
- Der alte Programmstand bleibt lokal verfügbar. Dateien und Konfiguration müssen in getrennten, privaten Verzeichnissen liegen.

## Sicherung und Umschaltung

1. Release-Code getrennt herunterladen, festen Commit auflösen, Metadaten prüfen und durch den Hosting-Treiber bauen/testen.
2. Wartungsmodus aktivieren: alle Schreibzugriffe und Hintergrundschreiber beenden; Anwendung vollständig stoppen.
3. Datenbankbestand, Dateien, Konfiguration einschließlich Wiederherstellungsschlüsseln und den bisherigen Code vollständig kopieren.
4. Dateien mit Größen/SHA-256 vergleichen und SQLite-Integrität prüfen. Die Kopie erneut in eine getrennte Probeablage wiederherstellen und vom Hosting-Treiber auf Anwendungsebene prüfen lassen. Ohne diese Prüfung keine Migration.
5. Die Zielmigration auf einer isolierten Kopie prüfen und erst danach alle nötigen Migrationen gegen den gestoppten Bestand durchführen. Technisch notwendige Zwischenreleases werden seit 0.35.0 einzeln installiert und bestätigt; der Treiber darf keine nötigen Migrationen überspringen.
6. Neuen Code über den `current`-Symlink auswählen und **weiterhin im Wartungsmodus** starten. Gesundheitsprüfung einschließlich Versions-/Schemaabgleich durchführen.
7. Erfolg dauerhaft protokollieren und erst dann Schreibzugriffe freigeben. Ein Neustart des Updaters kann diese Freigabe idempotent nachholen.

Bei Fehlern vor der Datenänderung startet die alte Version wieder. Nach einer angefangenen Migration wird zuerst die verifizierte Daten-/Konfigurationssicherung zurückgespielt, dann der alte Code gestartet und geprüft. Ein unterbrochener Vorgang wird beim Neustart wiederhergestellt. Beschädigte Sicherungen oder ein gescheiterter Rückweg lassen den Wartungsmodus bestehen und blockieren neue Updates. Fehlgeschlagene Datenablagen werden zur Diagnose zurückbehalten, nicht als aktive Daten verwendet.

Ein späterer manueller Code-Downgrade nach neuen Bearbeitungen wird nicht automatisch angeboten: Er könnte neue Daten verlieren. Dafür sind eine separate Prüfung und kompatible Wiederherstellung nötig. Die Implementierung automatisiert den Rückweg eines noch nicht freigegebenen Updates.

Update-Snapshots bleiben lokal erhalten. Sie enthalten sensible Konfiguration und werden durch private Verzeichnisse (0700) geschützt; sie gehören nicht in den Webroot oder GitHub. Zusätzlich externe Sicherungen betreiben. Speicherplatz/Aufbewahrung muss der Betreiber überwachen. Der Updater kann Hardwarefehler oder fehlenden Speicherplatz nicht wegautomatisieren.

## Hosting-Treiber: verbindliche Schnittstelle

`server/update-agent.mjs` benötigt eine **lokal vom Betreiber eingerichtete ausführbare Datei**. Sie erhält ausschließlich diese Argumente:

```text
TREIBER AKTION PROGRAMMVERZEICHNIS DATENVERZEICHNIS KONFIGURATIONSVERZEICHNIS
```

| Aktion | Verpflichtung |
| --- | --- |
| `prepare` | Neue Version bauen und vorprüfen, ohne aktive Daten oder Dienste zu verändern. |
| `stop` | Wartungsmodus sperrt Besucher und Schreiber; nur diesen Archivdienst vollständig anhalten. Idempotent, kein Apache-/Nextcloud-/Taler-Stopp. |
| `verify-restore` | Alten Programmstand gegen die angegebenen **Probeverzeichnisse** prüfen: Schema, Objektdateien, Referenzen, Schlüssel und Lesbarkeit. Kein Zugriff auf Liveablagen oder Versand/Timer. |
| `migrate` | Alle ausstehenden Migrationen für die Zielversion gegen den gestoppten Bestand ausführen. Bei unbekanntem Schema fehlschlagen. |
| `start` | Archivdienst mit angegebenem Code starten; Schreibzugriffe bleiben gesperrt. Idempotent. |
| `health` | Antwort, Zielversion, Schema und Medienlesbarkeit innerhalb des begrenzten Treiberzeitlimits prüfen; darf keine Schreibsperre aufheben. |
| `commit` | Nach erfolgreicher Prüfung Schreibsperre aufheben. Idempotent. Bei Fehler **niemals** teilweise freigeben. |

Ein Exit-Code ungleich 0 blockiert den nächsten Schritt. Der Treiber ist bewusst **kein Platzhalter, der Erfolg zurückgibt**: Ohne echten Treiber/Probeprüfung startet der Dienst nicht. `server/docker-update-driver.mjs` implementiert diese Schnittstelle für einen einzelnen Docker-Archivcontainer.

## Konfiguration des unabhängigen Dienstes

Node.js 24, Git, tar und der Docker-Client sind erforderlich. `Dockerfile.updater` stellt den unabhängigen Dienst bereit. Beispiel einer **nicht sofort aktivierbaren** Konfiguration, ausschließlich für den eigenen Dienstnutzer lesbar (0600):

```json
{
  "root": "/srv/geschichtsarchiv/updater",
  "dataRoot": "/srv/geschichtsarchiv/data",
  "configRoot": "/srv/geschichtsarchiv/config",
  "driver": "/app/server/docker-update-driver.mjs",
  "container": "geschichtsarchiv-archive-1",
  "appPort": 8080,
  "uid": 1000,
  "gid": 1000,
  "repository": "Kirchmeister/Geschichtsverein",
  "githubToken": "",
  "secret": "64-zufaellige-hexzeichen",
  "port": 3099
}
```

Die Konfigurationsdatei muss innerhalb `configRoot` liegen. Bei einem privaten Repository wird ein ausschließlich lesender GitHub-Zugang benötigt. Geheimnisse werden nie im Browser angezeigt oder als Prozessargumente übergeben. `root`, `dataRoot` und `configRoot` dürfen einander nicht enthalten. Der erste Programmstand muss vor seinem Build den genauen Git-Commit als `codeCommit` in seiner lokalen `version.json` erhalten. Ohne diese Kennung blockiert der Updater. Der initiale `updater/current`-Symlink verweist auf den bereits geprüften Programmstand innerhalb `updater/releases/`.

```sh
ARCHIVE_UPDATER_CONFIG=/srv/geschichtsarchiv/config/updater.json node server/update-agent.mjs
```

Den Dienst später als eigenen systemd-Dienst unter dem Archivnutzer betreiben. Er muss während eines App-Neustarts weiterlaufen. Er bindet ausschließlich `127.0.0.1:3099`. **Nicht über Apache veröffentlichen.** Nextcloud und Taler bleiben unangetastet.

Die Anwendung erhält separat `ARCHIVE_HOSTING_RUNTIME=linux`, `ARCHIVE_UPDATER_URL=http://127.0.0.1:3099/` und dasselbe `ARCHIVE_UPDATER_SECRET`. Die Admin-API prüft Rolle und Origin und signiert Serveranfragen mit HMAC, Zeitstempel und Einmalwert. Der Dienst verwirft Wiederholungen und abgelaufene Signaturen.

## Docker-Einrichtung durch den Betreiber

Diese Anleitung beschreibt die Einrichtung; sie wird nicht durch ein Repository-Update automatisch ausgeführt. Zunächst mit einer Kopie der Installation testen.

1. Die tatsächlichen Daten-/Konfigurationspfade, UID/GID, den Archivcontainernamen und einen freien lokalen Dienstport prüfen. Keine anderen Container auswählen. Daten und Konfiguration müssen als getrennte Bind-Verzeichnisse vorliegen; ein Docker-Datenvolume zuerst kontrolliert in eine Bind-Ablage übernehmen.
2. Einen separaten privaten Updater-Ordner anlegen. Den derzeit laufenden Quellstand in `root/releases/START-COMMIT` ablegen und dessen exakten Git-Commit vor dem Build in `version.json` als `codeCommit` eintragen. `root/current` auf dieses Verzeichnis setzen. Den Startstand mit `docker build -t geschichtsarchiv-managed:COMMIT VERZEICHNIS` bauen. Der erste Stand muss bereits Wartungsmodus und die erweiterte Health-Antwort dieser Version unterstützen.
3. Die oben gezeigte Konfiguration als `configRoot/updater.json` mit Modus 0600 anlegen. `uid`, `gid`, Container und Pfade aus der tatsächlichen Installation übernehmen. Ein zufälliges Geheimnis lokal erzeugen und dasselbe in `app.env` als `ARCHIVE_UPDATER_SECRET` hinterlegen. `ARCHIVE_UPDATER_URL=http://127.0.0.1:3099/` hinzufügen. Keine Schlüssel in GitHub speichern. Vor der ersten Umschaltung eine externe vollständige Sicherung und einen geprüften Restore bereithalten.
4. Das Agent-Image aus `Dockerfile.updater` bauen. Als separaten Container mit Linux-Hostnetzwerk starten. Die drei Verzeichnisse unter **denselben absoluten Hostpfaden** einbinden; nur der Agent erhält `/var/run/docker.sock`. `ARCHIVE_UPDATER_CONFIG` auf die eingebundene Konfiguration setzen. Keine Apache-Weiterleitung für Port 3099 anlegen. Docker-Socketzugriff hat weitreichende Hostrechte und gehört ausschließlich in den unabhängigen Betreiber-Dienst, niemals in die Web-App.
5. Den ersten Archivstand beaufsichtigt über die Treiberaktionen `stop`, `start`, `health`, `commit` übernehmen; vorher `verify-restore` gegen eine geprüfte Kopie durchführen. Der Agent muss auf das Startimage und den aktuellen Symlink abgestimmt sein. Bei einem Fehler Wartungsmodus beibehalten und die gesicherte Ausgangskonfiguration verwenden.
6. Anschließend in **Einstellungen → Updates** beide Versionsstände und den Status prüfen. Stabile Releases sind der Standard; versionierte Betas erfordern die ausdrücklich aktivierte Beta-Option ab 0.35.0. Ein neuer Commit im Development-Branch allein ist kein Release.

Der Treiber beendet und ersetzt ausschließlich den konfigurierten Archivcontainer. Er bindet die App mit Linux-Hostnetzwerk an `127.0.0.1:8080`, den Agenten an `127.0.0.1:3099`. Apache bleibt als HTTPS-Proxy bestehen; Nextcloud und Taler werden nicht umgestellt. Der Wartungsmodus blockiert Appzugriffe und Hintergrundaufgaben bis zur erfolgreichen Versions-, Schema- und Dateiprüfung. Der Agent bleibt während des Appwechsels erreichbar.

Nach der Übernahme verwaltet der Agent den Archivcontainer. Nicht zusätzlich `docker compose up` aus der bisherigen Installation ausführen: Compose würde den verwalteten Container überschreiben oder eine zweite Instanz starten. Die ursprüngliche Compose-Konfiguration für einen beaufsichtigten Rückweg aufbewahren. Automatische Installationen sind bewusst nicht aktiviert; der Admin startet ein angebotenes Update nach Bestätigung der geprüften Sicherung.

## Anmeldung und Fähigkeiten

Linux verwendet echte Passkey-Sitzungen und prüft Adminrechte aus der Instanzdatenbank. Browseranfragen können keine Treiberpfade oder Docker-Befehle festlegen.

## Prüfungen

`node tests/update-engine.test.mjs` prüft Skip/manuelle Wiederanzeige, stabile Releases, vollständige Snapshot-/Probeprüfung, gescheiterte Migration, Gesundheitsfehler, gescheiterte Probeprüfung, Neustart-Wiederherstellung und beschädigte Sicherungen. `node tests/docker-update-driver.test.mjs` prüft zusätzlich Containerzuordnung, gestoppte Migrationen und die begrenzten Dockerargumente. Der Agent/Servertreiber muss vor Aktivierung zusätzlich auf einer isolierten echten Linux-Instanz getestet werden. Ein Modultest ersetzt keinen Test des späteren systemd-/Login-/Speicheradapters.

Der Docker-Testbetrieb aus `docs/local-wsl.md` aktiviert keinen Update-Treiber. SQLite-/Dateiadapter und Passkey-Anmeldung sind verfügbar, die Container-Updateintegration wird separat durch den Betreiber aktiviert. In dieser Testinstanz werden daher keine Updates autonom installiert.

Der Agent verwendet eine Kernel-Dateisperre (`flock`, Paket `util-linux`) auf `root/agent.lock`. Container-PIDs werden nicht als Dienstidentität verwendet. Beim Beenden oder Absturz wird die Sperre freigegeben; eine vorhandene Lockdatei darf bestehen bleiben. Für diese Korrektur genügt das neue Updater-Image; bereits geprüfte Archiv-Images bleiben verwendbar.
## Update-Quelle wechseln

Ab 0.11.0 enthält Einstellungen → Updates einen Abschnitt **Update-Quelle**. Nur der tatsächliche Admin darf Quellen prüfen und wechseln. Auch der separate Update-Dienst muss mit dem Dockerfile.updater dieser Version neu gebaut und eingerichtet sein; ein App-Update allein aktualisiert den Dienst nicht. Ein älterer Dienst zeigt einen entsprechenden Hinweis. Nicht gleichzeitig einen zweiten Dienst starten.

Zulässig sind aktive direkte GitHub-Forks des aktuell eingestellten Repositorys. GitHub `parent.full_name` muss die aktuelle Quelle nennen; `source` (gemeinsamer Ursprung des Netzwerks) genügt nicht. Nach einem Wechsel ist die neue Quelle der Bezugspunkt. Bis zu 100 Forks werden angeboten; weitere können direkt eingegeben werden. Nicht eindeutig nachweisbare Herkunft wird abgelehnt. Bestehender GitHub-Zugang muss das Ziel lesen dürfen; Zugangsdaten werden weder angezeigt noch über das Formular geändert.

Vor dem Warnungsdialog wird die neueste stabile Release-Version am aufgelösten Commit auf `docs/update-contract.json`, Version, Backupformat, Schema und erforderliche Projektdateien geprüft. Der Marker ist **kein Sicherheitszertifikat** und kann kopiert werden. Der Betreiber muss dem neuen Anbieter ausdrücklich vertrauen: Updates führen Servercode aus. Der Admin muss `ICH VERTRAUE DER NEUEN UPDATE-QUELLE` abtippen. Die Prüfung gilt fünf Minuten und wird vor dem Speichern erneut ausgeführt. Bei Fehlern bleibt die bisherige Quelle erhalten. Laufende Updates und offene Wiederherstellungen sperren den Wechsel.

Der Wechsel installiert nichts, verändert keine Archivdaten und wird in der geschützten Updater-Konfiguration protokolliert. Übersprungene Versionen sind pro Repository getrennt. Nach dem Wechsel wird vor jedem Release-Build der Projektvertrag erneut geprüft. Fork-Betreiber dürfen die dauerhafte Projekt-ID und den Vertrags-Dateipfad nicht entfernen; Änderungen des Protokolls benötigen eine gesonderte kompatible Updater-Version. Eine höhere Schema-Nummer allein garantiert keine geeignete Migration: Sicherung, Probe-Wiederherstellung und Rückweg bleiben verpflichtend.
## Zertifikatsfehler beim Laden von GitHub

Bei `server certificate verification failed. CAfile: none` fehlt im bisherigen Update-Image das CA-Zertifikatspaket. Ab 0.12.1 installiert `Dockerfile.updater` ausdrücklich `ca-certificates` und prüft das Zertifikatsbündel beim Build. Nur das Update-Image neu bauen; `docker compose up` ist für diese Reparatur nicht erforderlich. Vor dem Austausch des laufenden Dienstes den GitHub-Zugriff mit `git ls-remote` im neuen Image testen. Bestehende Konfiguration, Mounts, Name, Hostnetzwerk und Neustartrichtlinie des Dienstes erhalten. TLS-Zertifikatsprüfung bleibt eingeschaltet. Die Archiv-App und ihre Daten werden dabei nicht aktualisiert.

## Fortschritt ab 0.13.0

Beim Start öffnet sich ein Statusfenster. Download, Build, geprüfte Sicherung, Installation und Funktionsprüfung werden getrennt angezeigt. „Details anzeigen“ enthält feste, zeitgestempelte Phasenmeldungen; rohe Prozessausgaben und Zugangsdaten werden nicht übernommen. Das Fenster kann geschlossen und über „Fortschritt anzeigen“ wieder geöffnet werden. Nach Seitenneuladen wird ein laufender Vorgang erneut erkannt. Während kurzer Nichterreichbarkeit bleibt der letzte Status sichtbar und die Oberfläche prüft die Verbindung erneut. Frühere Vorgänge stehen getrennt darunter.

Oberfläche und Update-Dienst müssen für die zusätzlichen Phasen beide aktualisiert sein. Bei älteren Diensten zeigt die neue Oberfläche die vorhandenen groberen Phasen und weist auf das fehlende Detailprotokoll hin. Einen aktiven Update-Dienst niemals während einer laufenden Installation ersetzen. Die Versionsnummer des Dienst-Images ist unabhängig von der installierten Archivversion.

## Fortschritt und Nextcloud-Sicherung ab 0.20.0

Die Oberfläche zeigt die neueste stabile Version zuerst; weitere Angebote sind einklappbar. „Update vorbereiten“ öffnet die Sicherungswahl. Wenn der gespeicherte Nextcloud-/WebDAV-Zugang erfolgreich getestet wurde und der neue Dienst angebunden ist, kann **Vor dem Update automatisch nach Nextcloud sichern** gewählt werden. Die tägliche Sicherung muss dafür nicht aktiviert sein. Ohne diese Auswahl bleibt der bisherige Bestätigungstext erforderlich.

Der Ablauf ist: Code herunterladen → Docker-Image bauen → Wartungsmodus → optionale neue Nextcloud-Sicherung einschließlich vollständigem Upload und Rücklesen aller Prüfsummen → Anwendung anhalten → lokale vollständige Rückfallsicherung und Probe-Wiederherstellung → Migration → Start und Funktionsprüfung. Erst eine erfolgreiche externe Sicherung ersetzt die Texteingabe. Scheitert sie, beginnt keine Migration und der bisherige Stand wird wieder freigegeben. Eine vorhandene alte Sicherung reicht für diese Auswahl nicht aus. Die Sicherung erscheint auch unter Backups. Bei Abbruch kann eine noch unvollständige Sicherung dort fortgesetzt werden; dadurch wird kein Update erneut gestartet.

Das Statusfenster zeigt die Dauer des aktuellen Schritts, den letzten Dienstkontakt und den Wartungsstatus. Der Agent schreibt während langer Schritte alle zehn Sekunden ein Lebenszeichen. Nach 45 Sekunden ohne Lebenszeichen weist die Oberfläche darauf hin; sie schätzt keine Prozentzahlen für Download oder Build. Nextcloud zeigt Dateizahlen je Kopier-/Prüf-/Uploadphase. Das Detailprotokoll enthält ausschließlich Phasen und Zeitpunkte, keine Rohlogs oder Zugangsdaten.

**Archiv-App und separater Update-Dienst müssen beide aktualisiert werden.** Ein früher Dienst, beispielsweise 0.12.1, lädt Code und baut das Docker-Image innerhalb derselben Phase. Deshalb kann dessen „Download“ sehr lange dauern. Die neue Oberfläche nennt diesen Schritt ausdrücklich „Code laden und bauen“ und erklärt die fehlenden Detailmeldungen. Ein App-Update allein ersetzt das externe Dienst-Image nicht. Die Nextcloud-Auswahl wird erst angeboten, wenn beide Seiten sie unterstützen.

### Vorhandenen Docker-Update-Dienst ersetzen

Nur im Leerlauf durchführen. Zuerst den bisherigen Job prüfen, ohne Zugangsschlüssel auszugeben:

```bash
sudo docker exec geschichtsarchiv-updater node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.env.ARCHIVE_UPDATER_CONFIG,"utf8"));const s=JSON.parse(fs.readFileSync(c.root+"/update-state.json","utf8"));if(s.job&&!["complete","rolled_back"].includes(s.job.status)){console.error("Update oder Wiederherstellung offen: "+s.job.status);process.exit(1)}console.log("Update-Dienst im Leerlauf")'
```

Danach den geprüften aktuellen Code holen und das neue Dienst-Image bauen:

```bash
cd ~/geschichtsarchiv
git pull --ff-only
sudo docker build -f Dockerfile.updater -t geschichtsarchiv-updater:0.20.0 .
```

Den bisherigen Dienst anhalten und als Rückfallcontainer behalten. Beim neuen `docker run` **genau die bisherigen Hostpfade** verwenden. Das folgende Beispiel entspricht der hier verwendeten Linux-Installation; andere Betreiber müssen Benutzer und Pfade anpassen. Die Archiv-App wird dabei nicht angehalten oder neu gebaut. Kein `docker compose up` ausführen, wenn das Archiv bereits vom Update-Dienst verwaltet wird.

```bash
(
set -eu
if sudo docker inspect geschichtsarchiv-updater-vor-0200 >/dev/null 2>&1; then
  echo "Rückfallcontainer existiert bereits; zuerst prüfen."
  exit 1
fi
sudo docker exec geschichtsarchiv-updater node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.env.ARCHIVE_UPDATER_CONFIG,"utf8"));const s=JSON.parse(fs.readFileSync(c.root+"/update-state.json","utf8"));if(s.job&&!["complete","rolled_back"].includes(s.job.status)){console.error("Update noch aktiv; Dienst nicht ersetzen.");process.exit(1)}'
sudo docker stop geschichtsarchiv-updater
sudo docker rename geschichtsarchiv-updater geschichtsarchiv-updater-vor-0200
if ! sudo docker run -d --name geschichtsarchiv-updater \
  --restart unless-stopped --network host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/u367583/geschichtsarchiv-updater:/home/u367583/geschichtsarchiv-updater \
  -v /home/u367583/geschichtsarchiv-daten:/home/u367583/geschichtsarchiv-daten \
  -v /home/u367583/geschichtsarchiv:/home/u367583/geschichtsarchiv \
  -e ARCHIVE_UPDATER_CONFIG=/home/u367583/geschichtsarchiv/linux-config/updater.json \
  geschichtsarchiv-updater:0.20.0; then
  sudo docker rm -f geschichtsarchiv-updater >/dev/null 2>&1 || true
  sudo docker rename geschichtsarchiv-updater-vor-0200 geschichtsarchiv-updater
  sudo docker start geschichtsarchiv-updater
  exit 1
fi
)
sudo docker logs --tail=30 geschichtsarchiv-updater
sudo ss -ltnp 'sport = :3099'
```

Erwartet: laufender Dienst und Listener ausschließlich auf `127.0.0.1:3099`. Danach Einstellungen → Updates neu laden. Bei nicht erfolgreichem Start zuerst die Logs prüfen; den angehaltenen Rückfallcontainer nicht löschen. Ein Rückwechsel ist nur ohne laufenden Updatejob zulässig. Für das erste App-Update auf 0.20.0 kann noch der bisherige Text erforderlich sein; die neue Nextcloud-Auswahl steht ab dem anschließenden Update zur Verfügung.

## Build-Abbruch nach rund 15 Minuten: Korrektur ab 0.27.1

Frühere Dienste begrenzen sowohl `docker build` als auch den aufrufenden Treiber auf 900 Sekunden. Bei langsamem Image-Bau bricht der erste Versuch dadurch ab; ein späterer Versuch kann dank Build-Cache schneller fertig werden. Ab 0.27.1 darf der Docker-Build bis zu 60 Minuten dauern, der aufrufende Dienst wartet 61 Minuten. Andere Treiberaktionen behalten ihr bisheriges Limit mit zusätzlichem Zeitpuffer im aufrufenden Dienst. Der begrenzte Prozessausgabepuffer beträgt 16 MiB. Fehler unterscheiden Zeitüberschreitung, volle Festplatte, Ausgabelimit und sonstige Prozessfehler; Rohlogs und Zugangsdaten werden nicht an die Oberfläche weitergereicht.

**Das Update-Dienst-Image muss separat ersetzt werden**, auch wenn die Archiv-App bereits aktuell ist. Nur nach einem abgeschlossenen oder sicher zurückgerollten Job nach „Vorhandenen Docker-Update-Dienst ersetzen“ vorgehen und für diese Korrektur `geschichtsarchiv-updater:0.27.1` bauen und starten. Bestehende Hostpfade und Konfiguration erhalten; das Archiv dabei nicht mit Compose neu starten. Bei diesem frühen Build-Abbruch läuft die bisherige App weiter, Sicherung und Migration werden noch nicht begonnen. Ein längeres Limit behebt keine tatsächlichen Compiler-, Netzwerk- oder Speicherplatzfehler.

## Web-Wiederherstellung ab 0.32.0

Den separaten Dienst wie bei früheren Dienst-Upgrades aus `Dockerfile.updater` neu bauen und seinen Container mit denselben Mounts, derselben Konfiguration und demselben lokalen Port ersetzen. Beispiel für den Build im aktuellen Repository: `sudo docker build -f Dockerfile.updater -t geschichtsarchiv-updater:0.32.0 .`. Bestehende Dienst-Konfiguration und Geheimnisse erhalten; den Dienst nur bei abgeschlossenem Update/Wiederherstellung ersetzen. Erst danach die App auf 0.32.0 aktualisieren. Die Oberfläche erkennt einen älteren Dienst und deaktiviert die Wiederherstellung mit einem Hinweis.

Prüfung und Wiederherstellung teilen die Dienstsperre mit Updates. Der TAR-Upload wird begrenzt und gestreamt, anschließend in die geschützte Dienstablage verschoben. Die Dateiprüfung läuft isoliert im App-Image ohne Netzwerk. Importablagen befinden sich unter `<Updater-Ablage>/restores/`; Rückfallsicherungen unter `<Updater-Ablage>/backups/`. Nach erfolgreichem Austausch bleibt der bisherige Datenordner zusätzlich als `.before-restore-<ID>` erhalten. Rückfallkopien enthalten Konten, Schlüssel und personenbezogene Daten; vertraulich behandeln, genügend Speicher reservieren und erst nach erfolgreicher Betriebsprüfung gemäß eigener Aufbewahrungspolitik offline bereinigen.

Bei einem Fehler mit offener Wiederherstellung kein weiteres Update starten. Unter Updates die Wiederherstellung erneut versuchen oder den Dienst anhand seiner Protokolle prüfen. Die Wartungssperre nicht manuell umgehen.

## Update-Dienst 0.35.0: sichere Pfade und Beta-Kanal

App und separater Dienst müssen für die neuen Kompatibilitätsfunktionen mindestens 0.35.0 verwenden. Den Dienst nach der vorhandenen Anleitung neu bauen und neu starten; Konfiguration, Ablagen und andere Serverdienste unverändert lassen. Die App aktualisiert den Dienst nicht automatisch. Vor einer Umstellung vollständig sichern. Den Dienst vor dem App-Update erneuern: Die Ziel-Migration verweigert bestehende Datenablagen, wenn Dienst- oder Quellversionsangaben fehlen beziehungsweise nicht kompatibel sind. Der neue Dienst kann den App-Stand 0.35.0 aus einer unterstützten alten Linux-Installation vorbereiten; fehlt der neue Dienst nach dem App-Update, sperrt die neue Oberfläche weitere Installationen.

## Update-Dienst 0.42.0: kontrollierte Rücknahme und vollständiger Verlauf

Für die neue manuelle Rücknahme und den vollständigen Protokoll-Download den separaten Dienst aus **Tag `v0.42.0`** nach „Vorhandenen Docker-Update-Dienst ersetzen“ bauen und austauschen. Erst Leerlauf, tatsächliche Konfiguration und externe Sicherung prüfen; alten Container behalten. Die App 0.42.0 kann auch mit Dienst 0.35.0 installiert werden, kennzeichnet diese neuen Funktionen dann aber als nicht verfügbar. Der Dienst benötigt keine automatische Selbsterneuerung und keine Datenbankmigration; vorhandene `update-state.json` und Ablagen bleiben erhalten.

Neue signierte Aktionen: `rollback-inspect` startet eine asynchrone isolierte Rückfallprobe, `rollback-start` verlangt den kurzlebigen Prüftoken und exakt `UPDATE RÜCKGÄNGIG MACHEN`. Nur Administratoren ohne Rollen-Vorschau dürfen sie über die gleichursprüngliche App-API anfordern. Nur das unmittelbar letzte erfolgreiche Update mit passendem `next`-Programmstand ist zulässig; keine beliebigen Downgrades, keine Restore-/Rollback-Ketten. Die verfügbaren Funktionen werden über `features.manualRollback` und `features.updateHistory` ausgehandelt.

Eine seit dem App-Update veränderte Updater-Konfiguration blockiert die manuelle Rücknahme (insbesondere Schlüssel, Ablagen oder Quellenwechsel), statt einen laufenden Agenten mit zurückgesetzter, abweichender Konfiguration weiterzubetreiben. Die Prüfung bindet manifestgeprüfte Daten/Konfiguration/Code und den unveränderten vorherigen Release-Stand an den aktuellen Stand. Alte Docker-Images müssen noch vorhanden sein; fehlende oder beschädigte Ablagen blockieren die Probe. Vor dem Wechsel entstehen eine neue geprüfte Sicherung des neueren Stands und eine isoliert geprüfte Kopie des alten Bestands. Erst dann werden die live-Datenablagen ersetzt und der Codezeiger umgeschaltet. Es findet keine Down-Migration statt. Fehler und unterbrochene Vorgänge verwenden den bisherigen Recovery-Pfad mit dem neuen Snapshot; bei einem Recovery-Fehler bleibt die Wartungssperre bestehen. Die Rücknahme protokolliert `kind: rollback` und `sourceJobId`. Die zusätzliche Sicherung ist ein lokaler interner Snapshot, kein portabler TAR-Export; eine spätere Wiederherstellung des neueren Bestands braucht fachkundige Betreuung, keine automatische Datenzusammenführung.

Release-Notizen und Repository/Commit werden bei Installationen gespeichert. Die Suche lädt zusätzlich Metadaten zu den letzten fünf erfolgreichen Installationen und ergänzt ältere Notizen nur bei passendem Commit. Die Statusantwort liefert fünf Installationskarten und einen begrenzten kompatiblen Verlauf; `history` exportiert alle gespeicherten, nach Jobkennung zusammengeführten Vorgänge ohne interne Pfade, Konfiguration und rohe Fehlermeldungen. Der Textdownload enthält Phasen und Ergebnisse; rohe Fehler bleiben ausschließlich in den diagnostischen Vorgangsdetails. Die zugrunde liegende Historie wird nicht auf fünf Einträge gekürzt.

Der Beta-Schalter ist standardmäßig aus und wird in der dauerhaften Updater-Zustandsablage gespeichert. Betas benötigen eine nummerierte SemVer-Version (`-beta.1`), `prerelease: true`, einen festen Tag und Zugehörigkeit zu `development`. Main-Releases benötigen `prerelease: false`. Ausschalten ändert weder die aktuelle App noch deren Daten. Ein neueres kompatibles Main-Release wird angeboten; ein älteres stabiles Release wird niemals als Downgrade installiert. Beide Versionsstände bleiben in der Übersicht sichtbar.

`docs/update-compatibility.json` ist eine Freigabe durch die Herausgeber, kein Sicherheitszertifikat. `supportedSources` begrenzt Ausgangsversion, Schema und Backupformat; `minimumServiceVersion` legt die Dienstanforderung fest. `intermediateReleases` nennt feste Tags für technisch notwendige Zwischenstände. Diese Metadaten werden am Release-Commit geprüft; unbekannte oder fehlende Angaben blockieren. Die Suche prüft die neuesten stabilen/Beta-Ziele und deren ausdrücklich genannten Zwischenstände, damit nicht jeder alte Tag erneut abgefragt werden muss. Ein GitHub-Fehler kann ein Angebot blockieren und wird erklärt.

Jeder Schritt erstellt eine verifizierte Rückfallsicherung und probt die Wiederherstellung. Anschließend wird die Zielmigration ohne Netzwerk auf einer getrennten Daten-/Konfigurationskopie durchgeführt. Datenbankintegrität, Migrationsprüfsummen, bestehende Archivzeilen und Dateireferenzen werden geprüft. Eine nicht freigegebene Veränderung bestehender Archivdaten wird abgelehnt; künftige notwendige Datenkonverter benötigen eine eigene geprüfte Erweiterung. Fehler verhindern Live-Migration; bereits gestoppte Dienste kehren über die geprüfte Rückfallsicherung zurück. Zwischenstände benötigen jeweils eine neue Betreiberbestätigung.

Für dieses Release sind historische SQL-Stände 0.20.0, 0.27.1, 0.32.0 und 0.34.0 auf Schema 19 geprüft. Ausgangsstände vor 0.20.0 oder ohne gültiges Linux-Migrationsjournal werden nicht pauschal unterstützt. Die reale Instanz wird unabhängig von diesen Tests vor jeder Installation isoliert geprüft.

### Versionierte Betas veröffentlichen

Betas ausschließlich auf `development` pflegen, mit einer neuen Versionsnummer in `package.json` und `version.json`, `prerelease: true`, CHANGELOG und aktualisierter Kompatibilitätspolicy. Relevante Tests und Linux-Build vor dem Push ausführen. Der Workflow veröffentlicht diesen festen Stand als Beta-Release; gewöhnliche Development-Commits ohne passende Release-Version erzeugen kein neues Installationsangebot. Bestehende Tags/Releases werden nicht ersetzt. Stabile Releases werden auf `main` veröffentlicht. Eine Beta ist trotz Prüfung freiwillige Testsoftware.
