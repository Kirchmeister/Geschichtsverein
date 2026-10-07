# Einrichtung und Übernahme eines Archivs

## Neue, leere Installation

Jede Installation verwendet eine eigene Datenbank, Dateiablage und eigene Laufzeitgeheimnisse. Das Repository enthält keine Beiträge oder Benutzerkonten. Die aktuelle Laufzeit verwendet einen Worker mit D1 und R2; ein Linux-Produktionsbetrieb mit echter Passkey-Anmeldung benötigt weiterhin den dafür vorgesehenen Hosting-/Identitätsadapter.

Nach Installation der Abhängigkeiten und Anwendung aller Migrationen aus `drizzle/` den initialen Admin ausschließlich über `ARCHIVE_BOOTSTRAP_ADMIN_EMAIL` konfigurieren. Die Identität muss von der vertrauenswürdigen Anmeldung bestätigt sein. Besucher können die Einrichtung nicht übernehmen. Für eine lokale Probe passt `seedy@sites.test` zur ausschließlich auf Loopback angebotenen simulierten Anmeldung.

Beim ersten Öffnen fordert der Einrichtungsbildschirm Ort und Vereinsname. Die Domain ist optional; angegebene Domains werden vor Speicherung auf Erreichbarkeit geprüft. Bei Nichterreichbarkeit ist eine ausdrückliche Bestätigung nötig. Nach Abschluss wird die Einrichtung gesperrt; Domainänderungen laufen später über die Admin-Einstellungen.

Die zwei optionalen Laufzeitwerte `ARCHIVE_INITIAL_PLACE` und `ARCHIVE_INITIAL_ASSOCIATION` dienen ausschließlich der Übernahme einer bereits bestehenden Installation. Sind beide gesetzt und existiert keine gespeicherte Installationskonfiguration, gilt diese Installation als eingerichtet. Auf einer neuen Installation diese Werte weglassen. Die bestehende Sites-Installation verwendet diese Übernahme ohne Änderung ihrer Archivdaten.

## Backup aus Sites oder einer anderen Instanz erstellen

Als Admin unter Einstellungen eine manuelle Sicherung erstellen, bis zum Status „complete“ warten und die TAR-Datei herunterladen. Der neue Export heißt `history-archive-backup-v2`; das Importwerkzeug liest auch das frühere Format. Es enthält Datenbanktabellen, Originaldateien, Metadaten und Prüfsummen. Verbindungspasswörter und Laufzeitschlüssel werden nicht exportiert. TAR-Dateien vertraulich behandeln: sie enthalten Archiv- und Benutzerinformationen.

Für den endgültigen Umzug Bearbeitungen und Hintergrundaufgaben während der abschließenden Sicherung pausieren. Einen Testimport zuerst unabhängig davon durchführen. Eine GitHub-Kopie des Codes ist kein Datenbackup.

## Offline prüfen und wiederherstellen

Voraussetzungen: Node.js **ab 22.13.0** mit `node:sqlite` und die Projektabhängigkeiten. Alle Befehle im Repository ausführen. Das Werkzeug verbindet sich niemals mit Sites oder einer Produktionsdatenbank.

```sh
node scripts/restore-backup.mjs --backup /sicherungen/archiv.tar --inspect
```

Das prüft alle Prüfsummen, TAR-Pfade, Tabellen, Datensätze und Verknüpfungen. Es zeigt Anzahl, Umfang und Warnungen. SQL aus dem Backup wird nicht ausgeführt: das Schema entsteht ausschließlich aus den Code-Migrationen. Ein Backup einer neueren, unbekannten Datenstruktur wird abgelehnt. Bei älteren Exporten fehlt die Prüfsumme von `schema.json`; dies wird ausgewiesen und die Datei wird ebenfalls nicht ausgeführt.

Für den tatsächlichen Import **einen noch nicht vorhandenen Zielordner** angeben:

```sh
node scripts/restore-backup.mjs --backup /sicherungen/archiv.tar --target /srv/geschichtsarchiv-import
```

Das Werkzeug erstellt zunächst einen temporären Nachbarordner. Erst nach erfolgreicher Prüfung und Kopie erhält dieser den endgültigen Namen. Bei Fehlern wird der temporäre Stand entfernt. Vorhandene Zielordner werden abgelehnt; es gibt weder Überschreiben noch Zusammenführen bestehender Bestände. Genügend freien Speicher für TAR, temporären Import und wiederhergestellte Dateien einplanen. Einzelne Datensätze sind auf 4 MiB beschränkt; Tabellen werden zeilenweise verarbeitet.

Der neue Ordner enthält:

- `archive.sqlite`: geprüfter, portabler SQLite-Datenbestand
- `objects/` und `objects.json`: Originaldateien und Zuordnung ihrer Schlüssel/Metadaten
- `runtime/`: betriebsbereite lokale D1-/R2-Persistenz für Wrangler/Miniflare
- `restore-report.json`: Prüfbericht mit Umfang und Warnungen

Der portable SQLite-/Dateibestand dient außerdem als definierte Eingabe für einen künftigen Serveradapter. Nicht direkt in fremde Datenbanktabellen kopieren.

## Wiederhergestellten Stand lokal prüfen

Nach `pnpm build` den Server gestoppt halten, dann die wiederhergestellte lokale Persistenz verwenden:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local --persist-to /srv/geschichtsarchiv-import/runtime --ip 127.0.0.1 --inspector-port 0
```

Die Laufzeitwerte für den neuen Admin und `ARCHIVE_SETTINGS_KEY` im lokalen, ignorierten `.dev.vars` beziehungsweise in der vorgesehenen geschützten Laufzeitkonfiguration hinterlegen. Keine Produktiv-Anmeldedaten in Git speichern. Dies ist eine lokale Probe, kein öffentlich freizugebender Server: eingehende Identitätsheader brauchen in Produktion einen vertrauenswürdigen Authentifizierungsadapter.

Die Wiederherstellung ist zunächst als nicht eingerichtet markiert. Im Einrichtungsbildschirm Anzahl und Datum prüfen, Ort/Verein bestätigen oder ändern und Hosting-Domain wählen. Wird eine importierte QR-Domain geändert oder entfernt, ist die bisherige Domainbestätigung exakt einzutippen. Frühere QR-Druckadressen bleiben erhalten. Alte gedruckte QR-Codes ändern sich nicht: Weiterleitung unter der alten Domain erhalten oder betroffene Codes neu drucken.

## Was bleibt erhalten, was wird pausiert?

Beiträge inklusive gelöschter Einträge, Versionshistorie und Bearbeiternamen, Originaldateien, stabile Referenzen, Personen-/Familientags, Kommentare, Aufbewahrungsorte, Zeitleistenauswahl und Varianten, Statistiken sowie QR-Druckhistorie bleiben erhalten.

Importierte Anmeldeidentitäten werden deaktiviert und Rollen auf Nutzer gesetzt; damit erhält kein alter Admin automatisch Rechte auf der neuen Instanz. IDs und Namen bleiben für die Historie erhalten. Der neue Admin wird separat authentifiziert. Einladungen/Passkeys und eine spätere gezielte Kontenzuordnung sind Teil des Serveradapters.

Zeitleistenrotation und tägliche WebDAV-Sicherung werden deaktiviert. SMTP-/WebDAV-Passwörter werden entfernt. Die ursprünglichen Sicherungshistorieneinträge bleiben als importierte Historie erhalten; deren Sicherungsdateien werden nicht rekursiv mitkopiert. Vor Inbetriebnahme Verbindungen neu testen und Aufgaben bewusst aktivieren.

Vor einer Domainumschaltung Dateien öffnen, mindestens einen öffentlichen Direktlink, Versionen, Kommentare, QR-Druckansichten und einen neuen Backup-Export prüfen. Nextcloud und Taler bleiben dabei unverändert in ihren separaten Diensten.

## Linux-Datenablage (SQLite / Dateien)

Für die neue Linux-Laufzeit zusätzlich `--linux` angeben:

```bash
node scripts/restore-backup.mjs --backup /pfad/sicherung.tar --target /pfad/neue-datenablage --linux
```

Das Ziel darf nicht existieren. Nach Integritäts- und Beziehungsprüfung entstehen `archive.sqlite` und `bucket/`. Die geprüfte Ablage statt des leeren Docker-Volumes als `/data` einhängen; der Container-Benutzer (UID 1000) benötigt Zugriff. Nicht in ein bereits laufendes Volume hinein kopieren. Immer zunächst eine getrennte Testinstanz starten. Das Docker-Image enthält ebenfalls das Importwerkzeug; ein separates leeres Zielverzeichnis einhängen und mit `docker compose run --rm archive node scripts/restore-backup.mjs ... --linux` offline importieren.

Portable Exporte enthalten Archivdaten und Urheberzuordnungen, aber keine Linux-Passkey-Schlüssel, Anmelde-Challenges oder Einladungsgeheimnisse. Nach Import einen neuen Administrator einrichten. Rohsicherungen für Updates müssen die gesamte Datenablage einschließlich Linux-Anmeldetabellen und die Konfigurationsschlüssel umfassen. Die bisherige Sites-Importmethode ohne `--linux` bleibt erhalten. Alle Pläne sind beim Import pausiert; Verbindungspasswörter müssen neu angegeben werden.
