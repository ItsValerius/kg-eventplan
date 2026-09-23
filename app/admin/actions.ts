"use server";

import { updateTag } from "next/cache";
import { isAdmin } from "@/lib/server/auth";
import { eventIdSchema, eventSchema, validationMessage } from "@/lib/events";
import { EVENTS_CACHE_TAG } from "@/lib/server/public-events";
import { createEvent, deleteEvent, readEvents, updateEvent } from "@/lib/server/store";
import { regenerateSeasonPlanPdf } from "@/lib/pdf/season-pdf";

// New events arrive without an id; edits carry the id of the stored event.
const savedEventSchema = eventSchema.extend({ id: eventIdSchema.shape.id.optional() });
const signedOut = { ok: false as const, error: "Bitte melde dich erneut an." };
const missingEvent = {
  ok: false as const,
  error: "Dieser Termin existiert nicht mehr. Bitte lade die Seite neu.",
};

// Refreshes the public page and regenerates the PDF, returning the admin's updated list.
async function publishChanges() {
  updateTag(EVENTS_CACHE_TAG);
  const events = await readEvents();
  try {
    await regenerateSeasonPlanPdf(events.filter((event) => event.published));
  } catch (error) {
    console.error("Sessionsplan-PDF konnte nicht aktualisiert werden:", error);
  }
  // Again after the upload, so a request made during it can't cache a missing PDF.
  updateTag(EVENTS_CACHE_TAG);
  return { ok: true as const, events };
}

export async function saveEventAction(input: unknown) {
  if (!(await isAdmin())) return signedOut;
  const parsed = savedEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };

  try {
    const { id, ...event } = parsed.data;
    if (id) {
      if (!(await updateEvent(id, event))) return missingEvent;
    } else {
      await createEvent(event);
    }
    return await publishChanges();
  } catch (error) {
    console.error("Event save failed:", error);
    return {
      ok: false as const,
      error: "Speichern fehlgeschlagen. Bitte lade die Seite neu und prüfe den Termin.",
    };
  }
}

export async function deleteEventAction(input: unknown) {
  if (!(await isAdmin())) return signedOut;
  const parsed = eventIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: validationMessage(parsed.error) };

  try {
    if (!(await deleteEvent(parsed.data.id))) return missingEvent;
    return await publishChanges();
  } catch (error) {
    console.error("Event delete failed:", error);
    return {
      ok: false as const,
      error: "Löschen fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.",
    };
  }
}
