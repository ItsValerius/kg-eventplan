import { useState } from "react";

// A removal confirmation: which item it asks about (null when closed), and whether it
// closed because the removal went through. Then the row that opened it is gone, so the
// dialog should return focus somewhere else.
export function useConfirmRemoval<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [removed, setRemoved] = useState(false);
  return {
    target,
    removed,
    ask(item: T) {
      setRemoved(false);
      setTarget(item);
    },
    cancel: () => setTarget(null),
    // Closes after a successful removal.
    done() {
      setRemoved(true);
      setTarget(null);
    },
  };
}
