"use client";
import { ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { emailSchema, newPasswordSchema, PASSWORD_MIN } from "@/lib/account";
import { authClient } from "@/lib/auth-client";
import { validationMessage } from "@/lib/events";

const failed = "Das hat nicht geklappt. Bitte versuche es erneut.";

function Card({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="max-w-110 rounded-xl border border-border bg-muted p-9 max-md:p-6.5">
      <KeyRound size={28} className="mb-5 text-primary" />
      <h1 className="text-4xl">{title}</h1>
      <p className="mt-4 mb-6.25 text-[13px] leading-[1.8]">{intro}</p>
      {children}
    </div>
  );
}

function Submit({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return (
    <Button
      type="submit"
      className="mt-4 w-full justify-between"
      variant="default"
      size="default"
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? busyLabel : label}
      {busy ? <Spinner aria-hidden className="size-4.5" /> : <ArrowRight size={18} />}
    </Button>
  );
}

function Problem({ children }: { children: ReactNode }) {
  return (
    <Alert variant="destructive" className="my-5 max-md:text-xs">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

function BackToLogin() {
  return (
    <Button variant="link" size="link" className="mt-4" nativeButton={false} render={<Link href="/admin" />}>
      Zur Anmeldung <ArrowRight size={15} />
    </Button>
  );
}

// Requests a reset link. The answer is the same whether or not the address has an account.
export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) return setError(validationMessage(parsed.error));
    setBusy(true);
    setError("");
    try {
      const { error } = await authClient.requestPasswordReset({
        email: parsed.data.email,
        redirectTo: `${location.origin}/admin/passwort`,
      });
      if (error?.status === 429) setError("Zu viele Anfragen. Bitte warte eine Minute.");
      else if (error) setError(failed);
      else setSent(true);
    } catch {
      setError(failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Passwort vergessen?"
      intro="Gib die E-Mail-Adresse deines Zugangs ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst."
    >
      {sent ? (
        <Alert variant="success" role="status">
          <AlertDescription>
            Wenn es für diese Adresse einen Zugang gibt, ist der Link unterwegs. Er ist 24 Stunden
            gültig.
          </AlertDescription>
        </Alert>
      ) : (
        <form noValidate onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor="email" className="text-xs font-semibold">
              E-Mail-Adresse
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Submit busy={busy} label="Link anfordern" busyLabel="Wird gesendet …" />
          {error && <Problem>{error}</Problem>}
        </form>
      )}
      <BackToLogin />
    </Card>
  );
}

// Sets the password from an invitation or reset link (/admin/passwort?token=…).
export function SetPassword() {
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const expired = !token || params.get("error") === "INVALID_TOKEN";

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = newPasswordSchema.safeParse({ password, repeat });
    if (!parsed.success) return setError(validationMessage(parsed.error));
    setBusy(true);
    setError("");
    try {
      const { error } = await authClient.resetPassword({
        newPassword: parsed.data.password,
        token: token!,
      });
      if (error?.code === "INVALID_TOKEN") setError("Der Link ist abgelaufen oder wurde schon benutzt.");
      else if (error) setError(failed);
      else setDone(true);
    } catch {
      setError(failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Passwort festlegen" intro="Wähle ein Passwort für deinen Zugang zum Sessionsplan.">
      {expired ? (
        <>
          <Problem>
            Der Link ist abgelaufen oder wurde schon benutzt. Fordere unter{" "}
            <Link href="/admin/passwort-vergessen">Passwort vergessen</Link> einen neuen an.
          </Problem>
          <BackToLogin />
        </>
      ) : done ? (
        <>
          <Alert variant="success" role="status">
            <AlertDescription>Dein Passwort ist gespeichert. Du kannst dich jetzt anmelden.</AlertDescription>
          </Alert>
          <BackToLogin />
        </>
      ) : (
        <form noValidate onSubmit={submit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="password" className="text-xs font-semibold">
                Neues Passwort
              </FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription className="text-xs">Mindestens {PASSWORD_MIN} Zeichen.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="repeat" className="text-xs font-semibold">
                Passwort wiederholen
              </FieldLabel>
              <Input
                id="repeat"
                type="password"
                autoComplete="new-password"
                required
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <Submit busy={busy} label="Passwort speichern" busyLabel="Wird gespeichert …" />
          {error && <Problem>{error}</Problem>}
        </form>
      )}
    </Card>
  );
}
