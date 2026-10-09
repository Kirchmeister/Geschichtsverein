# Änderungen

## [0.12.1]

- CA-Zertifikatspaket ausdrücklich im separaten Update-Container installieren und das Zertifikatsbündel beim Build prüfen. Behebt GitHub-Downloads mit „server certificate verification failed. CAfile: none“.
- Nur den Update-Dienst neu bauen und nach erfolgreichem GitHub-Zugriffstest austauschen; kein App- oder Datenbankupdate für diese Reparatur erforderlich.

## [0.12.0]

- Interne Nachrichten mit dauerhafter Beitragsreferenz, Titel-/ID-Suche und internem Beitragslink.
- Aus Freigabeanfragen direkt schreiben, Antragsteller vorauswählen und bestehende Unterhaltung derselben Beteiligten zur Anfrage wiederverwenden.
- Genehmigen/Ablehnen unten im Gespräch nur bei offener Anfrage und für Admin/Verwalter; Anfragekennung schützt vor zwischenzeitlich ersetzten Anfragen.
- Additive Migration 17; Beitragsreferenzen werden mit gesichert und wiederhergestellt. Bestehende Nachrichten und Archivdaten bleiben erhalten.

## [0.11.0]

- Admin-Quellenwechsel innerhalb der Update-Einstellungen: direkte Fork-Herkunft, Projektvertrag und Release-Kompatibilität prüfen; Warnungsdialog mit exaktem Bestätigungstext.
- Quellenwechsel ohne Installation, protokolliert und mit getrennten übersprungenen Versionen. Nach dem Wechsel Projektvertrag auch vor jedem Release-Build prüfen.
- Neuer Update-Dienst erforderlich; bestehende Quellen bleiben unverändert. Keine Schema- oder Archivdatenänderung.

## [0.10.3]

- Begrüßung nur auf der internen Startseite unter Vereins- und Archivnamen.
- Vereinsname behält die eingegebene Schreibweise.
- QR-Erreichbarkeitsanzeige weiter verdichtet, mit kompakter mobiler Darstellung.

## [0.10.2]

- Updater verwendet eine Kernel-Dateisperre statt einer PID-Datei; Containerneustarts blockieren den Dienst nicht und parallele Agenten bleiben gesperrt.

## [0.10.1]

- Vollständige CSS-Datei im GitHub-Repository wiederhergestellt; Übertragung anhand der Git-Blob-Prüfsummen verifiziert.

## [0.10.0]

- Kompakte QR-Erreichbarkeitsanzeige auf Mobiltelefonen; Details aufklappbar.
- Einstellungseinleitung entfernt.
- Docker-Treiber für beaufsichtigte Onlineupdates mit Wartungsmodus, Schema-/Dateiprüfung und geprüftem Rückweg. Betreiber-Einrichtung und isolierter Docker-Test sind vor Aktivierung erforderlich.

Versionsnummern folgen Major.Minor.Patch. Veröffentlichte Tags werden nicht verschoben. Versionen vor dem produktiven Serverbetrieb sind als Vorabversion gekennzeichnet.

## [Unreleased]

## [0.13.1] – 2026-10-09

- Dezenter grauer Hinweis auf Projekt und Quellcode im GitHub-Repository am Ende der öffentlichen Profilseite; öffnet in einem neuen Tab. Keine Datenmigration.

## [0.13.0] – 2026-10-09

- Update-Statusfenster mit automatisch aktualisierten Phasen, Laufzeit, aufklappbarem Zeitprotokoll und Wiederverbindung nach Serverneustart. Vorherige Vorgänge werden getrennt angezeigt.
- Rotationsplanung als kompakte Karte mit minutengenauem HH:MM-Feld, Aktivierung, Zeitplanzusammenfassung und Testterminen in zwei/fünf Minuten. Monatliche Wiederholung erhält die Minuten.
- Keine Datenmigration. Ausführliche Update-Phasen benötigen auch den Update-Dienst dieser Version. Stabile Veröffentlichung auf Main; weitere Entwicklung erfolgt auf Wunsch des Betreibers ebenfalls dort.

## [0.9.1] – 2026-10-07

- Öffentlicher Einstieg ohne persönliche Begrüßung und ohne lose Anmeldung oben. Die öffentliche Zeitleiste erhält eine klare Überschrift; der dezente Passkey-Button steht darunter links und startet die Anmeldung direkt.
- Auch `/anmelden` zeigt ohne Einladung oder geschützten Nachrichten-Rücksprung zunächst die öffentliche Zeitleiste. Einladungen und Rückkehr zu privaten Unterhaltungen bleiben erhalten. Keine Schema- oder Datenänderung.

## [0.9.0] – 2026-10-07

- Interne Nachrichten für Linux-Konten: Einzel- und Gruppenunterhaltungen, Nachrichten an alle aktiven Konten, Admin-Mitteilungen, Antworten und Ungelesen-Zähler unter Startseite. Nur Beteiligte haben Zugriff.
- Push-Thema „Neue interne Nachricht“ für alle internen Rollen standardmäßig ausgewählt. Zustellung ausschließlich an aktive Empfänger, ohne Text/Betreff/Namen; Klick öffnet die Unterhaltung.
- Additive Migration 16 und portable Sicherung der Nachrichten. Alte Sicherungen weiterhin importierbar; importierte Konten bleiben deaktiviert, Nachrichten werden keinem neuen Konto automatisch zugeordnet.
- Offene QR-Fehlerhinweise als späterer Arbeitspunkt dokumentiert.

## [0.8.1] – 2026-10-07

- Persönliche Push-Einstellungen: aufklappbare Anleitung mit Auswahl für iPhone und Android im bestehenden Kontodesign. Auf mobilen Geräten außerhalb der Web-App zunächst geöffnet; beide Anleitungen bleiben auf allen Geräten erreichbar.
- Erläutert Installation, erneute Anmeldung, Aktivierung und blockierte Mitteilungen. iPhone benötigt eine Home-Bildschirm-Web-App, Android kann Push auch direkt im unterstützten Browser nutzen.
- Keine Änderungen an Datenbank, Backupformat oder Push-Berechtigungen.


## [0.8.0] – 2026-10-07

- Startseite ohne „Sechs Zugänge zur Stadtgeschichte“ und „ARBEITSSTAND · IM AUFBAU“; persönliche Begrüßung ohne Rollen-Zeile. Rolle bleibt im Kontomenü sichtbar.
- Einladungseinstellungen stehen ganz unten im gemeinsam einklappbaren Bereich „Benutzer & Einladungen“. Archiv- und Vereinsname entfallen aus der geschlossenen Kopfzeile.
- Benutzerübersicht zeigt den letzten erfolgreichen Login. Frühere, nicht erfasste Anmeldungen werden nicht nachträglich geschätzt; additive Linux-Metadatentabelle, keine Änderung von Archivschema oder portablem Backupformat.

## [0.7.0] – 2026-10-07

- Überschrift und Einführungstext des öffentlichen Profils lassen sich im eingeklappten Einstellungsbereich „Öffentliches Profil“ durch Admins bearbeiten und auf die dynamischen Standardtexte zurücksetzen.
- Webadressen im Beschreibungstext werden als sichere Links in einem neuen Tab geöffnet; Zeilenumbrüche bleiben erhalten. Mehr Abstand zwischen Überschrift und Einführung.
- Speicherung in den bestehenden Archiveinstellungen, inklusive portabler Sicherung und Wiederherstellung; keine Änderung von Archivdaten oder Schema.

## [0.6.0] – 2026-10-07

- Persönliche Web-Push-Benachrichtigungen auf Linux mit rollenabhängigen Ereignissen und vereinbarten Vorauswahlen. Browserfreigabe und separate Geräteregistrierung sind erforderlich.
- QR-Hinweise melden ausschließlich den Wechsel zwischen vorhandenen und behobenen Problemen; keine Nachricht pro QR-Code oder fehlgeschlagenem Aufruf.
- Dauerhafte Versandwarteschlange mit Rollenprüfung, Wiederholungen und Entfernung abgelaufener Registrierungen. Neue Einladungsregistrierungen, Kommentare, Veröffentlichungsanfragen, Backupfehler und vom eingerichteten Updater gemeldete neue Releases werden erfasst.
- Kontomenü erhält kompakte Kopfzeile und getrennte Register für Berechtigungen, Benachrichtigungen und Passkeys.
- Additive Linux-Tabellen für Geräte, persönliche Auswahl, VAPID-Schlüssel und Versandstatus. Archivschema und portables Backupformat bleiben unverändert; Push-Geräte werden bei einem portablen Import neu registriert.

## [0.5.1] – 2026-10-07

- Hosting-Adresse für QR-Codes, Backups, Nextcloud / WebDAV, E-Mail / SMTP und Einladungseinstellungen verwenden dieselbe standardmäßig eingeklappte Darstellung wie die übrigen Einstellungen. Eingaben bleiben beim Einklappen erhalten.

## [0.5.0] – 2026-10-07

- Linux: SMTP-Prüfung sendet eine Testmail an eine wählbare Zieladresse und zeigt das Ergebnis direkt im Abschnitt. TLS/STARTTLS mit Zertifikatsprüfung sind verpflichtend.
- Einladungen können optional per E-Mail versendet werden; bei einem Versandfehler bleibt der erstellte Link verfügbar.
- Mehrere eigene Passkeys hinzufügen, benennen und entfernen; Hinzufügen und Entfernen erfordern eine erneute Passkey-Bestätigung. Der letzte Schlüssel ist geschützt. Konten zeigen die Anzahl der Passkeys, ohne eine irreführende Null als Status.
- Bestehende Authentifizierungsdaten bleiben erhalten; ergänzende Linux-Tabellen speichern nur Schlüsselmetadaten. Archivschema 15 und Backupformat 2 bleiben unverändert.

## [0.4.6] – 2026-10-07

- Unter „Archiv- & Vereinsname“ können Administratoren auch den bei der Einrichtung vergebenen Vereinsnamen ändern.
- Änderungen aktualisieren die Oberflächenbezeichnungen und werden mitgesichert; Ort, Domain und historische Texte bleiben erhalten.

## [0.4.5] – 2026-10-07

- Kontoanzeige mit Name und Berechtigungsdialog ersetzt den privaten Sidebar-Hinweis; Linux-Abmeldung steht direkt darunter.
- Begrüßung zeigt die tatsächliche zugeordnete Rolle; Admin-Profilvorschau wird zum kompakten Balken.
- Mobile Sidebar schließt nach Menüauswahl einschließlich Einstellungen und erneut gewähltem Menüpunkt.

## [0.4.4] – 2026-10-07

- Archivname, Hosting, Updates, Benutzer und Design erhalten einheitliche einklappbare Einstellungen mit einzelnen Trennlinien.
- Klar beschriftete Felder, kompakte Benutzerzeilen und mobile Anordnung; Archivname speichert mit direkter Rückmeldung ohne Seitenneuladen.

## [0.4.3] – 2026-10-07

- Automatischer deutscher Archivtitel mit Genitiv-s und „von“-Form bei s-Laut-Endungen.
- Admins können den vollständigen Titel unter Einstellungen → Archivname ändern oder auf automatisch zurücksetzen. Titel wird gesichert; Bestände und QR-Adressen bleiben erhalten.

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
