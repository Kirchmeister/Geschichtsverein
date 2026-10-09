# Digitales Geschichtsarchiv

Ein konfigurierbares Archiv für Geschichtsvereine: Beiträge, Quellen, Medien, Artefakte und Aufbewahrungsorte. Öffentlich freigegebene Geschichten sind über eine ausgewählte Zeitleiste und QR-Codes erreichbar.

## Stand und Installation

Dieses Projekt befindet sich in der Entwicklung. **Eine Linux-Testinstallation mit SQLite, lokalen Dateien und echter Passkey-Anmeldung ist verfügbar.** Die Produktionsfreigabe steht weiterhin aus. Bitte zunächst mit einer getrennten Testinstanz arbeiten.

- `development`: bisheriger Entwicklungszweig; bleibt erhalten.
- `main`: laufende Weiterentwicklung und geprüfte, versionierte Veröffentlichungen.
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

Technische Angaben zur Entwicklungs- und Testumgebung stehen in [docs/development-sites.md](docs/development-sites.md). Änderungen werden geprüft und anschließend auf `main` gepflegt. Der Release-Workflow veröffentlicht die zugehörigen Versionsstände; eine Installation auf dem Vereinsserver erfolgt weiterhin erst auf Anforderung des Administrators.

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

Nutzer, Verwalter und Admin erhalten die Optionen neue interne Nachrichten und QR-Probleme (jeweils Ein). Verwalter und Admin erhalten zusätzlich Kommentaranfragen (Ein). Veröffentlichungsanfragen werden als interne Nachricht zugestellt und verwenden deren Push-Einstellung. Admins erhalten zusätzlich Backupfehler und die erfolgreiche Passkey-Registrierung einer eingeladenen Person (jeweils Ein) sowie neue Softwareversionen (Aus). Die Vorauswahlen aktivieren keinen Versand ohne Ihre ausdrückliche Push-Aktivierung. QR-Hinweise melden ausschließlich den Wechsel zwischen „Probleme vorhanden“ und „alle behoben“.

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
## Beitragsreferenzen in Nachrichten

Auf Linux können interne Konten beim Schreiben einen Beitrag nach Titel oder ID auswählen. Die Verknüpfung bleibt im Gespräch und bei Antworten erhalten und nutzt eine interne Kennung statt einer festen Domain. Admin und Verwalter können aus einer Freigabeanfrage direkt mit dem Antragsteller sprechen und bei noch offener Anfrage unten im Gespräch genehmigen oder ablehnen. Nachrichten erteilen keine zusätzlichen Zugriffsrechte. Gelöschte Beiträge erhalten einen Hinweis; Unterhaltungen bleiben erhalten. Migration 17 ergänzt eine eigene Referenztabelle, die auch in Sicherungen enthalten ist. Alte Sicherungen bleiben importierbar.
Bei einem GitHub-Zertifikatsfehler im Online-Update-Dienst ist dessen Image ab 0.12.1 mit installiertem CA-Zertifikatspaket neu zu bauen. Die Reparatur erfordert kein App- oder Datenbankupdate. Siehe [Serverupdates](docs/server-updates.md).

Die Rotationsplanung erlaubt minutengenaue Starttermine (Europe/Berlin); auf Linux prüft der Archivprozess den Plan jede Minute. Die Schaltflächen „In 2 Minuten“ und „In 5 Minuten“ tragen Testtermine ein, die erst nach „Zeitplan speichern“ wirksam werden. Updates zeigen ein schließbares Fortschrittsfenster mit Phasen und Zeitprotokoll. Einzelne Download-/Build-Phasen setzen den Update-Dienst ab 0.13.0 voraus.

Die öffentliche Profilseite verlinkt am Seitenende dezent auf das GitHub-Projekt und seinen Quellcode.

Neue Veröffentlichungsanfragen informieren auf Linux alle aktiven Admins und Verwalter automatisch über eine interne Nachricht mit Beitragslink. Die Freigabe erfolgt weiterhin im Beitrag. Push nutzt ausschließlich die Einstellung „Neue interne Nachricht“; ein separater Freigabe-Push entfällt. Die Startseite zeigt offene Anfragen weiterhin als ergänzende Übersicht. Frühere Anfragen werden beim Update nicht nachträglich als Nachrichten versendet.

### Offene Veröffentlichungsanfragen
Admin und Verwalter sehen unter Nachrichten alle offenen Anfragen unabhängig vom Lesestand. Nach drei Tagen erstellt der Linux-Hintergrunddienst einmalig eine interne Erinnerung für die aktuell berechtigten aktiven Konten. Nachrichten-Push gilt auch hierfür; es gibt keinen zusätzlichen Genehmigungsprozess. Entscheidung, Rücknahme, Löschung oder eine Bearbeitung, die die Anfrage aufhebt, beendet die Erinnerung. Der laufende Linux-Container prüft jede Minute; bei Stillstand wird nach dem Neustart nachgeholt. Auch vor dem Update angelegte offene Anfragen werden berücksichtigt.

Das Archivsymbol ist im Web-App-Manifest und als Apple-Touch-Icon eingebunden. Bereits installierte Web-Apps aktualisieren ihre Symbole je nach Betriebssystem verzögert; gegebenenfalls den Home-Bildschirm-Eintrag entfernen und erneut hinzufügen.

Die Einstellungen zeigen Benutzer & Einladungen an zweiter Stelle sowie Backups und Updates am Ende. Der WebDAV- und SMTP-Einrichtungsstatus bleibt eingeklappt sichtbar. „Geprüft“ bezeichnet den letzten erfolgreichen Test, keine laufende Überwachung; geänderte Zugangsdaten erfordern einen neuen Test. Ein SMTP-Test bestätigt die Annahme durch den Mailserver, nicht die Zustellung im Posteingang. Die Update-Quelle öffnen Sie über den kleinen gleichnamigen Button unten im Update-Bereich. Quellenwechsel bleiben Admins vorbehalten und erfordern Prüfung und ausdrückliche Bestätigung.

Die Nextcloud-Einrichtung erfolgt unter Einstellungen in drei Schritten: Zugang speichern, Verbindung testen, danach die tägliche Sicherung aktivieren und speichern. Die WebDAV-Adresse ist die Basisadresse; der Zielordner wird separat angehängt. Änderungen am Zugang setzen die Prüfung zurück und deaktivieren die tägliche Sicherung bis zur erneuten Prüfung. Fehler stehen direkt im Formular. Der Backup-Bereich zeigt im eingeklappten Zustand Softwareversion und Datum der letzten erfolgreich abgeschlossenen Sicherung und warnt nach 14 Tagen. Fehlgeschlagene Sicherungen zählen nicht als erfolgreicher Stand. Nach einem fehlgeschlagenen WebDAV-Upload bitte eine neue Sicherung anlegen.

### Interne Nachrichten und persönliches Löschen
Nachrichten liegen unverschlüsselt in der Datenbank dieser Instanz (keine Ende-zu-Ende-Verschlüsselung); HTTPS schützt die Übertragung. Sie werden nicht per E-Mail versendet. Backups enthalten auch Nachrichten und können diese auf ein externes WebDAV-Ziel übertragen. Push enthält nur einen Hinweis und einen Link, keinen Nachrichtentext.

Nutzer, Verwalter und Admin können eine Unterhaltung **nur für sich löschen**. Sie wird persönlich ausgeblendet, nicht aus der Datenbank oder aus Sicherungen entfernt. Andere Beteiligte behalten Zugriff. Neue Antworten machen die Unterhaltung wieder sichtbar; während des Löschens eingehende neue Antworten bleiben ungelesen. Offene Veröffentlichungsanfragen bleiben in der unabhängigen Aufgabenliste, auch nach dem Löschen ihrer Mitteilung. Der Versandnachweis für die einmalige Erinnerung nach drei Tagen bleibt erhalten.

Version 0.17.0 verwendet Schema 18 (persönlicher Ausblendungsstand mit Standardwert 0). Das Update erhält alle bestehenden Nachrichten. Alte Sicherungen können weiterhin importiert werden; Sicherungen mit Schema 18 benötigen eine passende oder neuere Anwendung. Code-Downgrades bitte nur in getrennten Testinstanzen mit passender Sicherung testen.

Veröffentlichungsanfragen nennen unter „Angefragt von“ die anfragende Person in der Aufgabenliste und in den automatischen Nachrichten. Bei neuen Mitteilungen und Erinnerungen wird der Name im Nachrichtentext festgehalten. Bei älteren Mitteilungen wird er aus der zugehörigen Anfrage ermittelt; wenn dies nicht mehr eindeutig möglich ist, erscheint „Nicht mehr ermittelbar“. Der technische Absender bleibt „Archiv-Benachrichtigung“.
