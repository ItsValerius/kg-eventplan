import {
  columnFilteringFeature,
  createFilteredRowModel,
  tableFeatures,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table";
import type { ClubEvent } from "@/lib/events";
import { eventName } from "@/lib/format";

export type DateFilter = { month: string; upcoming: boolean; today: string };

export const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
});
type Filter = FilterFn<typeof features, ClubEvent>;

// "Köpp", "Koepp" and "köpp" all match each other.
export function fold(text: string) {
  return text
    .toLocaleLowerCase("de")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}
export const matchesQuery = (event: ClubEvent, query: string) =>
  fold([event.host, event.title, event.location].join(" ")).includes(fold(query.trim()));
export const matchesDate = (event: ClubEvent, { month, upcoming, today }: DateFilter) =>
  (!month || event.date.startsWith(month)) && (!upcoming || event.date >= today);
export const matchesStatus = (event: ClubEvent, status: string) =>
  event.published === (status === "veroeffentlicht");

const searchFilter: Filter = (row, _column, query: string) => matchesQuery(row.original, query);
const dateFilter: Filter = (row, _column, value: DateFilter) => matchesDate(row.original, value);
const statusFilter: Filter = (row, _column, status: string) => matchesStatus(row.original, status);

// Columns 3 and 4 fold into the event cell below md, so phones get two columns.
export const columns: ColumnDef<typeof features, ClubEvent>[] = [
  { id: "date", accessorKey: "date", header: "Datum", filterFn: dateFilter },
  { id: "event", accessorFn: eventName, header: "Termin", filterFn: searchFilter },
  { id: "published", accessorKey: "published", header: "Status", filterFn: statusFilter },
  { id: "actions", header: () => <span className="sr-only">Aktionen</span> },
];
