import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteEventAction, saveEventAction, setPublishedAction } from "@/app/admin/actions";
import { publishedMessage, savedId, savedMessage, type Draft } from "@/components/admin/draft";
import { errorMessage, fail, notify } from "@/components/admin/feedback";
import type { ClubEvent, EventInput } from "@/lib/events";
import { eventLabel } from "@/lib/format";
import { useRowHighlight } from "./use-row-highlight";

type Result = Awaited<ReturnType<typeof saveEventAction>>;

// The admin's event list and the server actions that change it. Each action reports
// through toasts and resolves to whether it succeeded.
export function useEventMutations(initialEvents: ClubEvent[]) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  // Saving or deleting: the whole list waits.
  const [busy, setBusy] = useState(false);
  // Publication changes in flight, by event id: the switch shows the target state meanwhile.
  const [publishing, setPublishing] = useState<ReadonlyMap<string, boolean>>(new Map());
  const { highlighted, reveal } = useRowHighlight();

  // Runs one action and takes over the list it returns; null when it failed.
  async function apply(request: () => Promise<Result>, failure: string) {
    try {
      const result = await request();
      if (!result.ok) throw new Error(result.error);
      setEvents(result.events);
      router.refresh();
      return result.events;
    } catch (e) {
      fail(errorMessage(e, failure));
      return null;
    }
  }

  async function save(draft: Draft, event: EventInput) {
    setBusy(true);
    const saved = await apply(
      () => saveEventAction(draft.id ? { ...event, id: draft.id } : event),
      "Speichern fehlgeschlagen. Bitte versuche es erneut.",
    );
    setBusy(false);
    if (!saved) return false;
    notify(savedMessage(event, Boolean(draft.id)));
    const id = savedId(draft, events, saved);
    if (id) reveal(id);
    return true;
  }

  async function remove(event: ClubEvent) {
    setBusy(true);
    const removed = await apply(
      () => deleteEventAction({ id: event.id }),
      "Löschen fehlgeschlagen. Bitte versuche es erneut.",
    );
    setBusy(false);
    if (removed) notify(`„${eventLabel(event)}“ wurde gelöscht.`);
    return Boolean(removed);
  }

  // Only this row waits for the server; the rest of the list stays usable.
  async function setPublished(event: ClubEvent, published: boolean) {
    if (publishing.has(event.id)) return false;
    setPublishing((current) => new Map(current).set(event.id, published));
    const changed = await apply(
      () => setPublishedAction({ id: event.id, published }),
      "Status konnte nicht geändert werden. Bitte versuche es erneut.",
    );
    setPublishing((current) => {
      const next = new Map(current);
      next.delete(event.id);
      return next;
    });
    if (changed) notify(publishedMessage(event, published));
    return Boolean(changed);
  }

  return { events, busy, publishing, highlighted, save, remove, setPublished };
}
