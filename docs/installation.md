# Linux-Installation und Wiederherstellung

## Neue Installation

Die [WSL-/Docker-Anleitung](local-wsl.md) beschreibt den ersten Start. Auf einem Linux-Server denselben Docker-Build verwenden und die Anwendung hinter einem HTTPS-Reverse-Proxy betreiben. `scripts/linux-init.mjs` erzeugt die geschützte Konfiguration. `ARCHIVE_ORIGIN` vor der ersten Passkey-Registrierung auf die endgültige HTTPS-Anmeldeadresse setzen. Datenablage und Konfiguration gemeinsam sichern; Geheimnisse gehören nicht in Git.

Den ersten Administrator einmalig mit `scripts/linux-admin.mjs` wie in der Anleitung einladen. Nach Passkey-Registrierung führt die Oberfläche durch Ort, Vereinsname, optionale QR-Domain und Karte. Weitere Konten werden in den Einstellungen eingeladen. Das Repository enthält keine Archivdaten.

## Portable Sicherung erstellen

Als Administrator unter **Einstellungen → Backups** eine Sicherung vollständig erstellen und herunterladen. Das TAR enthält Tabellen, Originaldateien und Prüfsummen sowie Software-, Schema- und Backupformat-Version. Passkeys, Einladungsgeheimnisse und Dienstpasswörter werden nicht exportiert. Archivdaten und interne Nachrichten sind unverschlüsselt enthalten; Datei vertraulich aufbewahren.

Ein Dateiname wie `geschichtsarchiv-backup-<ID>_v0.32.0_schema19.tar` bezeichnet den gesicherten Stand. Entscheidend für die Prüfung ist das Manifest im TAR, nicht der frei änderbare Dateiname. Für eine konsistente abschließende Umzugssicherung währenddessen keine Archivänderungen vornehmen. Eine Codekopie ist kein Datenbackup.

## Bestehende Instanz über die Weboberfläche wiederherstellen

Voraussetzung: App und separat eingerichteter [Server-Update-Dienst](server-updates.md) mindestens 0.32.0. Als echter Administrator **Einstellungen → Backups → Sicherung zurückspielen** öffnen. Der Dienst darf kein offenes Update oder einen Wiederherstellungsfehler haben.

1. TAR-Datei auswählen (bis 2 GiB). Auch Dateien aus einer anderen Instanz oder außerhalb des angezeigten Zeitraums sind möglich.
2. **Datei prüfen** lädt sie hoch und prüft sämtliche Prüfsummen, Dateireferenzen, Tabellen und Beziehungen in einer getrennten Ablage. Ältere unterstützte Schemas werden auf das aktuelle Schema gebracht; neuere unbekannte Schemas oder beschädigte Dateien werden abgelehnt. SQL aus der Sicherung wird niemals ausgeführt.
3. Datum, Versionsstand und Umfang in der Vorschau prüfen. Die Vorschau gilt höchstens 24 Stunden und verfällt nach einem Codewechsel. Exakt `ARCHIV WIEDERHERSTELLEN` eingeben und bestätigen.
4. Der Dienst stoppt die Anwendung, erstellt eine vollständige Rückfallsicherung und prüft eine Probe-Wiederherstellung, übernimmt den vorbereiteten Bestand und kontrolliert den Wiederanlauf. Fortschritt kann erneut geöffnet werden. Bei einem Fehler oder Dienstneustart wird der vorherige Bestand wiederhergestellt. Bei beschädigter Rückfallsicherung bleibt die Wartungssperre aktiv.

**Der Archivbestand wird ersetzt, nicht mit dem bisherigen Inhalt zusammengeführt.** Beiträge, Dateien, Versionen, Nachrichten und Statistiken stammen anschließend aus der Sicherung. Bereits gelöschte personenbezogene Angaben können dadurch wieder vorhanden sein.

Die aktuellen lokalen Serverkonten einschließlich Rollen, Passkeys, Sperrungen und Kontolöschungen bleiben erhalten; fremde importierte Identitäten erhalten keine Anmelderechte. Die lokale Anmeldeadresse, aktuelle QR-Hosting-Domain und bestehenden SMTP-/WebDAV-Zugänge bleiben erhalten. Archivname, Vereinsname, Inhalt und andere Archiveinstellungen werden aus der Sicherung übernommen. Frühere gedruckte QR-Links bleiben in der Historie erhalten. Tägliche Sicherung und Zeitleistenrotation sind pausiert und müssen bewusst wieder aktiviert werden. Nach Import Verbindungen, öffentliche Freigaben, Nachrichten, Dateien und Karte kontrollieren und eine neue Sicherung erstellen.

Freien Speicher für TAR, vorbereiteten Import, aktuelle vollständige Rückfallsicherung und den zurückbehaltenen bisherigen Datenordner einplanen. Prüf-/Rückfallablagen werden nicht automatisch gelöscht; siehe Serveranleitung. Eine getrennte Wiederherstellungsprobe vor dem Produktiveinsatz bleibt empfohlen.

## Offline-Import für neue Installationen oder große Dateien

Das Werkzeug ist im Docker-App-Image enthalten. Es erstellt ausschließlich einen **noch nicht vorhandenen Zielordner**. Eine laufende Datenablage niemals als Ziel verwenden.

```bash
node scripts/restore-backup.mjs --backup /sicherungen/archiv.tar --inspect
node scripts/restore-backup.mjs --backup /sicherungen/archiv.tar --target /srv/archiv-import --linux
```

Alternativ in einem Container ohne Netzwerk ausführen, die TAR-Datei schreibgeschützt und einen getrennten leeren Zielbereich einhängen. Beispiel (Image-Namen und absolute Hostpfade anpassen):

```bash
sudo docker run --rm --network none --user "$(id -u):$(id -g)" \
  -v /sicherungen/archiv.tar:/tmp/archiv.tar:ro \
  -v /srv/importbereich:/restore \
  geschichtsarchiv-archive \
  node scripts/restore-backup.mjs --backup /tmp/archiv.tar --target /restore/neuer-bestand --linux
```

Nach Prüfung entstehen `archive.sqlite`, `bucket/`, portable Datei-/Metadatenkopien und `restore-report.json`. Das neue Verzeichnis als `/data` in die neue Instanz einhängen, Besitzrechte für den Containerbenutzer einstellen und eine eigene Konfiguration erzeugen. Beim Offline-Import sind **alle importierten Anmeldeidentitäten deaktiviert**; einen neuen Administrator einladen und die Ersteinrichtung abschließen. Dienstpasswörter neu eingeben, Verbindungen testen und pausierte Aufgaben erst danach aktivieren.

Das Importwerkzeug prüft TAR-Pfade, Prüfsummen, Datensätze und Referenzen; einzelne Tabellenzeilen sind auf 4 MiB beschränkt. Das Schema entsteht ausschließlich aus den mitgelieferten Migrationen. Ältere Exporte ohne eigene Schema-Prüfsumme werden mit Warnung unterstützt. Bestehende Zielordner werden abgelehnt, Fehler entfernen die temporäre Ablage. Genügend Speicher für sämtliche Kopien vorsehen.

## Kartenangebot ab 0.33.0

In der Einrichtung und unter Einstellungen → Karte stehen heutige Karte, historische Karte oder beide Karten zur Auswahl. Mittelpunkt und Radius gelten gemeinsam; beide Kartentitel sind getrennt anpassbar und werden gesichert. Ein Upgrade aktiviert keine zusätzliche Karte automatisch. Für diese Erweiterung sind keine neuen Datenbankmigrationen oder Änderungen am separaten Update-Dienst erforderlich.

## Karten-Startansicht ab 0.34.0

Startansicht und Gesamtradius sind getrennt einstellbar. Gesamtansicht bleibt der Upgrade-Standard; Zoom 14 oder 16 kann bei der Einrichtung beziehungsweise in den Karteneinstellungen gewählt werden. Beide Anbieter verwenden dieselbe Einstellung, die mitgesichert und wiederhergestellt wird. Keine neue Datenbankmigration oder Änderung am Update-Dienst erforderlich.
