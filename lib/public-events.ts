import "server-only";
import { existsSync } from "node:fs";
import { cacheLife, cacheTag } from "next/cache";
import { readPublishedEvents } from "./store";
import { SESSION_PLAN_PDF_PATH } from "./season-pdf-path";

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
  return existsSync(SESSION_PLAN_PDF_PATH);
}
