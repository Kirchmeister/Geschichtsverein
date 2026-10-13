# Rollen und Veröffentlichungen

Linux-Sitzungen werden mittels Passkey authentifiziert. Rollen und Sperrungen werden aus der Instanzdatenbank geprüft; Namen oder frei gesetzte Browserheader begründen keine Rechte. Nur ein tatsächlicher Administrator darf die optionale Profilvorschau verwenden. Sie verändert keine Kontorollen. Handlungen bleiben dem angemeldeten Konto zugeordnet.

| Rolle | Archiv lesen | Beiträge bearbeiten | Veröffentlichungen genehmigen | Einstellungen und Konten |
| --- | --- | --- | --- | --- |
| Admin | Ja | Ja | Ja | Ja |
| Verwalter | Ja | Ja | Ja | Sechs freigegebene Bereiche und Administratorvergabe |
| Nutzer | Ja | Ja | Nein | Nein |
| Gast | Freigeschaltete Attribute | Nein | Nein | Nein |
| Öffentlich | Genehmigte Versionen und öffentliche Felder | Nein | Nein | Nein |

Einladungen und Rollen werden von Administratoren und Verwaltern verwaltet. Verwalter dürfen anderen Konten bestätigte, protokollierte Administratorrechte erteilen, aber bestehende Administratorkonten nicht verändern. Der letzte aktive Administrator darf nicht gelöscht, deaktiviert oder herabgestuft werden. Gleiche Anzeigenamen sind möglich; die unveränderliche Konto-Kennung unterscheidet Personen. Neue Konten erhalten stets neue IDs, auch bei gleichem Namen oder erneut genutzter E-Mail-Adresse. Persönliche Nachrichten werden dadurch nicht übertragen.

Veröffentlichungsanfragen betreffen eine gespeicherte Inhaltsversion. Admin und Verwalter werden intern informiert und entscheiden im Beitrag. Jede Bearbeitung, Wiederherstellung eines Attributs oder Löschung setzt die Freigabe zurück. Veraltete Anfragen werden nicht genehmigt. Offene Aufgaben und Erinnerungen bleiben vom persönlichen Ausblenden ihrer Nachricht unabhängig.

Öffentliche Inhalte stammen ausschließlich aus der genehmigten Version und den von Admin oder Verwalter freigegebenen Attributen. Gäste sehen den intern freigeschalteten Feldumfang; Schreib- und Verwaltungsfunktionen bleiben gesperrt. Dateiabrufe prüfen jeweils Version, Sichtbarkeit und Berechtigung. Änderungsprotokoll und Versionshistorie erhalten stabile Bearbeiter-IDs.

Portable Backups enthalten Archividentitäten und Historie, aber keine Anmeldeschlüssel. Ein Offline-Import in eine neue Installation verlangt neue Konten. Die Web-Wiederherstellung einer bestehenden Instanz erhält deren aktuelle lokale Konten und Zugänge; fremde Identitäten bleiben deaktiviert. Details: [Wiederherstellung](installation.md).
