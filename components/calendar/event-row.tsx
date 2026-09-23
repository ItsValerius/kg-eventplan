import { Clock, MapPin, Plus } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ClubEvent } from "@/lib/events";
import { eventName, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// One unfoldable event: date, title and meta in the trigger, the description below.
export function EventRow({
  event,
  past,
  next,
}: {
  event: ClubEvent;
  past: boolean;
  next: boolean;
}) {
  return (
    <AccordionItem
      value={event.id}
      id={`termin-${event.id}`}
      className="border-b border-border print:break-inside-avoid data-open:bg-surface-open"
    >
      <AccordionTrigger
        // The plus below replaces shadcn's chevrons; focus keeps the site-wide outline.
        className="items-center gap-6 rounded-none border-0 px-1 py-5.5 text-[15px] leading-normal font-normal hover:bg-muted hover:no-underline focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring focus-visible:outline-solid max-lg:gap-4 max-md:gap-3.25 max-md:px-0 max-md:py-5 print:py-3.5 [&>[data-slot=accordion-trigger-icon]]:hidden!"
      >
        <span
          className={cn(
            "flex w-12.5 shrink-0 flex-col items-center self-start rounded-md max-md:w-11 [&_strong]:font-display [&_strong]:text-[43px] [&_strong]:leading-none [&_strong]:tabular-nums max-md:[&_strong]:text-[39px] [&>span]:mt-1.5 [&>span]:text-[11px] [&>span]:uppercase",
            next
              ? "[&_strong]:text-primary [&>span]:font-bold [&>span]:text-primary"
              : past
                ? "[&_strong]:text-muted-foreground [&>span]:text-muted-foreground"
                : "[&_strong]:text-primary-dark [&>span]:text-muted-foreground",
          )}
        >
          {next && <span className="sr-only">Nächster Termin: </span>}
          <strong>{event.date.slice(8)}</strong>
          <span>{formatDate(event.date, { weekday: "short" }).replace(".", "")}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.75">
          <span
            className={cn(
              "text-xl leading-tight font-semibold tracking-tight break-words hyphens-auto max-[370px]:text-base max-md:text-lg",
              past && "text-muted-foreground",
            )}
          >
            {eventName(event)}
          </span>
          <span className="flex flex-wrap gap-x-5 gap-y-1.25 text-[13px] text-muted-foreground max-lg:gap-x-2.5 max-md:flex-col max-md:gap-1.25 [&>span]:flex [&>span]:items-center [&>span]:gap-1.25">
            <span>
              <Clock size={14} />
              {event.time ? `${event.time} Uhr` : "Uhrzeit folgt"}
            </span>
            <span>
              <MapPin size={14} />
              {event.location || "Ort folgt"}
            </span>
          </span>
        </span>
        <span className="grid size-7.5 shrink-0 place-items-center rounded-full text-primary transition-[transform,background] duration-250 ease-out group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:bg-accent print:hidden">
          <Plus size={20} />
        </span>
      </AccordionTrigger>
      <AccordionContent className="pr-15 pb-6 pl-19.5 max-lg:pr-6 max-lg:pl-17.5 max-md:pr-4 max-md:pb-5.5 max-md:pl-14.25 [&_p]:max-w-[65ch] [&_p]:text-[13px] [&_p]:leading-[1.75] max-md:[&_p]:text-xs">
        <p>{event.description || "Weitere Informationen folgen."}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
