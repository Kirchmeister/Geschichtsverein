# Änderungen

## [0.20.0]

- Updates: kompakte Versionsübersicht, neueste Version hervorgehoben, ältere Angebote einklappbar und Sicherungswahl im Bestätigungsfenster.
- Optional vor dem Update eine frische Nextcloud-Sicherung vollständig hochladen und durch Rücklesen mit Prüfsummen prüfen; nur damit entfällt die Texteingabe. Fehler verhindern Migrationen. Lokale Sicherung und Probe-Wiederherstellung bleiben verpflichtend.
- Fortschritt: getrennte Download-/Build-Phasen, Dauer des aktuellen Schritts, Dienst-Lebenszeichen, Nextcloud-Fortschritt und Wartungsstatus. Ältere Dienste kennzeichnen den zusammengefassten Download/Build ausdrücklich.
- Der externe Update-Dienst muss separat auf 0.20.0 aktualisiert werden; ein Archiv-App-Update ersetzt den Dienst nicht.
- Gäste: Push-Endpunkte gesperrt; Rollenwechsel entfernt vorhandene Geräteanmeldungen, Warteschlange und aktivierte Push-Einstellungen.
- Erste Gastrolle: einmalige interne Nachricht an aktive Admins mit Link zur Gast-Feldauswahl, sofern diese noch nicht ausdrücklich gespeichert wurde.
- Datenbankschema 18 und Backupformat 2 unverändert.

## [0.19.0]

- Neue Rolle Gast: einladbar, als Kontorolle zuweisbar und in der Admin-Profilvorschau verfügbar. Reiner Lesezugriff auf alle vorhandenen Beiträge mit einer gemeinsamen, adminseitigen Auswahl sichtbarer Attribute und Dateitypen.
- Server prüft Gast-Zugriffe auf Beitragsdaten und Dateien; Bearbeitung, Versionen, gelöschte Einträge und Verwaltungsendpunkte bleiben gesperrt.
- Einstellungen: Gast-Felder an Position 3, öffentliche Felder an Position 4. Öffentliche Felder sind nur noch vom Administrator verwaltbar; separater Menüpunkt entfällt.
- Änderungsprotokoll nur noch für Verwalter und Administratoren, einschließlich serverseitiger Zugriffssperre.
- Seitenleistenpunkt heißt QR-Codes drucken.
- Vollständige Archivbezeichnungen auch auf der ausgeloggten Anmeldeseite.
- Datenbankschema 18 und Backupformat 2 unverändert.

## [0.18.2]

- Mobile Seitenleiste: initialer Fokus liegt beim Öffnen auf dem Menüdialog statt auf „Startseite“. Dadurch entfällt der zusätzliche Rahmen um den bereits aktiven Menüpunkt.
- Tastaturnavigation, Fokusbegrenzung im geöffneten Menü und aktive Markierung bleiben erhalten.
- Datenbankschema 18 und Backupformat 2 unverändert.

## [0.18.1]

- Kleines Aktualisieren-Symbol rechts im Profilvorschau-Balken lädt die gesamte Seite auch in installierten Web-Apps neu, ohne den Balken zu vergrößern.
- Während laufender Speicherung oder Audioarbeit gesperrt; beim Bearbeiten eines Beitrags und in den Einstellungen Rückfrage vor dem Neuladen.
- Datenbankschema 18 und Backupformat 2 unverändert.

## [0.18.0]

- Freigegebenes Design der Kommentarmoderation: einheitliche Typografie, Filterleiste, Statuskennzeichen, Kommentarkarten und mobile Aktionsbuttons.
- Kommentarfunktion über den gemeinsamen aufklappbaren Einstellungsbereich; bleibt bis zum manuellen Schließen geöffnet.
- Web-App-Name verwendet den eingestellten Archivtitel in Manifest, Kurzname, Seitentitel und iPhone-Metadaten. Änderungen werden dynamisch für neue Installationen ausgeliefert.
- Datenbankschema 18 und Backupformat 2 unverändert.

## [0.17.4]

- Mobiler Viewport verwendet Gerätebreite und Startskalierung 1, ohne Zoom-Sperre.
- Touch-Geräte vermeiden Doppeltipp-Zoom über touch-action: manipulation; Scrollen und bewusstes Pinch-Zoom bleiben möglich. Texteingaben haben mindestens 16 Pixel Schriftgröße gegen unerwünschten Fokus-Zoom.
- Mobile Dialoge, Menü, lange Bezeichnungen und Audioplayer bleiben innerhalb der verfügbaren Fensterbreite. Desktop-Zoom unverändert.
- Datenbankschema 18 und Backupformat 2 bleiben unverändert.

## [0.17.3]

- Menüleiste prüft den tatsächlich benötigten Platz und verdichtet Abstände bei Bedarf, unabhängig von Rolle und Bildschirmbreite. Touch-Flächen bleiben mindestens 44 Pixel hoch; bei sehr geringer Höhe bleibt das Menü scrollbar.
- Kontoeinstellungen bleiben über den Namen erreichbar. Die native Abmeldung erfolgt ausschließlich über ein separates Icon mit Bestätigungsdialog; Sites zeigt kein nicht unterstütztes Abmelde-Icon.
- Datenbankschema 18 und Backupformat 2 bleiben unverändert.

## [0.17.2]

- Statistiken: sieben Tage als Standard, deutsches Datum in Ansicht und CSV.
- Separates Statistik-Reset-Script mit Vorschau, Bestätigung, geprüfter Zählwertsicherung und README-Anleitung.
- Der Einstellungsbereich „Namen“ enthält Archivname, Vereinsname und eine anpassbare Unterzeile für die Menüleiste. Vorgabe bleibt „Digitale Heimatforschung“.
- Bestehende Installationen behalten den Standard; Änderungen sind nur für Admins möglich. Die Unterzeile wird in Sicherungen übernommen und beim Import wiederhergestellt.
- Datenbankschema 18 und Backupformat 2 bleiben unverändert.

## [0.17.1]
- Veröffentlichungsanfragen zeigen die anfragende Person deutlich in der offenen Aufgabenliste, Nachrichtenübersicht und Unterhaltung.
- Neue automatische Mitteilungen und Erinnerungen enthalten den Namen als gespeicherten Nachrichtenbestandteil. Bestehende Mitteilungen lösen den Namen anhand derselben Anfrage auf, soweit er noch ermittelbar ist.
- Keine Änderung an Genehmigung, persönlichem Löschen oder einmaligen Erinnerungen; Schema 18 bleibt unverändert.

## [0.17.0]
- Nachrichten: Datenschutzhinweis zu Speicherung, HTTPS, fehlender Ende-zu-Ende-Verschlüsselung, externen Sicherungen und Push ohne Nachrichtentext.
- Alle internen Rollen können Unterhaltungen mit Bestätigung nur für sich löschen. Neue Antworten machen sie wieder sichtbar; gleichzeitig eingehende Nachrichten bleiben ungelesen.
- Offene Veröffentlichungsanfragen und der dauerhafte Versandnachweis für einmalige Erinnerungen bleiben unabhängig erhalten.
- Datenbankschema 18 ergänzt ausschließlich einen persönlichen Ausblendungsstand; bestehende Nachrichten werden nicht entfernt. Alte Sicherungen bleiben importierbar; neue Sicherungen benötigen Schema 18 oder neuer.

## [0.16.1]
- Linux: WebDAV-Dateistreams werden mit der erforderlichen Duplex-Option hochgeladen; Übertragung und Prüfsummenprüfung bleiben erhalten.
- Nextcloud-Einrichtung mit lokalem Speichern, Fehlermeldungen und klarer Reihenfolge; automatische Sicherungen erst nach erfolgreicher Prüfung.
- Einstellungen nur mit Aufklapppfeil; Speicherleiste dezent dunkler im gewählten Farbschema.
- Backup-Überschrift zeigt Version und Datum der letzten erfolgreichen Sicherung und warnt nach 14 Tagen oder bei fehlender Sicherung.

## [0.16.0]

- Interne Eintrags-Leseansicht im Pop-up vereinheitlichen: gerahmter Kopf mit Metadaten, abgestimmte Karten für Texte, Medien, QR-Code, Veröffentlichung und Kommentare.
- Zurückhaltende grüne/helle Hintergründe, konsistente Abstände, responsive Dateien und klarer Kommentarstatus. Bestehende Funktionen bleiben erhalten; öffentliche Kommentare und Bearbeitungsformular unverändert.

## [0.15.2]

- Vollständigen Archivnamen im öffentlichen Profil in der gespeicherten Schreibweise anzeigen; lange Namen auch mobil umbrechen.
- Hinweis „Private Arbeitsversion“ aus der Oberfläche entfernen.

## [0.15.1]

- Einstellungen: mehr Abstand zur Überschrift, Benutzer & Einladungen an zweiter Stelle, Backups vor Updates am Ende; Hosting-Funktionsübersicht entfernen.
- WebDAV- und SMTP-Einrichtungsstatus in eingeklappten Bereichen anzeigen. Erfolgreichen SMTP-Test speichern und bei Konfigurationsänderungen zurücksetzen.
- Update-Quelle über einen kleinen Button am Ende des Update-Bereichs in einem Pop-up öffnen; Sicherheitsprüfung und Warnung beibehalten.

## [0.15.0]

- Offene Veröffentlichungsanfragen in Nachrichten unabhängig vom Lesestand anzeigen; einmalige interne Erinnerung nach drei Tagen an aktive Genehmigungsberechtigte. Vorhandene Nachrichten-Push-Einstellung gilt.
- Archivsymbol für Android-Web-App, iPhone-Home-Bildschirm und Browser übernehmen.

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

## [0.14.0] – 2026-10-09

- Neue Veröffentlichungsanfragen erzeugen auf Linux automatisch eine interne Mitteilung mit Beitragslink für alle aktiven Admins und Verwalter, atomar mit der Anfrage gespeichert.
- Genehmigungen erfolgen weiter im Beitrag; automatische Mitteilungen erhalten keine zusätzlichen Genehmigungsbuttons. Die Startseitenübersicht bleibt ergänzend erhalten.
- Separaten Veröffentlichungs-Push entfernt; Benachrichtigung ausschließlich über die vorhandene Einstellung „Neue interne Nachricht“. Alte ausstehende Veröffentlichungs-Pushs werden verworfen. Keine Datenmigration und kein nachträglicher Nachrichtenversand für frühere Anfragen.

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
