"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  eventSchema,
  loginSchema,
  validationMessage,
  type ClubEvent,
  formatDate,
} from "@/lib/events";
import { Icon } from "../components/icons";
import {
  deleteEventAction,
  loginAction,
  logoutAction,
  saveEventAction,
} from "./actions";
type Draft = Omit<ClubEvent, "id"> & { id?: string };
const blank = (): Draft => ({
  title: "",
  date: "",
  time: "19:11",
  location: "Mehrzweckhalle Golkrath",
  description: "",
  published: false,
});
export default function AdminPanel({
  authenticated,
  configured,
  demo,
  initialEvents,
}: {
  authenticated: boolean;
  configured: boolean;
  demo: boolean;
  initialEvents: ClubEvent[];
}) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [transitioning, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  async function login(event: FormEvent) {
    event.preventDefault();
    const credentials = loginSchema.safeParse({ password });
    if (!credentials.success) {
      setError(validationMessage(credentials.error));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await loginAction(credentials.data);
      if (!result.ok) throw new Error(result.error);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Anmelden fehlgeschlagen. Bitte versuche es erneut.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const result = await logoutAction();
      if (!result.ok) throw new Error("Abmelden fehlgeschlagen. Bitte versuche es erneut.");
      setDraft(null);
      setPassword("");
      startTransition(() => router.refresh());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function openForm(event?: ClubEvent) {
    setDraft(event ? { ...event } : blank());
    setError("");
    setNotice("");
    requestAnimationFrame(() => {
      document
        .getElementById("event-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleRef.current?.focus({ preventScroll: true });
    });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const validated = eventSchema.safeParse(draft);
    if (!validated.success) {
      setError(validationMessage(validated.error));
      setNotice("");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await saveEventAction(
        draft.id ? { ...validated.data, id: draft.id } : validated.data,
      );
      if (!result.ok) throw new Error(result.error);
      setEvents(result.events);
      setNotice(
        draft.id
          ? "Die Änderungen wurden gespeichert."
          : validated.data.published
            ? "Der Termin wurde hinzugefügt und ist im Sessionsplan sichtbar."
            : "Der Termin wurde als Entwurf hinzugefügt.",
      );
      setDraft(null);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Speichern fehlgeschlagen. Bitte versuche es erneut.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await deleteEventAction({ id });
      if (!result.ok) throw new Error(result.error);
      setEvents(result.events);
      setDeleting(null);
      if (draft?.id === id) setDraft(null);
      setNotice("Der Termin wurde gelöscht.");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Löschen fehlgeschlagen. Bitte versuche es erneut.",
      );
    } finally {
      setBusy(false);
    }
  }
  const displayedEvents = events;
  if (!authenticated)
    return (
      <div className="grid grid-cols-[1.15fr_1fr] items-center gap-[90px] pt-10 pb-[70px] max-lg:gap-[35px] max-md:grid-cols-1 max-md:gap-[30px] max-md:py-0">
        <div className="[&_h1]:text-[62px] [&_h1_span]:text-primary [&_p]:my-6 [&_p]:max-w-[40ch] [&_p]:leading-[1.8] max-lg:[&_h1]:text-[50px] max-md:[&_h1]:text-[49px] max-md:[&_p]:my-[18px] max-md:[&_p]:text-[13px]">
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
            Zum öffentlichen Sessionsplan <Icon name="arrow" />
          </Button>
        </div>
        <form
          className="rounded-xl border border-border bg-muted p-9 [&>svg]:mb-5 [&>svg]:text-primary [&_h2]:text-4xl [&>p]:mt-4 [&>p]:mb-[25px] [&>p]:text-[13px] [&>p]:leading-[1.8] [&>label]:mb-2 [&>label]:block [&>label]:text-xs [&>label]:font-semibold [&>[data-slot=button]]:mt-4 [&>[data-slot=button]]:w-full [&>[data-slot=button]]:justify-between max-md:p-[26px]"
          onSubmit={login}
        >
          <Icon name="lock" size={28} />
          <h2>Willkommen im Team.</h2>
          <p>
            Melde dich an, um die Termine der Session 2026/2027 zu verwalten.
          </p>
          {!configured ? (
            <div className="my-5 flex items-center gap-2.5 rounded-[5px] px-[18px] py-3.5 text-[13px] leading-[1.6] max-md:text-xs bg-[#fff0eb] text-destructive">
              Der Admin-Zugang ist noch nicht eingerichtet. Hinterlege
              ADMIN_PASSWORD in der Server-Konfiguration.
            </div>
          ) : (
            <>
              <label htmlFor="password">Admin-Passwort</label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dein Passwort"
              />
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={busy || transitioning}
              >
                {busy || transitioning ? "Anmelden …" : "Anmelden"}
                <Icon name="arrow" size={18} />
              </Button>
            </>
          )}
          {error && (
            <p
              className="my-5 flex items-center gap-2.5 rounded-[5px] px-[18px] py-3.5 text-[13px] leading-[1.6] max-md:text-xs bg-[#fff0eb] text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          {demo && (
            <div className="mt-[26px] border-t border-border pt-5 text-[11px] [&_p]:mt-[5px] [&_[data-slot=button]]:text-[11px]">
              <strong>Lokale Design-Demo</strong>
              <p>Zum Ausprobieren der Terminverwaltung:</p>
              <Button
                type="button"
                variant="link"
                size="link"
                onClick={() => setPassword("knallkoepp-demo")}
              >
                Demo-Passwort einsetzen <Icon name="arrow" size={15} />
              </Button>
            </div>
          )}
        </form>
      </div>
    );
  return (
    <>
      <div className="flex items-center justify-between gap-5 [&_h1]:text-[58px] [&_p]:mt-4 [&_p]:text-[13px] max-md:items-start max-md:[&_h1]:text-[42px] max-md:[&_p]:mt-3 max-md:[&_p]:text-[11px] max-md:[&>button]:mt-[5px] max-md:[&>button]:min-h-[35px] max-md:[&>button]:p-[9px] max-md:[&>button]:text-[10px]">
        <div>
          <h1>Die Session gestalten.</h1>
          <p>Termine verwalten · Session 2026/2027</p>
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={logout}
          disabled={busy || transitioning}
        >
          Abmelden
        </Button>
      </div>
      <div className="mt-9 flex items-center justify-between gap-5 border-y border-border py-[22px] [&>div]:flex [&>div]:items-center [&>div]:gap-5 [&>div]:text-sm [&>div>span]:text-xs [&>div>span]:text-muted-foreground max-md:mt-[26px] max-md:gap-3 max-md:py-[18px] max-md:[&>div]:flex-col max-md:[&>div]:items-start max-md:[&>div]:gap-[3px] max-md:[&>div]:text-xs max-md:[&>div>span]:text-[10px] max-md:[&>button]:gap-[7px] max-md:[&>button]:p-3 max-md:[&>button]:text-[11px]">
        <div>
          <strong>{displayedEvents.length} Termine</strong>
          <span>
            {displayedEvents.filter((e) => e.published).length} veröffentlicht
          </span>
        </div>
        <Button
          variant="default"
          size="default"
          onClick={() => openForm()}
          disabled={busy}
        >
          <Icon name="plus" size={18} />
          Termin hinzufügen
        </Button>
      </div>
      {notice && (
        <p
          className="my-5 flex items-center gap-2.5 rounded-[5px] px-[18px] py-3.5 text-[13px] leading-[1.6] max-md:text-xs bg-accent text-primary-dark"
          role="status"
        >
          <Icon name="check" size={18} />
          {notice}
        </p>
      )}
      {error && (
        <p
          className="my-5 flex items-center gap-2.5 rounded-[5px] px-[18px] py-3.5 text-[13px] leading-[1.6] max-md:text-xs bg-[#fff0eb] text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {draft && (
        <form
          className="my-[30px] scroll-mt-6 rounded-xl border border-border bg-muted p-[30px] [&>p]:mt-3 [&>p]:text-xs max-md:px-4 max-md:py-5"
          id="event-form"
          onSubmit={save}
        >
          <div className="flex items-center justify-between gap-3 [&_h2]:text-[35px] max-md:[&_h2]:text-[29px]">
            <h2>
              {draft.id ? "Termin bearbeiten" : "Ein neuer Grund zum Feiern."}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Formular schließen"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              <Icon name="close" />
            </Button>
          </div>
          <p>
            Entwürfe bleiben intern. Veröffentlichte Termine erscheinen direkt im
            öffentlichen Sessionsplan.
          </p>
          <div className="mt-[25px] grid grid-cols-2 gap-5 [&>label]:block [&>label]:text-xs [&>label]:font-semibold [&_input:not([type=checkbox])]:mt-[7px] [&_textarea]:mt-[7px] max-md:gap-x-3 max-md:gap-y-4 max-md:[&>label]:text-[11px] max-md:[&>label:nth-child(4)]:col-span-full">
            <label className="col-span-full">
              Titel
              <Input
                ref={titleRef}
                required
                maxLength={120}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="z. B. Prinzenbiwak"
              />
            </label>
            <label>
              Datum
              <Input
                type="date"
                required
                min="2026-09-01"
                max="2027-08-31"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </label>
            <label>
              Uhrzeit{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
              <Input
                type="time"
                value={draft.time ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, time: e.target.value || null })
                }
              />
            </label>
            <label>
              Veranstaltungsort{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
              <Input
                maxLength={180}
                value={draft.location ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, location: e.target.value || null })
                }
              />
            </label>
            <label className="col-span-full">
              Beschreibung{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
              <Textarea
                rows={4}
                maxLength={2000}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder="Was erwartet die Jecken?"
              />
            </label>
            <label className="!flex items-start gap-2.5 [&_small]:mt-[3px] [&_small]:block [&_small]:text-[11px] [&_small]:font-normal [&_small]:text-muted-foreground max-md:[&_small]:text-[10px] col-span-full">
              <Checkbox
                checked={draft.published}
                onCheckedChange={(checked) =>
                  setDraft({ ...draft, published: checked })
                }
              />
              <span>
                Termin veröffentlichen
                <small>
                  Nur veröffentlichte Termine erscheinen im öffentlichen Kalender.
                </small>
              </span>
            </label>
          </div>
          <div className="mt-[26px] flex gap-3 max-md:[&_button]:p-3 max-md:[&_button]:text-[11px]">
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={busy}
            >
              {busy ? "Wird gespeichert …" : "Termin speichern"}
              <Icon name="check" size={18} />
            </Button>
            <Button
              variant="outline"
              size="default"
              type="button"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      )}
      <section className="" aria-label="Termine verwalten">
        <div className="grid grid-cols-[1fr_190px_100px] gap-5 pt-[26px] pb-3 text-[9px] tracking-[.08em] text-muted-foreground [&>span:last-child]:text-right max-lg:grid-cols-[1fr_135px_90px] max-lg:gap-3 max-md:hidden">
          <span>TERMIN</span>
          <span>STATUS</span>
          <span>BEARBEITEN</span>
        </div>
        {displayedEvents.map((event) => (
          <article
            className="grid grid-cols-[1fr_190px_100px] items-center gap-5 border-b border-border py-5 max-lg:grid-cols-[1fr_135px_90px] max-lg:gap-3 max-md:grid-cols-[1fr_auto]"
            key={event.id}
          >
            <div className="flex min-w-0 items-center gap-[22px] [&_h3]:text-base [&_h3]:leading-[1.35] [&_p]:mt-1.5 [&_p]:text-[11px] max-md:gap-3 max-md:[&_h3]:text-[15px] max-md:[&_p]:text-[10px]">
              <span className="flex min-w-[42px] flex-col items-center [&_strong]:font-display [&_strong]:text-[35px] [&_strong]:leading-none [&_strong]:text-primary [&>span]:text-[10px] [&>span]:text-muted-foreground">
                <strong>{event.date.slice(8)}</strong>
                <span>{formatDate(event.date, { month: "short" })}</span>
              </span>
              <div>
                <h3>{event.title}</h3>
                <p>
                  {formatDate(event.date, {
                    year: "numeric",
                    weekday: "short",
                  })}{" "}
                  · {event.time ? `${event.time} Uhr` : "Uhrzeit offen"} ·{" "}
                  {event.location || "Ort offen"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-[7px] text-[11px] max-md:col-start-1 max-md:flex-row max-md:items-center max-md:pl-[54px] max-md:text-[10px]">
              <Badge
                className={
                  event.published
                    ? "rounded-[3px] border-0 bg-accent px-1.5 py-[3px] text-[9px] text-primary"
                    : "rounded-[3px] border border-border bg-muted px-1.5 py-[3px] text-[9px] font-normal whitespace-nowrap text-muted-foreground"
                }
              >
                {event.published ? "Veröffentlicht" : "Entwurf"}
              </Badge>
            </div>
            <div className="flex justify-end gap-2.5 max-md:col-start-2 max-md:row-span-2 max-md:row-start-1 max-md:flex-col max-md:gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={busy}
                aria-label={`${event.title} bearbeiten`}
                onClick={() => openForm(event)}
              >
                <Icon name="edit" size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-[#fff0eb]"
                disabled={busy}
                aria-label={`${event.title} löschen`}
                onClick={() => setDeleting(event.id)}
              >
                <Icon name="trash" size={18} />
              </Button>
            </div>
            {deleting === event.id && (
              <div className="col-span-full flex items-center gap-3 bg-[#fff4ee] p-[18px] [&_p]:flex-1 [&_p]:text-xs [&_p]:text-[#813d2f] max-md:flex-wrap max-md:p-3.5 max-md:[&_p]:basis-full max-md:[&_button]:text-[11px]">
                <p>
                  „{event.title}“ wirklich löschen? Der Termin wird auch aus dem
                  öffentlichen Plan entfernt.
                </p>
                <Button
                  variant="destructive"
                  size="default"
                  disabled={busy}
                  onClick={() => remove(event.id)}
                >
                  Ja, löschen
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  disabled={busy}
                  onClick={() => setDeleting(null)}
                >
                  Behalten
                </Button>
              </div>
            )}
          </article>
        ))}
        {!displayedEvents.length && (
          <div className="mt-[22px] bg-muted px-5 py-[55px] text-center [&>svg]:mx-auto [&>svg]:mb-4 [&>svg]:text-primary [&_h3]:text-xl [&_h2]:text-[32px] [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:mb-5 [&_p]:max-w-[46ch] [&_p]:text-[13px] max-md:px-3.5">
            <h2>Der erste Termin macht den Anfang.</h2>
            <p>Füge eine Veranstaltung hinzu, um den Sessionsplan zu füllen.</p>
            <Button variant="default" size="default" onClick={() => openForm()}>
              Ersten Termin hinzufügen
            </Button>
          </div>
        )}
      </section>
      <p className="mt-6 text-xs [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-primary">
        Öffentlich sichtbar:{" "}
        <Link href="/">
          Sessionsplan öffnen <Icon name="external" size={13} />
        </Link>
      </p>
    </>
  );
}
