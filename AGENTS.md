# Projektworkflow

Dieses Projekt wird in der bestehenden Sites-Umgebung und im privaten Repository `Kirchmeister/Geschichtsverein` gepflegt. Nach autorisierten Codeänderungen beide Ziele mit demselben geprüften Quellstand aktualisieren, sofern der Nutzer nichts anderes verlangt. GitHub ist keine automatische Linux-Bereitstellung.

- Sites-Identität und Audience erhalten; Sites-Skill-Publishing verwenden.
- GitHub-Branch `main` vor Aktualisierung lesen; Änderungen anderer erhalten und Konflikte auflösen. Kein Force-Push.
- Nur Quellcode/Dokumentation/Schema synchronisieren: keine Laufzeitdaten, Uploads, Sicherungen, lokale Toolzustände oder Geheimnisse. Auch echte Benutzeridentitäten nicht in Fixtures/Bootstrap-Code schreiben.
- README bei Änderungen an Einrichtung, Konfiguration und Betrieb aktualisieren.
- Prüfergebnis, Sites-Link und GitHub-Commit melden; Teilerfolge klar benennen.
- Linux-Umzug ist noch separat vorzubereiten. Nextcloud und Taler dürfen nicht beeinträchtigt werden.
