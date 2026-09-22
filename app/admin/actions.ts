"use server";

import { cookies, headers } from "next/headers";
import { updateTag } from "next/cache";
import {
  checkPassword,
  configured,
  cookieName,
  isAdmin,
  newSession,
} from "@/lib/auth";
import {
  eventIdSchema,
  eventSchema,
  loginSchema,
  storedEventSchema,
  validationMessage,
  type ClubEvent,
} from "@/lib/events";
import { EVENTS_CACHE_TAG } from "@/lib/public-events";
import { createEvent, deleteEvent, readEvents, updateEvent } from "@/lib/store";
import { regenerateSeasonPlanPdf } from "@/lib/season-pdf";

const WINDOW_MS = 900_000;
const MAX_FAILURES_PER_CLIENT = 10;
// The client key comes from forwarding headers, which a client can spoof when
// self-hosted, so a global cap bounds guessing even if every request uses a new key.
const MAX_FAILURES_TOTAL = 100;
const attempts = new Map<string, { count: number; until: number }>();
let totalFailures = { count: 0, until: 0 };

async function clientKey() {
  const list = await headers();
  return (
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "unknown"
  );
}

function loginBlocked(key: string, now: number) {
  const record = attempts.get(key);
  return (
    (record !== undefined && record.until > now && record.count >= MAX_FAILURES_PER_CLIENT) ||
    (totalFailures.until > now && totalFailures.count >= MAX_FAILURES_TOTAL)
  );
}

function recordFailure(key: string, now: number) {
  for (const [entry, record] of attempts)
    if (record.until <= now) attempts.delete(entry);
  const record = attempts.get(key);
  attempts.set(key, record
    ? { count: record.count + 1, until: record.until }
    : { count: 1, until: now + WINDOW_MS });
  totalFailures = totalFailures.until > now
    ? { count: totalFailures.count + 1, until: totalFailures.until }
    : { count: 1, until: now + WINDOW_MS };
}

async function refreshEventsAndPdf() {
  const events = await readEvents();
  try {
    await regenerateSeasonPlanPdf(events.filter((event) => event.published));
  } catch (error) {
    console.error("Sessionsplan-PDF konnte nicht aktualisiert werden:", error);
  }
  return events;
}

export async function loginAction(input: unknown) {
  if (!configured)
    return { ok: false as const, error: "Der Admin-Zugang ist noch nicht eingerichtet." };
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: validationMessage(parsed.error) };

  const key = await clientKey();
  const now = Date.now();
  if (loginBlocked(key, now))
    return {
      ok: false as const,
      error: "Zu viele Versuche. Bitte versuche es in 15 Minuten erneut.",
    };
  if (!checkPassword(parsed.data.password)) {
    recordFailure(key, now);
    return {
      ok: false as const,
      error: "Das Passwort stimmt nicht. Bitte versuche es erneut.",
    };
  }

  attempts.delete(key);
  (await cookies()).set(cookieName, newSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 28_800,
  });
  return { ok: true as const };
}

export async function logoutAction() {
  (await cookies()).delete(cookieName);
  return { ok: true as const };
}

export async function saveEventAction(input: unknown) {
  if (!(await isAdmin()))
    return { ok: false as const, error: "Bitte melde dich erneut an." };

  const hasId = typeof input === "object" && input !== null && "id" in input;
  const parsed = hasId ? storedEventSchema.safeParse(input) : eventSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: validationMessage(parsed.error) };

  try {
    if (hasId) {
      const { id, ...event } = parsed.data as ClubEvent;
      if (!(await updateEvent(id, event)))
        return {
          ok: false as const,
          error: "Dieser Termin existiert nicht mehr. Bitte lade die Seite neu.",
        };
    } else {
      await createEvent(eventSchema.parse(parsed.data));
    }
    updateTag(EVENTS_CACHE_TAG);
    const events = await refreshEventsAndPdf();
    // Again after the upload, so a request made during it can't cache a missing PDF.
    updateTag(EVENTS_CACHE_TAG);
    return { ok: true as const, events };
  } catch (error) {
    console.error("Event save failed:", error);
    return {
      ok: false as const,
      error: "Speichern fehlgeschlagen. Bitte lade die Seite neu und prüfe den Termin.",
    };
  }
}

export async function deleteEventAction(input: unknown) {
  if (!(await isAdmin()))
    return { ok: false as const, error: "Bitte melde dich erneut an." };
  const parsed = eventIdSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: validationMessage(parsed.error) };

  try {
    if (!(await deleteEvent(parsed.data.id)))
      return {
        ok: false as const,
        error: "Dieser Termin existiert nicht mehr. Bitte lade die Seite neu.",
      };
    updateTag(EVENTS_CACHE_TAG);
    const events = await refreshEventsAndPdf();
    // Again after the upload, so a request made during it can't cache a missing PDF.
    updateTag(EVENTS_CACHE_TAG);
    return { ok: true as const, events };
  } catch (error) {
    console.error("Event delete failed:", error);
    return {
      ok: false as const,
      error: "Löschen fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.",
    };
  }
}
