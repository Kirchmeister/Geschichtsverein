# Digitales Geschichtsarchiv

Ein konfigurierbares Archiv für Geschichtsvereine: Beiträge, Quellen, Medien, Artefakte und Aufbewahrungsorte. Öffentlich freigegebene Geschichten sind über eine ausgewählte Zeitleiste und QR-Codes erreichbar.

## Stand und Installation

Dieses Projekt befindet sich in der Entwicklung. **Eine Linux-Testinstallation mit SQLite, lokalen Dateien und echter Passkey-Anmeldung ist verfügbar.** Die Produktionsfreigabe steht weiterhin aus. Bitte zunächst mit einer getrennten Testinstanz arbeiten.

- `development`: laufende Entwicklung und Tests.
- `main`: bisheriger Ausgangsstand; künftig ausdrücklich freigegebene Versionen.
- Veröffentlichte Versionsstände und Migrationshinweise: [Releases](https://github.com/Kirchmeister/Geschichtsverein/releases) und [CHANGELOG.md](CHANGELOG.md).

Die Installation führt durch Ort, Vereinsname, Hosting-Adresse und den ersten Administrator. Sie kann leer beginnen oder einen geprüften Backup-Bestand übernehmen. Vorhandene Datenablagen werden nicht überschrieben.

## Lokal installieren und testen

[Windows 11 / WSL 2 / Docker: Schritt für Schritt](docs/local-wsl.md). Der Docker-Build verwendet das feste Lockfile gemeinsam mit der zugehörigen Paketkonfiguration. Der Docker-Start bindet die App standardmäßig nur an `127.0.0.1:8080`. Ein einmaliger Konsolenbefehl lädt den ersten Administrator ein; anschließend erfolgen weitere Einladungen und Rollenzuweisungen in den Einstellungen. Es werden keine Archivdaten aus dem Repository geladen.

Für einen Backup-Import vor dem ersten Start: [Installation und Wiederherstellung](docs/installation.md). Passkeys benötigen eine stabile Anmeldeadresse; mobil ist vertrauenswürdiges HTTPS erforderlich. Automatische SMTP-Einladungen und ein produktiver Update-Treiber sind noch nicht freigegeben.

## Funktionen

- Admin, Verwalter und Nutzer sowie öffentliche Ansicht
- Geprüfte Veröffentlichung und öffentliche Zeitleisten-Auswahl
- Personen-/Familientags, Textverknüpfungen und Versionsvergleich
- Moderierte Kommentare und Antworten
- QR-Druck mit Domain und Druckhistorie
- Zugriffsstatistiken ohne Besuchernamen
- Sicherungen, Backup-Import und abgestimmte Farbvorlagen
- Vorbereitete Server-Updateverwaltung mit überspringbaren Versionen und geprüftem Rückweg

## Sicherungen und Updates

Ein vollständiges Backup umfasst Daten und Dateien und dokumentiert Software-, Datenbankschema- und Backupformat-Version. Vor einem Serverupdate wird zusätzlich der passende Programmstand und die Serverkonfiguration gesichert. Der Updater überprüft die Sicherung und eine getrennte Probe-Wiederherstellung, bevor er Daten verändern darf.

Ein Update wird nur vom Admin gestartet. Übersprungene Versionen werden bei automatischer Suche ausgeblendet, bei **Jetzt nach Updates suchen** jedoch mit Kennzeichnung wieder angeboten. Ein Code-Downgrade ersetzt keine Datenwiederherstellung.

[Serverupdates und Wiederherstellung](docs/server-updates.md) · [Technischer Backup-Import](docs/installation.md)

GitHub enthält ausschließlich Code und Dokumentation; Archivdaten, Benutzerkonten, Sicherungen und Zugangsdaten gehören nicht ins Repository.

## Entwicklung

Technische Angaben zur Entwicklungs- und Testumgebung stehen in [docs/development-sites.md](docs/development-sites.md). Änderungen werden auf `development` geprüft; Releases für Vereine werden erst nach ausdrücklicher Freigabe auf `main` erstellt.
