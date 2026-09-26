"use client";
import { ExternalLink, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventSchema, validationMessage, type ClubEvent } from "@/lib/events";
import { eventLabel } from "@/lib/format";
import { deleteEventAction, saveEventAction, setPublishedAction } from "@/app/admin/actions";
import { authClient } from "@/lib/auth-client";
import { season } from "@/lib/season";
import { blank, fieldOrder, type Draft, type FieldName } from "./draft";
import { EventForm } from "./event-form";
import { EventsTable } from "./events-table";
import { errorMessage } from "./error-message";
import { useFilterParams } from "./filter-params";
import { scrollBehavior } from "../motion";
// The work still to do before the season: how many dates are not public yet. The count is
// also the shortcut to them: it toggles the drafts filter.
function DraftCount({ events }: { events: ClubEvent[] }) {
  const filters = useFilterParams();
  const drafts = events.filter((e) => !e.published).length;
  if (!drafts) return <span>Alle veröffentlicht</span>;
  const active = filters.status === "entwurf";
  return (
    <Button
      variant="link"
      size="link"
      className="relative -mx-1.5 min-h-0 rounded-sm px-1.5 text-xs font-semibold underline decoration-1 underline-offset-4 after:absolute after:-inset-x-1 after:-inset-y-3.5 aria-pressed:bg-accent aria-pressed:no-underline"
      aria-pressed={active}
      onClick={() => filters.set("status", active ? "" : "entwurf")}
    >
      {drafts === 1 ? "1 Entwurf" : `${drafts} Entwürfe`}
    </Button>
  );
}
export default function AdminPanel({ initialEvents }: { initialEvents: ClubEvent[] }) {
  const router = useRouter();
  // Feedback floats as toasts, so the list never shifts. Errors stay until dismissed.
  const notify = (title: string) => toast.add({ title, type: "success", timeout: 3000 });
  const fail = (title: string) => toast.add({ title, type: "error", timeout: 0 });
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  // Publication changes in flight, by event id: the switch shows the target state meanwhile.
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [transitioning, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);
  // The event whose delete confirmation is open.
  const [confirming, setConfirming] = useState<ClubEvent | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  // The field the form dialog focuses when it opens.
  const [focusField, setFocusField] = useState<FieldName>("host");
  const addButton = useRef<HTMLButtonElement>(null);
  const justDeleted = useRef(false);
  async function logout() {
    setBusy(true);
    setLeaving(true);
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error();
      setDraft(null);
      startTransition(() => router.refresh());
    } catch (e) {
      fail(errorMessage(e, "Abmelden fehlgeschlagen. Bitte versuche es erneut."));
      setLeaving(false);
    } finally {
      setBusy(false);
    }
  }
  function openForm(event?: ClubEvent, copy = false) {
    if (event && copy) {
      // A copy keeps club, title, time, venue and description; the date is what changes.
      setDraft({ ...event, id: undefined, date: "", published: false });
    } else setDraft(event ? { ...event } : blank(events));
    setFieldErrors({});
    // A copy only needs a new date; an edit usually changes the title, not the optional club.
    setFocusField(copy ? "date" : event ? "title" : "host");
  }
  function update(field: FieldName | "published", value: string | boolean | null) {
    setDraft((current) => current && { ...current, [field]: value });
    if (field !== "published")
      setFieldErrors((errors) => (errors[field] ? { ...errors, [field]: undefined } : errors));
  }
  // Scroll the saved row into view and tint it briefly, so a new date or copy is easy to find.
  function reveal(id: string) {
    setHighlighted(id);
    requestAnimationFrame(() =>
      document
        .querySelector(`tr[data-row="${CSS.escape(id)}"]`)
        ?.scrollIntoView({ behavior: scrollBehavior(), block: "center" }),
    );
    setTimeout(() => setHighlighted((current) => (current === id ? null : current)), 2200);
  }
  // The dialog returns focus to the button that opened it.
  function closeForm() {
    setDraft(null);
    setFieldErrors({});
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const validated = eventSchema.safeParse(draft);
    if (!validated.success) {
      // Show each problem under its field and move focus to the first one.
      const errors: Partial<Record<FieldName, string>> = {};
      for (const issue of validated.error.issues) {
        const field = issue.path[0] as FieldName;
        if (fieldOrder.includes(field)) errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      if (!Object.keys(errors).length) fail(validationMessage(validated.error));
      const first = fieldOrder.find((field) => errors[field]);
      if (first) document.getElementById(`field-${first}`)?.focus();
      return;
    }
    setFieldErrors({});
    setBusy(true);
    try {
      const result = await saveEventAction(
        draft.id ? { ...validated.data, id: draft.id } : validated.data,
      );
      if (!result.ok) throw new Error(result.error);
      // The saved row: the edited one, or the one id the list did not have before.
      const savedId =
        draft.id ?? result.events.find((e) => !events.some((known) => known.id === e.id))?.id;
      setEvents(result.events);
      const label = `„${eventLabel(validated.data)}“`;
      notify(
        draft.id
          ? `${label} wurde gespeichert.`
          : validated.data.published
            ? `${label} wurde hinzugefügt und ist im Sessionsplan sichtbar.`
            : `${label} wurde als Entwurf hinzugefügt.`,
      );
      closeForm();
      if (savedId) reveal(savedId);
      router.refresh();
    } catch (e) {
      fail(errorMessage(e, "Speichern fehlgeschlagen. Bitte versuche es erneut."));
    } finally {
      setBusy(false);
    }
  }
  async function remove(event: ClubEvent) {
    setBusy(true);
    try {
      const result = await deleteEventAction({ id: event.id });
      if (!result.ok) throw new Error(result.error);
      setEvents(result.events);
      if (draft?.id === event.id) setDraft(null);
      justDeleted.current = true;
      setConfirming(null);
      notify(`„${eventLabel(event)}“ wurde gelöscht.`);
      router.refresh();
    } catch (e) {
      fail(errorMessage(e, "Löschen fehlgeschlagen. Bitte versuche es erneut."));
    } finally {
      setBusy(false);
    }
  }
  // Only this row waits for the server; the rest of the list stays usable.
  async function togglePublished(event: ClubEvent, published: boolean) {
    if (publishing.has(event.id)) return;
    setPublishing((current) => new Map(current).set(event.id, published));
    try {
      const result = await setPublishedAction({ id: event.id, published });
      if (!result.ok) throw new Error(result.error);
      setEvents(result.events);
      setDraft((current) => (current?.id === event.id ? { ...current, published } : current));
      notify(
        published
          ? `„${eventLabel(event)}“ ist jetzt im Sessionsplan sichtbar.`
          : `„${eventLabel(event)}“ ist wieder ein Entwurf.`,
      );
      router.refresh();
    } catch (e) {
      fail(errorMessage(e, "Status konnte nicht geändert werden. Bitte versuche es erneut."));
    } finally {
      setPublishing((current) => {
        const next = new Map(current);
        next.delete(event.id);
        return next;
      });
    }
  }
  const form = draft && (
    <EventForm
      draft={draft}
      fieldErrors={fieldErrors}
      busy={busy}
      focusField={focusField}
      onUpdate={update}
      onSubmit={save}
      onClose={closeForm}
    />
  );
  return (
    <>
      <div className="flex items-center justify-between gap-5 max-md:items-start [&_h1]:text-[44px] max-md:[&_h1]:text-[32px] [&_p]:mt-4 [&_p]:text-[13px] max-md:[&_p]:mt-3 max-md:[&_p]:text-xs">
        <div>
          <h1>Die Session gestalten.</h1>
          <p>Termine verwalten · Session {season.label}</p>
        </div>
        <Button
          className="max-md:min-h-11 max-md:border-transparent max-md:px-3 max-md:text-muted-foreground"
          variant="outline"
          size="default"
          onClick={logout}
          disabled={busy || transitioning}
          aria-busy={leaving}
        >
          {leaving && <Spinner aria-hidden />}
          {leaving ? "Abmelden …" : "Abmelden"}
        </Button>
      </div>
      <div className="mt-9 flex items-center justify-between gap-5 border-y border-border py-5.5 max-md:mt-6.5 max-md:gap-3 max-md:py-4.5 [&>div]:flex [&>div]:items-center [&>div]:gap-5 [&>div]:text-sm max-md:[&>div]:flex-col max-md:[&>div]:items-start max-md:[&>div]:gap-0.75 [&>div>span]:text-xs [&>div>span]:text-muted-foreground">
        <div>
          <strong>{events.length} Termine</strong>
          <DraftCount events={events} />
        </div>
        <Button
          ref={addButton}
          className="max-md:gap-1.75 max-md:px-3.5"
          variant="default"
          size="default"
          onClick={() => openForm()}
          disabled={busy}
        >
          <Plus size={18} />
          Termin hinzufügen
        </Button>
      </div>
      {form}
      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && !busy && setConfirming(null)}
      >
        {/* After a delete its row is gone, so focus lands on "Termin hinzufügen". */}
        <AlertDialogContent
          finalFocus={() => {
            const deleted = justDeleted.current;
            justDeleted.current = false;
            return deleted ? addButton.current : true;
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]">
              Termin löschen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              „{confirming && eventLabel(confirming)}“ wird auch aus dem öffentlichen Plan entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Behalten</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy}
              aria-busy={busy}
              onClick={() => confirming && remove(confirming)}
            >
              {busy && <Spinner aria-hidden />}
              {busy ? "Wird gelöscht …" : "Ja, löschen"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {events.length > 0 && (
        <EventsTable
          events={events}
          busy={busy}
          publishing={publishing}
          highlighted={highlighted}
          onEdit={(event) => openForm(event)}
          onDuplicate={(event) => openForm(event, true)}
          onPublish={togglePublished}
          onDelete={setConfirming}
        />
      )}
      {!events.length && (
        <Empty className="mt-5.5 gap-5 rounded-none bg-muted px-5 py-13.75 max-md:px-3.5">
          <EmptyHeader className="max-w-[46ch] gap-2.5">
            <EmptyTitle className="font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]">
              Der erste Termin macht den Anfang.
            </EmptyTitle>
            <EmptyDescription className="text-[13px]">
              Füge eine Veranstaltung hinzu, um den Sessionsplan zu füllen.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="default" size="default" onClick={() => openForm()}>
              Ersten Termin hinzufügen
            </Button>
          </EmptyContent>
        </Empty>
      )}
      <p className="mt-6 text-xs [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-2 [&_a]:text-primary">
        Öffentlich sichtbar:{" "}
        <Link href="/">
          Sessionsplan öffnen <ExternalLink size={13} />
        </Link>
      </p>
    </>
  );
}
