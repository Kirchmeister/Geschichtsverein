# Digitales Geschichtsarchiv

Ein konfigurierbares Archiv für Geschichtsvereine: Beiträge, Quellen, Medien, Artefakte und Aufbewahrungsorte. Öffentlich freigegebene Geschichten sind über eine ausgewählte Zeitleiste und QR-Codes erreichbar.

## Stand und Installation

Dieses Projekt befindet sich in der Entwicklung. **Eine Linux-Testinstallation mit SQLite, lokalen Dateien und echter Passkey-Anmeldung ist verfügbar.** Die Produktionsfreigabe steht weiterhin aus. Bitte zunächst mit einer getrennten Testinstanz arbeiten.

- `development`: laufende Entwicklung und Tests.
- `main`: bisheriger Ausgangsstand; künftig ausdrücklich freigegebene Versionen.
- Veröffentlichte Versionsstände und Migrationshinweise: [Releases](https://github.com/Kirchmeister/Geschichtsverein/releases) und [CHANGELOG.md](CHANGELOG.md).

Die Installation führt durch Ort, Vereinsname, Hosting-Adresse und den ersten Administrator. Sie kann leer beginnen oder einen geprüften Backup-Bestand übernehmen. Vorhandene Datenablagen werden nicht überschrieben.

## Lokal installieren und testen

[Windows 11 / WSL 2 / Docker: Schritt für Schritt](docs/local-wsl.md). Der Docker-Build verwendet das feste Lockfile gemeinsam mit der zugehörigen Paketkonfiguration. Der Container startet den erzeugten Standalone-Server mit der passenden Build-Konfiguration. Der Docker-Start bindet die App standardmäßig nur an `127.0.0.1:8080`. Ein einmaliger Konsolenbefehl lädt den ersten Administrator ein; anschließend erfolgen weitere Einladungen und Rollenzuweisungen in den Einstellungen. Es werden keine Archivdaten aus dem Repository geladen.

Für einen Backup-Import vor dem ersten Start: [Installation und Wiederherstellung](docs/installation.md). Passkeys benötigen eine stabile Anmeldeadresse; mobil ist vertrauenswürdiges HTTPS erforderlich. SMTP-Testmails und optionale Einladungsmails stehen auf Linux zur Verfügung. Ein produktiver Update-Treiber ist noch nicht freigegeben.

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

Der Archivtitel wird aus dem Ortsnamen vorgeschlagen (z. B. „Geschichte Rodenbachs“). Unter **Einstellungen → Archiv- & Vereinsname** kann der Administrator den vollständigen Titel ändern oder zur automatischen Bezeichnung zurückkehren. Diese Einstellung gehört zur Datensicherung und verändert keine Beitragstexte oder URLs.

Die Abschnitte Archivname, Hosting, Updates, Benutzer und Farben & Design sind in den Einstellungen standardmäßig eingeklappt. Aktuelle Werte erscheinen in den Kopfzeilen; Eingaben bleiben beim Einklappen erhalten.

Unten in der Seitenleiste öffnet der angemeldete Name die zugeordneten Berechtigungen. Die Linux-Version bietet dort **Abmelden**. Die kompakte Profilvorschau ist nur für tatsächliche Administratoren verfügbar und ändert ihre zugeordnete Rolle nicht. Auf Mobilgeräten schließt die Navigation nach Auswahl eines Menüpunktes automatisch.

Unter **Einstellungen → Archiv- & Vereinsname** kann der Administrator auch den Vereinsnamen korrigieren oder nach einer Umbenennung ändern. Diese Angabe wird gesichert und in der Oberfläche übernommen; Ort, Hosting-Domain, Beitragstexte und QR-Referenzen werden dabei nicht verändert.

### E-Mail und eigene Passkeys

Unter Einstellungen → E-Mail / SMTP Server, Port, TLS-Modus, Zugang und Absender speichern. Danach bei „Testmail an“ eine Zieladresse eingeben und „SMTP prüfen“ wählen. Eine erfolgreiche Prüfung bedeutet, dass der SMTP-Server die Nachricht angenommen hat; Posteingang und Spamordner prüfen. STARTTLS benötigt einen entsprechend konfigurierten Port (häufig 587), direkte TLS-Verbindungen häufig 465. Zertifikatsprüfung bleibt aktiviert. Die Zieladresse wird nicht als Einstellung gespeichert.

Bei Benutzer & Einladungen kann der Admin „Einladung per E-Mail senden“ wählen. Bei einem Versandfehler bleibt der vertrauliche Einladungslink zum manuellen Weitergeben vorhanden. Sites führt keinen SMTP-Versand aus.

Über den Namen unten links können angemeldete Personen ihre eigenen Passkeys verwalten: hinzufügen, umbenennen und entfernen. Vor dem Hinzufügen oder Entfernen wird ein vorhandener Passkey erneut bestätigt. Pro Konto sind bis zu 20 Schlüssel möglich; der letzte Schlüssel kann nicht entfernt werden. Die Schlüssel können auf unterschiedlichen Geräten oder in unterschiedlichen Passwortspeichern liegen. Administratoren sehen die Anzahl pro Konto, verwalten aber keine fremden Schlüssel. Private Schlüssel bleiben beim Authenticator.

Portable Archivbackups übertragen keine Linux-Anmeldeidentitäten oder Passkeys; beim Import einen neuen Admin einrichten. Ergänzende Passkey-Metadaten ändern weder Archivschema noch Backupformat. Eine Wiederherstellung nach Verlust aller Passkeys und der Backup-Import über die Oberfläche bleiben offene Punkte.
