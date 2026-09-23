"use client";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema } from "@/lib/account";
import { validationMessage } from "@/lib/events";
import { season } from "@/lib/season";
import { authClient } from "@/lib/auth-client";

// Better Auth answers wrong credentials with 401 and too many attempts with 429.
function signInError(status: number) {
  if (status === 401) return "E-Mail-Adresse oder Passwort stimmen nicht. Bitte versuche es erneut.";
  if (status === 429) return "Zu viele Versuche. Bitte warte ein paar Minuten und versuche es erneut.";
  return "Anmelden fehlgeschlagen. Bitte versuche es erneut.";
}

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [transitioning, startTransition] = useTransition();
  async function login(event: FormEvent) {
    event.preventDefault();
    const credentials = loginSchema.safeParse({ email, password });
    if (!credentials.success) {
      setError(validationMessage(credentials.error));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error } = await authClient.signIn.email(credentials.data);
      if (error) setError(signInError(error.status));
      else startTransition(() => router.refresh());
    } catch {
      setError(signInError(0));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid grid-cols-[1.15fr_1fr] items-center gap-22.5 pt-10 pb-17.5 max-lg:gap-8.75 max-md:grid-cols-1 max-md:gap-7.5 max-md:py-0">
      <div className="[&_h1]:text-[62px] [&_h1_span]:text-primary [&_p]:my-6 [&_p]:max-w-[40ch] [&_p]:leading-[1.8] max-lg:[&_h1]:text-[50px] max-md:[&_h1]:text-[49px] max-md:[&_p]:my-4.5 max-md:[&_p]:text-[13px]">
        <h1>
          Hinter den Kulissen.
          <br />
          <span>Mitten in der Session.</span>
        </h1>
        <p>
          Hier entsteht der Sessionsplan. Termine ergänzen, Details
          aktualisieren und die Vorfreude teilen.
        </p>
        <Button
          variant="link"
          size="link"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Zum öffentlichen Sessionsplan <ArrowRight size={20} />
        </Button>
      </div>
      <form
        className="rounded-xl border border-border bg-muted p-9 [&>svg]:mb-5 [&>svg]:text-primary [&_h2]:text-4xl [&>p]:mt-4 [&>p]:mb-6.25 [&>p]:text-[13px] [&>p]:leading-[1.8] *:data-[slot=button]:mt-4 *:data-[slot=button]:w-full *:data-[slot=button]:justify-between max-md:p-6.5"
        noValidate
        onSubmit={login}
      >
        <LockKeyhole size={28} />
        <h2>Willkommen im Team.</h2>
        <p>
          Melde dich an, um die Termine der Session {season.label} zu verwalten.
        </p>
        <FieldGroup className="gap-4">
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="email" className="text-xs font-semibold">
              E-Mail-Adresse
            </FieldLabel>
            <Input
              id="email"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="password" className="text-xs font-semibold">
              Passwort
            </FieldLabel>
            <Input
              id="password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link href="/admin/passwort-vergessen" className="w-fit text-xs text-primary hover:underline">
              Passwort vergessen?
            </Link>
          </Field>
        </FieldGroup>
        <Button
          type="submit"
          variant="default"
          size="default"
          disabled={busy || transitioning}
          aria-busy={busy || transitioning}
        >
          {busy || transitioning ? "Anmelden …" : "Anmelden"}
          {busy || transitioning ? <Spinner aria-hidden className="size-4.5" /> : <ArrowRight size={18} />}
        </Button>
        {error && (
          <Alert id="login-error" variant="destructive" className="my-5 max-md:text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Link
          href="/admin/datenschutz"
          className="mt-5 block w-fit text-xs text-muted-foreground hover:underline"
        >
          Datenschutzhinweise für den Verwaltungsbereich
        </Link>
      </form>
    </div>
  );
}
