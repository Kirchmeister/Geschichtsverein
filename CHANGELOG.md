# Änderungen

Versionsnummern folgen Major.Minor.Patch. Veröffentlichte Tags werden nicht verschoben. Versionen vor dem produktiven Serverbetrieb sind als Vorabversion gekennzeichnet.

## [Unreleased]

## [0.2.1] – 2026-10-07

- „Farben & Design“ in den Einstellungen ist zunächst eingeklappt. Überschrift und Pfeil öffnen/schließen die Farbvorlagen auch per Tastatur.
- Ungespeicherte Farbauswahl bleibt beim Einklappen erhalten. Keine Datenbankmigration; Schema 15 und Backupformat 2 bleiben unverändert.

## [0.2.0] – 2026-10-07

- Sechs instanzweite Farbvorlagen in den Admin-Einstellungen; Salbeigrün bleibt der Standard.
- Farben werden serverseitig angewendet und mitgesichert. Warnungen, Fehler und QR-Druckfarben bleiben unabhängig.
- Software-, Datenbankschema- und Backupformat-Versionen sind sichtbar und in neuen Sicherungen enthalten.
- Versionsprüfung, Versionsanhebung und automatische GitHub-Tags/Releases mit unveränderlichen Codezielen.
- Sicherungen aus neueren Datenbankschemata werden vor dem Import abgelehnt.
- Keine Datenbankmigration erforderlich: Schema 15 und Backupformat 2 bleiben kompatibel. Eine neue Einstellung `design` liegt in der vorhandenen Einstellungstabelle.
- Für Tests von v0.1.0 eine getrennte Testinstanz und Sicherungskopie verwenden. Die ältere Version zeigt das Standarddesign; neue Archivdaten niemals durch ein Code-Downgrade überschreiben.

## [0.1.0] – 2026-10-07

- Nachträglich festgelegter Ausgangsstand: konfigurierbare Orts-/Vereinsnamen, obligatorische Ersteinrichtung und geprüfte Wiederherstellung exportierter Sicherungen.
- Archiv mit Beiträgen, Quellen, Dateien, Versionen, moderierten Kommentaren, Veröffentlichung, öffentlicher Auswahl, QR-Codes und Statistiken.
- Datenbankschema: 15 Migrationen. Backupformat: 2; Lesekompatibilität für ältere Sicherungen.
- Vorabversion: produktive Linux-Anbindung sowie Einladungen/Passkeys sind noch separat umzusetzen. GitHub enthält keine Archivdaten oder Geheimnisse.
