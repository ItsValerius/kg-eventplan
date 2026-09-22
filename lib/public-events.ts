import "server-only";
import { BlobNotFoundError, head } from "@vercel/blob";
import { cacheLife, cacheTag } from "next/cache";
import { readPublishedEvents } from "./store";
import { SESSION_PLAN_BLOB_PATHNAME } from "./season-pdf-path";

export const EVENTS_CACHE_TAG = "season-events";

export async function readPublicEvents() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife({ stale: 30, revalidate: 300, expire: 3600 });
  return readPublishedEvents();
}

export async function hasSessionPlanPdf() {
  "use cache";
  cacheTag(EVENTS_CACHE_TAG);
  cacheLife({ stale: 30, revalidate: 300, expire: 3600 });
  try {
    await head(SESSION_PLAN_BLOB_PATHNAME);
    return true;
  } catch (error) {
    // The PDF button is optional; any Blob failure just hides it.
    if (!(error instanceof BlobNotFoundError))
      console.error("Sessionsplan-PDF konnte nicht geprüft werden:", error);
    return false;
  }
}
