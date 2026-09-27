"use client";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useLogin } from "@/hooks/use-login";
import { season } from "@/lib/season";
import { FormField } from "./form-field";

export function Login() {
  const { form, error, busy } = useLogin();
  // A refused sign-in marks both fields: it doesn't say which one was wrong.
  const refused = error
    ? ({ "aria-invalid": true, "aria-describedby": "login-error" } as const)
    : {};
  return (
    <div className="grid grid-cols-[1.15fr_1fr] items-center gap-22.5 pt-10 pb-17.5 max-lg:gap-8.75 max-md:grid-cols-1 max-md:gap-7.5 max-md:py-0">
      <div className="[&_h1]:text-[62px] max-lg:[&_h1]:text-[49px] [&_h1_span]:text-primary [&_p]:my-6 [&_p]:max-w-[40ch] [&_p]:leading-[1.8] max-md:[&_p]:my-4.5 max-md:[&_p]:text-[13px]">
        <h1>
          Hinter den Kulissen.
          <br />
          <span>Mitten in der Session.</span>
        </h1>
        <p>
          Hier entsteht der Sessionsplan. Termine ergänzen, Details aktualisieren und die Vorfreude
          teilen.
        </p>
        <Button variant="link" size="link" nativeButton={false} render={<Link href="/" />}>
          Zum öffentlichen Sessionsplan <ArrowRight size={20} />
        </Button>
      </div>
      <form
        className="rounded-xl border border-border bg-muted p-9 *:data-[slot=button]:mt-4 *:data-[slot=button]:w-full *:data-[slot=button]:justify-between max-md:p-6.5 [&_h2]:text-4xl [&>p]:mt-4 [&>p]:mb-6.25 [&>p]:text-[13px] [&>p]:leading-[1.8] [&>svg]:mb-5 [&>svg]:text-primary"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <LockKeyhole size={28} />
        <h2>Willkommen im Team.</h2>
        <p>Melde dich an, um die Termine der Session {season.label} zu verwalten.</p>
        <FieldGroup className="gap-4">
          <form.Field name="email">
            {(field) => (
              <FormField field={field} invalid={Boolean(error)} label="E-Mail-Adresse">
                {(control) => (
                  <Input
                    {...control}
                    {...refused}
                    type="email"
                    autoComplete="username"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <FormField field={field} invalid={Boolean(error)} label="Passwort">
                {(control) => (
                  <>
                    <Input
                      {...control}
                      {...refused}
                      type="password"
                      autoComplete="current-password"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <Link
                      href="/admin/passwort-vergessen"
                      className="w-fit text-xs text-primary hover:underline"
                    >
                      Passwort vergessen?
                    </Link>
                  </>
                )}
              </FormField>
            )}
          </form.Field>
        </FieldGroup>
        <Button type="submit" variant="default" size="default" disabled={busy} aria-busy={busy}>
          {busy ? "Anmelden …" : "Anmelden"}
          {busy ? <Spinner aria-hidden className="size-4.5" /> : <ArrowRight size={18} />}
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
