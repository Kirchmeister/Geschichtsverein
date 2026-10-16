# GADS – Geschichtsarchiv-Designsystem

**Status:** Verbindliche Referenz für neue Oberflächen, Fassung 1.0 (15.10.2026)  
**Geltungsbereich:** Geschichtsverein / digitales Geschichtsarchiv, Linux-Servervariante  
**Referenz im laufenden Archiv:** `/designsystem` (nur Administratoren und Verwalter)  
**Technische Grundlage:** `app/globals.css`, `lib/archive-theme.ts`, `components/ui/*`, `components/archive/settings-panel.tsx`, `components/archive/design.tsx`.

> **Wichtig:** Dieses Dokument beschreibt den gemeinsamen Zielstandard. Bestehende Abweichungen werden hier erfasst, aber durch die Einführung der Designreferenz **nicht** geändert. Die Referenzseite ist eine Sichtprobe; sie ersetzt keine Prüfung sämtlicher Bildschirmgrößen im tatsächlich betriebenen Archiv.

## 1. Ziel und Grundsatz

Das ruhige, historisch-editoriale Erscheinungsbild des Archivs bleibt erhalten: großzügige Flächen, Serifenschrift für große redaktionelle Überschriften, sachliche serifenlose Schrift in Formularen und Bedienelementen, feine Trennlinien und dezente Farben. Die vorhandene Farbwahl bleibt erhalten.

**Für jede neue UI-Implementierung verbindlich:**
1. Vor dem Entwurf dieses Dokument und die reale Referenzseite `/designsystem` prüfen.
2. Vorhandene Bauteile aus `components/ui/` und `components/archive/` bevorzugen, statt eigene Varianten zu schreiben.
3. Gleiche semantische Aufgabe = gleiche visuelle Rolle (z. B. Seitentitel, Einstellungsüberschrift, Feldlabel, Hinweis, Primäraktion).
4. Farben aus den vorhandenen semantischen CSS-Tokens wählen: `--background`, `--foreground`, `--primary`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--card`, `--destructive`; keine neuen fest codierten Farbcodes in Funktionskomponenten.
5. Neue Schriftgrößen, Rahmen, Innenabstände und Button-Typen nicht ad hoc einführen. Eine begründete Ausnahme zuerst hier dokumentieren.
6. Desktop und Smartphone prüfen; Schriftgröße der Formulareingaben mobil mindestens 16 px, nutzbare Klick-/Touch-Ziele möglichst mindestens 44 × 44 px, sichtbarer Tastaturfokus und ausreichender Kontrast.
7. Wenn eine neue Funktion ausnahmsweise vom System abweichen muss, die Ausnahme im Pull Request mit Grund, Geltungsbereich und Dauer dokumentieren.
8. Mit einer UI-Änderung nicht pauschal `app/globals.css` übersteuern und keine unrelated Screens mitändern.

**Explizite Nicht-Referenzen:** `Änderungsprotokoll` und `Zeitleiste verwalten`. Diese Ansichten sind Bestandsflächen mit zukünftigem Bereinigungsbedarf. **Weder ihre Überschriften, Schriftgrößen, Formulare, Abstände noch ihre Button-Gestaltung dürfen als Vorlage für neue Funktionen übernommen werden.** Sie werden hier nur in der Ausschlussliste genannt, nicht als Quelle für Soll-Werte ausgewertet.

## 2. Bestandsaufnahme – etablierte Grundlagen (Phase 1)

Die Analyse bezieht sich auf Quellcode und vorhandene Komponenten des Branches `main` am 15.10.2026, nicht auf eine vollständige Live-/Browser-Abnahme.

| Bereich | Nachgewiesene vorhandene Grundlage | Referenzbeurteilung |
| --- | --- | --- |
| Seitenrahmen / Startseite | `app/page.tsx`, `.content`, `.page-heading`, `.collections` | Ja: großzügiger Weißraum, ruhige Gliederung |
| Typografie | `app/globals.css`: Georgia für `h1/h2/h3`, Arial für Body und Bedienung | Ja: Schriftenkontrast erhalten |
| Einstellungen | `components/archive/settings-panel.tsx`; `.settings-panel`, `.settings-grid` | Ja: Aufklapper, Überschrift, Inhaltseinteilung |
| Beispiel `Nextcloud / WebDAV` | `components/archive/system-settings.tsx`, `SettingsPanel` | Ja: Abschnittstyp mit `h2`, Status und Formular |
| Farbgestaltung | `components/archive/design.tsx`; `lib/archive-theme.ts` | Ja: bestehende Farbschemata und semantische Tokens |
| Grundkomponenten | `components/ui/button.tsx`, `input.tsx`, `select.tsx`, `checkbox.tsx`, `dialog.tsx`, `card.tsx` | Ja: technische Bausteine, nicht jede Default-Größe ist schon normgerecht |
| Redaktionelle Texte | Öffentliche Beitragsansicht und Startseite | Ja: gut lesbare Langtexte, klare Quellen- und Metadatenebene |
| Bestätigungen | `components/archive/confirm-action.tsx` | Ja: Muster für kritische Bestätigung, Abbrechen und Fokus |

### Nachgewiesene Abweichungen und Risiken

- `app/globals.css` enthält mehrere Generationen überlagernder Einzelregeln. Die Body-Größe wird zunächst mit **18 px**, später global mit **20 px** definiert. Innerhalb von Einstellungsabschnitten stehen dagegen **14 px**.
- Für Seitenüberschriften existieren skalierende `h1`-Basiswerte und mehrere lokale Festwerte. Das erschwert eine einheitliche Hierarchie.
- Die `settings-panel`-Überschrift ist als **26 px** ausgeführt (mobil **23 px**). Andere `h2/h3`-Stellen erhalten lokal 18–28 px und teils andere Schriftgewichte.
- Eingabefelder, Beschriftungen, Buttons und Dropdowns werden sowohl durch `components/ui` als auch durch zahlreiche modulbezogene CSS-Regeln gestaltet; dies kann zu unterschiedlichen Höhen, Schriften und Eckenradien führen.
- Dialogtitel wechseln zwischen serif/normal und serifenlos/halbfett. Eine bewusst festgelegte Unterscheidung für Lesedialoge und Bestätigungen fehlte bislang.
- Die gesamte globale CSS-Datei enthält nach einfacher textueller Zählung ungefähr **481 `font-size`-Deklarationen** mit **54 unterschiedlichen Wertausdrücken**. Enthalten sind legitime responsive Varianten; diese Zahlen messen *nicht* unmittelbar 54 Designfehler.

**Erfasst, aber bewusst nicht als Soll-Gestaltung verwendet:** Änderungsprotokoll und Zeitleiste verwalten. Ein zukünftiges Redesign muss diese Bereiche *an GADS angleichen*, nicht umgekehrt.

## 3. Verbindliche visuelle Rollen (Phase 2)

Die Werte sind semantische **Soll-Rollen**; sie werden in dieser ersten Einführung noch nicht global in CSS-Variablen überführt. Bis zur späteren Migration ist `/designsystem` die visuelle Referenz.

| Rolle | Schrift / Größe | Typischer Einsatz |
| --- | --- | --- |
| Seitentitel / H1 | Georgia, 32–48 px responsiv, Gewicht 400, enge Laufweite | Haupttitel der Seite |
| Hauptabschnitt / H2 | Georgia, 26 px (mobil ca. 23 px), Gewicht 400 | `Nextcloud / WebDAV`, Abschnittstitel |
| Unterabschnitt / H3 | Arial, 20 px, Gewicht 600 | Formulargruppen und funktionale Untertitel |
| Karten-/Eintragstitel | Georgia, 20–22 px, Gewicht 400 | Einträge und Sammlungskarten |
| Redaktioneller Lesetext | Arial, 18 px, Zeilenhöhe ca. 1,7 | Längere Erläuterungen und Archivtexte |
| UI-/Formulartext | Arial, 16 px, Zeilenhöhe ca. 1,5–1,6 | Funktionen, Beschreibung, Buttons, ausgewählte Werte |
| Feldbeschriftung | Arial, 15–16 px, gut lesbar | Label oberhalb/bei einem Feld |
| Sekundärtext | Arial, 14 px, Zeilenhöhe ca. 1,5–1,6 | Beschreibung, Status, Metadaten, Fußnoten |
| Technische Kleinstangaben | Arial, 12–13 px, nur bei ausreichendem Kontrast | Versionskennung, kompakte Zähler; keine wesentlichen Handlungsanweisungen |

Schriftgrößen im Browser entsprechen px bei Standard-Rootgröße 16 px. Eine echte Schriftgrößenumstellung erfolgt **nicht** mit dieser Phase.

### Flächen, Abstände und Farben

- Hintergrund: `--background`, Oberflächen: `--card`, Sekundärflächen: `--muted`.
- Primärfarbe: `--primary`; Border: `--border`; Hilfstext: `--muted-foreground`.
- Vorhandene sechs Farbvorlagen bleiben erhalten: Salbeigrün, Küstenblau, Petrol & Sand, Pflaume & Creme, Weinrot & Porzellan, Ocker & Schiefer; Salbeigrün ist der bisherige Ausgangslook.
- Basiseinheit für Abstände: **4 px**. Häufige Abstände: 8, 12, 16, 24, 32 px. Zusammengehörige Felder eng gruppieren; Abschnitte mit Luft trennen.
- Formulare und Karten: feine 1-px-Rahmen, 4–8 px Rundung. Keine wechselnden dekorativen Schlagschatten für funktional identische Elemente.
- Inhaltsbreiten aus dem vorhandenen Layout ableiten, großzügige Außenabstände desktop, mobil ca. 16 px mit keinem horizontalen Überlaufen.

### Bedien- und Zustandsregeln

| Komponente | Soll-Standard |
| --- | --- |
| Textfeld | Beschriftung, 16-px-Eingabetext, min. 44 px Höhe, semantischer Rahmen, deutlicher Fokus |
| Mehrzeiliges Feld | Wie Textfeld, zusätzlich gut erkennbare Mindesthöhe und angemessene Resize-Möglichkeit |
| Dropdown | Inhalt, Schrift, Höhe und Rahmen wie vergleichbare Textfelder; Auswahlliste auf Mobilgeräten nicht abschneiden |
| Checkbox / Radiobutton | Deutliche Beschriftung, klickbare Gesamtzeile, Fokus und aktiv/inaktiv eindeutig |
| Primärbutton | Farbfläche aus `--primary`, nur für führende Aktion, Höhe möglichst ≥44 px |
| Sekundärbutton | Dezent mit Rahmen, visuell schwächer als Primäraktion |
| Gefährliche Aktion | `destructive`/Warnfarbe, Bestätigungsdialog; kein Löschen beim bloßen Anzeigen einer Demo |
| Statushinweis | Erfolg, Warnung oder Fehler mit verständlichem Text, nicht allein über Farbe vermitteln |
| Dialog | Vorhandenes `Dialog`-System; Fokusführung, Schließen und Tastaturbedienbarkeit erhalten |
| Lesedialog | Redaktioneller Titel in Georgia; darunter Kontext/Metadaten und lesbare Inhalte |
| Bestätigungsdialog | Knappes, klares Titel-/Erklärungspaar; **Abbrechen** und genau beschriftete Aktion |
| Aufklappbereich | `SettingsPanel` / `details`-Muster mit Titel links, optionalem Status, Pfeil |
| Tabelle | Einheitlicher Kopf, feine Trennung, mobil horizontal scrollbar oder lesbar gestapelt |
| Quellen-/Fußnote | Gut lesbar, als Sekundärtext ausgezeichnet; Quelle, Jahr, Herkunft soweit vorhanden |
| Seitenfuß | Dezente 14–16 px, Abstand zum Inhalt, rechtliche Links in bestehendem Stil |

### Responsive und Barrierefreiheit

- Mobil keine unkontrollierten Textverkleinerungen. Haupttitel und Einstellungsüberschriften dürfen responsiv reduziert werden.
- Formulare auf schmalen Ansichten einspaltig; Buttons sinnvoll umbrechen.
- Fokus, Zustand, Fehlermeldung und deaktivierte Aktionen sind erkennbar.
- Schrift und Hintergrund müssen ausreichenden Kontrast aufweisen (Ziel: WCAG AA).
- Interaktion per Tastatur, Touch und Maus funktioniert. Native Semantik (Headings, `label`, `button`, `dialog`/Radix) beibehalten.

## 4. Interne Referenzseite `/designsystem`

Die neue Seite zeigt und erläutert typografische Rollen, verfügbare Farbschemata, Formulare, Buttons, Karten, Einstellungsaufklapper, Dialoge, Status- und Fußnoten und die dokumentierten Abweichungen. Sie verwendet bestehende `components/ui`-Elemente und den vorhandenen `SettingsPanel`.

**Zugriff:** Die Route prüft serverseitig, ob die tatsächliche Rolle `admin` oder `manager` ist. Die Seite dient ausschließlich der Anschauung. Musteraktionen schreiben nichts in die Archivdatenbank.

**Navigationsgrenze dieses Auftrags:** Um wirklich *nur* eine neue Seite und die Dokumentation anzulegen, wurde kein bestehendes Einstellungsmenü geändert. Die Adresse muss deshalb zunächst direkt geöffnet werden: `https://<Archiv-Domain>/designsystem`. Der Rücklink führt zur Startseite des Archivs. Ein Menülink wäre eine getrennte, später freizugebende Änderung.

**Wichtig für Linux-Betreiber:** GitHub-Commits installieren sich nicht selbst auf dem Vereinsserver. Ab Version **0.49.3** wird die Referenz über das normale Anwendungsupdate ausgeliefert, einschließlich direktem Update von 0.49.2. Anschließend als Administrator oder Verwalter anmelden und `/designsystem` direkt öffnen. Kein Austausch des Update-Dienstes und keine neue Datenbankmigration erforderlich. Die ursprüngliche Anlage der Seite und Dokumentation erfolgte ohne Versionsänderung; die Release-Einbindung ergänzt nun Version und Updatefreigabe.

## 5. Integrationsvertrag für zukünftige Änderungen

In jedem neuen Implementierungsauftrag soll ausdrücklich stehen:

> **Designvorgabe GADS:** Lies `docs/designsystem.md` und prüfe `/designsystem`. Nutze die bestehenden Archivkomponenten, semantischen Farbtokens und definierten Typografie-/Abstandsrollen. `Änderungsprotokoll` und `Zeitleiste verwalten` sind ausdrücklich **keine** Designreferenzen. Führe keine neuen lokalen Schriftgrößen oder Sonder-Buttons ein, sofern nicht begründet und dokumentiert. Bestehende Funktionen und andere Screens nicht unbeabsichtigt verändern. Prüfe Desktop und Mobilansicht.

**Definition of Done für UI-Erweiterungen:**
- [ ] Passende Rolle / bestehende Komponente gewählt
- [ ] Keine unnötigen lokalen Sonderstile / `!important`-Kaskaden
- [ ] Aktive Farbvorlagen verwenden dieselbe semantische Komponente
- [ ] Tastaturfokus, Labels, mobile Darstellung, Status-/Fehlerzustände geprüft
- [ ] Keine regressiven Änderungen an Bestandsoberflächen
- [ ] Abweichungen vom Standard in diesem Dokument erfasst

Eine automatische Lint- oder visuelle Regression-Prüfung ist noch **nicht** eingerichtet, da sie Änderungen weiterer Dateien erfordern würde.

## 6. Noch offene Bereinigung (nicht Teil von Phase 1/2)

1. Globales `font-size`-Durcheinander durch semantische CSS-/Tailwind-Tokens ersetzen.
2. Bestehende Einstellungen, Formulare und Dialoge schrittweise auf diese Rollen umstellen.
3. Anschließend Startseite, Beitragsansichten, Karten und Fußbereiche abgleichen.
4. Die beiden expliziten Nicht-Referenzen erst danach nach GADS neu gestalten.
5. Später eine feste Navigation zur Designreferenz und automatisierte UI-Prüfungen ergänzen.

**Abgrenzung:** Die aktuelle Lieferung erfasst, definiert und zeigt Standards, ohne vorhandene Seiten, Daten, Funktionen, globale CSS-Dateien oder Komponenten zu modifizieren.

## 7. Umsetzung: Umgebungssuche ab 0.50.0

`components/archive/nearby-explorer.tsx` verwendet den vorhandenen `ConfirmAction`-Dialog mit ausdrücklichem Aktionslabel und bestehenden Primär-/Sekundärschaltflächen. Die angrenzenden Suchfelder und die Ergebnisliste verwenden die GADS-Rollen UI 16 px, Sekundärtext 14 px und Unterabschnitt 20 px/600 in Arial. Semantische Farbtokens, 44-px-Bedienhöhen, 8-px-Flächenrundung, einspaltiges mobiles Umbrechen und sichtbarer Fokus sind in einem auf die Komponente begrenzten CSS-Modul umgesetzt. Es gibt keine neue Schriftart, keine globale CSS-Änderung und keine Übernahme der ausgeschlossenen Altansichten als Referenz.

Beim längeren Standortdialog liegt der anfängliche Fokus auf dem Titel, damit mobile Ansichten am Anfang des Hinweises bleiben. Der vorhandene Standardfokus auf Abbrechen bleibt bei anderen Bestätigungen erhalten.

Die Ergebnisse stehen außerhalb der eingebetteten Karte als normal lesbare Beitragslinks, zusätzlich zu Markierungen und Umkreis. Die eigene Standortermittlung ist für erkannte Smartphones vorgesehen; Computer und Tablets erhalten einen gewöhnlichen Hilfstext. Zustimmungsdialog und Ergebnisse bleiben per Tastatur bedienbar. Die ergänzende Datenschutzerklärung verwendet die bestehende `LegalContent`-Darstellung und einen direkt verlinkbaren Abschnitt.
