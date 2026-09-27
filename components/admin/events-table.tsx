"use client";
import { Copy, Ellipsis, Pencil, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClubEvent } from "@/lib/events";
import { eventLabel, eventName, formatDate } from "@/lib/format";
import { MonthHeading } from "../month-heading";
import { useEventsTable } from "@/hooks/use-events-table";

type Handlers = {
  busy: boolean;
  publishing: ReadonlyMap<string, boolean>;
  onPublish: (event: ClubEvent, published: boolean) => void;
  onEdit: (event: ClubEvent) => void;
  onDuplicate: (event: ClubEvent) => void;
  onDelete: (event: ClubEvent) => void;
};

// Switch and text form one 44px-tall tap target. Published is the quiet norm; drafts,
// the work still to do, carry the tag.
function StatusSwitch({ event, busy, publishing, onPublish }: { event: ClubEvent } & Handlers) {
  const pending = publishing.get(event.id);
  const published = pending ?? event.published;
  return (
    <label className="-my-2 flex min-h-11 w-fit cursor-pointer items-center gap-2.5 py-2 pr-2 text-xs">
      <Switch
        checked={published}
        disabled={busy}
        aria-busy={pending !== undefined}
        onCheckedChange={(checked) => onPublish(event, checked)}
        aria-label={`${eventLabel(event)} veröffentlicht`}
      />
      {/* While saving, a spinner stands in for the status it is heading to. */}
      {pending !== undefined ? (
        <Spinner aria-hidden className="size-3.5 text-muted-foreground" />
      ) : published ? (
        <span aria-hidden className="text-muted-foreground">
          Veröffentlicht
        </span>
      ) : (
        <span
          aria-hidden
          className="rounded-sm border border-input bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground dark:bg-border"
        >
          Entwurf
        </span>
      )}
    </label>
  );
}

function Actions({ event, busy, onEdit, onDuplicate, onDelete }: { event: ClubEvent } & Handlers) {
  const name = eventLabel(event);
  // Quiet until the row is in use, so the dates stay the strongest column.
  const quiet =
    "text-muted-foreground hover:bg-muted group-focus-within/row:text-primary group-hover/row:text-primary";
  return (
    <span className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={quiet}
        disabled={busy}
        title="Bearbeiten"
        aria-label={`${name} bearbeiten`}
        aria-haspopup="dialog"
        onClick={() => onEdit(event)}
      >
        <Pencil size={18} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={quiet}
        disabled={busy}
        title="Duplizieren"
        aria-label={`${name} duplizieren`}
        onClick={() => onDuplicate(event)}
      >
        <Copy size={18} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground group-focus-within/row:text-destructive group-hover/row:text-destructive hover:bg-destructive-surface hover:text-destructive"
        disabled={busy}
        title="Löschen"
        aria-label={`${name} löschen`}
        onClick={() => onDelete(event)}
      >
        <Trash2 size={18} />
      </Button>
    </span>
  );
}

// Phones get one menu button instead of three icon buttons.
function ActionsMenu({
  event,
  busy,
  onEdit,
  onDuplicate,
  onDelete,
}: { event: ClubEvent } & Handlers) {
  const item = "min-h-11 gap-2.5 px-3 text-[13px]";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" disabled={busy} />}
        aria-label={`Aktionen für ${eventLabel(event)}`}
      >
        <Ellipsis size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        <DropdownMenuItem className={item} onClick={() => onEdit(event)}>
          <Pencil /> Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem className={item} onClick={() => onDuplicate(event)}>
          <Copy /> Duplizieren
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={item} variant="destructive" onClick={() => onDelete(event)}>
          <Trash2 /> Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Admin event list: search and filters over a table, split into months like the public plan.
export function EventsTable({
  events,
  highlighted,
  ...handlers
}: { events: ClubEvent[]; highlighted: string | null } & Handlers) {
  const { table, rows, filters, months, today, activeFilters, searchOnly, countText, announced } =
    useEventsTable(events);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <section aria-label="Termine verwalten" className="mt-6">
      <search className="flex flex-wrap items-center gap-3 [&_select]:h-11 [&_select]:rounded-md [&_select]:text-[13px]">
        <div className="relative min-w-48 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            className="pl-9"
            placeholder="Verein, Titel oder Ort"
            aria-label="Termine durchsuchen"
            value={filters.query}
            onChange={(e) => filters.set("suche", e.target.value)}
          />
        </div>
        {/* Phones keep search in view and fold the rest behind one button. */}
        <Button
          variant="outline"
          size="icon"
          className="relative text-foreground aria-expanded:border-input aria-expanded:bg-muted md:hidden"
          aria-label={activeFilters ? `Filter, ${activeFilters} aktiv` : "Filter"}
          aria-expanded={filtersOpen}
          aria-controls="event-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={18} />
          {activeFilters > 0 && (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-1.5 min-w-4.5 rounded-sm bg-primary px-1 text-[11px] leading-4.5 font-semibold text-primary-foreground"
            >
              {activeFilters}
            </span>
          )}
        </Button>
        <div
          id="event-filters"
          className={`flex flex-wrap items-center gap-3 max-md:basis-full md:contents ${filtersOpen ? "" : "max-md:hidden"}`}
        >
          <NativeSelect
            className="max-md:flex-1"
            aria-label="Status"
            value={filters.status}
            onChange={(e) => filters.set("status", e.target.value)}
          >
            <NativeSelectOption value="">Status: alle</NativeSelectOption>
            <NativeSelectOption value="veroeffentlicht">Veröffentlicht</NativeSelectOption>
            <NativeSelectOption value="entwurf">Entwürfe</NativeSelectOption>
          </NativeSelect>
          <NativeSelect
            className="max-md:flex-1"
            aria-label="Monat"
            value={filters.month}
            onChange={(e) => filters.set("monat", e.target.value)}
          >
            <NativeSelectOption value="">Monat: alle</NativeSelectOption>
            {months.map((month) => (
              <NativeSelectOption key={month} value={month}>
                {formatDate(`${month}-01`, { month: "long", year: "numeric" })}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <label className="flex min-h-11 items-center gap-2.5 text-[13px] max-md:basis-full">
            <Checkbox
              className="mt-0"
              checked={filters.upcoming}
              onCheckedChange={(checked) => filters.set("kommend", checked ? "1" : "")}
            />
            Vergangene ausblenden
          </label>
        </div>
      </search>
      {/* With no match the empty row says so, so the visible count hides. */}
      <p aria-hidden className={`text-xs not-empty:mt-3 ${rows.length ? "" : "hidden"}`}>
        {countText}
      </p>
      <p role="status" className="sr-only">
        {announced}
      </p>
      {/* Overlays the table top while focused instead of pushing the list down. */}
      <div className="relative">
        <a
          href="#accounts-heading"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-1 focus-visible:left-0 focus-visible:z-10 focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:bg-background focus-visible:px-3 focus-visible:text-xs focus-visible:text-primary"
        >
          Zu den Zugängen springen
        </a>
      </div>
      <Table className="mt-3 table-fixed max-md:table-auto">
        <TableHeader className="max-md:hidden">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    {
                      date: "w-18",
                      // From lg the event column is capped and status takes the rest, so the
                      // switch sits near the titles instead of at the far edge.
                      event: "lg:w-[34rem]",
                      published: "w-36 max-md:hidden lg:w-auto",
                      actions: "w-40 max-md:hidden",
                    }[header.id] +
                    " px-0 text-[11px] font-semibold tracking-[.08em] text-muted-foreground uppercase"
                  }
                >
                  <table.FlexRender header={header} />
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const event = row.original;
            const month = event.date.slice(0, 7);
            const newMonth = index === 0 || rows[index - 1].original.date.slice(0, 7) !== month;
            return (
              <Fragment key={row.id}>
                {newMonth && (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={4} className="px-0 pt-6 pb-1">
                      <MonthHeading month={month} />
                    </TableCell>
                  </TableRow>
                )}
                {/* Past events are muted like in the public month view, so the list shows where "now" is. */}
                <TableRow
                  data-row={event.id}
                  data-past={event.date < today ? "" : undefined}
                  data-highlight={highlighted === event.id ? "" : undefined}
                  className="group/row transition-colors duration-700 data-highlight:bg-accent data-past:[&_h3]:text-muted-foreground data-past:[&_strong]:text-muted-foreground [&>td]:py-5 [&>td]:whitespace-normal"
                >
                  {/* The date keeps its own gap to the title; the header setting its width is hidden on phones. */}
                  <TableCell className="pr-7.5 pl-0 align-top max-md:pr-4 md:align-middle">
                    <span className="flex w-10.5 flex-col items-center [&_strong]:font-display [&_strong]:text-[35px] [&_strong]:leading-none [&_strong]:text-primary [&_strong]:tabular-nums [&>span]:text-[11px] [&>span]:text-muted-foreground">
                      <strong>{event.date.slice(8)}</strong>
                      <span>{formatDate(event.date, { month: "short" })}</span>
                    </span>
                  </TableCell>
                  <TableCell className="px-0 md:pr-5">
                    <h3 className="text-base leading-[1.35] break-words hyphens-auto max-md:text-[15px]">
                      {eventName(event)}
                    </h3>
                    <p className="mt-1.5 max-w-[70ch] text-xs">
                      {formatDate(event.date, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {event.time ? `${event.time} Uhr` : "Uhrzeit offen"} ·{" "}
                      {event.location || "Ort offen"}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3 md:hidden">
                      <StatusSwitch event={event} {...handlers} />
                      <ActionsMenu event={event} {...handlers} />
                    </div>
                  </TableCell>
                  <TableCell className="px-0 max-md:hidden">
                    <StatusSwitch event={event} {...handlers} />
                  </TableCell>
                  <TableCell className="px-0 max-md:hidden">
                    <Actions event={event} {...handlers} />
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
          {!rows.length && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="px-0 py-10 text-center whitespace-normal">
                <p className="text-[13px]">
                  {searchOnly
                    ? "Keine Termine passen zu dieser Suche."
                    : "Keine Termine passen zu diesen Filtern."}
                </p>
                <Button variant="link" size="link" onClick={filters.reset}>
                  Filter zurücksetzen
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
