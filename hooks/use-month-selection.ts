import { useEffect, useRef, useState } from "react";
import { clearEventLink } from "@/components/calendar/event-links";
import { historyMonth, pushMonth, replaceMonth } from "@/components/calendar/history";

// Which month is shown (null = the overview tiles). Opening a month from the tiles adds
// a history entry, so Back returns to the overview; the month arrows replace that entry.
// Switching views moves focus along: into the month view's back button, and back onto
// the tile of the month that was left. Switches the visitor makes also drop a shared
// #termin- link; setMonth (used by those links) touches neither history nor the hash.
export function useMonthSelection() {
  const [month, setMonth] = useState<string | null>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const tiles = useRef(new Map<string, HTMLButtonElement>());
  const rendered = useRef<string | null>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    const previous = rendered.current;
    rendered.current = month;
    if (!moveFocus.current) return;
    moveFocus.current = false;
    if (month) backButton.current?.focus();
    else if (previous) tiles.current.get(previous)?.focus();
  }, [month]);

  // Back and Forward between the overview and a month; a reload keeps the month.
  useEffect(() => {
    const restore = (event?: PopStateEvent) => {
      // Hash navigation (the skip link, #termin- links) carries no state; ignore it.
      if (event && !event.state) return;
      const next = historyMonth();
      if (next === rendered.current) return;
      moveFocus.current = Boolean(event);
      setMonth(next);
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  return {
    month,
    setMonth,
    backButton,
    tileRef(value: string, node: HTMLButtonElement | null) {
      if (node) tiles.current.set(value, node);
      else tiles.current.delete(value);
    },
    openMonth(value: string) {
      clearEventLink();
      pushMonth(value);
      moveFocus.current = true;
      setMonth(value);
    },
    changeMonth(value: string) {
      clearEventLink();
      if (historyMonth()) replaceMonth(value);
      setMonth(value);
    },
    showAllMonths() {
      clearEventLink();
      moveFocus.current = true;
      // Step back over the month's entry; popstate then shows the overview.
      if (historyMonth()) history.back();
      else setMonth(null);
    },
  };
}
