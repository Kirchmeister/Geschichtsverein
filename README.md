# Digitales Geschichtsarchiv

Konfigurierbares Arbeitsarchiv für Geschichtsvereine: historische Beiträge, Quellen, Medien, Artefakte und Aufbewahrungsorte. Besucher sehen eine kuratierte öffentliche Zeitleiste; freigegebene Beiträge sind auch über dauerhafte Referenzlinks und QR-Codes erreichbar.

## Ersteinrichtung und Backup-Import

Eine neue Installation startet leer und verlangt Ort und Vereinsname. Die Hosting-Domain kann übersprungen werden. Alternativ lässt sich eine exportierte Sicherung aus Sites oder einer anderen Instanz zuerst offline in einen getrennten Bestand importieren.

```sh
node scripts/restore-backup.mjs --backup /pfad/archiv.tar --inspect
node scripts/restore-backup.mjs --backup /pfad/archiv.tar --target /pfad/neuer-bestand
```

Vorhandene Zielordner werden nicht überschrieben. Zugangspasswörter werden entfernt, automatische Aufgaben pausiert und importierte Anmeldeidentitäten deaktiviert. Der neue Admin bestätigt die Einrichtung. Die bestehende Sites-Installation erhält ihre Daten und ihre vorbelegte Konfiguration.

Die vollständige Anleitung, Laufzeitpfade und Grenzen stehen in [docs/installation.md](docs/installation.md). Der Import funktioniert mit der aktuellen Worker-/D1-/R2-Laufzeit; der Linux-Produktionsadapter mit echter Anmeldung ist weiter separat vorzubereiten.

## Funktionen

- Rollen Admin, Verwalter und Nutzer sowie öffentliche Ansicht
- Veröffentlichung mit Prüfung, Rücknahme und geplanten Zeitleisten-Auswahlen
- Personen- und Familientags sowie Verknüpfungen innerhalb von Beschreibungstexten
- Versionsvergleich und Wiederherstellung einzelner Felder
- Moderierte Kommentare und Antworten
- QR-Druck mit Hosting-Adresse und Druckhistorie
- Aggregierte Zugriffsstatistik ohne Besuchernamen oder Nutzer-IDs
- Manuelle Sicherungen und vorbereitete tägliche Nextcloud-/WebDAV-Sicherung

## Technik und Voraussetzungen

React und TypeScript, Vinext/Vite; der derzeitige Server läuft als Cloudflare Worker mit D1 (SQLite) und R2 für Dateien. Node.js ab 22.13.0, Git und die in `package.json` festgelegte pnpm-Version werden benötigt. Die Bindings heißen `DB` und `BUCKET`.

## Lokal installieren

```sh
git clone https://github.com/Kirchmeister/Geschichtsverein.git
cd Geschichtsverein
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Das private Repository benötigt GitHub-Zugriff. Ein frischer Checkout verwendet automatisch das portable Entwicklungsprofil. Der Entwicklungsserver läuft standardmäßig unter `http://localhost:5173` und bietet ausschließlich lokal simulierte Anmeldung. Produktionsidentitäten dürfen nicht durch diese Simulation ersetzt werden.

Für lokale D1-Migrationen eine **lokale** Wrangler-Konfiguration `wrangler.local.json` erstellen:

```json
{
  "name": "stadtgeschichte-local",
  "compatibility_date": "2026-10-01",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "site-creator-d1",
    "database_id": "00000000-0000-4000-8000-000000000000",
    "migrations_dir": "drizzle"
  }]
}
```

Den Entwicklungsserver stoppen und anschließend ausführen:

```sh
corepack pnpm exec wrangler d1 migrations apply site-creator-d1 --local --config wrangler.local.json --persist-to .wrangler/state
```

Diese Konfiguration enthält keine Produktionsdatenbank. Lokale Daten liegen unter `.wrangler/` und gehören nicht ins Repository. Die Persistenzpfade des verwendeten Vite-/Wrangler-Profils müssen übereinstimmen; bei einer abweichenden lokalen Konfiguration den Pfad entsprechend anpassen.

## Laufzeitkonfiguration

Für lokale Tests kann eine ignorierte `.dev.vars` verwendet werden:

```text
ARCHIVE_BOOTSTRAP_ADMIN_EMAIL=seedy@sites.test
ARCHIVE_SETTINGS_KEY=<zufälliger geheimer Schlüssel>
```

Die Bootstrap-Adresse bestimmt den initialen Admin und muss zur authentifizierten Identität passen. In Produktion als geschützte Laufzeitvariable setzen. `ARCHIVE_SETTINGS_KEY` wird für verschlüsselte Verbindungseinstellungen benötigt; Der Schlüssel besteht aus 64 hexadezimalen Zeichen (32 Zufallsbytes); Details siehe `lib/archive-system-settings.ts`. Bestehende Schlüssel bei einem Umzug erhalten, sonst lassen sich gespeicherte Zugangsdaten nicht entschlüsseln. Keine echten Werte in Git eintragen.

## Prüfen und bauen

```sh
corepack pnpm exec tsc --noEmit
corepack pnpm build
```

`tests/` enthält ergänzende Prüfscripte; einige benötigen einen gestarteten lokalen Worker und passende Testkonfiguration. Ein Build allein prüft keine produktiven Zugangsdaten oder externen Dienste.

## Veröffentlichung und Linux-Umzug

Die bestehende Sites-Umgebung wird über den Sites-Publishing-Workflow veröffentlicht. `.openai/hosting.json` beschreibt die Bindings und die bestehende Site; die Projektkennung ist keine Zugangsdatenfreigabe. Ein GitHub-Commit veröffentlicht die Anwendung nicht automatisch.

**Der aktuelle Stand ist noch kein direkt installierbares Docker-/Apache-Paket.** Für den geplanten Linux-Betrieb müssen Worker-Bindings/D1/R2, Identitätsprüfung und Anmeldung an die Zielumgebung angepasst werden. Insbesondere darf ein eigener Server die `oai-authenticated-*`-Header nicht ungeprüft von Browsern übernehmen. Einladungen und Passkeys benötigen dort eine echte Authentifizierung. SMTP-Verbindungen müssen ebenfalls zur Ziel-Laufzeit passen.

Nextcloud und Taler bleiben getrennte Dienste. Erst nach vorbereitetem Adapter, separater Datenbank/Dateiablage, geprüfter Sicherungswiederherstellung und einem isolierten Testbetrieb wird die neue Domain auf die Anwendung umgestellt. Die Anleitung wird mit der Umsetzung um konkrete Installations- und Aktualisierungsbefehle erweitert.

## Daten und Sicherungen

GitHub enthält nur Quellcode, Schema-Migrationen und Dokumentation. Archivbeiträge, Nutzerkonten, Kommentare, Statistiken, Uploads und Sicherungsarchive sind Laufzeitdaten und werden nicht synchronisiert. Dasselbe gilt für SMTP-/WebDAV-Zugangsdaten und Produktionsschlüssel. Die Anwendungssicherung bleibt unabhängig von GitHub erforderlich.

Bei einem Umzug IDs, Referenzen, Versionsdaten, Beschreibungstags/-links und QR-Druckhistorie erhalten. Sicherungen enthalten Daten und Dateien; das Offline-Importwerkzeug überprüft und importiert sie in eine getrennte, neue Ablage. Wiederherstellung zuerst in einer Testumgebung prüfen. Verbindungspasswörter werden nicht im Sicherungsexport mitgegeben und müssen neu gesetzt werden.

## Zusammenarbeit und Synchronisierung

Nach jeder beauftragten Codeänderung werden die geprüfte Sites-Version und ein entsprechender GitHub-Commit bereitgestellt. Beide Ziele sind unabhängige Veröffentlichungen; Fehler oder abweichende Stände werden gemeldet. Änderungen am GitHub-Repository vor einer Synchronisierung prüfen und erhalten; keine fremden Änderungen überschreiben. Die README bei Änderungen an Installation, Konfiguration und Betrieb mitpflegen.

## Versionen und Farbvorlagen

`version.json` führt Softwareversion, Datenbankschema-Version und Backupformat-Version. Die Softwareversion steht auch in `package.json` und im Admin-Menü **Einstellungen**. `CHANGELOG.md` beschreibt Änderungen und Migrationshinweise.

Nach dem Push auf `main` erstellt der GitHub-Workflow **Versioned releases** einen festen Tag und ein Release zur Versionsnummer. Bereits veröffentlichte Tags/Releases werden nicht umgebogen. Der bisherige Stand ist `v0.1.0`; die erste Version mit Farbvorlagen ist `v0.2.0`. Beide sind Vorabversionen, solange der produktive Linux-Betrieb noch nicht fertiggestellt ist. GitHub Actions muss für das Repository aktiviert sein; der Workflow verwendet ausschließlich dessen kurzlebiges `GITHUB_TOKEN` mit `contents: write`.

Version anheben:

```sh
node scripts/bump-version.mjs patch   # Fehlerkorrektur
# minor für neue Funktionen; major für inkompatible Änderungen
node scripts/check-version.mjs
```

Danach Änderungsnotizen ausfüllen, angemessen prüfen/builden, committen und veröffentlichen. Neue Migrationen erhöhen zusätzlich die Datenbankschema-Version; ein inkompatibles Backupformat erhält eine eigene neue Formatversion und einen passenden Importer. Bei Vorabversionen können auch Minor-Versionen Änderungen enthalten, die eine Migration erfordern; maßgeblich sind die Release-Hinweise.

Eine ältere Version **auf einer getrennten Testinstanz** ausprobieren:

```sh
git fetch --tags
git worktree add --detach ../geschichtsarchiv-v0.1.0 v0.1.0
```

In diesem Verzeichnis die Installationsanleitung verwenden, eigene Laufzeitdaten konfigurieren und nur eine Sicherungskopie importieren. Kein gemeinsames Datenverzeichnis mit der laufenden Instanz verwenden. Ein Code-Downgrade stellt keine Datenbank zurück; bei späteren Migrationen sind die Versionshinweise und ein kompatibles Backup erforderlich. Sicherungen mit neuerem Schema werden vom Importer abgelehnt.

Unter **Einstellungen → Farben & Design** kann ausschließlich der Admin zwischen Salbeigrün (bisheriges Design), Küstenblau, Petrol & Sand, Pflaume & Creme, Weinrot & Porzellan und Ocker & Schiefer wählen. Erst **Farbvorlage übernehmen** speichert die Auswahl für alle Profile dieser Instanz. Sie wird mitgesichert; sensible Verbindungsdaten sind über die Design-API nicht lesbar. Andere bereits geöffnete Tabs aktualisieren ihre Farben beim erneuten Aktivieren. QR-Codes bleiben schwarz auf weiß.
