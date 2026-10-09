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

Für einen Backup-Import vor dem ersten Start: [Installation und Wiederherstellung](docs/installation.md). Passkeys benötigen eine stabile Anmeldeadresse; mobil ist vertrauenswürdiges HTTPS erforderlich. SMTP-Testmails und optionale Einladungsmails stehen auf Linux zur Verfügung. Ein Docker-Update-Treiber mit einer neustartfesten Dienstsperre ist implementiert; seine Einrichtung und die erforderlichen isolierten Serverprüfungen beschreibt [Serverupdates](docs/server-updates.md). Die bestehende Installation wird nicht automatisch umgestellt.

Die interne Startseite begrüßt angemeldete Personen unter Archiv- und Vereinsnamen. Die eingegebene Schreibweise des Vereins bleibt erhalten; QR-Erreichbarkeitsmeldungen sind für Mobiltelefone kompakt dargestellt.

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

Alle Einstellungsbereiche sind standardmäßig eingeklappt, einschließlich Hosting-Adresse für QR-Codes, Backups, Nextcloud / WebDAV und E-Mail / SMTP. Einladungseinstellungen stehen ganz unten im gemeinsamen Bereich „Benutzer & Einladungen“. Aktuelle Werte erscheinen in den Kopfzeilen; Eingaben bleiben beim Einklappen erhalten.

Unten in der Seitenleiste öffnet der angemeldete Name die zugeordneten Berechtigungen. Die Linux-Version bietet dort **Abmelden**. Die kompakte Profilvorschau ist nur für tatsächliche Administratoren verfügbar und ändert ihre zugeordnete Rolle nicht. Auf Mobilgeräten schließt die Navigation nach Auswahl eines Menüpunktes automatisch.

Unter **Einstellungen → Archiv- & Vereinsname** kann der Administrator auch den Vereinsnamen korrigieren oder nach einer Umbenennung ändern. Diese Angabe wird gesichert und in der Oberfläche übernommen; Ort, Hosting-Domain, Beitragstexte und QR-Referenzen werden dabei nicht verändert.

### E-Mail und eigene Passkeys

Unter Einstellungen → E-Mail / SMTP Server, Port, TLS-Modus, Zugang und Absender speichern. Danach bei „Testmail an“ eine Zieladresse eingeben und „SMTP prüfen“ wählen. Eine erfolgreiche Prüfung bedeutet, dass der SMTP-Server die Nachricht angenommen hat; Posteingang und Spamordner prüfen. STARTTLS benötigt einen entsprechend konfigurierten Port (häufig 587), direkte TLS-Verbindungen häufig 465. Zertifikatsprüfung bleibt aktiviert. Die Zieladresse wird nicht als Einstellung gespeichert.

Bei Benutzer & Einladungen kann der Admin „Einladung per E-Mail senden“ wählen. Bei einem Versandfehler bleibt der vertrauliche Einladungslink zum manuellen Weitergeben vorhanden. Sites führt keinen SMTP-Versand aus.

Über den Namen unten links können angemeldete Personen ihre eigenen Passkeys verwalten: hinzufügen, umbenennen und entfernen. Vor dem Hinzufügen oder Entfernen wird ein vorhandener Passkey erneut bestätigt. Pro Konto sind bis zu 20 Schlüssel möglich; der letzte Schlüssel kann nicht entfernt werden. Die Schlüssel können auf unterschiedlichen Geräten oder in unterschiedlichen Passwortspeichern liegen. Administratoren sehen die Anzahl pro Konto, verwalten aber keine fremden Schlüssel. Private Schlüssel bleiben beim Authenticator.

Portable Archivbackups übertragen keine Linux-Anmeldeidentitäten oder Passkeys; beim Import einen neuen Admin einrichten. Ergänzende Passkey-Metadaten ändern weder Archivschema noch Backupformat. Eine Wiederherstellung nach Verlust aller Passkeys und der Backup-Import über die Oberfläche bleiben offene Punkte.

### Persönliche Push-Benachrichtigungen

Auf dem Linux-Server öffnet der Name unten links das Kontomenü. Im Register **Benachrichtigungen** können Sie Push aktivieren, den Browser freigeben und die Ereignisse persönlich auswählen. Die Auswahl und der Hauptschalter gelten für Ihr Konto; jeden Browser separat aktivieren. Das Ausschalten stoppt die Zustellung auf allen Geräten, „Alle Geräte abmelden“ entfernt die Registrierungen. Beim Abmelden aus dem Konto wird die Registrierung dieses Browsers entfernt.

Nutzer, Verwalter und Admin erhalten die Option QR-Probleme (Ein). Verwalter und Admin erhalten zusätzlich Kommentaranfragen und Veröffentlichungsanfragen (jeweils Ein). Admins erhalten zusätzlich Backupfehler und die erfolgreiche Passkey-Registrierung einer eingeladenen Person (jeweils Ein) sowie neue Softwareversionen (Aus). Die Vorauswahlen aktivieren keinen Versand ohne Ihre ausdrückliche Push-Aktivierung. QR-Hinweise melden ausschließlich den Wechsel zwischen „Probleme vorhanden“ und „alle behoben“.

Push erfordert HTTPS und Browser-Unterstützung. Auf iPhone/iPad die Website zum Home-Bildschirm hinzufügen, von dort öffnen und Benachrichtigungen erlauben. Nach einem Browserwechsel oder portablen Datenimport neu registrieren. Sites zeigt die Optionen und einen Hinweis zur Linux-Verfügbarkeit; dort läuft kein Push-Versand.

Die Linux-Anwendung erzeugt ihre VAPID-Schlüssel beim ersten Start und speichert sie im geschützten Datenbestand. Keine zusätzlichen Schlüssel oder externen Konten müssen konfiguriert werden. Der Hintergrundprozess verarbeitet die Versandwarteschlange jede Minute. Vor jeder Zustellung werden Rolle, Kontostatus und persönliche Auswahl geprüft. Abgelaufene Geräte werden entfernt; vorübergehende Fehler werden bis zu sechs Mal innerhalb von 24 Stunden versucht. Nachrichten enthalten nur einen allgemeinen Hinweis, keine Namen oder Beitragstexte. Push verwendet die Browserdienste von Google, Mozilla, Apple oder Microsoft; Geräte-Endpunkte und Schlüssel verbleiben im eigenen Linux-Datenbestand und sind nicht Teil portabler Archivbackups. Betriebssystem, Browser und Push-Dienst können die Zustellung verzögern oder verhindern.

Die Update-Benachrichtigung verwendet die Ergebnisse des **eingerichteten sicheren Server-Update-Dienstes**. Sie aktiviert oder installiert keine Updates und richtet den noch fehlenden produktiven Update-Treiber nicht ein. Übersprungene Releases erzeugen keine Push-Nachricht.

### Texte des öffentlichen Profils

Unter **Einstellungen → Öffentliches Profil** kann der Admin die Überschrift und den Beschreibungstext über der öffentlichen Zeitleiste ändern. Der Bereich ist zunächst eingeklappt. Leere Felder verwenden die bisherigen Standardtexte mit dem konfigurierten Orts- und Vereinsnamen; „Standardtexte verwenden“ setzt beide Felder zurück und wird erst mit „Änderungen speichern“ wirksam. Zeilenumbrüche bleiben erhalten. Webadressen mit https://, http:// oder www. werden im Beschreibungstext anklickbar und öffnen einen neuen Tab. HTML wird als einfacher Text behandelt. Die Texte werden mit dem Archiv gesichert und beim portablen Import wiederhergestellt.

Die Benutzerübersicht zeigt den letzten erfolgreichen Linux-Login je Konto. Registrierung mit anschließender Anmeldung zählt ebenfalls; fehlgeschlagene Versuche und reine Passkey-Bestätigungen ändern den Zeitpunkt nicht. Bei bestehenden Konten ohne erfassten Zeitpunkt steht „Noch nicht erfasst“, bis sie sich erneut anmelden. Die Rolle bleibt über das persönliche Kontomenü einsehbar. In der geschlossenen Kopfzeile „Archiv- & Vereinsname“ werden die Namen nicht mehr angezeigt.

Die persönlichen Benachrichtigungseinstellungen enthalten eine aufklappbare Anleitung mit Auswahl „iPhone“ und „Android“. Auf Mobilgeräten außerhalb der Web-App öffnet sie sich zunächst automatisch. iPhone: ab iOS 16.4 über Safari zum Home-Bildschirm hinzufügen und von dort öffnen; Android: optional über Chrome installieren. Danach im Konto erneut anmelden, Push aktivieren und die Browserfreigabe bestätigen. Blockierte Mitteilungen müssen zusätzlich in Browser- oder Systemeinstellungen freigegeben werden.

### Interne Nachrichten

Unter „Nachrichten“ direkt unter der Startseite können aktive Linux-Konten Nachrichten an einzelne, mehrere oder alle derzeit aktiven Konten senden. Die Zahl zeigt ungelesene eingegangene Nachrichten; sie wird alle 30 Sekunden aktualisiert. Nur Beteiligte sehen Inhalt und Empfänger. „Allen antworten“ bleibt in derselben Unterhaltung; andere Empfänger beginnen eine neue. Admins können Mitteilungen an alle kennzeichnen; Antworten darauf erfolgen als neue Nachricht. Texte sind auf 4.000 Zeichen begrenzt, Betreff auf 120; keine Dateianhänge. Die Übersicht zeigt die neuesten 200 Unterhaltungen, ältere bekannte Unterhaltungslinks bleiben gültig. Lange Unterhaltungen laden ältere Nachrichten in Schritten von 100 nach.

„Neue interne Nachricht“ ist in den persönlichen Push-Einstellungen für Nutzer, Verwalter und Admin vorausgewählt. Konto-Push und Gerät müssen trotzdem aktiviert sein. Versand versucht die Zustellung unmittelbar; der bestehende Push-Hintergrunddienst übernimmt Wiederholungen. Nur Empfänger werden informiert, Nachrichtentext, Betreff und Namen stehen nicht in Push-Mitteilungen. Der Klick öffnet die Unterhaltung nach Anmeldung. Sites zeigt einen Hinweis auf die eigenen Linux-Konten; es werden dort keine Demo-Konten oder echten Nachrichten erzeugt.

Version 0.9.0 ergänzt Migration 16. Vor Server-Updates eine vollständige Sicherung erstellen. Nachrichten sind in portablen Sicherungen enthalten. Beim Import bleiben die bisherigen Konten deaktiviert; private Nachrichten werden erhalten, aber keinem neu eingerichteten Konto automatisch zugeordnet. Für eine vollständige Wiederherstellung derselben Linux-Instanz mit Konten müssen zusätzlich Datenverzeichnis und geschützte Konfiguration gesichert werden.

Der öffentliche Einstieg zeigt die Zeitleiste ohne Begrüßung. Der dezente Button „Mit Passkey anmelden“ steht unten links unter der Zeitleiste und startet die Passkey-Abfrage direkt. Auch `/anmelden` zeigt standardmäßig diese öffentliche Ansicht. Einladungslinks öffnen weiterhin die Registrierung; geschützte Nachrichtenlinks führen nach erforderlicher Anmeldung zur jeweiligen Unterhaltung zurück.
## Update-Quelle

Administratoren können unter **Einstellungen → Updates → Update-Quelle** zu einem direkten Fork der aktuellen GitHub-Quelle wechseln. Projekt- und Release-Prüfung sowie ein ausdrücklicher Warnungsdialog schützen vor Verwechslungen, nicht vor bösartigem Code. Der Wechsel installiert nichts und verändert keine Archivdaten. Der separate Update-Dienst muss diese Funktion ebenfalls unterstützen. Details: [Serverupdates](docs/server-updates.md).
