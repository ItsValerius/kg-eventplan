import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readPublishedEvents } from "./store";
import { findPdf } from "../pdf/storage";
import { todayInBerlin } from "../format";

export const EVENTS_CACHE_TAG = "season-events";

export async function readPublicEvents() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife("events");
  return readPublishedEvents();
}

// The stored PDF (see lib/pdf/storage.ts), or null when there is none. Cached with the
// events, which the admin actions refresh after every upload, so the page and the download
// route share one lookup instead of one per request.
export async function sessionPlanPdf() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife("events");
  try {
    return await findPdf();
  } catch (error) {
    // The PDF is optional; any storage failure just hides it.
    console.error("Sessionsplan-PDF konnte nicht geprüft werden:", error);
    return null;
  }
}

// The day the page was rendered, cached alongside the events so the prerendered HTML
// already hides past dates and marks the next one; the client clock takes over after midnight.
export async function renderDay() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife("events");
  return todayInBerlin();
}
