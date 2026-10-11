# Projektworkflow

Auf ausdrücklichen Wunsch wird nur noch die Linux-Servervariante gepflegt. Code und Dokumentation werden nach Prüfung auf `Kirchmeister/Geschichtsverein`, Branch `main`, veröffentlicht. `development` bleibt erhalten. Die bisherige gehostete Testinstanz wird nicht aktualisiert. GitHub veröffentlicht keine Anwendung automatisch auf dem Vereinsserver.

- `main` vor Aktualisierung lesen; fremde Änderungen erhalten. Kein Force-Push.
- Nur Quellcode, Dokumentation und Schema übertragen; keine Laufzeitdaten, Sicherungen, Uploads, Konten oder Geheimnisse.
- README und Betriebsanleitung bei Änderungen pflegen. Dokumentation richtet sich ausschließlich an Linux-Betreiber.
- Passende Versionsnummer in `version.json` und `package.json`, Eintrag im CHANGELOG; bestehende Tags nie ändern.
- Relevante Tests, Linux-Build, `node scripts/check-version.mjs` und `git diff --check` ausführen.
- Ergebnis, GitHub-Commit und nötige Serversschritte berichten. Andere Serverdienste nicht verändern.
