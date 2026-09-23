import "server-only";
import { hasPassword } from "./accounts";
import { sendMail } from "./mail";

export const PASSWORD_LINK_HOURS = 24;

// Better Auth's password-reset link doubles as the invitation: an account without a
// password is new, so it gets the welcome text instead of the reset text.
export async function sendPasswordLink({ id, name, email }: { id: string; name: string; email: string }, url: string) {
  const invited = !(await hasPassword(id));
  const link = `${url}\n\nDer Link ist ${PASSWORD_LINK_HOURS} Stunden gültig und kann nur einmal verwendet werden.`;
  // Art. 13/14 DSGVO: tell the person where their data is explained.
  const privacy = `Wie wir deine Daten dafür verarbeiten: ${new URL(url).origin}/admin/datenschutz`;
  await sendMail(
    invited
      ? {
          to: email,
          subject: "Dein Zugang zum Sessionsplan der KG Knallköpp",
          text: `Hallo ${name},\n\ndu wurdest eingeladen, die Termine im Sessionsplan der KG Knallköpp Golkrath zu pflegen. Lege über diesen Link dein Passwort fest:\n\n${link}\n\nDanach meldest du dich mit ${email} und deinem Passwort an.\n\n${privacy}\n\nJolkere Knall Mött!`,
        }
      : {
          to: email,
          subject: "Neues Passwort für den Sessionsplan",
          text: `Hallo ${name},\n\nfür deinen Zugang zum Sessionsplan wurde ein neues Passwort angefordert. Lege es über diesen Link fest:\n\n${link}\n\nWenn du das nicht warst, kannst du diese E-Mail ignorieren; dein bisheriges Passwort bleibt gültig.\n\n${privacy}`,
        },
  );
}
