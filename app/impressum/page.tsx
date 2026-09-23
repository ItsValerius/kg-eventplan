import type { Metadata } from "next";
import { ClubAddress, LegalPage } from "@/components/legal-page";
import { club } from "@/lib/club";

export const metadata: Metadata = {
  title: "Impressum | Knallköpp Golkrath",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <ClubAddress />
      <p>Mitglied im Bund Deutscher Karneval und im VKAG.</p>

      <h3>Vertreten durch den Vorstand</h3>
      <p>Der Verein wird durch jeweils zwei Vorstandsmitglieder gemeinschaftlich vertreten.</p>
      <ul>
        {club.board.map((member) => (
          <li key={member.role}>
            {member.role}: {member.name}
          </li>
        ))}
      </ul>

      <h3>Registereintrag</h3>
      <p>
        Eingetragen im Vereinsregister beim {club.register.court} unter {club.register.number}.
      </p>

      <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
      <p>{club.contentResponsible}, Anschrift wie oben.</p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Die Termine auf dieser Seite stellen wir mit Sorgfalt zusammen. Änderungen bleiben
        vorbehalten; für Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr.
        Als Diensteanbieter sind wir nach § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen
        Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir nicht verpflichtet, übermittelte oder
        gespeicherte fremde Informationen zu überwachen. Sobald uns eine Rechtsverletzung bekannt
        wird, entfernen wir den betreffenden Inhalt umgehend.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Diese Seite enthält Links zu Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
        Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich. Zum Zeitpunkt der
        Verlinkung waren keine Rechtsverstöße erkennbar; werden uns welche bekannt, entfernen wir
        den Link umgehend.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Gestaltung und das Vereinswappen unterliegen dem deutschen Urheberrecht. Die
        Vervielfältigung, Bearbeitung oder Verbreitung außerhalb der Grenzen des Urheberrechts
        bedarf der schriftlichen Zustimmung des Vereins. Der Sessionsplan als PDF darf für private,
        nicht kommerzielle Zwecke heruntergeladen und weitergegeben werden.
      </p>
    </LegalPage>
  );
}
