import { useTable, type ColumnFiltersState } from "@tanstack/react-table";
import { useMemo } from "react";
import { columns, features } from "@/components/admin/event-columns";
import type { ClubEvent } from "@/lib/events";
import { todayInBerlin } from "@/lib/format";
import { useDebouncedValue } from "./use-debounced-value";
import { useFilterParams } from "./use-filter-params";

// The admin table over the address-bar filters, plus what the toolbar says about them.
export function useEventsTable(events: ClubEvent[]) {
  const filters = useFilterParams();
  const today = todayInBerlin();
  const months = useMemo(() => [...new Set(events.map((e) => e.date.slice(0, 7)))], [events]);
  const columnFilters: ColumnFiltersState = [
    { id: "event", value: filters.query },
    { id: "date", value: { month: filters.month, upcoming: filters.upcoming, today } },
    ...(filters.status ? [{ id: "published", value: filters.status }] : []),
  ].filter(({ value }) => value !== "");
  const table = useTable({
    features,
    data: events,
    columns,
    state: { columnFilters },
    getRowId: (event) => event.id,
  });
  const rows = table.getRowModel().rows;
  const activeFilters = [filters.status, filters.month, filters.upcoming].filter(Boolean).length;
  const filtered = Boolean(filters.query) || activeFilters > 0;
  const countText = filtered ? `${rows.length} von ${events.length} Terminen` : "";
  // Screen readers hear the count once typing pauses, not on every keystroke.
  const announced = useDebouncedValue(countText, 700, "");
  return {
    table,
    rows,
    filters,
    months,
    today,
    activeFilters,
    searchOnly: Boolean(filters.query) && !activeFilters,
    countText,
    announced,
  };
}
