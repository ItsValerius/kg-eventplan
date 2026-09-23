import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// Outgoing mail through the club's IONOS mailbox: SMTP_USER is its address, SMTP_PASSWORD
// its password. SMTP_HOST and SMTP_PORT only need setting to test locally (e.g. Mailpit).
let transport: Transporter | undefined;

function mailer() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) throw new Error("SMTP_USER and SMTP_PASSWORD are required to send email.");
  const port = Number(process.env.SMTP_PORT ?? 587);
  return (transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.ionos.de",
    port,
    // 465 is TLS from the start; 587 must upgrade with STARTTLS.
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
  }));
}

export async function sendMail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  await mailer().sendMail({
    from: { name: "KG Knallköpp Sessionsplan", address: process.env.SMTP_USER! },
    to,
    subject,
    text,
  });
}

// Logs in to the SMTP server without sending, so an invitation fails before it is created.
export async function checkMailer() {
  await mailer().verify();
}
