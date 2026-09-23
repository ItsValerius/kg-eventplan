import "server-only";
import { headers } from "next/headers";

const WINDOW_MS = 900_000;
const MAX_FAILURES_PER_CLIENT = 10;
// The client key comes from forwarding headers, which a client can spoof when
// self-hosted, so a global cap bounds guessing even if every request uses a new key.
const MAX_FAILURES_TOTAL = 100;
const attempts = new Map<string, { count: number; until: number }>();
let totalFailures = { count: 0, until: 0 };

export async function clientKey() {
  const list = await headers();
  return (
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "unknown"
  );
}

export function loginBlocked(key: string, now: number) {
  const record = attempts.get(key);
  return (
    (record !== undefined && record.until > now && record.count >= MAX_FAILURES_PER_CLIENT) ||
    (totalFailures.until > now && totalFailures.count >= MAX_FAILURES_TOTAL)
  );
}

export function recordFailure(key: string, now: number) {
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

export function clearFailures(key: string) {
  attempts.delete(key);
}
