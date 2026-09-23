import "server-only";
import { BlobNotFoundError, head } from "@vercel/blob";
import { cacheLife, cacheTag } from "next/cache";
import { readPublishedEvents } from "./store";
import { SESSION_PLAN_BLOB_PATHNAME } from "../pdf/path";
import { todayInBerlin } from "../format";

export const EVENTS_CACHE_TAG = "season-events";

export async function readPublicEvents() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife("events");
  return readPublishedEvents();
}

// The uploaded PDF's URL and etag, or null when there is none. Cached with the events,
// which the admin actions refresh after every upload, so the page and the download
// route share one Blob lookup instead of one per request.
export async function sessionPlanBlob() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife("events");
  try {
    const { url, etag } = await head(SESSION_PLAN_BLOB_PATHNAME);
    return { url, etag };
  } catch (error) {
    // The PDF is optional; any Blob failure just hides it.
    if (!(error instanceof BlobNotFoundError))
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
