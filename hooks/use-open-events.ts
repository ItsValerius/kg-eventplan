import { useCallback, useEffect, useRef, useState } from "react";
import { clearEventLink, eventHash } from "@/components/calendar/event-links";
import { replaceUrl } from "@/components/calendar/history";
import { scrollBehavior } from "@/components/motion";

// Which event rows are unfolded. The most recently opened one stays in the address bar,
// so copying the URL shares it. openEvent (shared links, calendar days) also scrolls
// the row to the top and focuses it once it has rendered.
export function useOpenEvents() {
  const [open, setOpen] = useState<string[]>([]);
  const reveal = useRef<string | null>(null);

  // Runs after every render: the row may only appear after a month switch.
  useEffect(() => {
    const row = reveal.current && document.getElementById(`termin-${reveal.current}`);
    if (!row) return;
    reveal.current = null;
    row.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    row.querySelector("button")?.focus({ preventScroll: true });
  });

  const openEvent = useCallback((id: string) => {
    replaceUrl(eventHash(id));
    reveal.current = id;
    // Always a new array, so opening an already open event still re-renders and reveals it.
    setOpen((ids) => [...ids.filter((openId) => openId !== id), id]);
  }, []);

  function toggle(next: string[]) {
    const opened = next.find((id) => !open.includes(id));
    const closed = open.find((id) => !next.includes(id));
    if (opened) replaceUrl(eventHash(opened));
    else if (closed) clearEventLink(eventHash(closed));
    setOpen(next);
  }

  return { open, openEvent, toggle };
}
