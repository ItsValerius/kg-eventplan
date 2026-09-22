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
} from "@/lib/events";
import { formatDate, isClubEvent } from "@/lib/format";
import { Icon } from "../components/icons";
import {
  deleteEventAction,
  loginAction,
  logoutAction,
  saveEventAction,
} from "./actions";
type Draft = Omit<ClubEvent, "id"> & { id?: string };
// Prefill the venue the club itself uses most, so new club events need no retyping.
function usualVenue(events: ClubEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events)
    if (event.location && isClubEvent(event.title))
      counts.set(event.location, (counts.get(event.location) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mehrzweckhalle Golkrath";
}
const blank = (events: ClubEvent[]): Draft => ({
  title: "",
  date: "",
  time: "19:11",
  location: usualVenue(events),
  description: "",
  published: false,
});
const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
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
  const editButtons = useRef(new Map<string, HTMLButtonElement>());
  const keepButtons = useRef(new Map<string, HTMLButtonElement>());
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
    setDraft(event ? { ...event } : blank(events));
    setDeleting(null);
    setError("");
    setNotice("");
    requestAnimationFrame(() => {
      document
        .getElementById("event-form")
        ?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      titleRef.current?.focus({ preventScroll: true });
    });
  }
  // Return focus to the row the form or confirmation belonged to.
  function closeForm() {
    const id = draft?.id;
    setDraft(null);
    if (id) requestAnimationFrame(() => editButtons.current.get(id)?.focus());
  }
  function askDelete(id: string) {
    setDeleting(id);
    requestAnimationFrame(() => keepButtons.current.get(id)?.focus());
  }
  function cancelDelete(id: string) {
    setDeleting(null);
    requestAnimationFrame(() => editButtons.current.get(id)?.focus());
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
      closeForm();
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
            Zum öffentlichen Sessionsplan <Icon name="arrow" />
          </Button>
        </div>
        <form
          className="rounded-xl border border-border bg-muted p-9 [&>svg]:mb-5 [&>svg]:text-primary [&_h2]:text-4xl [&>p]:mt-4 [&>p]:mb-6.25 [&>p]:text-[13px] [&>p]:leading-[1.8] [&>label]:mb-2 [&>label]:block [&>label]:text-xs [&>label]:font-semibold *:data-[slot=button]:mt-4 *:data-[slot=button]:w-full *:data-[slot=button]:justify-between max-md:p-6.5"
          onSubmit={login}
        >
          <Icon name="lock" size={28} />
          <h2>Willkommen im Team.</h2>
          <p>
            Melde dich an, um die Termine der Session 2026/2027 zu verwalten.
          </p>
          {!configured ? (
            <div className="my-5 flex items-center gap-2.5 rounded-md px-4.5 py-3.5 text-[13px] leading-[1.6] max-md:text-xs bg-destructive-surface text-destructive">
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
              className="my-5 flex items-center gap-2.5 rounded-md px-4.5 py-3.5 text-[13px] leading-[1.6] max-md:text-xs bg-destructive-surface text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          {demo && (
            <div className="mt-6.5 border-t border-border pt-5 text-[11px] [&_p]:mt-1.25 **:data-[slot=button]:text-[11px]">
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
  const months = [...new Set(displayedEvents.map((e) => e.date.slice(0, 7)))];
  const form = draft && (
    <form
      className={`scroll-mt-6 rounded-xl border border-border bg-muted p-7.5 max-md:px-4 max-md:py-5 ${draft.id ? "col-span-full mt-2" : "my-7.5"}`}
      id="event-form"
      onSubmit={save}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) closeForm();
      }}
    >
      <div className="flex items-center justify-between gap-3 [&_h2]:text-[35px] max-md:[&_h2]:text-[29px]">
        <h2>{draft.id ? "Termin bearbeiten" : "Ein neuer Grund zum Feiern."}</h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Formular schließen"
          disabled={busy}
          onClick={closeForm}
        >
          <Icon name="close" />
        </Button>
      </div>
      <div className="mt-6.25 grid grid-cols-2 gap-5 max-md:gap-x-3 max-md:gap-y-4 [&_input:not([type=checkbox])]:mt-1.75 [&_textarea]:mt-1.75 [&>label]:block [&>label]:text-xs [&>label]:font-semibold">
        <label className="col-span-full">
          Titel
          <Input
            ref={titleRef}
            required
            maxLength={120}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="z. B. KG Knallköpp – Biwak"
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
          <span className="font-normal text-muted-foreground">(optional)</span>
          <Input
            type="time"
            value={draft.time ?? ""}
            onChange={(e) => setDraft({ ...draft, time: e.target.value || null })}
          />
        </label>
        <label className="col-span-full">
          Veranstaltungsort{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <Input
            maxLength={180}
            value={draft.location ?? ""}
            onChange={(e) => setDraft({ ...draft, location: e.target.value || null })}
          />
        </label>
        <label className="col-span-full">
          Beschreibung{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <Textarea
            rows={4}
            maxLength={2000}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Was erwartet die Jecken?"
          />
        </label>
        <label className="col-span-full flex! items-start gap-2.5 [&_small]:mt-0.75 [&_small]:block [&_small]:text-xs [&_small]:font-normal [&_small]:text-muted-foreground">
          <Checkbox
            checked={draft.published}
            onCheckedChange={(checked) => setDraft({ ...draft, published: checked })}
          />
          <span>
            Termin veröffentlichen
            <small>
              Nur veröffentlichte Termine erscheinen im öffentlichen Kalender.
            </small>
          </span>
        </label>
      </div>
      <div className="mt-6.5 flex flex-wrap gap-3">
        <Button type="submit" variant="default" size="default" disabled={busy}>
          {busy ? "Wird gespeichert …" : "Termin speichern"}
          <Icon name="check" size={18} />
        </Button>
        <Button
          variant="outline"
          size="default"
          type="button"
          disabled={busy}
          onClick={closeForm}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
  return (
    <>
      <div className="flex items-center justify-between gap-5 max-md:items-start [&_h1]:text-[58px] max-md:[&_h1]:text-[42px] [&_p]:mt-4 [&_p]:text-[13px] max-md:[&_p]:mt-3 max-md:[&_p]:text-xs">
        <div>
          <h1>Die Session gestalten.</h1>
          <p>Termine verwalten · Session 2026/2027</p>
        </div>
        <Button
          className="max-md:min-h-11 max-md:px-3.5"
          variant="outline"
          size="default"
          onClick={logout}
          disabled={busy || transitioning}
        >
          Abmelden
        </Button>
      </div>
      <div className="mt-9 flex items-center justify-between gap-5 border-y border-border py-5.5 max-md:mt-6.5 max-md:gap-3 max-md:py-4.5 [&>div]:flex [&>div]:items-center [&>div]:gap-5 [&>div]:text-sm max-md:[&>div]:flex-col max-md:[&>div]:items-start max-md:[&>div]:gap-0.75 [&>div>span]:text-xs [&>div>span]:text-muted-foreground">
        <div>
          <strong>{displayedEvents.length} Termine</strong>
          <span>
            {displayedEvents.filter((e) => e.published).length} veröffentlicht
          </span>
        </div>
        <Button
          className="max-md:gap-1.75 max-md:px-3.5"
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
          className="my-5 flex items-center gap-2.5 rounded-md bg-accent px-4.5 py-3.5 text-[13px] leading-[1.6] text-primary-dark"
          role="status"
        >
          <Icon name="check" size={18} />
          {notice}
        </p>
      )}
      {error && (
        <p
          className="my-5 flex items-center gap-2.5 rounded-md bg-destructive-surface px-4.5 py-3.5 text-[13px] leading-[1.6] text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {draft && !draft.id && form}
      <section aria-label="Termine verwalten">
        <div
          className="grid grid-cols-[1fr_190px_110px] gap-5 pt-6.5 pb-1 text-[11px] font-semibold tracking-[.08em] text-muted-foreground uppercase max-lg:grid-cols-[1fr_135px_100px] max-lg:gap-3 max-md:hidden [&>span:last-child]:text-right"
          aria-hidden="true"
        >
          <span>Termin</span>
          <span>Status</span>
          <span>Bearbeiten</span>
        </div>
        {months.map((month) => (
          <section key={month} aria-label={formatDate(`${month}-01`, { month: "long", year: "numeric" })}>
            <h2 className="mt-6 flex items-center gap-2.5 font-sans text-[15px] font-semibold tracking-normal">
              {formatDate(`${month}-01`, { month: "long" })}
              <span className="text-xs font-normal text-muted-foreground">
                {month.slice(0, 4)}
              </span>
              <span className="ml-1.5 h-px flex-1 bg-border" />
            </h2>
            {displayedEvents
              .filter((event) => event.date.startsWith(month))
              .map((event) => (
                <article
                  className="grid grid-cols-[1fr_190px_110px] items-center gap-5 border-b border-border py-5 max-lg:grid-cols-[1fr_135px_100px] max-lg:gap-3 max-md:grid-cols-[1fr_auto]"
                  key={event.id}
                >
                  <div className="flex min-w-0 items-center gap-5.5 max-md:gap-3 [&_h3]:text-base [&_h3]:leading-[1.35] max-md:[&_h3]:text-[15px] [&_p]:mt-1.5 [&_p]:text-xs">
                    <span className="flex min-w-10.5 flex-col items-center [&_strong]:font-display [&_strong]:text-[35px] [&_strong]:leading-none [&_strong]:text-primary [&_strong]:tabular-nums [&>span]:text-[11px] [&>span]:text-muted-foreground">
                      <strong>{event.date.slice(8)}</strong>
                      <span>{formatDate(event.date, { month: "short" })}</span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="break-words hyphens-auto">
                        {event.title}
                      </h3>
                      <p>
                        {formatDate(event.date, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        · {event.time ? `${event.time} Uhr` : "Uhrzeit offen"} ·{" "}
                        {event.location || "Ort offen"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-1.75 max-md:col-start-1 max-md:flex-row max-md:items-center max-md:pl-13.5">
                    <Badge
                      className={
                        event.published
                          ? "rounded-sm border-0 bg-accent px-1.5 py-0.75 text-[11px] text-primary"
                          : "rounded-sm border border-border bg-muted px-1.5 py-0.75 text-[11px] font-normal whitespace-nowrap text-muted-foreground"
                      }
                    >
                      {event.published ? "Veröffentlicht" : "Entwurf"}
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-2 max-md:col-start-2 max-md:row-span-2 max-md:row-start-1 max-md:flex-col">
                    <Button
                      ref={(node) => {
                        if (node) editButtons.current.set(event.id, node);
                        else editButtons.current.delete(event.id);
                      }}
                      variant="outline"
                      size="icon"
                      disabled={busy}
                      aria-label={`${event.title} bearbeiten`}
                      aria-expanded={draft?.id === event.id}
                      onClick={() => openForm(event)}
                    >
                      <Icon name="edit" size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive-surface"
                      disabled={busy}
                      aria-label={`${event.title} löschen`}
                      onClick={() => askDelete(event.id)}
                    >
                      <Icon name="trash" size={18} />
                    </Button>
                  </div>
                  {draft?.id === event.id && form}
                  {deleting === event.id && (
                    <div
                      className="col-span-full flex items-center gap-3 bg-destructive-surface p-4.5 max-md:flex-wrap max-md:p-3.5 [&_p]:flex-1 [&_p]:text-[13px] [&_p]:text-destructive max-md:[&_p]:basis-full"
                      onKeyDown={(e) => {
                        if (e.key === "Escape" && !busy) cancelDelete(event.id);
                      }}
                    >
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
                        ref={(node) => {
                          if (node) keepButtons.current.set(event.id, node);
                          else keepButtons.current.delete(event.id);
                        }}
                        variant="outline"
                        size="default"
                        disabled={busy}
                        onClick={() => cancelDelete(event.id)}
                      >
                        Behalten
                      </Button>
                    </div>
                  )}
                </article>
              ))}
          </section>
        ))}
        {!displayedEvents.length && (
          <div className="mt-5.5 bg-muted px-5 py-13.75 text-center max-md:px-3.5 [&_h2]:text-[32px] [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:mb-5 [&_p]:max-w-[46ch] [&_p]:text-[13px]">
            <h2>Der erste Termin macht den Anfang.</h2>
            <p>Füge eine Veranstaltung hinzu, um den Sessionsplan zu füllen.</p>
            <Button variant="default" size="default" onClick={() => openForm()}>
              Ersten Termin hinzufügen
            </Button>
          </div>
        )}
      </section>
      <p className="mt-6 text-xs [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-2 [&_a]:text-primary">
        Öffentlich sichtbar:{" "}
        <Link href="/">
          Sessionsplan öffnen <Icon name="external" size={13} />
        </Link>
      </p>
    </>
  );
}
