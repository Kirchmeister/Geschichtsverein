# Das Geschichtsarchiv einrichten und betreiben – mit wenig Vorkenntnissen

**Tipp für den Einstieg: Lassen Sie sich die Einrichtung anhand dieses Repositorys von ChatGPT oder einer anderen KI begleiten.** Sie müssen nicht alle Linux- und Docker-Befehle bereits kennen. Mit SSH-Zugriff, einer passenden Serverumgebung und kleinen, überprüften Schritten können Sie die Einrichtung nachvollziehen. Eine KI kann Ausgaben erklären und Befehle an Ihren Server anpassen; ihre Vorschläge müssen dennoch geprüft werden. Das Projekt befindet sich weiterhin in Entwicklung. Beginnen Sie mit einer getrennten Testinstallation.

## Ein Prompt zum Kopieren

Kopieren Sie diesen Text in ChatGPT oder eine andere KI. Wenn die KI das Repository nicht lesen kann, geben Sie ihr die relevanten öffentlichen Anleitungsabschnitte – keine vollständigen Serverkonfigurationen.

```text
Hilf mir, das digitale Geschichtsarchiv aus diesem Repository auf einem
Linux-Server einzurichten und später sicher zu betreiben:
https://github.com/Kirchmeister/Geschichtsverein

Ich habe SSH-Zugriff, aber wenig Erfahrung mit Linux, Docker und Serverbetrieb.
Lies zuerst README.md, AGENTS.md, docs/betreiber-anleitung.md,
docs/installation.md und docs/server-updates.md. Verwende ein veröffentlichtes
stabiles Release und prüfe die aktuellen Voraussetzungen im Repository.

Beginne mit ausschließlich lesenden Prüfungen: Betriebssystem, freier Speicher,
vorhandene Dienste und Container, belegte Ports und vorhandene Installationen.
Frage nach einer Domain und danach, ob bereits ein HTTPS-Proxy eingerichtet ist.
Errate keine Serverpfade, Containernamen oder Mounts.

Erkläre jeden Schritt in einfacher Sprache. Gib mir jeweils nur einen kleinen
Befehlsblock, erkläre die erwartete Ausgabe und warte auf meine Rückmeldung.
Bei einem Fehler sollen wir zuerst dessen Ursache prüfen, statt weitere
Installationsbefehle auszuführen. Beginne mit einer getrennten Testinstanz.

Fordere keine Passwörter, privaten SSH-Schlüssel, Tokens, Einladungslinks oder
vollständigen app.env-/updater.json-Dateien an. Zugangsdaten bleiben auf meinem
Server. Zeige mir nur Befehle, die die für die Diagnose benötigten Angaben ausgeben.

Lass bestehende Webseiten, Nextcloud, Bezahldienste und andere Container unverändert.
Vor Änderungen an einer vorhandenen Installation brauche ich eine vollständige
Sicherung und einen geprüften Rückweg. Lösche keine Datenvolumes.

Erkläre ausdrücklich den Unterschied zwischen Archiv-App und separatem
Update-Dienst. Richte den Update-Dienst nur nach der Betriebsanleitung und einer
isolierten Prüfung ein. Die App aktualisiert ihn nicht automatisch.
Plane HTTPS und ARCHIVE_ORIGIN vor der ersten Passkey-Anmeldung.

Hilf mir abschließend, Anmeldung, Beispielbeiträge, Dateien, öffentliche Freigaben,
Sicherung und Wiederherstellung auf einer Testinstanz zu prüfen. Dokumentiere meine
konkreten Pfade, Container, Ports und beide Versionsstände ohne Geheimnisse.
```

Für eine bereits laufende Instanz ergänzen Sie: „Ich möchte keine Neuinstallation, sondern ein sicheres Update. Installiert sind App … und Update-Dienst … .“ Einstellungen → Hilfe bietet ebenfalls einen kopierbaren Prompt mit den ermittelten Versionsständen.

## 1. Die wichtigsten Begriffe

| Begriff | Bedeutung |
| --- | --- |
| SSH | Ihre Terminalverbindung zum Server. Befehle darin werden auf dem Server ausgeführt. |
| Docker-Image | Die gebaute Vorlage einer Programmversion. Ein neues Image allein ersetzt keinen laufenden Container. |
| Container | Das tatsächlich laufende Programm aus einem Image. |
| Archiv-App | Die Webseite mit Beiträgen, Konten und Einstellungen. |
| Update-Dienst / Updater | Ein separates Programm, das geprüfte App-Updates vorbereitet, sichert und installiert. |
| Daten und Konfiguration | Archivbestand, Medien und geheime Schlüssel. Sie müssen unabhängig vom Programmcode erhalten und gesichert werden. |

**App und Updater haben eigene Versionsnummern.** Beispielsweise können App 0.36.0 und Updater 0.35.0 zusammen funktionieren. Entscheidend ist die angezeigte Mindestanforderung, nicht die Gleichheit beider Nummern. Ein Update der App erneuert den Updater nicht. Der Updater ersetzt sich in dieser Version auch nicht automatisch selbst.

## 2. Den Server zunächst kennenlernen

Öffnen Sie Ihre bestehende SSH-Verbindung. Bei einer Passwortabfrage zeigt das Terminal beim Tippen gewöhnlich keine Zeichen an; das ist normal. Diese Befehle verändern nichts:

```bash
whoami
pwd
cat /etc/os-release
df -h
command -v docker
```

Falls Docker vorhanden ist:

```bash
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

Lassen Sie sich die Ausgabe erklären. Wenn Docker fehlt, installieren Sie es passend zum ermittelten Betriebssystem; übernehmen Sie keine Paketbefehle für ein anderes System. Prüfen Sie vorher, welche anderen Dienste laufen. Bei wenig freiem Speicher oder einer bestehenden Archivinstallation erst die Situation klären.

## 3. Eine neue Testinstallation einrichten

Diese Schritte gelten ausschließlich für eine neue, getrennte Installation. Für vorhandene Daten springen Sie zum Updateabschnitt.

1. **Rahmen klären:** Domain beziehungsweise lokale Testadresse, HTTPS, freier Port, Speicherplatz und Sicherungsort festlegen. Auf einem öffentlichen Server schützt ein vorhandener oder gezielt eingerichteter HTTPS-Proxy die App. Andere Webseiten nicht überschreiben.
2. **Quellcode beziehen:** Ein stabiles Release des Repositorys in einen neuen Ordner herunterladen. GitHub-Releases sind unter https://github.com/Kirchmeister/Geschichtsverein/releases zu finden. Der Programmcode enthält keine Vereinsdaten und keine fertigen Benutzerkonten. Das öffentliche Repository erfordert keine GitHub-Anmeldung zum Lesen.
3. **Konfiguration einmalig erzeugen:** `scripts/linux-init.mjs` erstellt die geschützte Datei `linux-config/app.env`. Die konkrete Ausführung über das Node-24-Docker-Image ist in [Lokal testen](local-wsl.md) beschrieben. Vorhandene Konfiguration nicht neu erzeugen und nicht in einen Chat kopieren.
4. **Anmeldeadresse festlegen:** `ARCHIVE_ORIGIN` auf die endgültige Anmeldeadresse setzen, bevor Sie einen Passkey registrieren. Auf dem Telefon ist vertrauenswürdiges HTTPS erforderlich. Ein bloßer Wechsel der Domain überträgt bestehende Passkeys nicht.
5. **App bauen und starten:** Nur in dieser neuen Installation den dokumentierten Docker-Compose-Start verwenden. Der Standard bindet die App an `127.0.0.1:8080`; von einem anderen Rechner ist diese Adresse nicht direkt erreichbar. Für einen SSH-Tunnel oder HTTPS-Proxy lassen Sie sich die passende Einrichtung erklären. Der erste Build kann längere Zeit dauern.
6. **Ersten Administrator einladen:** Der einmalige Konsolenbefehl aus [Lokal testen](local-wsl.md#3-ersten-administrator-einladen) erzeugt einen privaten Einladungslink. Name und E-Mail-Adresse anpassen, den Link selbst öffnen und den Passkey registrieren. Es gibt kein allgemeines Standardpasswort. Den Link nicht öffentlich teilen.
7. **Oberfläche einrichten:** Ort, Vereinsname, Karte und gegebenenfalls QR-Adresse eingeben. Erst mit Beispielbeiträgen und Testdateien prüfen. Weitere Personen über „Benutzer & Einladungen“ einladen.
8. **Sicherung üben:** Eine vollständige Sicherung herunterladen und auf einer getrennten Testinstanz wiederherstellen. Erst danach echte Vereinsdaten übernehmen. Details stehen unter [Installation und Wiederherstellung](installation.md).

Bewahren Sie mindestens einen funktionierenden SSH-Zugang, die geschützte Serverkonfiguration und eine externe Sicherung auf. Eine portable TAR-Sicherung enthält Archivdaten, aber nicht Ihre Passkeys und Dienstpasswörter; für einen vollständigen Serverrückweg werden auch die lokale Konfiguration und die entsprechende Datensicherung benötigt.

## 4. Den Update-Dienst gesondert einrichten

Eine funktionierende App kann noch keinen eingerichteten Updater haben. **Einstellungen → Updates** zeigt diesen Unterschied an. Die Ersteinrichtung des Dienstes ist ein eigener Betreiber-Schritt über SSH.

Gehen Sie mit der KI oder einer sachkundigen Person die [Server-Update-Anleitung](server-updates.md#docker-einrichtung-durch-den-betreiber) durch. Sie muss Ihre tatsächlichen Daten- und Konfigurationsablagen, Benutzerkennung, Containernamen, lokalen Ports und den bereits laufenden Programmstand prüfen. Eine bestehende Docker-Volume-Installation darf nicht ungeprüft auf andere Ablagen umgestellt werden.

Der Updater läuft getrennt von der App. Er erhält die geprüften Ablagen und den Docker-Socket, bindet seinen Port nur lokal und wird nicht über den öffentlichen HTTPS-Proxy erreichbar gemacht. Der Docker-Socket gehört nicht in die Web-App. Seine Einrichtung muss zunächst mit einer isolierten Kopie geprüft werden. Bei einer Installation mit systemd oder einem eigenen Treiber keine Docker-Austauschbefehle übernehmen.

Wenn der Updater die App bereits verwaltet, **kein zusätzliches `docker compose up` für die alte Installation ausführen**. Dadurch könnte der verwaltete Container überschrieben oder eine zweite Instanz gestartet werden.

## 5. Jedes Update in derselben Reihenfolge durchführen

Öffnen Sie als Administrator **Einstellungen → Updates**. Dort stehen App-Version, Updater-Version, verfügbare Releases und ein verständlicher Status. Anleitung und SSH-/KI-Begleitung befinden sich ab 0.42.0 unter Einstellungen → Hilfe.

1. **Neue vollständige Sicherung vorbereiten.** Unter Backups herunterladen beziehungsweise extern ablegen. Die lokale Rückfallsicherung beim App-Update ist zusätzlich hilfreich, ersetzt aber keine externe Sicherung vor einem manuellen Dienstwechsel.
2. **Updater prüfen.** Zeigt die Oberfläche „Bereit“, ist kein Dienstwechsel allein wegen einer anderen App-Versionsnummer nötig. Zeigt sie eine höhere erforderliche Dienstversion, zuerst den Updater erneuern. Bei einer unbekannten oder nicht erreichbaren Version zunächst diagnostizieren.
3. **App aktualisieren.** Ein kompatibles Release auswählen und den Bestätigungsdialog lesen. Erforderliche Zwischenversionen werden einzeln installiert und bestätigt. Betas sind freiwillig; standardmäßig werden nur stabile Releases angeboten.
4. **Ergebnis prüfen.** App- und Dienstversion kontrollieren, anmelden und einige Beiträge sowie Dateien öffnen. Bei Fehlern den angezeigten Text notieren. Den alten Updater als Rückfallmöglichkeit zunächst behalten.

Beim App-Update werden Sicherung und Wiederherstellung geprüft; danach wird die Zielmigration auf einer separaten Kopie getestet. Erst anschließend werden Live-Daten verändert. Schließen des Fortschrittsfensters stoppt den Vorgang nicht. Während eines Updates oder Restores den Updater nicht ersetzen und keine weiteren Installationsbefehle starten.

## 6. Einen vorhandenen Docker-Updater erneuern

**Nicht während eines laufenden Updates.** Die App kann während des Dienstwechsels normalerweise weiterlaufen. Ein unterbrochener oder fehlgeschlagener Updatejob muss zuerst geklärt werden.

### A. Den richtigen Container und seine Einstellungen ermitteln

```bash
sudo docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
read -r -p "Name des vorhandenen Updater-Containers: " archive_updater_container
sudo docker inspect "$archive_updater_container" \
  --format 'Image: {{.Config.Image}}
Netzwerk: {{.HostConfig.NetworkMode}}
Neustart: {{.HostConfig.RestartPolicy.Name}}
{{range .Mounts}}Mount: {{.Source}} → {{.Destination}}; schreibbar={{.RW}}
{{end}}'
```

Geben Sie den tatsächlich angezeigten Updaternamen ein, nicht den App- oder Testcontainer. Diese Ausgabe enthält keine Umgebungsgeheimnisse. Verwenden Sie nicht stattdessen eine ungefilterte vollständige `docker inspect`-Ausgabe im Chat.

Für den dokumentierten Node-/Docker-Updater zeigt dieser Lesebefehl nur Konfigurationspfad und Jobstatus:

```bash
sudo docker exec "$archive_updater_container" node -e '
const fs = require("node:fs");
const file = process.env.ARCHIVE_UPDATER_CONFIG;
if (!file) throw Error("Konfigurationspfad fehlt; Installationsart prüfen");
const c = JSON.parse(fs.readFileSync(file, "utf8"));
const s = JSON.parse(fs.readFileSync(c.root + "/update-state.json", "utf8"));
console.log("Konfigurationsdatei: " + file);
console.log("Letzter Vorgang: " + (s.job?.status || "Keiner"));
if (s.job && !["complete", "rolled_back"].includes(s.job.status)) {
  console.error("Vorgang offen. Updater nicht ersetzen.");
  process.exit(1);
}
console.log("Update-Dienst im Leerlauf");
'
```

### B. Passende Austauschbefehle vorbereiten lassen

Geben Sie der KI diese gefilterten Ausgaben und die gewünschte Dienstversion. Sie soll nach der [bestehenden Austausch-Anleitung](server-updates.md#vorhandenen-docker-update-dienst-ersetzen) Befehle für genau Ihre Installation vorbereiten:

- Das passende veröffentlichte Release in eine separate Build-Ablage holen; keinen laufenden Quellstand überschreiben.
- Nur `Dockerfile.updater` bauen und die Image-Version mit einem kurzlebigen Prüfcontainer ohne Daten-Mounts und ohne Docker-Socket lesen.
- Den Leerlauf unmittelbar vor dem Wechsel erneut prüfen.
- Den bisherigen Updater anhalten und unter einem eindeutigen Rückfallnamen behalten.
- Den neuen Updater mit derselben geprüften Konfiguration starten. Mounts, Netzwerk, Neustartregeln und sonstige erforderliche Einstellungen erhalten. Ein verkürztes Beispiel darf keine benötigten Einstellungen weglassen.
- Start, Versionsnummer und lokalen Listener prüfen. Ein sofortiges „Up Less than a second“ allein genügt nicht; nach dem Start erneut prüfen.

Es gibt absichtlich keinen universellen Austauschbefehl mit geratenen Hostpfaden. Wenn der neue Dienst nicht startet, **kein App-Update beginnen**. Gefilterte Fehlermeldungen prüfen und den vorbereiteten Rückweg verwenden. Beim Rückwechsel zuerst sicherstellen, dass kein neuer Job läuft; niemals zwei Updater gleichzeitig starten.

### C. Zur Oberfläche zurückkehren

„Status und Updates prüfen“ aktualisiert die Anzeige. Erst wenn der Dienst erreichbar ist und seine Mindestanforderungen erfüllt, das App-Update vorbereiten. Für normale App-Updates genügt Dienst 0.35.0 weiterhin. Für die manuelle Rücknahme und den vollständigen Protokoll-Download ab App 0.42.0 benötigen Sie ausdrücklich Dienst 0.42.0. Erneuern Sie ihn nach Abschnitt 6 mit dem Release-Tag `v0.42.0`, sobald kein Vorgang läuft. Das App-Update allein schaltet diese Dienstfunktionen nicht frei.

### D. Bilder nach dem Update auf 0.37.0

Für neue Bilder ist beim Hochladen jeweils eine eigene Beschriftung erforderlich. Bei mehreren Bildern alle Beschriftungsfelder ausfüllen und danach „Ausgewählte Dateien hochladen“ anklicken. Anschließend den Beitrag speichern. Bereits vorhandene Bilder bleiben auch ohne Beschriftung sichtbar. Wenn Sie einen solchen Beitrag bearbeiten und speichern, ergänzen Sie zuerst alle fehlenden Bildbeschriftungen. Die vorhandenen Bilder müssen dafür nicht erneut hochgeladen werden. Unter Bildern stehen künftig Beschriftungen statt Dateinamen; direkte Bild-Download-Links entfallen.

### E. Kleine Beitragskarte und Bedienung ab 0.38.0

Beim Bearbeiten eines Beitrags klappen Sie „Standort auf der Karte“ auf. Unter „Karte im öffentlichen Beitrag“ können Sie den Standard oder einen aktivierten Kartenanbieter wählen. Wenn nur OpenHistoricalMap aktiviert ist, zeigt auch die kleine Beitragskarte automatisch historische Karten. Bei beiden aktiven Karten bleibt OpenStreetMap der Standard. Wird die gewählte Karte später deaktiviert, erscheint die noch aktive Karte. Ohne aktive Karte bleibt die kleine Karte ausgeblendet. Der Text unter der kleinen Karte nennt ab 0.38.2 passend zur angezeigten Karte „Standort auf der heutigen Karte“ oder „Standort auf der historischen Karte“. Das öffentliche Standortfeld muss weiterhin freigegeben sein. Speichern Sie die Wahl im Beitrag und beantragen Sie bei Bedarf eine neue Veröffentlichung.

In der internen Leseansicht stehen Schließen-X und „Eintrag bearbeiten“ oben in einer festen Leiste. Scrollen Sie im Beitrag; die Leiste bleibt erreichbar. Ab 0.43.0 entfällt der doppelte Bearbeiten-Button unten. Dort stehen nur Versionshistorie und – für Administratoren – Eintrag löschen, kompakter und mit ausreichend Abstand.

### F. Einen Entwurf verwerfen ab 0.38.1

Beim Öffnen des Bearbeitungsfensters ist kein Textfeld automatisch ausgewählt. Klicken oder tippen Sie das gewünschte Feld zum Bearbeiten an. Wenn Sie Ihre Änderungen nicht behalten möchten, wählen Sie unten im Bearbeitungsfenster „Entwurf verwerfen“ und bestätigen Sie die Rückfrage. Das Fenster schließt sich und der Hinweis auf diesen lokalen Entwurf verschwindet. Der zuletzt gespeicherte Beitrag und seine Freigabe bleiben erhalten; Sie müssen nichts speichern oder neu genehmigen lassen. „Abbrechen“ oder das Schließen-X bewahren den Entwurf weiterhin, damit Sie später fortsetzen können.

### G. Veröffentlichungshinweise ab 0.39.0

Neue Veröffentlichungsanfragen stehen weiterhin auf der Startseite unter „Ausstehende Veröffentlichungsanfragen“. Das System verschickt dafür keine internen Nachrichten und keine Erinnerungsnachrichten nach drei Tagen mehr. Bereits vorhandene Nachrichten bleiben erhalten.

Öffnen Sie Ihre persönlichen Push-Einstellungen. Als Admin oder Verwalter können Sie „Neue Veröffentlichungsanfrage“ ein- oder ausschalten; ein normaler Nutzer hat diese Option nicht. „Eigener Beitrag zur Veröffentlichung freigegeben“ informiert die Person, die die Anfrage gestellt hat, nach der Genehmigung. Diese Option ist standardmäßig ausgewählt. Beide Hinweise benötigen weiterhin eine insgesamt aktivierte Push-Zustellung und die Browser-/Geräteberechtigung. Sie sind unabhängig von der Option „Neue interne Nachricht“. Beim Update werden frühere Vorgänge nicht nachträglich versendet.

### H. Ungefähre Datierungen ab 0.40.0

Tragen Sie das Jahr wie bisher als Zahl ein, zum Beispiel 1520. Für eine unsichere Datierung aktivieren Sie darunter „Datierung ist ungefähr (ca.)“. Der Beitrag zeigt dann „ca. 1520“. Die eine Checkbox gilt gemeinsam für Zeitraum, Beginn und Ende; ein Zeitraum erscheint beispielsweise als „ca. 1520–1530“. Die technische Sortierung und die Jahresfilter ändern sich dadurch nicht. Ohne Datierung erscheint kein „ca.“. Bereits in den freien Text eingetragenes „ca.“ wird nicht verdoppelt und beim Ausschalten nicht gelöscht.

Bestehende Beiträge bleiben ohne Zusatz, bis die Option ausdrücklich aktiviert wird. Speichern Sie die Änderung und beantragen Sie bei Bedarf erneut die Veröffentlichung. Die Kennzeichnung bleibt in Versionen und Sicherungen erhalten. Beim Zurückholen einer früheren Datierungsangabe wird ihre gemeinsame Circa-Kennzeichnung mit übernommen; beachten Sie, dass sie auch die übrigen Datierungsfelder betrifft.

### I. Das neue Archiv ab 0.41.0

Auf der Startseite bleiben die Übersicht, Eintrag anlegen und Veröffentlichungsanfragen. Zum Recherchieren öffnen Sie **Archiv** direkt unter Startseite im Menü. Alternativ wählen Sie eine der bisherigen Recherchekacheln; diese stellt passende Filter im Archiv ein. Sie können alle Filter anschließend ändern oder entfernen.

Geben Sie einen Suchbegriff ein und kombinieren Sie Kategorie, Forschungsstand, Jahresbereich, Medien oder die weiteren Filter. Suche und Filter sind miteinander kombinierbar. Die Suche nach Personen/Familien zeigt passende Namen zur Auswahl. „Filter zurücksetzen“ zeigt wieder den vollständigen für Ihr Konto zugänglichen Bestand. Die Datierung kann auch als Zeitleiste sortiert angezeigt werden.

Unten und oberhalb der Ergebnisse stehen Seitenzahlen und „Einträge … von …“. Sie können 10, 20, 50 oder 100 Beiträge pro Seite wählen. Der Browser merkt sich diese Auswahl nach Möglichkeit. Bei neuen Filtern geht es automatisch auf die erste Seite. Kopieren Sie die Adresse aus der Adressleiste, um eine gefilterte Ansicht weiterzugeben. Der Empfänger benötigt weiterhin ein berechtigtes Konto; Gäste sehen nur ihre freigegebenen Felder. Browser-Zurück/Vorwärts und Neuladen behalten die passende Ansicht. Eine notwendige Anmeldung führt zum geteilten Archivlink zurück.

Ein Beitrag wird vollständig erst beim Öffnen geladen. Suche und Seitenabfragen benötigen keine vollständige Neuladung der Webseite. Falls keine Ergebnisse erscheinen, löschen Sie einzelne aktive Filter oder verwenden Sie „Filter zurücksetzen“.

### J. Einstellungen und Updates ab 0.42.0

Unter **Einstellungen für Gäste → Sichtbare Felder für Gäste** finden Sie die bisherige Gast-Feldauswahl. Unter **Öffentliches Profil → Sichtbare Felder** liegen die öffentlichen Felder; Überschrift und Einführungstext können Sie darunter bearbeiten. Die Umordnung verändert keine gespeicherten Freigaben.

Unter **Backups** wählen Sie den Anzeigezeitraum über ein Dropdown: 1, 3, 7, 14 oder 31 Tage. Ohne bisherige Auswahl sind 3 Tage eingestellt. Bereits gespeicherte 7/14/31 Tage werden nicht überschrieben. Laufende Sicherungen bleiben sichtbar. Der Filter löscht nichts und verändert die Nextcloud-Aufbewahrung nicht.

**Hilfe** enthält die Betreiberanleitung, die Erklärung von App und Update-Dienst sowie die einklappbare SSH-Hilfe und den KI-Prompt. Bei einem Dienstproblem führt „Passende Hilfe öffnen“ direkt dorthin. Auf der Update-Seite bedeutet **Status und Updates prüfen**: Dienststatus erneut lesen und bei erreichbarem Dienst nach GitHub-Releases suchen. Der Button installiert nichts und erneuert keinen Dienst.

**Zuletzt installierte Updates** zeigt maximal fünf erfolgreich abgeschlossene Installationen. Öffnen Sie eine Karte für Zeitpunkte, Version, Änderungsnotizen und Ablauf. Die GitHub-Notizen werden für den passenden Release-Commit gespeichert und sind danach ohne GitHub-Verbindung lesbar. Für ältere Vorgänge werden sie bei der Suche nach Möglichkeit nachgeladen. Ist ein Release oder sein Programmstand nicht mehr verfügbar, bleibt ein entsprechender Hinweis statt erfundener Notizen. Ein später zurückgenommenes Update bleibt als historische Installation dokumentiert.

**Update-Protokoll herunterladen** speichert alle noch vorhandenen Vorgänge als lesbare Textdatei, auch ältere als die fünf Karten, fehlgeschlagene Versuche, Bestandswiederherstellungen und manuelle Rücknahmen. Es enthält Phasen und Ergebnisse, aber keine Hostpfade, Konfigurationsdateien, Zugangsdaten oder rohen Treiberausgaben. Bereits gelöschte historische Vorgänge können nicht rekonstruiert werden. Für den vollständigen Export benötigen Sie den separaten Dienst 0.42.0.

### K. Ein problematisches Update bewusst rückgängig machen

**Dies ist keine normale Aktualisierung. Programmversion UND Daten/Konfiguration werden gemeinsam zurückgesetzt.** Seit der Rückfallsicherung erstellte oder geänderte Beiträge, Dateien, Konten und Einstellungen sind anschließend im aktiven Archiv nicht mehr enthalten. Auch Ihr Passkey oder Ihre Adminberechtigung kann auf den damaligen Stand zurückgehen. Halten Sie einen funktionierenden SSH-Zugang bereit. Wählen Sie diesen Weg nur, wenn Sie genau diesen älteren Bestand wieder benötigen; bei Unsicherheit erst Hilfe einholen.

Voraussetzungen: App 0.42.0 und separater Update-Dienst 0.42.0, Administratorzugang, kein laufender oder offener Vorgang und ein unmittelbar letztes erfolgreiches App-Update. Nach einer Bestandswiederherstellung oder einer bereits erfolgten Rücknahme wird keine weitere beliebige Kette älterer Versionen angeboten. Die alte Release-Ablage, ihr Docker-Image und die vollständige lokale Sicherung müssen noch vorhanden sein. Die Konfiguration des Update-Dienstes darf seit dem Update nicht verändert worden sein; sonst ist die Rücknahme gesperrt, damit Dienst und zurückgesetzte App weiterhin sicher zusammenarbeiten. Entfernen Sie diese nicht vorschnell. Eine Verbindung zu GitHub ist für die Rücknahme nicht erforderlich.

1. Laden Sie nach Möglichkeit zusätzlich eine externe Sicherung und das Update-Protokoll herunter.
2. Öffnen Sie **Updates → Letztes Update rückgängig machen** und lesen Sie die Warnung.
3. Wählen Sie **Rückfallsicherung prüfen …**. Der Dienst prüft Prüfsummen, Programmstand und Metadaten und erprobt den alten Bestand auf einer isolierten Kopie. Die App bleibt während dieser Prüfung erreichbar. Bei einem Fehler nicht fortfahren.
4. Kontrollieren Sie aktuelle Version, Rückkehrversion und den angezeigten Datenstand. Die Prüfung gilt 20 Minuten und nur für den unveränderten Update-Ausgangsstand.
5. Geben Sie exakt **UPDATE RÜCKGÄNGIG MACHEN** ein und bestätigen Sie die verbindliche Rücknahme.
6. Der Dienst aktiviert den Wartungsmodus und erstellt zuerst eine neue, vollständig geprüfte Sicherung des aktuellen neueren Stands. Scheitert das, wird der alte Bestand nicht eingespielt. Danach stellt er alte Daten, Konfiguration und Programmversion gemeinsam wieder her – ohne Rückwärtsmigration der aktuellen Datenbank.
7. Warten Sie auf die Funktionsprüfung. Das Schließen des Fortschrittsfensters stoppt den Servervorgang nicht. Nach Abschluss neu anmelden und Beiträge sowie Dateien prüfen. Bei einem Fehler oder Dienstneustart versucht der Dienst, den zusätzlich gesicherten neueren Stand wieder zu aktivieren. Bei beschädigter Sicherung bleibt der Wartungsmodus bestehen; nicht manuell umgehen.

Die zusätzliche Sicherung des neueren Stands bleibt lokal beim Updater in seiner `backups`-Ablage, einschließlich geprüftem Manifest, Daten, Konfiguration und Code. Sie wird nicht automatisch nach Nextcloud übertragen und ist kein portabler TAR-Download aus der normalen Backup-Liste. Behalten Sie sie und lassen Sie einen benötigten Rückweg zu diesem neueren Bestand anhand des Protokolls fachkundig über SSH planen. Ein erneutes App-Update allein übernimmt die neueren Daten nicht; es gibt keine automatische Zusammenführung und keinen automatischen „Rücknahme rückgängig“-Button. Geheime Konfiguration niemals in einen Chat kopieren.

### L. Dauerhafte Backup-Erinnerung ab 0.43.0

Wenn keine einsatzbereite automatische Sicherung aktiviert ist und mindestens 31 Kalendertage seit der letzten erfolgreichen Sicherung vergangen sind, sehen Administratoren beim Einloggen einen dauerhaften Hinweis. Er zeigt zum Beispiel „Seit 32 Tagen wurde keine erfolgreiche Sicherung erstellt“ und zählt am nächsten Tag weiter. Die Berechnung verwendet den deutschen Kalender. Ohne bisherige erfolgreiche Sicherung erscheint sofort ein entsprechender Hinweis. Gäste, Nutzer und Verwalter sehen ihn nicht; auch Rollen-Vorschauen sind ausgenommen.

Der Hinweis lässt sich nicht wegklicken. Er bleibt auch nach bloßem Aktivieren der täglichen Nextcloud-Sicherung sichtbar, bis tatsächlich eine neue Sicherung erfolgreich abgeschlossen wurde. Ein laufendes oder fehlgeschlagenes Backup reicht nicht. Die Erinnerung wird bei Rückkehr zur Seite und regelmäßig aktualisiert. Sollte der Status nicht erreichbar sein, bleibt eine entsprechende Prüfmeldung sichtbar.

Wählen Sie **Jetzt Backup erstellen**. Sie gelangen direkt zu **Einstellungen → Backups**; der Bereich ist aufgeklappt und die Sicherungsaktionen werden angezeigt. Erst dort starten Sie ein manuelles Backup oder eine Nextcloud-Sicherung. Der Link startet nichts ohne Ihre Auswahl. Nach erfolgreichem Abschluss verschwindet der Hinweis. Der Anzeigezeitraum im Backup-Dropdown beeinflusst weder diese Prüfung noch gespeicherte Sicherungen. Interne Rückfallsicherungen des Updaters sind ein zusätzlicher lokaler Schutz und zählen nicht als diese regulären Sicherungen.

### M. Eintrag löschen oder frühere Werte übernehmen ab 0.43.0

Zum Bearbeiten verwenden Sie den dauerhaft sichtbaren oberen Button. Der doppelte untere Button entfällt. **Versionshistorie** öffnet nur den Vergleich; es wird nichts verändert.

**Eintrag löschen** zeigt zuerst einen Dialog mit dem Beitragstitel und einer Warnung. Anfangs ist **Abbrechen** ausgewählt. Erst die ausdrückliche Löschbestätigung entfernt den Eintrag aus dem aktiven Archiv. Administratoren können ihn weiterhin unter Gelöschte Einträge wiederherstellen; die Versionshistorie bleibt erhalten. Bei einem Fehler bleibt der Dialog geöffnet. Ein inzwischen veränderter Beitragsstand wird nicht blind gelöscht.

Auch **Wert zurückholen**, **Ausgewählte Werte zurückholen** und **Gesamte Version übernehmen** zeigen eine Rückfrage mit dem früheren Zeitpunkt und den betroffenen Feldern. Bestätigen übernimmt die Werte zunächst ins Bearbeitungsformular. Kontrollieren Sie sie dort. Erst beim anschließenden Speichern wird eine neue Version erstellt; gegebenenfalls ist eine neue Veröffentlichungsfreigabe nötig. Abbrechen übernimmt nichts und beantragt keine Freigabe. Die übrigen Werte bleiben bei einer gezielten Übernahme erhalten, einschließlich der bestehenden Regeln für verknüpfte Datierungen und Beschreibungszuordnungen.

Für diese Änderungen ist nach bereits installiertem Update-Dienst 0.42.0 kein weiterer Dienstwechsel nötig.

### N. Das entfernte Interpretationsfeld ab 0.44.0

„Eigene Interpretation“ erscheint nicht mehr im Formular, in Beitragsansichten, Gast-/öffentlicher Ansicht, Freigabeprüfung, Feldauswahl oder Versionshistorie. Es wird auch nicht mehr für Suchtreffer im Archiv, öffentlichen Profil und Änderungsprotokoll verwendet. Andere Textfelder wie Beschreibung, Quellen und offene Fragen bleiben bestehen.

Ihre bisherigen Inhalte und die zugehörige Formatierung werden nicht gelöscht. Sie bleiben in der Datenbank, früheren Beitragsversionen und vollständigen Sicherungen erhalten. Wenn Sie andere Angaben bearbeiten oder frühere sichtbare Werte übernehmen, bewahrt der Server die aktuell gespeicherte Interpretation unverändert. Das Feld lässt sich über die Oberfläche nicht mehr bearbeiten oder zurückholen. Auch eine früher aktivierte öffentliche oder Gast-Freigabe liefert es nicht mehr aus. Sie müssen dafür keine Feldauswahl manuell korrigieren und keine Datenmigration durchführen. Der bereits eingerichtete Update-Dienst muss für diese Änderung nicht erneuert werden.

### O. Textbearbeitung und Gliederung ab 0.45.0

„Eintrag bearbeiten“ gliedert sich in vier offene Rahmen: Grunddaten, Beschreibung und Verknüpfungen, Quellen und Forschung sowie Dateien und Nutzungsrechte. Am Ende stehen die gemeinsamen Speicheraktionen. Beschreibung, Quellen, offene Fragen und Nutzungsrechte passen ihre Höhe automatisch dem Inhalt an. Sie können Text einfügen, tippen oder über die Gerätetastatur diktieren; das Feld wächst nach unten. Beim Kürzen schrumpft es wieder bis zu einer Mindesthöhe. Scrollen Sie im Dialog, um darunterliegende Abschnitte zu erreichen.

Die kleine Checkbox **Markdown** steht unmittelbar vor ihrem Namen. **Bearbeiten** zeigt den Quelltext, **Vorschau** das Ergebnis. Die Symbole bedeuten: B = Fett, I = Kursiv, H = Überschrift, Aufzählung = Liste, Anführungszeichen = Zitat, Kette = Link, Raster = Tabelle. Am Computer zeigen sie beim Darüberfahren ihren Namen; Screenreader erhalten dieselben Beschriftungen. Die Buttons haben gleich große Bedienflächen.

Markieren Sie Text und wählen Sie ein Format. Ein erkennbares aktives Format wird hervorgehoben. Noch einmal drücken entfernt die betreffende Auszeichnung; der Text bleibt erhalten. Bei Überschrift, Liste und Zitat sind die betroffenen Zeilen maßgeblich. Bei bereits zusammenhängend ausgezeichnetem Text wird die umgebende Formatierung entfernt. Der allgemeine Linkbutton setzt zunächst `https://example.org` ein; ersetzen Sie die Adresse im Quelltext durch das gewünschte Ziel. Eine vorhandene Markdown-Tabelle wird mit dem Tabellenbutton in Text mit Tabulatoren zwischen den Zellen und Zeilenumbrüchen zwischen den Zeilen umgewandelt. Alle Zellinhalte einschließlich Überschriften und Beispielwerte bleiben erhalten; kontrollieren Sie den Text danach.

Für interne Beitragslinks markieren Sie zuerst eine passende Textstelle und wählen **Beitrag verknüpfen**. Suchen Sie nach Titel oder Referenz und wählen Sie den Beitrag. **Person/Familie zuordnen** öffnet die Namenssuche und Auswahl der Art. Die bestehenden Zuordnungen darunter können bearbeitet beziehungsweise entfernt werden. Formatierungsbuttons erhalten ihre Textpositionen; normale Änderungen innerhalb des zugeordneten Textes entfernen die betreffende Zuordnung wie bisher. Alle Änderungen müssen anschließend gespeichert werden.

Beim iPhone entfällt die bisherige Verschiebungs-/Zoom-Geometrie des Bearbeitungsdialogs; die Schrift ist mindestens 16 px groß und die Höhe wird ohne Zusammenziehen des aktiven Feldes gemessen. Bitte nach dem Update am iPhone prüfen: vorhandenen Text öffnen, Cursor in verschiedene Zeilen setzen, einzelne Zeichen einfügen/löschen, Text markieren, formatieren und diktieren. Eine Bildschirm-/Cursorabweichung ist ohne echten Gerätetest nicht abschließend überprüfbar. Falls sie weiterhin auftritt, iOS-Version, Browser/Web-App-Modus und verwendeten Zoom notieren. Kein erneuter Wechsel des Update-Dienstes nötig.

## 7. Häufige Situationen

| Anzeige / Situation | Nächster Schritt |
| --- | --- |
| Update-Dienst noch nicht eingerichtet | Einrichtung getrennt von der App planen; zuerst die Anleitung lesen. |
| Dienstversion nicht ermittelbar | Über SSH die tatsächliche Version prüfen; nicht als „aktuell“ interpretieren. |
| Update-Dienst nicht erreichbar | Container-/Dienststatus und Verbindung prüfen, dann „Status und Updates prüfen“. Keine Daten löschen. |
| Update-Dienst zuerst erneuern | Mindestversion beachten, Leerlauf und Sicherung prüfen, passenden Dienstwechsel vorbereiten. |
| Ein Vorgang läuft | Fortschritt abwarten. Der Dienst darf jetzt nicht ersetzt werden. |
| Zwischenversionen erforderlich | Den angezeigten sicheren Pfad Schritt für Schritt ausführen; kein Sprung auf Verdacht. |
| Wiederherstellung zuerst abschließen | Fehler klären und den geprüften Rückweg abschließen. Wartungssperre nicht manuell umgehen. |

Notieren Sie Ihre Installation an einem geschützten Ort: Repository, App- und Updater-Version, Containernamen, Ablagen, Ports und Sicherungsort. Geheimnisse gehören getrennt in die geschützte Konfiguration. Teilen Sie bei einer Hilfsanfrage nur die benötigten gefilterten Angaben.

## Einstellungen für Verwalter ab 0.46.0

Der Menüpunkt **Öffentliches Profil** befindet sich unten, oberhalb von **Einstellungen**. Ohne Einstellungsrechte ist er der letzte Menüpunkt vor dem eigenen Konto.

Verwalter dürfen **Namen**, **Benutzer und Einladungen**, **Einstellungen für Gäste**, **Öffentliches Profil**, **Farben und Design** und **Karte** verwalten. Backups, Updates, E-Mail/SMTP, Nextcloud/WebDAV, Serverdomain und Hilfe bleiben Administratoren vorbehalten. Diese Grenzen gelten auch bei direkten Schnittstellenaufrufen und in der Profilvorschau.

### Administratorzugang über einen Verwalter ersetzen

1. Als Verwalter **Einstellungen → Benutzer & Einladungen** öffnen.
2. Beim Konto einer erreichbaren, vertrauenswürdigen Person die Rolle **Administrator** auswählen. Alternativ eine neue Person als Administrator einladen.
3. Den Hinweis auf vollständigen Zugriff lesen und die Vergabe ausdrücklich bestätigen. Abbrechen ändert nichts.
4. Die Person meldet sich erneut an beziehungsweise registriert über den privaten Einladungslink ihren Passkey.

Der neue Administrator erhält vollständigen Zugriff einschließlich Updates und Sicherungen. Verwalter dürfen bestehende Administratorkonten nicht verändern, sperren, löschen oder herabstufen. Sie können das eigene Konto hier nicht hochstufen; wählen Sie eine andere Person. Die Anwendung schützt den letzten aktiven Administrator unabhängig davon, wer die Änderung versucht. Ein deaktivierter Administrator zählt nicht als Ersatz.

Unter **Protokoll der Administratorvergaben** stehen die letzten 50 Vergaben und erstellten Administrator-Einladungen mit Zeitpunkt, ausführendem Konto und Empfänger. Ältere Protokolle bleiben gespeichert und werden mitgesichert. Eine protokollierte Einladung bedeutet noch nicht, dass sich die Person registriert hat. Der Widerruf einer Einladung entfernt den historischen Vergabeeintrag nicht. Dieses Protokoll ist keine manipulationssichere externe Aufzeichnung; Serverbetreiber mit Datenbankzugriff können Daten verändern.

## Notfallzugang über SSH

Nutzen Sie diesen Weg nur, wenn kein Administrator oder Verwalter mehr erreichbar ist. Er setzt berechtigten SSH-Zugriff auf Ihren eigenen Server voraus. Die Routine erstellt einen neuen einmaligen Administrator-Einladungslink und protokolliert den Vorgang als SSH-Wiederherstellung. Sie setzt keine Passkeys zurück und löscht keine Konten oder Archivdaten.

1. Warten Sie, bis Updates und Wiederherstellungen vollständig abgeschlossen sind. Keine Wartungssperre umgehen.
2. Mit SSH anmelden. Mit `sudo docker ps --format 'table {{.Names}}\t{{.Image}}'` den **Anwendungscontainer** ermitteln, nicht den Updater.
3. Im folgenden Befehl `APP_CONTAINER` durch dessen Namen ersetzen. Verwenden Sie eine erreichbare E-Mail-Adresse, die noch keinem Konto dieser Instanz gehört. Name ebenfalls anpassen. Die Adresse muss nicht öffentlich geteilt werden.

```bash
sudo docker exec APP_CONTAINER node scripts/linux-start.mjs scripts/linux-recover-admin.mjs 'neuer-admin@example.org' 'Neuer Administrator' 'ADMINISTRATORRECHTE VERGEBEN'
```

4. Der Befehl zeigt einen vertraulichen Link. Öffnen Sie ihn auf der tatsächlichen HTTPS-Adresse der Instanz und registrieren Sie einen Passkey. Der Link gilt sieben Tage und ist nur einmal verwendbar. Nicht öffentlich oder in einen KI-Chat kopieren.
5. Nach der Anmeldung einen zweiten Passkey einrichten, vorhandene Administratorzugänge prüfen und vertrauenswürdige Stellvertretungen bestimmen. Nicht mehr benötigte Einladungen widerrufen.

Falls die Adresse bereits existiert, bricht die Routine ab. Verwenden Sie eine andere erreichbare Adresse; bearbeiten Sie nicht auf Verdacht die Datenbank. Ohne SSH-Zugriff muss der zuständige Serverbetreiber helfen. Diese Anleitung gilt ab App 0.46.0 und benötigt keinen Austausch des separaten Updaters.


### GitHub-Fehler bei Update-Suche oder Start

Version 0.46.1 korrigiert die Abfragewiederholungen und die Fehleranzeige. **Den separaten Update-Dienst nach Abschnitt 4 auf 0.46.1 erneuern**, anschließend die App aktualisieren. Ein App-Update allein ersetzt den laufenden Dienst nicht. Bei einer bereits blockierten GitHub-Abfrage kann das App-Update erst nach Ablauf der Sperre oder nach Korrektur der Zugangskonfiguration gelingen.

Die bisherige Suche prüfte auch die Metadaten für bis zu fünf historische Installationen erneut; der Installationsstart wiederholte die gesamte Suche. Damit konnte die unauthentifizierte GitHub-Grenze von 60 Anfragen pro Stunde und öffentlicher IP schon nach wenigen Bedienvorgängen erreicht werden. Das ist eine mögliche Ursache von HTTP 403, keine Diagnose allein anhand des Statuscodes. Nextcloud ist an dieser Stelle noch nicht beteiligt: GitHub-Vorprüfung, Download und Build erfolgen vor der externen Sicherung.

Der Dienst speichert erfolgreiche GitHub-Antworten fünf Minuten im Arbeitsspeicher und führt gleichzeitig laufende identische Anfragen zusammen. Ein Dienstneustart leert diesen Cache. Bereits gespeicherte historische Notizen werden nicht erneut abgefragt. Der heruntergeladene Release-Commit und seine Kompatibilität werden weiterhin vor Installation geprüft; fehlgeschlagene Antworten werden nicht als Freigabe verwendet.

Bei bestätigtem Anfragelimit enthält die Meldung den frühesten Wiederholungszeitpunkt in UTC (`Z`). Bis dahin keine erneuten Anfragen; der Dienst pausiert selbst. Bei HTTP 403 ohne Limitangaben Repositoryzugriff und gegebenenfalls Token-Berechtigungen prüfen; bei HTTP 401 den Token prüfen. Die Oberfläche zeigt bei fehlgeschlagener Suche „Update-Prüfung derzeit nicht möglich“. Ältere Versionen sind als zuletzt bekannter Stand gekennzeichnet. Ein fehlgeschlagener Start zeigt den Fehler, statt eine erfolgreiche Sicherung oder Installation vorzutäuschen.

Optional kann der Betreiber in der geschützten Dienstkonfiguration `/etc/geschichtsarchiv/updater.json` das bereits unterstützte Feld `githubToken` setzen. Für einen auf dieses Repository beschränkten Fine-grained-Token genügen lesende Repository-Metadaten und **Contents: Read-only**. Token nicht im Chat, Repository oder Browser eintragen; Datei weiterhin mit `0600` schützen und den Dienst nur im Leerlauf neu starten. Ein Token hebt Sperren nicht pauschal auf und ersetzt keine Zugriffsprüfung. Die Änderung der Dienstkonfiguration sperrt die Rücknahme früherer App-Updates über die Oberfläche gemäß den bestehenden Schutzregeln.


### Einstellungen und Bearbeitungsfenster ab 0.46.2

Innerhalb der geöffneten Bereiche „Öffentliches Profil“ und „Einstellungen für Gäste“ ist die Feldauswahl direkt sichtbar, ohne zusätzliches Aufklappen. „Sichtbare Felder“ und „Sichtbare Felder für Gäste“ verwenden dieselbe Zwischenüberschrift wie „Überschrift und Einführungstext“. Bestehende Freigaben, Speicheraktionen und Rollenrechte bleiben erhalten; der Direktlink zu den Gastfeldern öffnet weiterhin den äußeren Bereich.

Das Bearbeitungsfenster wird horizontal und vertikal innerhalb des Bildschirms zentriert, ohne CSS-Verschiebung oder Zoom-Animation. Lange Formulare scrollen im Fenster; kleine Bildschirme behalten einen Rand und eine begrenzte Fensterhöhe. Dies gilt für Bearbeiten und Neuanlegen. App auf 0.46.2 aktualisieren; der bereits laufende Update-Dienst 0.46.1 genügt.


### Mobile Beitragsbearbeitung ab 0.46.3

Bilder, ihre Beschriftungsvorschau und das Beschriftungsfeld nutzen im Editor die verfügbare Breite. Der Papierkorb-Button mit ausreichend großer Touchfläche entfernt die Zuordnung zum Beitrag; er löscht die gespeicherte Datei nicht unmittelbar. Erst das Speichern des Beitrags übernimmt die geänderte Zuordnung. Der Beitragstitel wächst und schrumpft automatisch mit seinem Inhalt, wie die Beschreibung. Die Grenze von 250 Zeichen bleibt bestehen; eingefügte Zeilenumbrüche werden zu Leerzeichen. Bitte nach dem App-Update am iPhone Bildbeschriftung, Titelumbruch und Cursorposition prüfen. Update-Dienst 0.46.1 genügt weiterhin.


### Dateiauswahl und Querformat ab 0.46.4

Die Buttons „Entwurf verwerfen“, „Abbrechen“ und „Eintrag speichern“ scrollen immer am Formularende mit, auch im Querformat. Beitragsanhänge und „Sicherung zurückspielen“ verwenden eine gemeinsame Dateiauswahl: Auswahlbutton, separater Status und eine Liste mit umbrechenden Dateinamen, Dateigröße und Entfernen-Symbol. Das Entfernen verwirft nur die lokale Auswahl. Bei Bildern zuerst die individuelle Beschriftung ergänzen und anschließend „Ausgewählte Dateien hochladen“ anklicken. Die Auswahl selbst lädt nichts hoch. Bei einer Sicherung weiterhin „Datei prüfen“ ausführen und die Wiederherstellung danach ausdrücklich bestätigen. Dateitypen und Größenlimits bleiben bestehen. Der bereits laufende Update-Dienst 0.46.1 genügt.


### Aufbewahrungsort auswählen ab 0.46.5

Nur die Auswahl „Aufbewahrungsort“ im Beitragseditor und im Archivfilter verwendet jetzt ein Design-Dropdown aus der vorhandenen Oberflächenbibliothek. „Nicht zugeordnet“ entfernt die Zuordnung im Formular; erst Speichern übernimmt die Änderung. „Alle Aufbewahrungsorte“ entfernt den Archivfilter. Bestehende Zuordnungen und Filter bleiben erhalten. Früher zugeordnete, nicht mehr verfügbare Orte werden weiterhin kenntlich gemacht. Lange Namen dürfen umbrechen; die Auswahl ist in ihrer Bildschirmhöhe begrenzt und scrollbar. Andere Dropdowns bleiben unverändert. Bitte nach dem App-Update am iPhone Hoch- und Querformat prüfen. Der Update-Dienst 0.46.1 genügt weiterhin.
