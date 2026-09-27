"use client";
import { ExternalLink, Plus } from "lucide-react";
import { useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
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
import Link from "next/link";
import type { ClubEvent } from "@/lib/events";
import { eventLabel } from "@/lib/format";
import { season } from "@/lib/season";
import { useEventForm } from "@/hooks/use-event-form";
import { useEventMutations } from "@/hooks/use-event-mutations";
import { useFilterParams } from "@/hooks/use-filter-params";
import { useConfirmRemoval } from "@/hooks/use-confirm-removal";
import { useLogout } from "@/hooks/use-logout";
import { EventForm } from "./event-form";
import { EventsTable } from "./events-table";
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
  const { events, publishing, highlighted, ...mutations } = useEventMutations(initialEvents);
  const form = useEventForm(events, mutations.save);
  const { leaving, signingOut, transitioning, logout } = useLogout();
  // The event whose delete confirmation is open. After a delete its row is gone, so focus
  // lands on "Termin hinzufügen".
  const addButton = useRef<HTMLButtonElement>(null);
  const confirm = useConfirmRemoval<ClubEvent>();
  const busy = mutations.busy || signingOut;

  async function remove(event: ClubEvent) {
    if (!(await mutations.remove(event))) return;
    confirm.done();
  }
  async function setPublished(event: ClubEvent, published: boolean) {
    if (await mutations.setPublished(event, published)) form.syncPublished(event.id, published);
  }

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
          onClick={() => form.open()}
          disabled={busy}
        >
          <Plus size={18} />
          Termin hinzufügen
        </Button>
      </div>
      {form.draft && (
        <EventForm
          form={form.form}
          draft={form.draft}
          busy={busy}
          focusField={form.focusField}
          onClose={form.close}
        />
      )}
      <AlertDialog
        open={confirm.target !== null}
        onOpenChange={(open) => !open && !busy && confirm.cancel()}
      >
        <AlertDialogContent finalFocus={confirm.removed ? addButton : true}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]">
              Termin löschen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              „{confirm.target && eventLabel(confirm.target)}“ wird auch aus dem öffentlichen Plan
              entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Behalten</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy}
              aria-busy={busy}
              onClick={() => confirm.target && remove(confirm.target)}
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
          onEdit={(event) => form.open(event)}
          onDuplicate={(event) => form.open(event, true)}
          onPublish={setPublished}
          onDelete={confirm.ask}
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
            <Button variant="default" size="default" onClick={() => form.open()}>
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
