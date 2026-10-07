# Updates auf dem eigenen Server

## Stand

Der Update-Dienst und die Admin-Oberfläche sind implementiert und mit separaten Testbeständen geprüft. **Die produktive Linux-Anmeldung und der Hosting-Treiber sind noch nicht freigegeben.** Es gibt daher noch keinen gefahrlosen Ein-Klick-Installer. Eine vorhandene Serverinstallation wird durch diese Änderungen nicht umgestellt.

Die Standard-README beschreibt den Vereinsbetrieb. Die ChatGPT-/Sites-Verifikation und deren technische Speicheranbindung stehen ausschließlich in `development-sites.md`. Entwicklung erfolgt auf `development`; `main` bleibt bis zur ausdrücklich beauftragten Freigabe unverändert. Der Release-Workflow ist auf `main` beschränkt. Die bisherigen Vorab-Releases bleiben erhalten.

## Verhalten

- Der eigenständige Dienst prüft GitHub beim Start und alle sechs Stunden. Er installiert nichts automatisch.
- Nur stabile, nicht als Entwurf/Vorabversion markierte Releases mit `vMajor.Minor.Patch` werden angeboten. `development` wird nie zum Updateziel.
- „Version überspringen“ blendet die Version in automatischen Ergebnissen aus. „Jetzt nach Updates suchen“ zeigt sie mit Kennzeichnung wieder an und erlaubt Installation oder Rücknahme des Überspringens.
- Vor einer Installation verlangt die Admin-Oberfläche `UPDATE MIT GEPRÜFTER SICHERUNG`.
- Ein nur vom Betreiber eingerichteter lokaler Dienst führt die Arbeiten aus. Eine Browseranfrage kann keine Shellbefehle oder Programme vorgeben.
- Der alte Programmstand bleibt lokal verfügbar. Dateien und Konfiguration müssen in getrennten, privaten Verzeichnissen liegen.

## Sicherung und Umschaltung

1. Release-Code getrennt herunterladen, festen Commit auflösen, Metadaten prüfen und durch den Hosting-Treiber bauen/testen.
2. Wartungsmodus aktivieren: alle Schreibzugriffe und Hintergrundschreiber beenden; Anwendung vollständig stoppen.
3. Datenbankbestand, Dateien, Konfiguration einschließlich Wiederherstellungsschlüsseln und den bisherigen Code vollständig kopieren.
4. Dateien mit Größen/SHA-256 vergleichen und SQLite-Integrität prüfen. Die Kopie erneut in eine getrennte Probeablage wiederherstellen und vom Hosting-Treiber auf Anwendungsebene prüfen lassen. Ohne diese Prüfung keine Migration.
5. Alle nötigen Migrationen durchführen; Zwischenversionen müssen nicht einzeln installiert werden. Der Treiber darf keine nötigen Migrationen überspringen.
6. Neuen Code über den `current`-Symlink auswählen und **weiterhin im Wartungsmodus** starten. Gesundheitsprüfung einschließlich Versions-/Schemaabgleich durchführen.
7. Erfolg dauerhaft protokollieren und erst dann Schreibzugriffe freigeben. Ein Neustart des Updaters kann diese Freigabe idempotent nachholen.

Bei Fehlern vor der Datenänderung startet die alte Version wieder. Nach einer angefangenen Migration wird zuerst die verifizierte Daten-/Konfigurationssicherung zurückgespielt, dann der alte Code gestartet und geprüft. Ein unterbrochener Vorgang wird beim Neustart wiederhergestellt. Beschädigte Sicherungen oder ein gescheiterter Rückweg lassen den Wartungsmodus bestehen und blockieren neue Updates. Fehlgeschlagene Datenablagen werden zur Diagnose zurückbehalten, nicht als aktive Daten verwendet.

Ein späterer manueller Code-Downgrade nach neuen Bearbeitungen wird nicht automatisch angeboten: Er könnte neue Daten verlieren. Dafür sind eine separate Prüfung und kompatible Wiederherstellung nötig. Die Implementierung automatisiert den Rückweg eines noch nicht freigegebenen Updates.

Update-Snapshots bleiben lokal erhalten. Sie enthalten sensible Konfiguration und werden durch private Verzeichnisse (0700) geschützt; sie gehören nicht in den Webroot oder GitHub. Zusätzlich externe Sicherungen betreiben. Speicherplatz/Aufbewahrung muss der Betreiber überwachen. Der Updater kann Hardwarefehler oder fehlenden Speicherplatz nicht wegautomatisieren.

## Hosting-Treiber: verbindliche Schnittstelle

`server/update-agent.mjs` benötigt eine **lokal vom Betreiber eingerichtete ausführbare Datei**. Sie erhält ausschließlich diese Argumente:

```text
TREIBER AKTION PROGRAMMVERZEICHNIS DATENVERZEICHNIS KONFIGURATIONSVERZEICHNIS
```

| Aktion | Verpflichtung |
| --- | --- |
| `prepare` | Neue Version bauen und vorprüfen, ohne aktive Daten oder Dienste zu verändern. |
| `stop` | Wartungsmodus sperrt Besucher und Schreiber; nur diesen Archivdienst vollständig anhalten. Idempotent, kein Apache-/Nextcloud-/Taler-Stopp. |
| `verify-restore` | Alten Programmstand gegen die angegebenen **Probeverzeichnisse** prüfen: Schema, Objektdateien, Referenzen, Schlüssel und Lesbarkeit. Kein Zugriff auf Liveablagen oder Versand/Timer. |
| `migrate` | Alle ausstehenden Migrationen für die Zielversion gegen den gestoppten Bestand ausführen. Bei unbekanntem Schema fehlschlagen. |
| `start` | Archivdienst mit angegebenem Code starten; Schreibzugriffe bleiben gesperrt. Idempotent. |
| `health` | Innerhalb von zwei Minuten Antwort, Zielversion, Schema und Medienlesbarkeit prüfen; darf keine Schreibsperre aufheben. |
| `commit` | Nach erfolgreicher Prüfung Schreibsperre aufheben. Idempotent. Bei Fehler **niemals** teilweise freigeben. |

Ein Exit-Code ungleich 0 blockiert den nächsten Schritt. Der Treiber ist bewusst **kein Platzhalter, der Erfolg zurückgibt**: Ohne echten Treiber/Probeprüfung startet der Dienst nicht. Seine produktive Implementierung folgt mit dem Linux-Hosting-/Login-Adapter.

## Konfiguration des unabhängigen Dienstes

Node.js ab 22.13, Git und tar sind erforderlich. Beispiel einer **nicht sofort aktivierbaren** Konfiguration, ausschließlich für den eigenen Dienstnutzer lesbar (0600):

```json
{
  "root": "/srv/geschichtsarchiv/updater",
  "dataRoot": "/srv/geschichtsarchiv/data",
  "configRoot": "/srv/geschichtsarchiv/config",
  "driver": "/usr/local/libexec/geschichtsarchiv-host-control",
  "repository": "Kirchmeister/Geschichtsverein",
  "githubToken": "",
  "secret": "64-zufaellige-hexzeichen",
  "port": 3099
}
```

Die Konfigurationsdatei muss innerhalb `configRoot` liegen. Bei einem privaten Repository wird ein ausschließlich lesender GitHub-Zugang benötigt. Geheimnisse werden nie im Browser angezeigt oder als Prozessargumente übergeben. `root`, `dataRoot` und `configRoot` dürfen einander nicht enthalten. Der erste Programmstand muss vor seinem Build den genauen Git-Commit als `codeCommit` in seiner lokalen `version.json` erhalten. Ohne diese Kennung blockiert der Updater. Der initiale `updater/current`-Symlink verweist auf den bereits geprüften Programmstand innerhalb `updater/releases/`.

```sh
ARCHIVE_UPDATER_CONFIG=/srv/geschichtsarchiv/config/updater.json node server/update-agent.mjs
```

Den Dienst später als eigenen systemd-Dienst unter dem Archivnutzer betreiben. Er muss während eines App-Neustarts weiterlaufen. Er bindet ausschließlich `127.0.0.1:3099`. **Nicht über Apache veröffentlichen.** Nextcloud und Taler bleiben unangetastet.

Die Anwendung erhält separat `ARCHIVE_HOSTING_RUNTIME=linux`, `ARCHIVE_UPDATER_URL=http://127.0.0.1:3099/` und dasselbe `ARCHIVE_UPDATER_SECRET`. Die Admin-API prüft Rolle und Origin und signiert Serveranfragen mit HMAC, Zeitstempel und Einmalwert. Der Dienst verwirft Wiederholungen und abgelaufene Signaturen.

## Anmeldung und Fähigkeiten

Linux akzeptiert keine `oai-authenticated-*`-Header. Der künftige Login-Adapter muss eine `archive_session`-Sitzung ausstellen: HMAC-SHA-256 mit `ARCHIVE_SESSION_KEY` (64 Hexzeichen), Payload in Base64url, anschließend Punkt und Signatur in Base64url. Payload: `issuer=archive-linux-session-v1`, `subject`, `email`, `name`, `iat`, `exp` (maximal 24 Stunden). Cookie: HttpOnly, Secure, SameSite=Lax, Path=/. Die bestehende Rollenprüfung liest Rechte weiterhin aus der Instanz-Datenbank. Kein Schlüssel oder Cookie ins Repository.

Das Ausstellen dieser Sitzung nach echter Passkey-Prüfung ist noch nicht freigegeben. Ohne Sitzung bleibt der Linux-Zugang gesperrt; ein frei gesetzter Header gibt keine Rechte. Sites verwendet weiterhin die bestätigte Hosting-Identität und zeigt unter „Hosting & verfügbare Funktionen“, dass Serverupdates dort nicht erforderlich sind.

## Prüfungen

`node tests/update-engine.test.mjs` prüft Skip/manuelle Wiederanzeige, stabile Releases, vollständige Snapshot-/Probeprüfung, gescheiterte Migration, Gesundheitsfehler, gescheiterte Probeprüfung, Neustart-Wiederherstellung und beschädigte Sicherungen. Der Agent/Servertreiber muss vor Aktivierung zusätzlich auf einer isolierten echten Linux-Instanz getestet werden. Ein Modultest ersetzt keinen Test des späteren systemd-/Login-/Speicheradapters.

Der Docker-Testbetrieb aus `docs/local-wsl.md` aktiviert keinen Update-Treiber. SQLite-/Dateiadapter und Passkey-Anmeldung sind verfügbar, die beaufsichtigte Container-Updateintegration bleibt separat. In dieser Testinstanz werden daher keine Updates autonom installiert.
