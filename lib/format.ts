// Client-safe helpers: keep zod (lib/events.ts) out of the public bundle.
export function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("de-DE", {
    ...options,
    timeZone: "Europe/Berlin",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function todayInBerlin(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
}

// Titles follow "Host – Event"; the club's own entries start with "KG Knallköpp".
export function isClubEvent(title: string) {
  return /^(KG\s+)?Knallk(ö|oe)pp\b/i.test(title.trim());
}
