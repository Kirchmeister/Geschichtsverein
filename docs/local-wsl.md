# Lokal mit Windows 11, WSL 2 und Docker Desktop testen

Entwicklungsstand, noch keine Produktionsfreigabe. Alle Befehle im Ubuntu-Terminal als normaler Benutzer ausführen. Docker Desktop muss laufen; Ubuntu muss unter WSL Integration aktiviert sein. Nextcloud und andere Dienste auf einem entfernten Server werden nicht angesprochen.

## 1. Quellcode beziehen

Das derzeitige Repository ist privat. Beispielsweise mit GitHub CLI anmelden (keine Tokens in Dateien oder Befehlsargumente schreiben):

```bash
sudo apt update
sudo apt install gh
gh auth login
gh auth setup-git
cd ~/projekte
gh repo clone Kirchmeister/Geschichtsverein
cd Geschichtsverein
git switch development
```

Bei `gh auth login` GitHub.com, HTTPS und Anmeldung im Browser auswählen. Berechtigungen für das private Repository müssen vorhanden sein.

## 2. Geheimnisse erzeugen und Docker starten

Die Konfiguration enthält Sitzungsschlüssel und den Verschlüsselungsschlüssel für Verbindungen. Sie ist ignoriert und gehört niemals in GitHub. Die Datei unbedingt gemeinsam mit der Datenablage sichern.

```bash
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/app" -w /app node:24-bookworm-slim node scripts/linux-init.mjs
docker compose up -d --build
docker compose ps
```

Falls eine frühere Version beim `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` abgebrochen ist, mit `git pull --ff-only` aktualisieren und `docker compose up -d --build` erneut ausführen. Die bereits erzeugte Konfiguration nicht neu erzeugen; das Lockfile bleibt verbindlich.

Der erste Build benötigt Zeit und lädt Abhängigkeiten herunter. Ein dauerhaft laufender Container ist normal. Nach dem Build unter http://localhost:8080 öffnen. Die Daten bleiben im benannten Docker-Volume `archive-data`; `docker compose down` entfernt sie nicht. **`docker compose down -v` löscht dagegen die Daten** und ist für normale Neustarts ungeeignet.

## 3. Ersten Administrator einladen

E-Mail-Adresse und Name im folgenden Befehl ersetzen:

```bash
docker compose exec archive node scripts/linux-start.mjs scripts/linux-admin.mjs "admin@example.org" "Ihr Name"
```

Dieser Befehl erzeugt einen vertraulichen, einmal nutzbaren Link. Er funktioniert nur, solange noch kein Linux-Konto angelegt ist. Den Link im Windows-Browser öffnen und den Passkey bestätigen (z. B. Windows Hello). Es gibt kein festes Testpasswort und keinen öffentlichen Admin-Zugang. Danach Ort und Vereinsnamen in der Ersteinrichtung eingeben; die Hosting-Domain darf für den lokalen Test leer bleiben.

In Einstellungen → Benutzer & Einladungen können weitere Konten mit Nutzer-, Verwalter- oder Administratorrolle eingeladen werden. Kontoänderungen sind nur für echte Administratoren möglich, auch bei Rollen-Vorschau. Das eigene Konto lässt sich hier nicht sperren oder herunterstufen. Einladungen gelten standardmäßig sieben Tage (in den Einstellungen änderbar) und können widerrufen werden; der Link wird derzeit manuell übermittelt. Automatischer SMTP-Versand und Zugangswiederherstellung bei Verlust aller Passkeys sind noch nicht freigegeben.

## 4. Test vom Mobiltelefon

Passkeys funktionieren auf einer LAN-IP über unverschlüsseltes HTTP nicht. Mobil benötigt eine feste, im WLAN auflösbare Adresse und HTTPS mit einem auf dem Telefon vertrauten Zertifikat. **Diese Adresse vor der ersten Registrierung wählen**, wenn dieselben Konten auch mobil getestet werden sollen. Passkeys sind an ihren Hostnamen gebunden, ein Domainwechsel überträgt sie nicht.

Eine getrennte Testinstanz ist für den Mobiltest am einfachsten:

1. Im Router einen lokalen DNS-Eintrag `archiv.home.arpa` auf die private IP des Windows-Rechners setzen; DHCP-Adresse reservieren. Beide Geräte müssen diesen DNS verwenden. Einen Windows-Hosts-Eintrag allein kann das Telefon nicht sehen.
2. In `linux-config/app.env` `ARCHIVE_ORIGIN=https://archiv.home.arpa:8443` setzen. Das ist die Anmeldeadresse, getrennt von der QR-Hosting-Domain in den App-Einstellungen.
3. Mit `docker compose -f compose.yaml -f compose.lan.yaml up -d --build` starten. Der zusätzliche Caddy-Proxy stellt internes HTTPS bereit. Die normale App bleibt nur auf localhost:8080 direkt erreichbar.
4. Die öffentliche Root-CA exportieren: `docker compose -f compose.yaml -f compose.lan.yaml cp proxy:/data/caddy/pki/authorities/local/root.crt ./linux-config/local-root.crt`. Nur dieses öffentliche Zertifikat auf Windows und Telefon als vertrauenswürdige CA installieren, niemals den privaten CA-Schlüssel kopieren. Auf iOS muss nach der Profilinstallation zusätzlich volles Zertifikatsvertrauen aktiviert werden.
5. Bei Bedarf ausschließlich TCP 8443 im privaten Windows-Firewallprofil für das lokale Subnetz freigeben. Keine Router-Portweiterleitung ins Internet erstellen.
6. `https://archiv.home.arpa:8443` auf beiden Geräten ohne Zertifikatswarnung öffnen und erst dann den Administrator-Link für diese Adresse erzeugen.

Eine bereits auf localhost eingerichtete Instanz nicht durch Umschreiben der Anmeldeadresse umstellen. Für einen weiteren, leeren Test stattdessen einen anderen Compose-Projektnamen (`-p archiv-mobil`) sowie eine eigene Konfigurationsablage/Portbelegung verwenden. Den vorhandenen Datenstand bewahren.

Bei einem früheren Startfehler „production build in .next“ auf mindestens 0.4.2 aktualisieren (`git pull --ff-only`) und erneut bauen. Der Container startet den erzeugten Standalone-Server und verwendet dessen gespeicherte Build-Konfiguration. Konfiguration und Datenvolume bleiben erhalten.

## Diagnose

```bash
docker compose ps
docker compose logs --tail=80 archive
curl -sS http://localhost:8080/api/health
```

Die letzte Anfrage sollte `{"ok":true}` liefern. Einladungslinks oder Konfigurationsdateien bitte nicht in öffentliche Fehlerberichte aufnehmen. Docker-Image-Build und echte Windows-Hello-/Telefon-Bedienung müssen auf Ihrem Rechner verifiziert werden; die Entwicklungsumgebung hat keine Docker Engine bzw. physische Authentifikatoren.
