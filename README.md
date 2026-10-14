# Digitales Geschichtsarchiv

Ein konfigurierbares Archiv für Geschichtsvereine: Beiträge, Quellen, Medien, Artefakte und Aufbewahrungsorte. Öffentlich freigegebene Geschichten sind über eine ausgewählte Zeitleiste und QR-Codes erreichbar.

## Einstieg mit KI-Begleitung

Auch mit wenig Linux-Erfahrung können Sie sich die Einrichtung anhand dieses Repositorys von ChatGPT oder einer anderen KI Schritt für Schritt erklären lassen. Beginnen Sie mit einer getrennten Testinstanz und kleinen, überprüften Befehlen. **[Einsteigeranleitung mit kopierbarem KI-Prompt](docs/betreiber-anleitung.md)** erklärt SSH, Docker, App und separaten Update-Dienst sowie sichere Updates. Zugangsdaten und vollständige geheime Konfigurationsdateien bleiben auf Ihrem Server.

Ab 0.46.1 reduzieren zwischengespeicherte GitHub-Abfragen das Risiko von Anfragelimits. Fehlgeschlagene Prüfungen werden ausdrücklich angezeigt. **Für den vollständigen Bugfix den separaten Update-Dienst auf 0.46.1 erneuern**; siehe [Betreiberanleitung](docs/betreiber-anleitung.md#github-fehler-bei-update-suche-oder-start).

## Stand und Installation

Dieses Projekt befindet sich in der Entwicklung. **Eine Linux-Testinstallation mit SQLite, lokalen Dateien und echter Passkey-Anmeldung ist verfügbar.** Die Produktionsfreigabe steht weiterhin aus. Bitte zunächst mit einer getrennten Testinstanz arbeiten.

- `development`: bisheriger Entwicklungszweig; bleibt erhalten.
- `main`: laufende Weiterentwicklung und geprüfte, versionierte Veröffentlichungen.
- Veröffentlichte Versionsstände und Migrationshinweise: [Releases](https://github.com/Kirchmeister/Geschichtsverein/releases) und [CHANGELOG.md](CHANGELOG.md).

Die Installation führt durch Ort, Vereinsname, Hosting-Adresse, eine optionale Ortskarte und den ersten Administrator. Sie kann leer beginnen oder einen geprüften Backup-Bestand übernehmen. Vorhandene Datenablagen werden nicht überschrieben.

## Lokal installieren und testen

[Windows 11 / WSL 2 / Docker: Schritt für Schritt](docs/local-wsl.md). Der Docker-Build verwendet das feste Lockfile gemeinsam mit der zugehörigen Paketkonfiguration. Der Container startet den erzeugten Standalone-Server mit der passenden Build-Konfiguration. Der Docker-Start bindet die App standardmäßig nur an `127.0.0.1:8080`. Ein einmaliger Konsolenbefehl lädt den ersten Administrator ein; anschließend erfolgen weitere Einladungen und Rollenzuweisungen in den Einstellungen. Es werden keine Archivdaten aus dem Repository geladen.

Für einen Backup-Import vor dem ersten Start: [Installation und Wiederherstellung](docs/installation.md). Passkeys benötigen eine stabile Anmeldeadresse; mobil ist vertrauenswürdiges HTTPS erforderlich. SMTP-Testmails und optionale Einladungsmails stehen auf Linux zur Verfügung. Ein Docker-Update-Treiber mit einer neustartfesten Dienstsperre ist implementiert; seine Einrichtung und die erforderlichen isolierten Serverprüfungen beschreibt [Serverupdates](docs/server-updates.md). Die bestehende Installation wird nicht automatisch umgestellt.

Die interne Startseite begrüßt angemeldete Personen unter Archiv- und Vereinsnamen. Die eingegebene Schreibweise des Vereins bleibt erhalten; QR-Erreichbarkeitsmeldungen sind für Mobiltelefone kompakt dargestellt.

## Ortskarte einrichten

Ab 0.34.0 wählen Sie unter **Startansicht** zwischen **Gesamte Kartenumgebung**, **Ortsübersicht (Zoom 14)** und **Nahansicht (Zoom 16)**. Die Einstellung gilt für beide Karten; der Radius begrenzt weiterhin die erkundbare Umgebung. Besucher können herauszoomen. Vorschau und „Ansicht zurücksetzen“ verwenden die gewählte Startansicht. Bei sehr kleinen Radien kann die notwendige Gesamtansicht bereits näher sein; dann wird nicht weiter herausgezoomt. Bestehende Installationen behalten ihre Gesamtansicht. Die Startansicht gehört zur Datensicherung. Ein Konfigurationswechsel verwirft den gemerkten Besuchsausschnitt; Beitragsstandortlinks haben Vorrang.

Mini-Karten in Beiträgen zeigen den Standort standardmäßig auf Zoom 16, bei „Lage ungefähr“ auf Zoom 14. Dies gilt intern, für Gäste und öffentlich unter den bestehenden Sichtbarkeitsregeln. Die Standortauswahl im Editor bleibt unverändert; die Verlinkung zur großen Karte übernimmt den passenden Standortzoom innerhalb der Kartenumgebung.

Ab Version 0.33.0 bietet **Kartenangebot → Beide Karten** die heutige und historische Karte in getrennten öffentlichen Reitern an: **Zeitleiste**, **Heutige Karte**, **Historische Karte**. Beide verwenden denselben Ort, Mittelpunkt und Radius. Nur die geöffnete Karte lädt externe Kartendaten. Ausschnitt, Zoom und historisches Jahr werden während des Browserbesuchs beim Wechsel gemerkt; nach einer Änderung der Kartenumgebung wird die Ansicht zurückgesetzt. Die Titel sind getrennt anpassbar; leere Felder verwenden „Heutige Karte“ beziehungsweise „Historische Karte“. Ein bisheriger eigener Titel bleibt der bisher ausgewählten Karte zugeordnet. Bestehende Installationen behalten ihr Kartenangebot. Die Auswahl und beide Titel gehören zur Datensicherung. Der historische Zeitschieber verändert weiterhin nur das Kartenmaterial, nicht die Archivmarkierungen.


Während der Ersteinrichtung oder später unter **Einstellungen → Karte** kann der Administrator die Karte aktivieren. Wählen Sie **OpenStreetMap** für die heutige Umgebung ohne Zeitschieber oder **OpenHistoricalMap** für historische Daten mit Zeitschieber. Historische Daten müssen für den gewählten Ort bereits von Mitwirkenden erfasst sein; eine dünne oder leere Darstellung ist möglich.

Suchen Sie den Ort und wählen Sie einen Treffer anhand von Region und Land. Prüfen Sie den Mittelpunkt auf der Vorschaukarte; er lässt sich durch Klicken, Verschieben der Markierung oder Koordinateneingabe ändern. Der Radius reicht von 0,5 bis 100 km. Ein Kreis zeigt den Bereich; die rechteckige öffentliche Ansicht enthält auch Umgebung außerhalb des Kreises. Der Titel entsteht automatisch aus dem Ort und kann überschrieben werden. Die Vorschau verwendet immer die heutige Karte zur Orientierung.

Mit **Karte speichern** übernehmen Sie die Änderung. Ausschalten blendet den öffentlichen Karten-Tab und die Konfigurationsfelder aus, behält jedoch gespeicherte Werte. Neue Installationen starten ohne aktivierte Karte. Beim Upgrade bleibt die bisherige Karte der bestehenden Instanz erhalten. Kartenwerte liegen in der Datenbank und sind in Backups enthalten; ein Restore lässt sie im Einrichtungsbildschirm überprüfen und ändern. Beiträge können optional verortet und nach Freigabe als Kartenmarker angezeigt werden (siehe „Beiträge auf der Karte verorten“).

Die Ortssuche nutzt Photon auf OpenStreetMap-Datenbasis und läuft nur nach ausdrücklichem Suchen. Der öffentliche [Photon-Dienst](https://github.com/komoot/photon#demo-server) erlaubt angemessene Nutzung ohne Verfügbarkeitsgarantie; umfangreiche Nutzung kann begrenzt werden. Betreiber können in `linux-config/app.env` mit `ARCHIVE_GEOCODER_URL=https://ihr-photon-server.example/api/` einen anderen kompatiblen HTTPS-Photon-Endpunkt setzen und den App-Container neu starten. Keine Zugangsdaten in dieser URL verwenden. Beim Laden der Karte werden externe Kartendienste und Bibliotheken kontaktiert. Quellenhinweise bleiben sichtbar. Die [OSM-Kachelnutzungsbedingungen](https://operations.osmfoundation.org/policies/tiles/) gelten für die heutige Karte; keine Offline- oder Massendownloads sind eingebaut.

## Zentrales Archiv ab 0.41.0

Die **Startseite** enthält Begrüßung, Eintrag anlegen, Bestandszahlen, QR-Hinweise, Veröffentlichungsanfragen und Recherchekacheln. Die bisherige Beitragsliste liegt jetzt unter **Archiv**, direkt unter Startseite im Menü. Orte/Gebäude, Themen, Bilder/Dokumente, Personen/Familien, Artefakte, Quellen und die interne Zeitleiste öffnen dieselbe Archivseite mit veränderbaren Filtern. Die Kacheln sind Links und können auch in einem neuen Tab geöffnet werden. Die öffentliche Zeitleiste und ihre administrative Auswahlverwaltung behalten ihre Aufgaben.

Das Archiv kombiniert freie Rohwertsuche, Kategorie, Forschungsstatus, Von-/Bis-Jahr, Aufbewahrungsort, Medien, Quellen und Personen-/Familienzuordnungen. Mehrere Medientypen werden mit ODER verbunden, unterschiedliche Filter mit UND. Namen können über die Personensuche gewählt werden; bestehende Personenmarkierungen öffnen direkt deren gefilterte Archivansicht. Listen- und Zeitleistendarstellung sind umschaltbar. Aktive Filter können einzeln oder gemeinsam entfernt werden. Bei fehlenden Ergebnissen bietet die Ansicht das Zurücksetzen an.

Standardmäßig erscheinen **10 Einträge je Seite**, wahlweise 20, 50 oder 100. Die Auswahl wird nach Möglichkeit im Browser gespeichert. Eine ausdrücklich im Link angegebene Größe hat Vorrang. Änderungen an Suche, Filtern, Sortierung, Darstellung oder Seitengröße beginnen auf Seite 1. „Einträge 1–10 von 347“, Zurück/Weiter und kompakte Seitenzahlen zeigen den aktuellen Ausschnitt. Nicht mehr vorhandene Seiten werden auf die letzte gültige Seite korrigiert.

Beispiel: `/archiv?kategorie=orte&suche=kirche&seite=2&limit=20`. Suchtext, Filter, Sortierung, Seite, Seitengröße und Darstellung werden in der URL gespeichert. Neuladen, Browser-Zurück/Vorwärts und geteilte Links stellen die Ansicht wieder her. Falls eine Anmeldung nötig ist, bleibt der Archivlink als sicheres Rücksprungziel erhalten. Ungültige Parameter erhalten Standardwerte; ein umgekehrter Jahresbereich wird mit einem Hinweis abgelehnt.

Suche, Filter, Sortierung, Trefferzählung und LIMIT/OFFSET laufen in der Linux-Datenbank. Nur Zusammenfassungen der gewählten Ergebnisseite werden übertragen; ein vollständiger Beitrag wird beim Öffnen gezielt geladen. Suchabfragen starten nach kurzer Eingabepause; überholte Antworten werden abgebrochen oder ignoriert. Übersichtszahlen, Beitrags-/Personenauswahl und QR-Auswahl verwenden eigene Abfragen. Die QR-Sammelauswahl benötigt weiterhin die leichte Titel-/Referenzliste des Bestandes, lädt aber keine vollständigen Beiträge.

Gastabfragen verwenden die freigegebenen Felder auch für Suchbedingungen, Filter, Sortierung und Zahlen. Verborgene Felder werden nicht durch Treffer oder Reihenfolgen verraten. Nicht verfügbare Filter werden entfernt; bei verborgenem Bearbeitungsdatum ist die Titelsortierung der Rückfall. Circa-Kennzeichnung, fehlende Datierungen und Feldfreigaben bleiben erhalten. Der Suchtext ist eine wörtliche Teilzeichenfolge, kein SQL-/Wildcard-Ausdruck. Die Suche arbeitet ohne separaten Volltextindex; umfangreiche Textsuchen und Zählungen prüfen die passenden Datenbankzeilen, während die übertragene Ergebnisseite begrenzt bleibt.

## Ungefähre Datierung ab 0.40.0

Im Beitragseditor kennzeichnet **Datierung ist ungefähr (ca.)** gemeinsam Zeitraum/Datierung, Beginn und Ende. Die gespeicherten Jahreswerte bleiben unverändert; nur die Darstellung erhält „ca.“. Einzeljahr: „ca. 1520“, zusammengefasster Zeitraum: „ca. 1520–1530“, einzeln angezeigte Beginn-/Ende-Felder jeweils mit „ca.“. Ein bereits im freien Datierungstext vorhandenes „ca.“ oder „circa“ wird nicht doppelt ergänzt. Beim Ausschalten bleibt selbst eingegebener Freitext unverändert. Ohne sichtbare Datierung erscheint kein alleinstehendes „ca.“.

Die Kennzeichnung gilt in internen Listen und Suchergebnissen, Personenansichten, Details, Freigabeprüfung, Gast-/öffentlicher Ansicht und Zeitleiste. Sortierung und Jahresfilter verwenden weiterhin die regulären Jahreswerte; der Circa-Schalter erweitert keine Filterbereiche. Die Suche verarbeitet die bisherigen Rohwerte, ohne den Zusatz oder das Boolean-Attribut zu indexieren. Die öffentlichen und Gast-Feldfreigaben gelten weiterhin; bei versteckten Datierungsfeldern wird auch die Kennzeichnung nicht ausgegeben.

Bestehende Einträge ohne `isApproximateDate` gelten als exakt (`false`). Die Kennzeichnung gehört zur gespeicherten Version, Veröffentlichung und Sicherung. Beim gezielten Zurückholen eines Datierungsfelds wird auch die gemeinsame Kennzeichnung übernommen; sie wirkt dadurch auf die übrigen Datierungsfelder. Die Kennzeichnung kann in der Historie auch einzeln zurückgeholt werden. Änderungen benötigen wie gewohnt eine neue Freigabe.

## Entwürfe und Editorfokus ab 0.38.1

Beim Öffnen des Beitragseditors liegt der Fokus auf der Fensterüberschrift; der Titel wird nicht automatisch markiert. **Abbrechen** und Schließen behalten die lokale Entwurfssicherung zum Fortsetzen. **Entwurf verwerfen** im Bearbeitungsfenster löscht nach Bestätigung den Entwurf in diesem Tab und schließt das Fenster. Der gespeicherte Beitrag und seine Freigabe werden dabei nicht geändert. Das gilt auch für noch nicht gespeicherte neue Beiträge. Während Speichern, Datei-Uploads oder Audioverarbeitung ist Verwerfen gesperrt.

## Beitragskarte und Detailansicht ab 0.38.0

Im Beitragseditor unter **Standort auf der Karte → Karte im öffentlichen Beitrag** wählen Sie „Standard aus den Einstellungen“, OpenStreetMap oder OpenHistoricalMap. Nur unter Einstellungen → Karte aktivierte Anbieter sind auswählbar. Standard und bestehende Beiträge verwenden bei beiden aktivierten Karten OpenStreetMap; bei nur einer aktiven Karte diese. Wird eine gewählte Karte deaktiviert, verwendet die kleine Beitragskarte die noch aktive Karte. Ohne aktive Karte wird sie ausgeblendet. Die Wahl gehört zum Standort, zur Beitragsversion und zur Sicherung; die bestehenden Feldfreigaben gelten weiterhin. Der Standorteditor verwendet zur Koordinatenauswahl weiterhin OpenStreetMap. Ab 0.38.2 steht unter der kleinen Karte passend zum tatsächlich verwendeten Anbieter „Standort auf der heutigen Karte“ oder „Standort auf der historischen Karte“, auch beim automatischen Rückfall.

Die interne Detailansicht hat eine feste Leiste mit Schließen-X und einem zusätzlichen **Eintrag bearbeiten**-Button oben. Der Beitrag scrollt unterhalb dieser Leiste; der Bearbeiten-Button am Ende bleibt erhalten. Gäste können schließen, erhalten aber keinen Bearbeiten-Button. Das öffentliche Profil bleibt davon unberührt.

## Bildbeschriftungen ab 0.37.0

Jedes neu hochgeladene Bild benötigt eine eigene Beschriftung (bis 500 Zeichen). Dateien auswählen, die Beschriftung für jedes Bild ausfüllen und **Ausgewählte Dateien hochladen** anklicken; anschließend den Beitrag speichern. Bei einem Uploadfehler bleiben die noch nicht hochgeladenen Dateien zur Korrektur oder zum erneuten Versuch ausgewählt. Erfolgreiche Uploads sind bereits zugeordnet. Noch ausstehende Uploads werden nicht in der lokalen Entwurfssicherung gespeichert.

Unter Bildern steht in der internen, Gast-, öffentlichen und Freigabeansicht ausschließlich die Beschriftung; Bild und Beschriftung sind keine Download-Links. Dokumente und Audio behalten ihre bisherigen Funktionen. Bereits gespeicherte Bilder ohne Beschriftung bleiben sichtbar, ohne Dateinamen darunter. Beim nächsten Bearbeiten und Speichern müssen fehlende Beschriftungen ergänzt oder die Bildzuordnungen entfernt werden. Beschriftungen gehören zur Beitragsversion und werden mitgesichert und bei der Wiederherstellung übernommen. Änderungen benötigen wie bisher eine neue Freigabe.

## Markdown in Beiträgen ab 0.35.0

Beschreibung, Quellen, offene Fragen und Nutzungsrechte unterstützen Markdown mit Überschriften, Fett/Kursiv, Listen, Zitaten, Links und Tabellen. Der Editor bietet Formatierungsbuttons und **Bearbeiten / Vorschau**. Neue Beiträge verwenden Markdown; bestehende Texte bleiben Klartext, bis **Markdown-Formatierung aktivieren** für das jeweilige Feld ausgewählt wird. Abschalten verändert den Quelltext nicht. Intern, für Gäste, öffentlich und ab 0.36.1 beim Prüfen von Veröffentlichungsanfragen wird derselbe Renderer verwendet; die vorhandenen Freigaben gelten weiterhin. Eingebettetes HTML wird nur als Text dargestellt, unsichere Linkprotokolle sind gesperrt, Markdown-Bilder laden keine externen Medien. Dateien und Audio weiter über die Dateiverwaltung hinzufügen.

Personen- und Beitragsverknüpfungen bleiben an den Positionen im Markdown-Quelltext gespeichert. Formatierungsbuttons erhalten vorhandene Zuordnungen; manuelle Änderungen innerhalb eines zugeordneten Textes entfernen dessen Zuordnung wie bisher. Markdown-Linktexte können vorhandene Zuordnungen überlagern; innerhalb eines Markdown-Links wird kein zweiter Link verschachtelt. Versionshistorie und Sicherungen behalten Quelltext und Feldformat. Die gezielte Wiederherstellung übernimmt beide gemeinsam.

## Geführte Update-Vorbereitung ab 0.36.0

Einstellungen → Updates zeigt die App- und Dienstversion getrennt, die erforderliche Mindestversion und einen verständlichen Status. **Anleitung öffnen** führt zur passenden versionierten Betreiberanleitung; Ab 0.42.0 liegen Anleitung, SSH-Hilfe und KI-Prompt unter **Einstellungen → Hilfe**. **Status und Updates prüfen** aktualisiert Dienststatus und verfügbare Releases, ohne etwas zu installieren. Die Vorbereitung führt durch Sicherung, gegebenenfalls Dienstwechsel, App-Update und Abschlussprüfung. Im Bestätigungsdialog werden die Anforderungen des ausgewählten Releases geprüft. Unbekannte Versionen und nicht erreichbare Dienste werden nicht als bereit behandelt. Die SSH-Hilfe bietet gefilterte Diagnose und einen kopierbaren KI-Prompt; Container und Hostpfade werden nicht geraten. Der Updater erneuert sich weiterhin nicht selbst.

Die App 0.45.0 lässt sich weiterhin mit Dienst **0.35.0** installieren. Für **manuelles Zurückrollen und den vollständigen Protokoll-Download** muss der separate Dienst auf **0.42.0** erneuert werden; die Oberfläche kennzeichnet fehlende Funktionen und verlinkt Hilfe. App-Updates erneuern ihn nicht automatisch.

## Updatekanäle und Kompatibilität ab 0.35.0

**Wichtig: Auch den separaten Update-Dienst auf mindestens 0.35.0 aktualisieren**, siehe [Serverupdates](docs/server-updates.md). Eine neue App allein ersetzt den Dienst nicht. Eine Migration einer bestehenden Instanz auf 0.35.0 verlangt den neuen Dienst bereits vor der Datenänderung; ein alter Dienst erhält eine verständliche Sperre. Ohne den neuen Dienst sind weitere Installationen und die Beta-Auswahl in der neuen Oberfläche gesperrt.

Unter **Einstellungen → Updates** bietet **Beta-Updates zusätzlich anbieten** optional versionierte Development-Releases wie `0.36.0-beta.1` an. Standardmäßig erscheinen nur stabile Main-Releases. Die Auswahl bleibt beim Dienstneustart gespeichert. Ausschalten installiert nichts und entfernt keinen vorhandenen Betastand. Installierter Kanal, neueste stabile Version, blockierte Ziele und erforderliche Zwischenschritte werden angezeigt. Eine Beta kehrt erst über einen neueren kompatiblen stabilen Stand zurück; Downgrades bleiben gesperrt.

Jedes neue Release enthält `docs/update-compatibility.json` mit unterstützten Ausgangsständen und Mindestversion des Dienstes. Notwendige Zwischenreleases werden über `intermediateReleases` ausdrücklich angegeben. Der Dienst prüft Metadaten am festen Commit, den vorgesehenen Branch und den kürzesten freigegebenen Pfad. Jeder Schritt benötigt einen eigenen Installationsauftrag; Folgeschritte erfolgen nicht automatisch. Nach Sicherung und Probe-Wiederherstellung wird die konkrete Zielmigration auf einer getrennten Kopie geprüft. Erst danach verändert sie die Live-Daten.

Die aktuelle Policy unterstützt Linux-Stände ab 0.20.0 mit Schema 18/19, Backupformat 2 und gültigem Migrationsjournal. Repräsentative historische Schema-Prüfungen erfolgen für 0.20.0, 0.27.1, 0.32.0 und 0.34.0. Das ist keine Garantie für beliebige alte Installationen: unbekannte Ausgangsstände, fehlende Metadaten, geänderte Migrationsdateien oder fehlende Medien blockieren den Vorgang. Ein älterer Stand benötigt zunächst eine gesonderte Prüfung und einen ausdrücklich freigegebenen Migrationsweg.

## Funktionen

- Admin, Verwalter, Nutzer und Gäste sowie öffentliche Ansicht
- Geprüfte Veröffentlichung und öffentliche Zeitleisten-Auswahl
- Personen-/Familientags, Textverknüpfungen und Versionsvergleich
- Moderierte Kommentare und Antworten
- QR-Druck mit Domain und Druckhistorie
- Zugriffsstatistiken ohne Besuchernamen
- Sicherungen, Backup-Import und abgestimmte Farbvorlagen
- Vorbereitete Server-Updateverwaltung mit überspringbaren Versionen und geprüftem Rückweg

## Sicherungen und Updates

Ein vollständiges Backup umfasst Daten und Dateien und dokumentiert Software-, Datenbankschema- und Backupformat-Version. Vor einem Serverupdate wird zusätzlich der passende Programmstand und die Serverkonfiguration gesichert. Der Updater überprüft die Sicherung und eine getrennte Probe-Wiederherstellung, bevor er Daten verändern darf.

Ein Update wird nur vom Admin gestartet. Bei eingerichtetem und erfolgreich getestetem Nextcloud-Zugang kann der Admin vor dem Update eine neue externe Sicherung auswählen. Erst nach vollständigem Upload und Prüfsummenprüfung entfällt die Texteingabe; die lokale Rückfallsicherung und Probe-Wiederherstellung erfolgen zusätzlich. Dafür müssen Archiv-App und separater Update-Dienst mindestens Version 0.20.0 verwenden. Übersprungene Versionen werden bei automatischer Suche ausgeblendet, bei **Jetzt nach Updates suchen** jedoch mit Kennzeichnung wieder angeboten. Ein Code-Downgrade ersetzt keine Datenwiederherstellung.

Bei einem Build-Abbruch nach rund 15 Minuten den separaten Update-Dienst auf mindestens 0.27.1 erneuern; ein App-Update allein genügt dafür nicht.

[Serverupdates und Wiederherstellung](docs/server-updates.md) · [Technischer Backup-Import](docs/installation.md)

GitHub enthält ausschließlich Code und Dokumentation; Archivdaten, Benutzerkonten, Sicherungen und Zugangsdaten gehören nicht ins Repository.

## Entwicklung

Änderungen werden geprüft und anschließend auf `main` gepflegt. Der Release-Workflow veröffentlicht die zugehörigen Versionsstände; eine Installation auf dem Vereinsserver erfolgt weiterhin erst auf Anforderung des Administrators.

Der Archivtitel wird aus dem Ortsnamen vorgeschlagen (z. B. „Geschichte Rodenbachs“). Unter **Einstellungen → Archiv- & Vereinsname** kann der Administrator den vollständigen Titel ändern oder zur automatischen Bezeichnung zurückkehren. Diese Einstellung gehört zur Datensicherung und verändert keine Beitragstexte oder URLs.

Alle Einstellungsbereiche sind standardmäßig eingeklappt, einschließlich Hosting-Adresse für QR-Codes, Backups, Nextcloud / WebDAV und E-Mail / SMTP. Einladungseinstellungen stehen ganz unten im gemeinsamen Bereich „Benutzer & Einladungen“. Aktuelle Werte erscheinen in den Kopfzeilen; Eingaben bleiben beim Einklappen erhalten.

Unten in der Seitenleiste öffnet der angemeldete Name die zugeordneten Berechtigungen. Die Linux-Version bietet dort **Abmelden**. Die kompakte Profilvorschau ist nur für tatsächliche Administratoren verfügbar und ändert ihre zugeordnete Rolle nicht. Auf Mobilgeräten schließt die Navigation nach Auswahl eines Menüpunktes automatisch.

Unter **Einstellungen → Archiv- & Vereinsname** kann der Administrator auch den Vereinsnamen korrigieren oder nach einer Umbenennung ändern. Diese Angabe wird gesichert und in der Oberfläche übernommen; Ort, Hosting-Domain, Beitragstexte und QR-Referenzen werden dabei nicht verändert.

### E-Mail und eigene Passkeys

Unter Einstellungen → E-Mail / SMTP Server, Port, TLS-Modus, Zugang und Absender speichern. Danach bei „Testmail an“ eine Zieladresse eingeben und „SMTP prüfen“ wählen. Eine erfolgreiche Prüfung bedeutet, dass der SMTP-Server die Nachricht angenommen hat; Posteingang und Spamordner prüfen. STARTTLS benötigt einen entsprechend konfigurierten Port (häufig 587), direkte TLS-Verbindungen häufig 465. Zertifikatsprüfung bleibt aktiviert. Die Zieladresse wird nicht als Einstellung gespeichert.

Bei Benutzer & Einladungen kann der Admin „Einladung per E-Mail senden“ wählen. Bei einem Versandfehler bleibt der vertrauliche Einladungslink zum manuellen Weitergeben vorhanden.

Über den Namen unten links können angemeldete Personen ihre eigenen Passkeys verwalten: hinzufügen, umbenennen und entfernen. Vor dem Hinzufügen oder Entfernen wird ein vorhandener Passkey erneut bestätigt. Pro Konto sind bis zu 20 Schlüssel möglich; der letzte Schlüssel kann nicht entfernt werden. Die Schlüssel können auf unterschiedlichen Geräten oder in unterschiedlichen Passwortspeichern liegen. Administratoren sehen die Anzahl pro Konto, verwalten aber keine fremden Schlüssel. Private Schlüssel bleiben beim Authenticator.

Portable Archivbackups übertragen keine Linux-Anmeldeidentitäten oder Passkeys; beim Import einen neuen Admin einrichten. Ergänzende Passkey-Metadaten ändern weder Archivschema noch Backupformat. Eine Wiederherstellung nach Verlust aller Passkeys und der Backup-Import über die Oberfläche bleiben offene Punkte.

### Persönliche Push-Benachrichtigungen

Auf dem Linux-Server öffnet der Name unten links das Kontomenü. Im Register **Benachrichtigungen** können Sie Push aktivieren, den Browser freigeben und die Ereignisse persönlich auswählen. Die Auswahl und der Hauptschalter gelten für Ihr Konto; jeden Browser separat aktivieren. Das Ausschalten stoppt die Zustellung auf allen Geräten, „Alle Geräte abmelden“ entfernt die Registrierungen. Beim Abmelden aus dem Konto wird die Registrierung dieses Browsers entfernt.

Nutzer, Verwalter und Admin erhalten die Optionen neue interne Nachrichten und QR-Probleme (jeweils Ein). Nutzer, Verwalter und Admin erhalten zusätzlich „Eigener Beitrag zur Veröffentlichung freigegeben“ (Ein). Verwalter und Admin erhalten außerdem Kommentaranfragen und „Neue Veröffentlichungsanfrage“ (jeweils Ein). Diese Veröffentlichungsthemen sind unabhängig von internen Nachrichten einstellbar. Admins erhalten zusätzlich Backupfehler und die erfolgreiche Passkey-Registrierung einer eingeladenen Person (jeweils Ein) sowie neue Softwareversionen (Aus). Die Vorauswahlen aktivieren keinen Versand ohne Ihre ausdrückliche Push-Aktivierung. QR-Hinweise melden ausschließlich den Wechsel zwischen „Probleme vorhanden“ und „alle behoben“.

Push erfordert HTTPS und Browser-Unterstützung. Auf iPhone/iPad die Website zum Home-Bildschirm hinzufügen, von dort öffnen und Benachrichtigungen erlauben. Nach einem Browserwechsel oder portablen Datenimport neu registrieren.

Die Linux-Anwendung erzeugt ihre VAPID-Schlüssel beim ersten Start und speichert sie im geschützten Datenbestand. Keine zusätzlichen Schlüssel oder externen Konten müssen konfiguriert werden. Der Hintergrundprozess verarbeitet die Versandwarteschlange jede Minute. Vor jeder Zustellung werden Rolle, Kontostatus und persönliche Auswahl geprüft. Abgelaufene Geräte werden entfernt; vorübergehende Fehler werden bis zu sechs Mal innerhalb von 24 Stunden versucht. Nachrichten enthalten nur einen allgemeinen Hinweis, keine Namen oder Beitragstexte. Push verwendet die Browserdienste von Google, Mozilla, Apple oder Microsoft; Geräte-Endpunkte und Schlüssel verbleiben im eigenen Linux-Datenbestand und sind nicht Teil portabler Archivbackups. Betriebssystem, Browser und Push-Dienst können die Zustellung verzögern oder verhindern.

Die Update-Benachrichtigung verwendet die Ergebnisse des **eingerichteten sicheren Server-Update-Dienstes**. Sie aktiviert oder installiert keine Updates und richtet den noch fehlenden produktiven Update-Treiber nicht ein. Übersprungene Releases erzeugen keine Push-Nachricht.

### Texte des öffentlichen Profils

Unter **Einstellungen → Öffentliches Profil** kann der Admin die Überschrift und den Beschreibungstext über der öffentlichen Zeitleiste ändern. Der Bereich ist zunächst eingeklappt. Leere Felder verwenden die bisherigen Standardtexte mit dem konfigurierten Orts- und Vereinsnamen; „Standardtexte verwenden“ setzt beide Felder zurück und wird erst mit „Änderungen speichern“ wirksam. Zeilenumbrüche bleiben erhalten. Webadressen mit https://, http:// oder www. werden im Beschreibungstext anklickbar und öffnen einen neuen Tab. HTML wird als einfacher Text behandelt. Die Texte werden mit dem Archiv gesichert und beim portablen Import wiederhergestellt.

Die Benutzerübersicht zeigt den letzten erfolgreichen Linux-Login je Konto. Registrierung mit anschließender Anmeldung zählt ebenfalls; fehlgeschlagene Versuche und reine Passkey-Bestätigungen ändern den Zeitpunkt nicht. Bei bestehenden Konten ohne erfassten Zeitpunkt steht „Noch nicht erfasst“, bis sie sich erneut anmelden. Die Rolle bleibt über das persönliche Kontomenü einsehbar. In der geschlossenen Kopfzeile „Archiv- & Vereinsname“ werden die Namen nicht mehr angezeigt.

Die persönlichen Benachrichtigungseinstellungen enthalten eine aufklappbare Anleitung mit Auswahl „iPhone“ und „Android“. Auf Mobilgeräten außerhalb der Web-App öffnet sie sich zunächst automatisch. iPhone: ab iOS 16.4 über Safari zum Home-Bildschirm hinzufügen und von dort öffnen; Android: optional über Chrome installieren. Danach im Konto erneut anmelden, Push aktivieren und die Browserfreigabe bestätigen. Blockierte Mitteilungen müssen zusätzlich in Browser- oder Systemeinstellungen freigegeben werden.

### Interne Nachrichten

Unter „Nachrichten“ direkt unter der Startseite können aktive Linux-Konten Nachrichten an einzelne, mehrere oder alle derzeit aktiven Konten senden. Die Zahl zeigt ungelesene eingegangene Nachrichten; sie wird alle 30 Sekunden aktualisiert. Nur Beteiligte sehen Inhalt und Empfänger. „Allen antworten“ bleibt in derselben Unterhaltung; andere Empfänger beginnen eine neue. Admins können Mitteilungen an alle kennzeichnen; Antworten darauf erfolgen als neue Nachricht. Texte sind auf 4.000 Zeichen begrenzt, Betreff auf 120; keine Dateianhänge. Die Übersicht zeigt die neuesten 200 Unterhaltungen, ältere bekannte Unterhaltungslinks bleiben gültig. Lange Unterhaltungen laden ältere Nachrichten in Schritten von 100 nach.

„Neue interne Nachricht“ ist in den persönlichen Push-Einstellungen für Nutzer, Verwalter und Admin vorausgewählt. Konto-Push und Gerät müssen trotzdem aktiviert sein. Versand versucht die Zustellung unmittelbar; der bestehende Push-Hintergrunddienst übernimmt Wiederholungen. Nur Empfänger werden informiert, Nachrichtentext, Betreff und Namen stehen nicht in Push-Mitteilungen. Der Klick öffnet die Unterhaltung nach Anmeldung.

Version 0.9.0 ergänzt Migration 16. Vor Server-Updates eine vollständige Sicherung erstellen. Nachrichten sind in portablen Sicherungen enthalten. Beim Import bleiben die bisherigen Konten deaktiviert; private Nachrichten werden erhalten, aber keinem neu eingerichteten Konto automatisch zugeordnet. Für eine vollständige Wiederherstellung derselben Linux-Instanz mit Konten müssen zusätzlich Datenverzeichnis und geschützte Konfiguration gesichert werden.

Der öffentliche Einstieg zeigt die Zeitleiste ohne Begrüßung. Der dezente Button „Mit Passkey anmelden“ steht unten links unter der Zeitleiste und startet die Passkey-Abfrage direkt. Auch `/anmelden` zeigt standardmäßig diese öffentliche Ansicht. Einladungslinks öffnen weiterhin die Registrierung; geschützte Nachrichtenlinks führen nach erforderlicher Anmeldung zur jeweiligen Unterhaltung zurück.
## Update-Quelle

Administratoren können unter **Einstellungen → Updates → Update-Quelle** zu einem direkten Fork der aktuellen GitHub-Quelle wechseln. Projekt- und Release-Prüfung sowie ein ausdrücklicher Warnungsdialog schützen vor Verwechslungen, nicht vor bösartigem Code. Der Wechsel installiert nichts und verändert keine Archivdaten. Der separate Update-Dienst muss diese Funktion ebenfalls unterstützen. Details: [Serverupdates](docs/server-updates.md).
## Beitragsreferenzen in Nachrichten

Auf Linux können interne Konten beim Schreiben einen Beitrag nach Titel oder ID auswählen. Die Verknüpfung bleibt im Gespräch und bei Antworten erhalten und nutzt eine interne Kennung statt einer festen Domain. Admin und Verwalter können aus einer Freigabeanfrage direkt mit dem Antragsteller sprechen und bei noch offener Anfrage unten im Gespräch genehmigen oder ablehnen. Nachrichten erteilen keine zusätzlichen Zugriffsrechte. Gelöschte Beiträge erhalten einen Hinweis; Unterhaltungen bleiben erhalten. Migration 17 ergänzt eine eigene Referenztabelle, die auch in Sicherungen enthalten ist. Alte Sicherungen bleiben importierbar.
Bei einem GitHub-Zertifikatsfehler im Online-Update-Dienst ist dessen Image ab 0.12.1 mit installiertem CA-Zertifikatspaket neu zu bauen. Die Reparatur erfordert kein App- oder Datenbankupdate. Siehe [Serverupdates](docs/server-updates.md).

Die Rotationsplanung erlaubt minutengenaue Starttermine (Europe/Berlin); auf Linux prüft der Archivprozess den Plan jede Minute. Die Schaltflächen „In 2 Minuten“ und „In 5 Minuten“ tragen Testtermine ein, die erst nach „Zeitplan speichern“ wirksam werden. Updates zeigen ein schließbares Fortschrittsfenster mit Phasen und Zeitprotokoll. Einzelne Download-/Build-Phasen setzen den Update-Dienst ab 0.13.0 voraus.

Die öffentliche Profilseite verlinkt am Seitenende dezent auf das GitHub-Projekt und seinen Quellcode.

Ab 0.39.0 erzeugen neue Veröffentlichungsanfragen keine internen Systemnachrichten mehr. Die Startseite zeigt sie weiterhin unter **Ausstehende Veröffentlichungsanfragen**. Admins und Verwalter können unter ihren Push-Einstellungen **Neue Veröffentlichungsanfrage** unabhängig von internen Nachrichten ein- oder ausschalten. Der Push führt zur Startseite und enthält „Ein Beitrag wartet auf Veröffentlichungsfreigabe.“ Nutzer und Gäste erhalten diese Anfrage-Pushs nicht.

### Offene Veröffentlichungsanfragen
Admin und Verwalter erreichen offene Anfragen über die Startseite und weiterhin über die vorhandene Aufgabenliste unter Nachrichten. Automatische Erinnerungsnachrichten nach drei Tagen entfallen. Bereits vorhandene Nachrichten bleiben erhalten und erzeugen keine nachträglichen Pushs. Beim Update vorhandene offene Anfragen bleiben sichtbar, lösen aber keine neue Benachrichtigungswelle aus.

Nach einer Genehmigung erhält ausschließlich die anfragende Person den Push „Dein Beitrag ‚[Titel]‘ wurde zur Veröffentlichung freigegeben.“, sofern Push insgesamt und **Eigener Beitrag zur Veröffentlichung freigegeben** aktiviert sind. Die Profiloption ist für interne Nutzer standardmäßig eingeschaltet; Geräteberechtigung und globale Push-Aktivierung bleiben erforderlich. Die Mitteilung öffnet den Beitrag im internen Archiv.

Push-Ereignisse werden atomar mit Anfrage beziehungsweise Genehmigung gespeichert und pro Vorgang dedupliziert. Rollen und Einstellungen werden vor der Zustellung erneut geprüft; zurückgezogene, gelöschte oder durch Bearbeitung überholte Vorgänge werden nicht mehr zugestellt. Ausschalten aktiviert später keinen Nachversand bereits verarbeiteter Vorgänge. Es entstehen weder neue interne Nachrichten noch neue E-Mails durch diese Veröffentlichungshinweise.

Das Archivsymbol ist im Web-App-Manifest und als Apple-Touch-Icon eingebunden. Bereits installierte Web-Apps aktualisieren ihre Symbole je nach Betriebssystem verzögert; gegebenenfalls den Home-Bildschirm-Eintrag entfernen und erneut hinzufügen.

Die Einstellungen zeigen Benutzer & Einladungen an zweiter Stelle sowie Backups und Updates am Ende. Der WebDAV- und SMTP-Einrichtungsstatus bleibt eingeklappt sichtbar. „Geprüft“ bezeichnet den letzten erfolgreichen Test, keine laufende Überwachung; geänderte Zugangsdaten erfordern einen neuen Test. Ein SMTP-Test bestätigt die Annahme durch den Mailserver, nicht die Zustellung im Posteingang. Die Update-Quelle öffnen Sie über den kleinen gleichnamigen Button unten im Update-Bereich. Quellenwechsel bleiben Admins vorbehalten und erfordern Prüfung und ausdrückliche Bestätigung.

Die Nextcloud-Einrichtung erfolgt unter Einstellungen in drei Schritten: Zugang speichern, Verbindung testen, danach die tägliche Sicherung aktivieren und speichern. Die WebDAV-Adresse ist die Basisadresse; der Zielordner wird separat angehängt. Änderungen am Zugang setzen die Prüfung zurück und deaktivieren die tägliche Sicherung bis zur erneuten Prüfung. Fehler stehen direkt im Formular. Der Backup-Bereich zeigt im eingeklappten Zustand Softwareversion und Datum der letzten erfolgreich abgeschlossenen Sicherung und warnt nach 14 Tagen. Fehlgeschlagene Sicherungen zählen nicht als erfolgreicher Stand. Nach einem fehlgeschlagenen WebDAV-Upload bitte eine neue Sicherung anlegen.

### Interne Nachrichten und persönliches Löschen
Nachrichten liegen unverschlüsselt in der Datenbank dieser Instanz (keine Ende-zu-Ende-Verschlüsselung); HTTPS schützt die Übertragung. Sie werden nicht per E-Mail versendet. Backups enthalten auch Nachrichten und können diese auf ein externes WebDAV-Ziel übertragen. Push enthält nur einen Hinweis und einen Link, keinen Nachrichtentext.

Nutzer, Verwalter und Admin können eine Unterhaltung **nur für sich löschen**. Sie wird persönlich ausgeblendet, nicht aus der Datenbank oder aus Sicherungen entfernt. Andere Beteiligte behalten Zugriff. Neue Antworten machen die Unterhaltung wieder sichtbar; während des Löschens eingehende neue Antworten bleiben ungelesen. Offene Veröffentlichungsanfragen bleiben in der unabhängigen Aufgabenliste, auch nach dem Löschen ihrer Mitteilung. Frühere Erinnerungsnachrichten bleiben als historische Nachrichten erhalten; neue werden nicht erstellt.

Version 0.17.0 verwendet Schema 18 (persönlicher Ausblendungsstand mit Standardwert 0). Das Update erhält alle bestehenden Nachrichten. Alte Sicherungen können weiterhin importiert werden; Sicherungen mit Schema 18 benötigen eine passende oder neuere Anwendung. Code-Downgrades bitte nur in getrennten Testinstanzen mit passender Sicherung testen.

Veröffentlichungsanfragen nennen unter „Angefragt von“ die anfragende Person in der Aufgabenliste. Die früheren automatischen Nachrichten bleiben erhalten; ab 0.39.0 werden keine neuen erstellt. Bei älteren Mitteilungen wird er aus der zugehörigen Anfrage ermittelt; wenn dies nicht mehr eindeutig möglich ist, erscheint „Nicht mehr ermittelbar“. Der technische Absender bleibt „Archiv-Benachrichtigung“.

Unter **Einstellungen → Namen** können Administratoren Archivname, Vereinsname und die Unterzeile in der Menüleiste ändern. Die Unterzeile ist mit „Digitale Heimatforschung“ vorbelegt, erlaubt 1 bis 120 Zeichen und wird nach dem Speichern sofort aktualisiert. Alte Installationen ohne diese Einstellung verwenden den bisherigen Text. Sicherungen enthalten die Unterzeile; der Import stellt sie wieder her.

### Statistik zum Produktionsstart zurücksetzen (Linux)

Standardmäßig erscheinen die letzten sieben Tage einschließlich heute, neueste zuerst. Datumsangaben und CSV-Daten verwenden TT.MM.JJJJ. Längere Zeiträume bleiben auswählbar.

Das separate Script ist nur über die Konsole verfügbar. Im Repository-Verzeichnis zuerst die Vorschau aufrufen:

```bash
sudo bash scripts/reset-statistics.sh --preview
```

Zum Zurücksetzen:

```bash
sudo bash scripts/reset-statistics.sh --reset
```

Exakt `STATISTIK ZURÜCKSETZEN` bestätigen. Bei anderem Containernamen diesen als zweites Argument angeben; Standard ist `geschichtsarchiv-archive-1`. Der Container muss laufen. Nicht während eines Updates ausführen; aktiver Wartungsmodus führt zum Abbruch.

Nur `public_page_views` wird geleert: Beitrags-, Zeitleisten- und QR-Aufrufe einschließlich authentifizierter und unauthentifizierter Zählungen. Andere Archivdaten und QR-Fehlerhinweise bleiben erhalten. Neue Aufrufe werden wieder gezählt.

Vor der Löschung sichert das Script alle bisherigen Statistikzeilen als geprüfte JSON-Datei innerhalb derselben Datenbanktransaktion, mit Dateirechten 600 unter `<Datenverzeichnis>/statistics-reset-backups/`. Es nennt den Containerpfad; `/data` entspricht dem eingebundenen Host-Datenverzeichnis. Die Zählwertsicherung ersetzt keine vollständige Archivsicherung. Fehler vor dem Commit führen zum Zurückrollen der Löschung.

### Menü und Abmeldung

Ab 0.33.1 bleibt die kompakte obere Menüleiste beim Scrollen sichtbar. Sie ist 48 Pixel hoch, zuzüglich eines gegebenenfalls nötigen Geräte-Sicherheitsabstands. Der Menüschalter bleibt ausreichend groß für Touch-Bedienung; lange Seitennamen werden einzeilig gekürzt. Geöffnete Menüs und Dialoge liegen weiterhin über der Leiste.

Die linke Menüleiste passt ihre Abstände automatisch an den tatsächlich benötigten Platz an, auch nach Profilwechseln und Bildschirmdrehungen. Bei ausreichend Höhe bleibt die Standardansicht erhalten; bei sehr geringer Höhe kann der Menübereich gescrollt werden. Kontoeinstellungen öffnen sich über den Benutzernamen. Auf der Linux-Instanz öffnet das Abmelde-Icon rechts daneben eine Bestätigung mit Abbrechen und Abmelden.

### Mobile Darstellung und Zoom

Die Seite startet in Gerätebreite mit Skalierung 1. Auf Touch-Geräten verhindert `touch-action: manipulation` Doppeltipp-Zoom, während Scrollen und bewusstes Zoomen mit zwei Fingern erlaubt bleiben. Texteingabefelder verwenden mindestens 16 Pixel Schriftgröße gegen automatisches Vergrößern beim Fokussieren. Browser- und Bedienungshilfen behalten ihre Kontrolle über die Vergrößerung. Desktop-Zoom wird nicht eingeschränkt.

### Name der installierten Web-App

Der Titel unter **Einstellungen → Namen → Titel des Archivs** wird als vollständiger und kurzer Web-App-Name sowie als iPhone-Titel vorgeschlagen. Bei leerem Titelfeld gilt der automatische Archivtitel. Der Name wird aus den Einstellungen dieser Instanz geladen, ohne Neubuild; lange Namen können auf dem Home-Bildschirm durch das Betriebssystem gekürzt dargestellt werden.

Für unterschiedliche Vereine oder Test- und Produktionsinstanzen lassen sich eindeutige Archivtitel vergeben, etwa „Ortsarchiv – Test“. Verschiedene Instanzen benötigen eigene Hosting-Adressen. Die App-Identität und bestehende Links werden durch eine Umbenennung nicht verändert. Bereits installierte Symbole übernehmen Namensänderungen je nach Browser/Betriebssystem verzögert oder müssen umbenannt beziehungsweise erneut hinzugefügt werden.

Die Kommentarmoderation zeigt Status, Beitrag, Autor, Datum und Kommentar in einheitlichen Karten. Die Einstellungen der Kommentarfunktion bleiben bis zum manuellen Einklappen geöffnet.

### Gäste mit Lesezugriff

Administratoren können in **Einstellungen → Benutzer & Einladungen** die Rolle **Gast** einladen oder einem vorhandenen Konto zuweisen. Gäste lesen alle vorhandenen, nicht gelöschten Beiträge, auch ohne öffentliche Freigabe. In **Sichtbare Felder für Gäste** (dritter Einstellungsbereich) wird die gemeinsame Sichtbarkeit festgelegt. Standardmäßig sind Titel, Bereich, Datierung und Beschreibung sichtbar; Dateien und weitere Attribute müssen ausdrücklich freigeschaltet werden. Ausgeblendete Werte und Dateitypen werden serverseitig zurückgehalten. Gäste erhalten keine Bearbeitungs-, Freigabe-, Versions- oder Verwaltungsfunktionen; eigene Passkeys und Abmeldung bleiben verfügbar. Die Admin-Profilvorschau enthält ebenfalls Gast.

**Öffentliche Felder** stehen als vierter Bereich ausschließlich dem Administrator zur Verfügung. Öffentliche Freigaben bleiben unabhängig vom Gastzugriff. Das Änderungsprotokoll ist nur für Verwalter und Administratoren zugänglich. Die Gast-Feldauswahl wird als Einstellung mitgesichert; bei einer portablen Wiederherstellung bleiben Anmeldeidentitäten wie bisher deaktiviert und werden neu eingerichtet.

Gäste können ausschließlich Push-Benachrichtigungen für neue interne Nachrichten aktivieren. Beim ersten Einrichten einer Gastrolle erinnert eine interne Nachricht aktive Admins an die Gast-Feldauswahl, sofern diese noch nicht ausdrücklich gespeichert wurde.

### Begrüßung und Push-Erinnerung

Nach dem Annehmen einer Einladung wartet eine persönliche interne Willkommensnachricht mit einer Web-App-Anleitung im Nachrichtenbereich. Gäste können ihre Begrüßung und gezielte Mitteilungen von Admin und Verwalter lesen und für sich löschen, aber keine Unterhaltungen beginnen oder frei antworten. Bestehende Konten erhalten keine nachträgliche Begrüßung.

Der erste bestätigte Lesestand startet eine Frist von 24 Stunden. Der Linux-Hintergrunddienst prüft anschließend minütlich, ob einmalig an die freiwillige Push-Einrichtung erinnert werden soll: nur bei einem erkannten geeigneten iPhone, fehlender Registrierung dieses Geräts, aktiver interner Rolle und ohne bewusste Push-Deaktivierung. Läuft der Dienst nicht oder befindet sich das Archiv im Wartungsmodus, erfolgt die Prüfung beim nächsten erfolgreichen Durchlauf. Es wird keine SMTP-Mail versendet.

Gespeichert werden der erste Lesezeitpunkt, der Erinnerungsstatus, grobe Plattform-/Fähigkeitsmerkmale und gegebenenfalls ein Hash der Push-Adresse; keine vollständige Browserkennung. Diese Zustände und internen Nachrichten sind in den Datensicherungen enthalten.

### Archivbestand und Einstellungen

Die interne Kachel „Zeitleiste“ öffnet ab 0.41.0 das zentrale Archiv mit „Datierung: älteste zuerst“ und Zeitleistendarstellung. Die öffentliche Zeitleiste wird weiterhin separat verwaltet. Suche, Bereich, Forschungsstand und Von-/Bis-Jahr lassen sich mit der Sortierung kombinieren. Undatierte Beiträge stehen bei auf- und absteigender Datierung immer zuletzt; Zeiträume werden nach dem Beginn sortiert. Der Forschungsstand folgt der Reihenfolge Offen, In Bearbeitung, Quellengeprüft, Unsicher. „Neu angelegt“ nutzt den frühesten verfügbaren Versionsstand; bei importierten Altbeständen kann dies vom ursprünglichen Erstellungsdatum abweichen. „Zuletzt bearbeitet“ ist der Standard, bei Gleichstand folgt der Titel. Gäste erhalten weiterhin ausschließlich freigegebene Angaben; verborgene Datierungen oder Bearbeitungsdaten werden nicht für eine zusätzliche Sortierung ausgeliefert.

Einladungseinstellungen, Nextcloud/WebDAV und SMTP besitzen jeweils einen eigenen Speicherbutton im aufgeklappten Bereich. Dieser speichert nur den betreffenden Bereich; Entwürfe anderer Bereiche bleiben erhalten. Vor Verbindungstests müssen nur die zugehörigen Zugangseinstellungen gespeichert werden. Ein globaler Speicherbalken ist nicht mehr vorhanden.

### Mitteilungen und Auswahlfragen an Gäste
Admin und Verwalter können Gäste unter Nachrichten als Empfänger auswählen. Mitteilungen mit Gästen sind lesend; Freitextantworten, Weiterleiten und eigene Nachrichten bleiben für Gäste gesperrt. Gästen werden keine internen Beitragsreferenzen zugesandt. Eine optionale Auswahlfrage richtet sich ausschließlich an gezielt ausgewählte Gäste: Frage und zwei bis vier unterschiedliche Antworten frei beschriften. Jeder Gast bestätigt genau eine Auswahl, die danach nicht verändert werden kann. Andere Gäste sehen nur ihre eigene Antwort. Der Absender sieht beantwortete und offene Empfänger mit Namen, Auswahl und Zeitpunkt; Admin und Verwalter können eine Frage schließen. Antworten entziehen keine Berechtigungen. Persönliches Löschen blendet Nachrichten aus, erhält aber Antworten und unabhängige Freigabeaufgaben. Gäste können ausschließlich Nachrichten-Push nach ausdrücklicher Konto- und Geräteaktivierung empfangen. Fragen und Antworten werden mit Nachrichten/Einstellungen gesichert; Schema 18 bleibt unverändert.

### Gäste anschreiben und Nachrichten-Push
Admin und Verwalter können Gäste einzeln oder als Gruppe auswählen. „Alle Gäste auswählen“ und „Alle internen Mitglieder auswählen“ ersetzen die Auswahl jeweils durch die bezeichnete Gruppe; einzelne Checkboxen lassen sich danach anpassen. Vor dem Senden wird die Empfängerzahl angezeigt. Auswahlfragen können an einen, mehrere oder alle Gäste gesendet werden; freie Antworten bleiben gesperrt. Die Admin-Mitteilung an alle internen Mitglieder umfasst keine Gäste.
Gäste öffnen über ihren Namen **Benachrichtigungen**. Nur „Neue interne Nachricht“ ist verfügbar und vorausgewählt; Konto-Push bleibt bis zur ausdrücklichen Aktivierung ausgeschaltet. Jedes Gerät muss registriert und die Browserfreigabe bestätigt werden. Begrüßung und iPhone-Erinnerung erklären diese Einrichtung auch Gästen. Push enthält nur einen allgemeinen Hinweis und einen geschützten Nachrichtenlink, keine Namen, Fragen oder Antworten. Rollenwechsel erhalten bereits ausdrücklich aktivierte Nachrichtengeräte; unzulässige Themen und unzugängliche Gespräche werden nicht zugestellt.

### Konten umbenennen, deaktivieren und löschen

Ab 0.25.0 verwaltet der Admin diese Aktionen unter **Einstellungen → Benutzer & Einladungen**. Gleiche Anzeigenamen sind erlaubt; eine unveränderliche Konto-Kennung unterscheidet sie in Übersicht und Nachrichtenauswahl. Umbenennen ändert weder ID noch Berechtigungen. Deaktivieren ist reversibel. Das eigene Konto kann hier nicht deaktiviert oder gelöscht werden.

Dauerhaftes Löschen verlangt die exakt eingegebene Konto-Kennung. Die E-Mail-Adresse, Passkeys, Push-Geräte, Anmeldebestätigungen und Einladungen dieses Kontos werden entfernt; das Konto ist dauerhaft gesperrt und verschwindet aus der Übersicht. Die interne ID bleibt für Beitragsversionen, Kommentare und Nachrichten erhalten; zuordenbare Namensmetadaten werden durch **Gelöschtes Konto · Kennung** ersetzt. Umfrageantworten bleiben erhalten. Alte automatische Hinweise ohne eindeutige Identitätsreferenz erhalten eine neutrale historische Bezeichnung. Freie Beitragstexte und Nachrichteninhalte werden nicht automatisch nach Namen durchsucht oder verändert. Vorhandene Backups können alte Angaben enthalten; dies ist keine rückwirkende Löschung aus Sicherungen oder physische Bereinigung aller Datenträgerreste.

Eine neue Einladung mit derselben E-Mail-Adresse ist anschließend möglich. Registrierung erzeugt stets eine neue ID und Kennung; gleichnamige oder erneut angelegte Konten werden nicht zusammengeführt und erhalten keine alten privaten Nachrichten. Zusätzliche Linux-Kontotabellen werden beim Start eingerichtet; die Schema-/Backupformat-Version bleibt unverändert.

Auf neuen Instanzen sind für Gäste **Beginn (Jahr)** und **Ende (Jahr)** zusätzlich vorausgewählt, damit die chronologische Ansicht datiert bleibt. Vorhandene gespeicherte Freigaben werden erhalten; bei Bedarf unter **Sichtbare Felder für Gäste** beide Felder aktivieren.

Die Profilvorschau ist ab 0.25.1 standardmäßig ausgeschaltet. Administratoren aktivieren sie im persönlichen Kontomenü unter **Berechtigungen → Profilvorschau anzeigen**. Die Auswahl wird je Konto gespeichert, auch über erneute Anmeldungen hinweg. Ausschalten blendet den oberen Balken aus und beendet die Vorschau einer anderen Rolle. Die tatsächlichen Berechtigungen bleiben unverändert.

Beim Speichern eines Beitrags wählen interne Bearbeiter ab 0.26.0 **Nur speichern** oder **Speichern und Veröffentlichung beantragen**. Die zweite Option speichert die neue Version und erstellt den vorhandenen Freigabeantrag in einer gemeinsamen Transaktion. Verwalter und Admin erhalten auf Linux die bisherige interne Benachrichtigung; sie prüfen und genehmigen weiterhin über den bestehenden Ablauf. Der Beitrag ist damit noch nicht veröffentlicht. Rückkehr zur Bearbeitung und Speicherfehler erhalten den Entwurf. Bearbeitungen eines freigegebenen Beitrags heben wie bisher dessen alte Freigabe auf; eine neue Anfrage bezieht sich auf die neue gespeicherte Version.

### Beiträge auf der Karte verorten

In der Beitragsbearbeitung lässt sich „Standort auf der Karte“ aufklappen. Pro Beitrag ist ein optionaler Punkt möglich: über Klick auf die heutige Karte, Verschieben der Markierung oder direkte Eingabe von Breitengrad und Längengrad. Lagebeschreibung und „Lage ungefähr“ sind optional; der Standort ist vom Aufbewahrungsort unabhängig. Alle Bereiche können verortet werden. Die Kartenvorschau wird von externen Diensten geladen; Beitragstexte und Archivdaten werden nicht an den Kartenanbieter übertragen.

Das Feld „Standort auf der Karte“ muss vom Administrator unter „Öffentliches Profil → Sichtbare Felder“ beziehungsweise „Einstellungen für Gäste → Sichtbare Felder für Gäste“ ausdrücklich aktiviert werden. Die öffentliche Karte zeigt nur genehmigte Beitragsversionen, unabhängig von deren Aufnahme in die öffentliche Zeitleiste. Nahe Markierungen werden zusammengefasst; Antippen vergrößert die Gruppe, einzelne Markierungen verlinken den Beitrag. Bei OpenHistoricalMap bleiben Archivmarkierungen über alle Jahre sichtbar.

Ausgeschaltete Karten behalten Standortdaten, blenden aber Mini-Karten und öffentliche Standorte aus. Punkte außerhalb des konfigurierten Radius sind in der Mini-Karte sichtbar; die Hauptkarte bleibt auf ihre Umgebung begrenzt. Standort, Beschreibung und Genauigkeit sind Teil der normalen Beitragsversion und der Sicherung; die Versionshistorie erlaubt die gemeinsame Wiederherstellung dieser Werte. Es ist keine zusätzliche Datenbankmigration erforderlich.

Auf Touch-Geräten begrenzen öffentliche Profil-, Beitrags- und Kartenseiten den Browser-Zoom, damit Zwei-Finger-Gesten nur die Karte vergrößern. Ein-Finger-Scrollen und die Karten-Zoomtasten bleiben verfügbar; Desktop-Browser behalten ihren normalen Zoom. Browser- oder Betriebssystemfunktionen zur erzwungenen Vergrößerung können diese Vorgabe übersteuern.

### Mobile Web-App aktualisieren

In der installierten Web-App auf iPhone oder Android lässt sich die Seite am oberen Rand mit einem Finger ausreichend weit nach unten ziehen. Sobald „Loslassen zum Aktualisieren“ erscheint, löst Loslassen einen vollständigen Refresh der aktuellen Adresse aus. Kurzes Ziehen aktualisiert nicht. Karten, Bedienelemente, offene Dialoge und die mobile Menüleiste sind ausgenommen. Im normalen Browser bleibt dessen eigene Aktualisierungsfunktion verfügbar. Vor dem Aktualisieren sollten Änderungen gespeichert werden.

### Backup-Erinnerung ab 0.43.0

Ohne einsatzbereite aktivierte automatische Sicherung erscheint für Administratoren ab 31 Kalendertagen seit dem letzten erfolgreichen Backup eine dauerhafte Erinnerung; ohne bisherige Sicherung sofort. Sie zeigt die Tageszahl nach Europe/Berlin, wird bei Anmeldung/Rückkehr, regelmäßig und nach Sicherungsaktionen aktualisiert und hat keinen Ausblenden-Button. Einmal aktiviert bleibt sie auch beim späteren Einschalten der Automatik bis zur nächsten erfolgreichen Sicherung bestehen. Laufende oder fehlgeschlagene Sicherungen reichen nicht. Erfolgreiche manuelle und WebDAV-Sicherungen zählen; interne Update-Rückfallsnapshots ersetzen diese Erinnerung nicht. Der Link „Jetzt Backup erstellen“ öffnet Einstellungen → Backups, klappt den Bereich auf und scrollt zu den Aktionen; er startet nichts automatisch. Serverseitiger Adminschutz verhindert Gast-/Nutzerzugriff auf Sicherungsmetadaten; Rollen-Vorschauen erhalten den Hinweis nicht. Zukünftige automatische Speicheranbieter können ihre Bereitschaft über dieselbe Provider-Schnittstelle melden.

### Überarbeitetes Bearbeitungsformular ab 0.45.0

Grunddaten, Beschreibung/Verknüpfungen, Quellen/Forschung und Dateien/Nutzungsrechte stehen in eigenen offenen Rahmen. Die Checkbox „Markdown“ steht klein links neben ihrer Beschriftung. Bearbeiten/Vorschau bleiben Textbuttons; die sieben Formatierungsaktionen sind gleich große, beschriftete Symbolbuttons (44 px). Erkannte aktive Formate werden angezeigt und durch erneutes Anklicken entfernt. Blockformate gelten für betroffene Zeilen, Inlineformate für die umgebende erkannte Auszeichnung beziehungsweise die Auswahl. Tabellen werden zu Text mit Tabulatoren zwischen den Zellen; Zellinhalte und vorhandene Inlineformatierungen bleiben erhalten. Der Linkbutton erzeugt zunächst eine bearbeitbare Beispieladresse.

Die vier Textbereiche wachsen automatisch mit vorhandenen, getippten, eingefügten oder diktierten Inhalten und schrumpfen bis zur Mindesthöhe. Das Dialogfenster scrollt normal; es gibt keine eigene starre Textfeldhöhe. Eine Messkopie verhindert das kurzfristige Zusammenziehen des fokussierten Feldes. Bestehende Beitrags- und Personenpositionen werden bei Formatierungsänderungen gezielt verschoben; normale Änderungen innerhalb einer Zuordnung entfernen sie wie bisher. „Beitrag verknüpfen“ und „Person/Familie zuordnen“ verlangen zuerst eine markierte Textstelle. Vorhandene Zuordnungen bleiben sichtbar und entfernbar.

Der Bearbeitungsdialog nutzt keine CSS-Zentrierungstransformation oder Zoom-Animation mehr. Textgröße und Zeilenhöhe sind explizit, mindestens 16 px; Benutzerzoom bleibt erlaubt. Das vermeidet mögliche Safari-Geometrieprobleme. Ein echter iPhone-Cursortest kann durch Quellcode- und Modelltests nicht ersetzt werden; nach dem Update am Gerät prüfen. Kein neuer Update-Dienst und keine Datenmigration erforderlich.

### Eigene Interpretation ab 0.44.0

Das bisherige Feld „Eigene Interpretation“ ist aus Bearbeitung, interner Leseansicht, Gäste-/öffentlicher Ansicht, Freigabeprüfung, Feldauswahl und Versionshistorie entfernt. Archivsuche, öffentliche Suche und Änderungsprotokoll berücksichtigen seine Inhalte nicht mehr. Bereits gespeicherte Texte, Textformate und frühere Versionen bleiben unverändert in Datenbank und Sicherungen erhalten; beim Speichern anderer Felder übernimmt der Server diese Daten aus dem aktuellen gespeicherten Stand. Sie lassen sich über die Weboberfläche nicht mehr ändern oder aus früheren Versionen übernehmen. Alte Feldfreigaben werden bei der Auslieferung ignoriert; es erfolgt keine Löschung oder Datenmigration.

### Eintragsaktionen ab 0.43.0

In der internen Leseansicht bleibt „Eintrag bearbeiten“ ausschließlich in der festen oberen Leiste. Unten stehen kompakte Versionshistorie- und Löschen-Buttons mit ausreichender Bedienfläche und Abstand. Das Öffnen der Historie ist unverändert rein lesend. Löschen sowie die Übernahme einzelner, ausgewählter oder sämtlicher früherer Werte benötigen einen Bestätigungsdialog mit Abbrechen als Anfangsfokus. Übernahmen ändern zunächst nur das Bearbeitungsformular; erst Speichern erstellt einen neuen Beitragsstand. Abbrechen und bloßes Öffnen lösen weder Speicherung noch Freigabeanfrage aus.

### Backup-Anzeige und Wiederherstellung über die Oberfläche

Unter **Einstellungen → Backups** bietet ein Dropdown 1, 3, 7, 14 oder 31 Tage an; Standard ohne gespeicherte Auswahl sind 3 Tage. Bereits gespeicherte Zeiträume bleiben erhalten. Die Auswahl bleibt in diesem Browser gespeichert. **Alle vorhandenen Sicherungen anzeigen** hebt den Filter vorübergehend auf. Laufende Sicherungen bleiben sichtbar. Dies ändert weder Daten noch die separat konfigurierte Nextcloud-Aufbewahrung.

Downloads verwenden den Versionsstand der jeweiligen Sicherung: `geschichtsarchiv-backup-<ID>_v0.32.0_schema19.tar`. Unbekannte Versionsstände älterer Exporte werden als unbekannt gekennzeichnet, nicht mit der aktuellen Softwareversion ersetzt.

**Sicherung zurückspielen** erlaubt dem Admin den Upload einer TAR-Datei bis 2 GiB, auch aus einer anderen Instanz oder außerhalb des Anzeigezeitraums. Erst nach Prüfung und Vorschau sowie exakt eingegebenem Bestätigungstext wird der Bestand ersetzt. Der separate Serverdienst erstellt zuvor eine geprüfte vollständige Rückfallsicherung einschließlich Konfiguration und Programmstand mit Probe-Wiederherstellung. Fehler oder ein Dienstneustart lösen die Wiederherstellung des bisherigen Stands aus; bei beschädigter Rückfallsicherung bleibt der Wartungsmodus aktiv.

App **und separater Update-Dienst benötigen mindestens 0.32.0**. Ein App-Update aktualisiert den Dienstcontainer nicht. Die Einrichtung steht in [Serverupdates](docs/server-updates.md), der Ablauf und seine Grenzen in [Installation und Wiederherstellung](docs/installation.md). Vor dem Produktiveinsatz eine getrennte Wiederherstellungsprobe durchführen.

### Einstellungen und Notfallzugang ab 0.46.0

„Öffentliches Profil“ steht am Ende der Menüeinträge, direkt über Einstellungen. Administratoren sehen alle Einstellungen. Verwalter sehen Namen, Benutzer und Einladungen, Einstellungen für Gäste, öffentliches Profil, rechtliche Angaben, Farben und Design sowie Karte. Sie dürfen anderen Konten nach ausdrücklicher Bestätigung vollständige Administratorrechte vergeben; bestehende Administratorkonten können sie nicht verändern. Jede Vergabe wird protokolliert. Der letzte aktive Administrator bleibt vor Löschung, Sperrung und Herabstufung geschützt. Verwalterkonten deshalb nur vertrauenswürdigen Personen geben.

Ohne erreichbaren Administrator- oder Verwalterzugang siehe [Notfallzugang über SSH](docs/betreiber-anleitung.md#notfallzugang-über-ssh). Bestehende Konto-Passkeys werden dabei nicht ersetzt.


### Einstellungen und Bearbeitungsfenster ab 0.46.2

Innerhalb der geöffneten Bereiche „Öffentliches Profil“ und „Einstellungen für Gäste“ ist die Feldauswahl direkt sichtbar, ohne zusätzliches Aufklappen. „Sichtbare Felder“ und „Sichtbare Felder für Gäste“ verwenden dieselbe Zwischenüberschrift wie „Überschrift und Einführungstext“. Bestehende Freigaben, Speicheraktionen und Rollenrechte bleiben erhalten; der Direktlink zu den Gastfeldern öffnet weiterhin den äußeren Bereich.

Das Bearbeitungsfenster wird horizontal und vertikal innerhalb des Bildschirms zentriert, ohne CSS-Verschiebung oder Zoom-Animation. Lange Formulare scrollen im Fenster; kleine Bildschirme behalten einen Rand und eine begrenzte Fensterhöhe. Dies gilt für Bearbeiten und Neuanlegen. App auf 0.46.2 aktualisieren; der bereits laufende Update-Dienst 0.46.1 genügt.


### Mobile Beitragsbearbeitung ab 0.46.3

Bilder, ihre Beschriftungsvorschau und das Beschriftungsfeld nutzen im Editor die verfügbare Breite. Der Papierkorb-Button mit ausreichend großer Touchfläche entfernt die Zuordnung zum Beitrag; er löscht die gespeicherte Datei nicht unmittelbar. Erst das Speichern des Beitrags übernimmt die geänderte Zuordnung. Der Beitragstitel wächst und schrumpft automatisch mit seinem Inhalt, wie die Beschreibung. Die Grenze von 250 Zeichen bleibt bestehen; eingefügte Zeilenumbrüche werden zu Leerzeichen. Bitte nach dem App-Update am iPhone Bildbeschriftung, Titelumbruch und Cursorposition prüfen. Update-Dienst 0.46.1 genügt weiterhin.


### Dateiauswahl und Querformat ab 0.46.4

Die Buttons „Entwurf verwerfen“, „Abbrechen“ und „Eintrag speichern“ scrollen immer am Formularende mit, auch im Querformat. Beitragsanhänge und „Sicherung zurückspielen“ verwenden eine gemeinsame Dateiauswahl: Auswahlbutton, separater Status und eine Liste mit umbrechenden Dateinamen, Dateigröße und Entfernen-Symbol. Das Entfernen verwirft nur die lokale Auswahl. Bei Bildern zuerst die individuelle Beschriftung ergänzen und anschließend „Ausgewählte Dateien hochladen“ anklicken. Die Auswahl selbst lädt nichts hoch. Bei einer Sicherung weiterhin „Datei prüfen“ ausführen und die Wiederherstellung danach ausdrücklich bestätigen. Dateitypen und Größenlimits bleiben bestehen. Der bereits laufende Update-Dienst 0.46.1 genügt.


### Aufbewahrungsort auswählen ab 0.46.5

Nur die Auswahl „Aufbewahrungsort“ im Beitragseditor und im Archivfilter verwendet jetzt ein Design-Dropdown aus der vorhandenen Oberflächenbibliothek. „Nicht zugeordnet“ entfernt die Zuordnung im Formular; erst Speichern übernimmt die Änderung. „Alle Aufbewahrungsorte“ entfernt den Archivfilter. Bestehende Zuordnungen und Filter bleiben erhalten. Früher zugeordnete, nicht mehr verfügbare Orte werden weiterhin kenntlich gemacht. Lange Namen dürfen umbrechen; die Auswahl ist in ihrer Bildschirmhöhe begrenzt und scrollbar. Andere Dropdowns bleiben unverändert. Bitte nach dem App-Update am iPhone Hoch- und Querformat prüfen. Der Update-Dienst 0.46.1 genügt weiterhin.


### Archiv-Dropdowns ab 0.46.6

Im Archiv verwenden nun auch Kategorie, Forschungsstand, Sortierung, Darstellung und Einträge pro Seite Design-Dropdowns aus derselben Oberflächenbibliothek wie Aufbewahrungsort. „Alle Kategorien“ und „Alle Forschungsstände“ entfernen den jeweiligen Filter. Auswahlwerte, Filterrechte, gespeicherte Seitengröße sowie Browser-Zurück/Vorwärts bleiben erhalten. Auswahländerungen führen wie bisher zur ersten Ergebnisseite. Die Listen bleiben innerhalb des Bildschirms scrollbar, lange Texte dürfen umbrechen. Dropdowns außerhalb des Archivs bleiben unverändert. Der Update-Dienst 0.46.1 genügt weiterhin; bitte Darstellung und Touchbedienung nach dem App-Update am iPhone prüfen.


### Seitenleisten-Cookie entfällt ab 0.46.7

Die Seitenleiste speichert ihren Auf-/Zu-Zustand nur noch während der laufenden Nutzung im Arbeitsspeicher. Sie setzt dafür keinen Cookie mehr. Ein vorhandener `sidebar_state`-Cookie aus älteren Versionen wird beim nächsten Laden der internen Oberfläche gelöscht. Anmeldung, mobile Menübedienung und Tastaturkürzel bleiben erhalten; der Anmelde-Cookie wird nicht verändert. Der Update-Dienst 0.46.1 genügt.


### Rechtliche Angaben ab 0.47.0

Administrator und Verwalter bearbeiten „Rechtliche Angaben“ direkt nach „Öffentliches Profil“. Betreibername, Rechtsform, zustellfähige Adresse, Kontakt, Vorstandsmitglieder/Vertretungsberechtigte mit Funktion, Vertretungsregel und Registerdaten eingeben. Redaktionell Verantwortliche und Datenschutzbeauftragte nur soweit erforderlich ergänzen. Geprüften Datenschutztext, Hosting-Anbieter, Standort und tatsächlich genutzte Dienste getrennt erfassen. Keine Passwörter, privaten Schlüssel oder internen Serveradressen eintragen.

„Entwurf speichern“ veröffentlicht nichts. Die Vorschau zeigt den aktuellen Entwurf. „Impressum veröffentlichen“ und „Datenschutz veröffentlichen“ verlangen eine ausdrückliche Bestätigung und prüfen ausgefüllte Felder. Die Prüfung stellt keine Rechtssicherheit fest; Texte müssen zum tatsächlichen Betrieb passen und fachkundig geprüft werden. Veröffentlichungen sind getrennte Momentaufnahmen. Spätere Entwurfsänderungen verändern sie erst nach erneuter Veröffentlichung der jeweiligen Seite. Bei gleichzeitigen Änderungen neu laden, statt fremde Änderungen zu überschreiben.

Die Links im Fußbereich führen ohne Anmeldung zu `/impressum` und `/datenschutz`. Bis zur ersten Veröffentlichung wird dort ehrlich auf fehlende Angaben hingewiesen. Deshalb Betreiberangaben und geprüfte Datenschutzerklärung zeitnah veröffentlichen. Öffentliche Antworten enthalten keine Entwürfe. Die Angaben sind in vollständigen Backups enthalten; nach einem Import von einer anderen Instanz die übernommenen rechtlichen Texte auf den neuen Betreiber prüfen und anpassen. Der Update-Dienst 0.46.1 genügt.

Ab 0.47.1 stehen Impressum und Datenschutz mit dem Vereinsnamen in einer gemeinsamen Fußzeile. Auf schmalen Bildschirmen dürfen sie innerhalb dieser Zeile umbrechen. Der zusätzliche untere Bereich entfällt; die Links bleiben ohne Anmeldung erreichbar. Das normale Anwendungsupdate genügt, der Update-Dienst muss nicht ersetzt werden.
