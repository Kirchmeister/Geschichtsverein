# Änderungen

Versionsnummern folgen Major.Minor.Patch. Veröffentlichte Tags werden nicht verschoben. Versionen vor dem produktiven Serverbetrieb sind als Vorabversion gekennzeichnet.

## [Unreleased]

## [0.4.2] – 2026-10-07

- Container startet den erzeugten Standalone-Server statt `next start`; dadurch wird der tatsächliche Build-Pfad verwendet.
- Linux verwendet die fest konfigurierte externe Anmeldeadresse für Origin-Prüfungen und QR-Fallback-Links hinter Portweiterleitungen/Proxys. Eingehende Host-Header werden dafür nicht vertraut.
- Explizite Bindung an alle Container-Schnittstellen für Docker-Portweiterleitung und localhost-Healthcheck.
- Startprüfung der gepackten Laufzeit einschließlich Konfigurationsleser, Datenbank, Rollen und Sicherungen. Bestehende Konfiguration/Daten bleiben erhalten.

## [0.4.1] – 2026-10-07

- Docker kopiert die pnpm-Workspace-Konfiguration vor der unveränderlichen Installation mit. Damit stimmen Overrides und freigegebene Abhängigkeits-Builds mit dem Lockfile überein.
- Bestehende lokale Konfiguration und Datenablage bleiben erhalten; keine Änderung am Archivschema oder Backupformat.

## [0.4.0] – 2026-10-07

- Separate Linux-Laufzeit mit SQLite und lokalem Objektspeicher; Sites bleibt auf seinen bisherigen Bindings.
- Echte Passkey-Registrierung/Anmeldung, einmalige Einladungen und adminseitige Rollen-/Kontosperren. Linux lehnt OAI-Identitätsheader ab.
- Docker-/WSL-Testinstallation mit Ersteinrichtung, eigener Geheimniskonfiguration und optionalem internem HTTPS für Mobiltests.
- Portable Backup-Wiederherstellung direkt in die Linux-Ablage; Archivdaten werden nicht in GitHub übernommen.
- Linux-Hintergrundläufe benötigen einen Service-Schlüssel. Native und Sites-Build werden getrennt geprüft.
- Keine Änderung des Archivschemas (15) oder des Backupformats (2). Neue Anmeldetabellen sind Linux-intern und werden bei portablem Import neu eingerichtet; vollständige Rohsicherungen müssen sie enthalten.
- Noch Entwicklungsstand: Docker-/physische Passkey-Bedienung vor Ort prüfen; SMTP-Versand, Geräteverlust-Wiederherstellung und Container-Update-Treiber noch nicht produktiv freigegeben.

## [0.3.0] – 2026-10-07

- Server-Update-Dienst: stabile Release-Suche, Skip und manuelle Wiederanzeige; ausschließlich Admin startet Updates.
- Getrennte Release-Vorbereitung, vollständiger Daten-/Datei-/Konfigurations-/Code-Snapshot, Prüfsummen und verpflichtende Probe-Wiederherstellung vor Migrationen.
- Automatischer Rückweg bei Fehlern und Wiederaufnahme einer unterbrochenen Wiederherstellung; beschädigte Sicherungen blockieren weitere Updates.
- Hosting-Unterschiede sind sichtbar. Linux ignoriert OAI-Identitätsheader und benötigt eine gültige signierte Server-Sitzung. Der Einladungs-/Passkey-Login und der produktive Linux-Treiber sind weiterhin nicht freigegeben.
- Backup-Metadaten enthalten zusätzlich den Code-Commit. Schema 15 und Backupformat 2 bleiben kompatibel; keine Migration erforderlich.
- Entwicklung auf `development`; `main` und bisherige Vorab-Releases bleiben unverändert. README auf Vereinsbetrieb ausgerichtet, Testumgebung in `docs/`.

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
