// A month opened from the tiles gets its own history entry, so the phone's Back button
// returns to the overview. Next.js copies its router data into every pushed or replaced
// state; the month has to be carried along explicitly.
const MONTH_KEY = "calendarMonth";

export function historyMonth(): string | null {
  return history.state?.[MONTH_KEY] ?? null;
}

function monthState(month: string | null) {
  return month ? { [MONTH_KEY]: month } : null;
}

export function pushMonth(month: string) {
  history.pushState(monthState(month), "");
}

export function replaceMonth(month: string) {
  history.replaceState(monthState(month), "");
}

// Changes the address (e.g. the #termin- hash) without losing the month entry.
export function replaceUrl(url: string) {
  history.replaceState(monthState(historyMonth()), "", url);
}
