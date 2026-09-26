"use client";
import { ExternalLink, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "@/components/ui/toast";
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
import { eventName, formatDate, groupByMonth } from "@/lib/format";
import { MonthHeading } from "../month-heading";
import { deleteEventAction, saveEventAction, setPublishedAction } from "@/app/admin/actions";
import { authClient } from "@/lib/auth-client";
import { season } from "@/lib/season";
import { blank, fieldOrder, type Draft, type FieldName } from "./draft";
import { EventForm } from "./event-form";
import { EventItem } from "./event-item";
import { errorMessage } from "./error-message";
export default function AdminPanel({ initialEvents }: { initialEvents: ClubEvent[] }) {
  const router = useRouter();
  // Feedback floats as toasts, so the list never shifts. Errors stay until dismissed.
  const notify = (title: string) => toast.add({ title, type: "success" });
  const fail = (title: string) => toast.add({ title, type: "error", timeout: 0 });
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
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
    // A copy only needs a new date.
    setFocusField(copy ? "date" : "host");
  }
  function update(field: FieldName | "published", value: string | boolean | null) {
    setDraft((current) => current && { ...current, [field]: value });
    if (field !== "published")
      setFieldErrors((errors) => (errors[field] ? { ...errors, [field]: undefined } : errors));
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
      setEvents(result.events);
      notify(
        draft.id
          ? "Die Änderungen wurden gespeichert."
          : validated.data.published
            ? "Der Termin wurde hinzugefügt und ist im Sessionsplan sichtbar."
            : "Der Termin wurde als Entwurf hinzugefügt.",
      );
      closeForm();
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
      notify(`„${eventName(event)}“ wurde gelöscht.`);
      router.refresh();
    } catch (e) {
      fail(errorMessage(e, "Löschen fehlgeschlagen. Bitte versuche es erneut."));
    } finally {
      setBusy(false);
    }
  }
  async function togglePublished(event: ClubEvent, published: boolean) {
    setBusy(true);
    try {
      const result = await setPublishedAction({ id: event.id, published });
      if (!result.ok) throw new Error(result.error);
      setEvents(result.events);
      setDraft((current) => (current?.id === event.id ? { ...current, published } : current));
      notify(
        published
          ? `„${eventName(event)}“ ist jetzt im Sessionsplan sichtbar.`
          : `„${eventName(event)}“ ist wieder ein Entwurf.`,
      );
      // The switch was disabled while saving, which drops its focus.
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`[data-publish="${CSS.escape(event.id)}"]`)?.focus(),
      );
      router.refresh();
    } catch (e) {
      fail(errorMessage(e, "Status konnte nicht geändert werden. Bitte versuche es erneut."));
    } finally {
      setBusy(false);
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
      <div className="flex items-center justify-between gap-5 max-md:items-start [&_h1]:text-[58px] max-md:[&_h1]:text-[42px] [&_p]:mt-4 [&_p]:text-[13px] max-md:[&_p]:mt-3 max-md:[&_p]:text-xs">
        <div>
          <h1>Die Session gestalten.</h1>
          <p>Termine verwalten · Session {season.label}</p>
        </div>
        <Button
          className="max-md:min-h-11 max-md:px-3.5"
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
          <span>{events.filter((e) => e.published).length} veröffentlicht</span>
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
      <Toaster />
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
            <AlertDialogTitle className="font-display text-[29px] leading-[1.03] font-bold tracking-[-.02em]">
              Termin löschen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              „{confirming && eventName(confirming)}“ wird auch aus dem öffentlichen Plan entfernt.
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
      <section aria-label="Termine verwalten">
        <div
          className="grid grid-cols-[1fr_190px_160px] gap-5 pt-6.5 pb-1 text-[11px] font-semibold tracking-[.08em] text-muted-foreground uppercase max-lg:grid-cols-[1fr_120px_152px] max-lg:gap-3 max-md:hidden [&>span:last-child]:text-right"
          aria-hidden="true"
        >
          <span>Termin</span>
          <span>Status</span>
          <span>Bearbeiten</span>
        </div>
        {groupByMonth(events).map(([month, monthEvents]) => (
          <section
            key={month}
            aria-label={formatDate(`${month}-01`, { month: "long", year: "numeric" })}
          >
            <MonthHeading month={month} className="mt-6" />
            {monthEvents.map((event) => {
              return (
                <EventItem
                  key={event.id}
                  event={event}
                  busy={busy}
                  onEdit={() => openForm(event)}
                  onDuplicate={() => openForm(event, true)}
                  onPublish={(published) => togglePublished(event, published)}
                  onDelete={() => setConfirming(event)}
                />
              );
            })}
          </section>
        ))}
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
      </section>
      <p className="mt-6 text-xs [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-2 [&_a]:text-primary">
        Öffentlich sichtbar:{" "}
        <Link href="/">
          Sessionsplan öffnen <ExternalLink size={13} />
        </Link>
      </p>
    </>
  );
}
