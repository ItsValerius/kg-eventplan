import { useState } from "react";
import { scrollBehavior } from "@/components/motion";

// Scrolls a table row into view and tints it briefly, so a new date or copy is easy to find.
export function useRowHighlight() {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  function reveal(id: string) {
    setHighlighted(id);
    requestAnimationFrame(() =>
      document
        .querySelector(`tr[data-row="${CSS.escape(id)}"]`)
        ?.scrollIntoView({ behavior: scrollBehavior(), block: "center" }),
    );
    setTimeout(() => setHighlighted((current) => (current === id ? null : current)), 2200);
  }
  return { highlighted, reveal };
}
