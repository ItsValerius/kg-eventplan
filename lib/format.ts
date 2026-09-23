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

// Events (already sorted by date) grouped under their "YYYY-MM" month, in one pass.
export function groupByMonth<T extends { date: string }>(events: T[]) {
  const groups = new Map<string, T[]>();
  for (const event of events) {
    const month = event.date.slice(0, 7);
    const group = groups.get(month);
    if (group) group.push(event);
    else groups.set(month, [event]);
  }
  return [...groups];
}
