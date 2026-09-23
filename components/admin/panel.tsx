"use client";
import { Check, ExternalLink, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { formatDate, groupByMonth } from "@/lib/format";
import { MonthHeading } from "../month-heading";
import { scrollBehavior } from "../motion";
import { deleteEventAction, saveEventAction } from "@/app/admin/actions";
import { authClient } from "@/lib/auth-client";
import { season } from "@/lib/season";
import { blank, fieldOrder, type Draft, type FieldName } from "./draft";
import { EventForm } from "./event-form";
import { EventItem } from "./event-item";
import { errorMessage } from "./error-message";
export default function AdminPanel({ initialEvents }: { initialEvents: ClubEvent[] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [transitioning, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const editButtons = useRef(new Map<string, HTMLButtonElement>());
  const keepButtons = useRef(new Map<string, HTMLButtonElement>());
  async function logout() {
    setBusy(true);
    setLeaving(true);
    setError("");
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error();
      setDraft(null);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(errorMessage(e, "Abmelden fehlgeschlagen. Bitte versuche es erneut."));
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
    setDeleting(null);
    setFieldErrors({});
    setError("");
    setNotice("");
    requestAnimationFrame(() => {
      document
        .getElementById("event-form")
        ?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      const target = copy ? document.getElementById("field-date") : firstFieldRef.current;
      target?.focus({ preventScroll: true });
    });
  }
  function update(field: FieldName | "published", value: string | boolean | null) {
    setDraft((current) => current && { ...current, [field]: value });
    if (field !== "published")
      setFieldErrors((errors) => (errors[field] ? { ...errors, [field]: undefined } : errors));
  }
  // Return focus to the row the form or confirmation belonged to.
  function closeForm() {
    const id = draft?.id;
    setDraft(null);
    setFieldErrors({});
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
      // Show each problem under its field and move focus to the first one.
      const errors: Partial<Record<FieldName, string>> = {};
      for (const issue of validated.error.issues) {
        const field = issue.path[0] as FieldName;
        if (fieldOrder.includes(field)) errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      setError(Object.keys(errors).length ? "" : validationMessage(validated.error));
      setNotice("");
      const first = fieldOrder.find((field) => errors[field]);
      if (first) document.getElementById(`field-${first}`)?.focus();
      return;
    }
    setFieldErrors({});
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
      setError(errorMessage(e, "Speichern fehlgeschlagen. Bitte versuche es erneut."));
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
      setError(errorMessage(e, "Löschen fehlgeschlagen. Bitte versuche es erneut."));
    } finally {
      setBusy(false);
    }
  }
  const form = draft && (
    <EventForm
      draft={draft}
      fieldErrors={fieldErrors}
      busy={busy}
      firstFieldRef={firstFieldRef}
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
      {notice && (
        <Alert variant="success" role="status" className="my-5">
          <Check className="size-4.5" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="my-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {draft && !draft.id && form}
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
              const editing = draft?.id === event.id;
              return (
                <EventItem
                  key={event.id}
                  event={event}
                  busy={busy}
                  editing={editing}
                  deleting={deleting === event.id}
                  form={editing && form}
                  editRef={(node) => {
                    if (node) editButtons.current.set(event.id, node);
                    else editButtons.current.delete(event.id);
                  }}
                  keepRef={(node) => {
                    if (node) keepButtons.current.set(event.id, node);
                    else keepButtons.current.delete(event.id);
                  }}
                  onEdit={() => openForm(event)}
                  onDuplicate={() => openForm(event, true)}
                  onAskDelete={() => askDelete(event.id)}
                  onDelete={() => remove(event.id)}
                  onKeep={() => cancelDelete(event.id)}
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
