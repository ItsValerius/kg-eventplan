import { Copy, Pencil, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReactNode, Ref } from "react";
import type { ClubEvent } from "@/lib/events";
import { eventName, formatDate } from "@/lib/format";

// One admin row: event details, publication status, actions and the delete confirmation.
export function EventItem({
  event,
  busy,
  editing,
  deleting,
  form,
  editRef,
  keepRef,
  onEdit,
  onDuplicate,
  onAskDelete,
  onDelete,
  onKeep,
}: {
  event: ClubEvent;
  busy: boolean;
  editing: boolean;
  deleting: boolean;
  form: ReactNode;
  editRef: Ref<HTMLButtonElement>;
  keepRef: Ref<HTMLButtonElement>;
  onEdit: () => void;
  onDuplicate: () => void;
  onAskDelete: () => void;
  onDelete: () => void;
  onKeep: () => void;
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
      <div className="flex flex-col items-start gap-1.75 max-md:flex-row max-md:items-center max-md:pl-13.5">
        <Badge
          className={
            event.published
              ? "rounded-sm border-0 bg-accent px-1.5 py-0.75 text-[11px] text-primary"
              : "rounded-sm border border-border bg-muted px-1.5 py-0.75 text-[11px] font-normal whitespace-nowrap text-muted-foreground"
          }
        >
          {event.published ? "Veröffentlicht" : "Entwurf"}
        </Badge>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          ref={editRef}
          variant="outline"
          size="icon"
          disabled={busy}
          aria-label={`${name} bearbeiten`}
          aria-expanded={editing}
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
          onClick={onAskDelete}
        >
          <Trash2 size={18} />
        </Button>
      </div>
      {form}
      {deleting && (
        <div
          className="col-span-full flex items-center gap-3 bg-destructive-surface p-4.5 max-md:flex-wrap max-md:p-3.5 [&_p]:flex-1 [&_p]:text-[13px] [&_p]:text-destructive max-md:[&_p]:basis-full"
          onKeyDown={(e) => {
            if (e.key === "Escape" && !busy) onKeep();
          }}
        >
          <p>„{name}“ wirklich löschen? Der Termin wird auch aus dem öffentlichen Plan entfernt.</p>
          <Button
            variant="destructive"
            size="default"
            disabled={busy}
            aria-busy={busy}
            onClick={onDelete}
          >
            {busy && <Spinner aria-hidden />}
            {busy ? "Wird gelöscht …" : "Ja, löschen"}
          </Button>
          <Button ref={keepRef} variant="outline" size="default" disabled={busy} onClick={onKeep}>
            Behalten
          </Button>
        </div>
      )}
    </article>
  );
}
