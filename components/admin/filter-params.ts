"use client";
import { useSearchParams } from "next/navigation";

// Filters live in the address bar, so a reload or a shared link keeps the view.
// replaceState updates useSearchParams without a server round trip.
export function useFilterParams() {
  const params = useSearchParams();
  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `?${query}` : location.pathname);
  }
  return {
    query: params.get("suche") ?? "",
    status: params.get("status") ?? "",
    month: params.get("monat") ?? "",
    upcoming: params.get("kommend") === "1",
    set,
    reset: () => window.history.replaceState(null, "", location.pathname),
  };
}
