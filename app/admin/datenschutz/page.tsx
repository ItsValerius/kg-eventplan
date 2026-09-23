import type { Metadata } from "next";
import Link from "next/link";
import { ClubAddress, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Datenschutzhinweise Verwaltungsbereich | Knallköpp Golkrath",
  robots: { index: false, follow: false },
};

// Art. 13/14 DSGVO information for admins; linked from the login and from every
// invitation and password email. Visitors' processing is on /datenschutz.
export default function AdminPrivacyPage() {
  return (
    <LegalPage title="Datenschutz­hinweise für den Verwaltungs­bereich">
      <p>
        Diese Hinweise gelten für Vereinsmitglieder, die im Verwaltungsbereich des Sessionsplans
        Termine pflegen. Sie ergänzen die allgemeine{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>, die auch für die Server-Logs, Ihre
        Rechte und die zuständige Aufsichtsbehörde gilt.
      </p>

      <h2>Verantwortlicher</h2>
      <ClubAddress />

      <h2>Welche Daten wir verarbeiten</h2>
      <ul>
        <li>
          Name und E-Mail-Adresse Ihres Zugangs sowie Ihr Passwort als verschlüsselten Hashwert
        </li>
        <li>
          je Anmeldung eine Sitzung mit Ablaufzeit, IP-Adresse und Browserkennung (User-Agent)
        </li>
        <li>
          zur Abwehr von Passwort-Rateversuchen einen Zähler je IP-Adresse (höchstens zehn
          Anmeldeversuche in 15 Minuten)
        </li>
        <li>
          für Einladungen und „Passwort vergessen“ einen einmal verwendbaren Link, der 24 Stunden
          gültig ist
        </li>
      </ul>
      <p>
        Wenn ein anderes Vereinsmitglied Sie einlädt, erhalten wir Ihren Namen und Ihre
        E-Mail-Adresse von dieser Person.
      </p>

      <h2>Zweck und Rechtsgrundlage</h2>
      <p>
        Wir verarbeiten die Daten, um Ihnen einen sicheren Zugang zur Terminverwaltung zu geben.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Wahrnehmung der Vereinsaufgabe) sowie unser
        berechtigtes Interesse an der Sicherheit des Zugangs nach Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>Sitzungscookie</h2>
      <p>
        Nach der Anmeldung setzt die Seite ein Sitzungscookie, das Sie für höchstens acht Stunden
        angemeldet hält. Es ist für den von Ihnen gewünschten Dienst unbedingt erforderlich (§ 25
        Abs. 2 Nr. 2 TDDDG) und wird beim Abmelden gelöscht.
      </p>

      <h2>Empfänger</h2>
      <p>
        Die Daten liegen in einer Datenbank von Neon, LLC, einem Unternehmen der Databricks, Inc.,
        160 Spear Street, Suite 1300, San Francisco, CA 94105, USA, mit Standort in Frankfurt am
        Main. Einladungen und Links zum Festlegen eines Passworts versenden wir über das
        E-Mail-Postfach des Vereins bei der IONOS SE, Elgendorfer Straße 57, 56410 Montabaur; die
        Server stehen in Deutschland bzw. der EU. Die Seite selbst wird bei Vercel Inc. betrieben
        (siehe <Link href="/datenschutz">Datenschutzerklärung</Link>).
      </p>
      <p>
        Alle drei verarbeiten die Daten in unserem Auftrag (Art. 28 DSGVO). Soweit ein Zugriff aus
        den USA möglich ist, sind Vercel und Neon (über Databricks) nach dem EU-US Data Privacy
        Framework zertifiziert (Art. 45 DSGVO).
      </p>

      <h2>Speicherdauer</h2>
      <p>
        Beim Abmelden wird die Sitzung gelöscht; spätestens nach acht Stunden ist sie ungültig. Ein
        Einladungs- oder Passwort-Link wird mit seiner Verwendung gelöscht. Abgelaufene Sitzungen
        und Links sowie Zähler für Anmeldeversuche, die älter als einen Tag sind, werden bei der
        nächsten Anmeldung automatisch gelöscht. Ihr Zugang wird gelöscht, sobald Sie keine Termine
        mehr pflegen.
      </p>

      <p>Stand: September 2026</p>
    </LegalPage>
  );
}
