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

// The club's own events are hosted by "KG Knallköpp" (or a spelling of it).
export function isClubEvent(host: string | null) {
  return host !== null && /^(KG\s+)?Knallk(ö|oe)pp\b/i.test(host.trim());
}

// How an event is named everywhere it is shown: "Host – Title", or just the title.
export function eventName({ host, title }: { host: string | null; title: string }) {
  return host ? `${host} – ${title}` : title;
}

// The name plus a short date ("KG Knallköpp – Biwak, Sa., 24. Jan."), so duplicates that
// share a name stay distinguishable in labels, confirmations and toasts.
export function eventLabel(event: { host: string | null; title: string; date: string }) {
  const name = eventName(event);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return name;
  return `${name}, ${formatDate(event.date, { weekday: "short", day: "numeric", month: "short" })}`;
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
