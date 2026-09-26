import { Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ClubEvent } from "@/lib/events";
import { eventName, formatDate } from "@/lib/format";

// One admin row: event details, publication switch and actions.
export function EventItem({
  event,
  busy,
  onPublish,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  event: ClubEvent;
  busy: boolean;
  onPublish: (published: boolean) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const name = eventName(event);
  return (
    <article className="grid grid-cols-[1fr_190px_160px] items-center gap-5 border-b border-border py-5 max-lg:grid-cols-[1fr_120px_152px] max-lg:gap-3 max-md:grid-cols-[1fr_auto] max-md:gap-y-3">
      <div className="flex min-w-0 items-center gap-5.5 max-md:col-span-full max-md:gap-3 [&_h3]:text-base [&_h3]:leading-[1.35] max-md:[&_h3]:text-[15px] [&_p]:mt-1.5 [&_p]:text-xs">
        <span className="flex min-w-10.5 flex-col items-center [&_strong]:font-display [&_strong]:text-[35px] [&_strong]:leading-none [&_strong]:text-primary [&_strong]:tabular-nums [&>span]:text-[11px] [&>span]:text-muted-foreground">
          <strong>{event.date.slice(8)}</strong>
          <span>{formatDate(event.date, { month: "short" })}</span>
        </span>
        <div className="min-w-0">
          <h3 className="break-words hyphens-auto">{name}</h3>
          <p>
            {formatDate(event.date, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {event.time ? `${event.time} Uhr` : "Uhrzeit offen"} · {event.location || "Ort offen"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-xs max-md:pl-13.5">
        <Switch
          data-publish={event.id}
          checked={event.published}
          disabled={busy}
          onCheckedChange={onPublish}
          aria-label={`${name} veröffentlicht`}
        />
        <span aria-hidden className={event.published ? "text-primary" : "text-muted-foreground"}>
          {event.published ? "Veröffentlicht" : "Entwurf"}
        </span>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={busy}
          aria-label={`${name} bearbeiten`}
          aria-haspopup="dialog"
          onClick={onEdit}
        >
          <Pencil size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={busy}
          aria-label={`${name} duplizieren`}
          onClick={onDuplicate}
        >
          <Copy size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:bg-destructive-surface"
          disabled={busy}
          aria-label={`${name} löschen`}
          onClick={onDelete}
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </article>
  );
}
