import { useEffect, useState } from "react";

// The value once it has stopped changing for `delay` ms; `initial` until then.
export function useDebouncedValue<T>(value: T, delay: number, initial: T = value) {
  const [settled, setSettled] = useState(initial);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}
