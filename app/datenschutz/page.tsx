import type { Metadata } from "next";
import Link from "next/link";
import { ClubAddress, LegalPage } from "@/components/legal-page";
import { siteUrl } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Knallköpp Golkrath",
  alternates: { canonical: "/datenschutz" },
};

const host = new URL(siteUrl).host;

// What visitors need to know. Processing that only concerns admins (login, invitations,
// email, database) is explained to them separately on /admin/datenschutz.
export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutz­erklärung">
      <p>
        Diese Erklärung gilt für den Sessionsplan unter {host}. Sie informiert darüber, welche
        personenbezogenen Daten wir beim Besuch dieser Seite verarbeiten, zu welchem Zweck und
        welche Rechte Sie haben (Art. 13 DSGVO).
      </p>

      <h2>Verantwortlicher</h2>
      <ClubAddress />

      <h2>Das Wichtigste in Kürze</h2>
      <ul>
        <li>Die Seite setzt für Besucher keine Cookies und speichert nichts auf Ihrem Gerät.</li>
        <li>Es gibt kein Tracking, keine Analyse-Werkzeuge und keine Werbung.</li>
        <li>
          Schriften, Bilder und das Vereinswappen werden von dieser Seite selbst ausgeliefert; beim
          Aufruf werden keine Inhalte von Drittanbietern geladen.
        </li>
        <li>Personenbezogene Daten fallen nur technisch beim Aufruf an (Server-Logs).</li>
      </ul>

      <h2>Hosting und Server-Logs</h2>
      <p>
        Die Seite wird bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA
        betrieben. Beim Aufruf, auch beim Herunterladen des Sessionsplans als PDF, verarbeitet
        Vercel technisch notwendige Daten, die Ihr Browser übermittelt:
      </p>
      <ul>
        <li>IP-Adresse</li>
        <li>Datum und Uhrzeit der Anfrage</li>
        <li>aufgerufene Seite bzw. Datei, HTTP-Statuscode und übertragene Datenmenge</li>
        <li>Referrer (die zuvor besuchte Seite)</li>
        <li>Browser und Betriebssystem (User-Agent)</li>
      </ul>
      <p>
        Das ist erforderlich, um die Seite auszuliefern und ihre Stabilität und Sicherheit zu
        gewährleisten, etwa zur Abwehr von Angriffen. Rechtsgrundlage ist unser berechtigtes
        Interesse nach Art. 6 Abs. 1 lit. f DSGVO. Wir werten diese Daten nicht aus und führen sie
        nicht mit anderen Daten zusammen. Vercel speichert die Logs nur für begrenzte Zeit und
        löscht sie anschließend.
      </p>
      <p>
        Vercel verarbeitet die Daten in unserem Auftrag auf Grundlage eines Vertrags zur
        Auftragsverarbeitung (Art. 28 DSGVO). Dabei können Daten in die USA übermittelt werden.
        Vercel ist nach dem EU-US Data Privacy Framework zertifiziert; die Übermittlung stützt sich
        auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO) und ergänzend auf
        EU-Standardvertragsklauseln. Weitere Informationen:{" "}
        <a href="https://vercel.com/legal/privacy-notice">vercel.com/legal/privacy-notice</a>.
      </p>

      <h2>Kontakt per E-Mail</h2>
      <p>
        Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Angaben (etwa Name,
        E-Mail-Adresse und Ihr Anliegen), um die Anfrage zu beantworten. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. f DSGVO, bei Anfragen zu einer Mitgliedschaft Art. 6 Abs. 1 lit. b DSGVO. Wir
        löschen die Daten, wenn sie nicht mehr erforderlich sind und keine gesetzlichen
        Aufbewahrungspflichten bestehen.
      </p>

      <h2>Links zu anderen Websites</h2>
      <p>
        Diese Seite verlinkt auf die Website des Vereins und auf Websites Dritter. Erst wenn Sie
        einem Link folgen, gelten die Datenschutzhinweise des jeweiligen Anbieters.
      </p>

      <h2>Verwaltungsbereich</h2>
      <p>
        Vereinsmitglieder, die die Termine pflegen, melden sich in einem geschützten Bereich an.
        Die dabei verarbeiteten Daten betreffen nur sie; sie werden in den{" "}
        <Link href="/admin/datenschutz">Datenschutzhinweisen für den Verwaltungsbereich</Link>{" "}
        erläutert.
      </p>

      <h2>Ihre Rechte</h2>
      <p>Sie haben das Recht auf</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
        <li>
          Widerspruch gegen Verarbeitungen, die auf unserem berechtigten Interesse beruhen (Art. 21
          DSGVO),
        </li>
        <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
      </ul>
      <p>Wenden Sie sich dazu formlos an die oben genannten Kontaktdaten.</p>
      <p>
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77
        DSGVO). Für uns zuständig ist die Landesbeauftragte für Datenschutz und
        Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213 Düsseldorf,{" "}
        <a href="https://www.ldi.nrw.de">www.ldi.nrw.de</a>.
      </p>

      <h2>Pflicht zur Bereitstellung und automatisierte Entscheidungen</h2>
      <p>
        Sie sind nicht verpflichtet, uns Daten bereitzustellen. Ohne die technisch notwendigen
        Server-Logs kann die Seite jedoch nicht ausgeliefert werden. Eine automatisierte
        Entscheidungsfindung oder ein Profiling findet nicht statt.
      </p>

      <p>Stand: September 2026</p>
    </LegalPage>
  );
}
