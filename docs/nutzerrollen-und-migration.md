# Rollen, Vorschau und Veröffentlichung

## Jetzt aktiv

Die Site bleibt privat und nutzt weiterhin die Sites-Zugriffssteuerung. Das obere Dropdown erlaubt dem derzeitigen Eigentümer eine temporäre Vorschau als Admin, Verwalter, Nutzer oder öffentlicher Leser. Die Auswahl gilt für diesen Browser-Tab und wird bei einem Neuladen zurückgesetzt. Änderungen, Feldauswahl und Freigaben werden dagegen dauerhaft gespeichert.

Die Vorschau verändert keine Nutzeridentitäten oder gespeicherten Rollen. Bearbeitungen und Freigaben werden weiterhin dem tatsächlich angemeldeten Benutzer zugeschrieben. Der Server akzeptiert `x-archive-preview-role` ausschließlich vom über Sites verifizierten Eigentümer. Die zeitweilige Eigentümer-Zuordnung in `lib/archive-access.ts` muss beim Serverumzug durch die tatsächliche Admin-Mitgliedschaft ersetzt werden.

| Rolle | Beiträge anlegen / ändern | Einladungen (vorbereitet) | Veröffentlichungen genehmigen | Löschen / Wiederherstellen |
| --- | --- | --- | --- | --- |
| Admin | Ja | Ja | Ja | Ja |
| Verwalter | Ja | Ja | Nein | Nein |
| Nutzer | Ja | Nein | Nein | Nein |
| Öffentliche Ansicht | Nein | Nein | Nein | Nein |

Einladungen und Rollenverwaltung sind weiterhin für den Serverumzug vorbereitet, noch nicht als Benutzerfunktionen aktiviert. Admins können die öffentliche Feldauswahl speichern. Nutzer und Verwalter können die Veröffentlichung eines gespeicherten Eintrags anfragen. Alle Genehmigungen und Ablehnungen sind ausschließlich Admins vorbehalten; die ursprüngliche Planung wurde entsprechend geändert.

## Veröffentlichungsablauf

Einträge beginnen als Entwurf (`draft`). Eine Anfrage (`pending`) verweist auf eine konkrete gespeicherte Inhaltsversion und hält Antragsteller sowie Zeitpunkt fest. Nur ein Admin kann diese unveränderte Version genehmigen (`approved`) oder ablehnen (`rejected`). Eine abgelehnte Anfrage kann erneut eingereicht werden. Jede Bearbeitung, Wiederherstellung oder Löschung setzt die Freigabe und Anfrage zurück. Eine veraltete Anfrage kann nach einer konkurrierenden Bearbeitung nicht mehr genehmigt werden.

Anfragen, Genehmigungen und Ablehnungen erzeugen unveränderliche Einträge im bestehenden Änderungsprotokoll. Öffentliche Daten werden aus dem genehmigten Versionsdatensatz und ausschließlich anhand der Admin-Feldauswahl aufgebaut. Ausgeblendete Felder werden nicht an die öffentliche Ansicht geliefert. Bilder, Dokumente und Tonaufnahmen sind unabhängig auswählbar. Dateiabrufe in der öffentlichen Ansicht müssen zu einer weiterhin genehmigten Version gehören und zur aktuell erlaubten Dateigruppe passen. Private Such-, Historien-, Änderungsprotokoll-, Konfigurations- und Schreibendpunkte verweigern die öffentliche Vorschau.

Das öffentliche Profil ist innerhalb der privaten Site als Vorschau erreichbar. Die Site wurde durch diese Erweiterung nicht allgemein öffentlich freigegeben.

## Identitäten und Aufbewahrung

`lib/archive-identity.ts` übersetzt die authentifizierte Sites-Identität in eine stabile eigene Archiv-Nutzer-ID. Namen aus Formularen oder JSON-Anfragen werden nicht als Bearbeiter akzeptiert. Versionen behalten ihre ursprünglichen Bearbeiter-IDs und damaligen Anzeigenamen. Bei älteren Versionen bleibt der Bearbeiter unbekannt. Pagination begrenzt nur die Anzeige und niemals die Aufbewahrung.

## Beim Serverumzug

1. Datenbank einschließlich aller Migrationen, Nutzer-IDs, Freigaben, Einstellungen und Versionsdatensätze sowie Dateien mit ihren unveränderten Schlüsseln übernehmen.
2. Verifizierte Sitzungen des Zielservers an den Identitätsadapter anbinden. Ungeprüfte HTTP-Header dürfen dort keine Identitäten festlegen. Bestehende Konten kontrolliert mit Archiv-Nutzer-IDs verknüpfen, nicht anhand des Anzeigenamens.
3. Eigentümer ausdrücklich als Admin festlegen. Die temporäre Eigentümer-E-Mail-Zuordnung und das Vorschau-Dropdown entfernen oder auf eine gesonderte, nur Admins zugängliche Testumgebung beschränken.
4. Einladungen mit befristeten, einmaligen und gehasht gespeicherten Tokens sowie Rollenverwaltung ergänzen. Verwalter dürfen Nutzer einladen; Adminrollen werden nur von Admins vergeben.
5. Erst nach Prüfung aller Zugriffe eine öffentlich erreichbare Leseansicht aktivieren. Private APIs und private Dateien müssen weiterhin geschützt bleiben. Ein Dateischlüssel allein ist keine öffentliche Zugriffsberechtigung.
6. Sicherung und Wiederherstellung sowie Freigaben unter konkurrierenden Änderungen testen. Der Forschungsstatus „Quellengeprüft“ ersetzt keine Veröffentlichungsfreigabe.
