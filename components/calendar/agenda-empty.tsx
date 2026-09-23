import { CalendarDays } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatDate } from "@/lib/format";
import { season } from "@/lib/season";

// Why nothing is listed: no events yet, an empty month, or the session is over.
function emptyMessage(hasEvents: boolean, month: string | null, today: string) {
  const over = today > season.end;
  if (!hasEvents)
    return {
      title: "Die Session nimmt Gestalt an.",
      description: "Sobald die ersten Termine feststehen, findest du sie hier.",
    };
  if (month) {
    const name = formatDate(`${month}-01`, { month: "long" });
    return {
      title:
        over || month < today.slice(0, 7)
          ? `Im ${name} gab es keine Termine.`
          : `Für ${name} stehen noch keine Termine fest.`,
    };
  }
  if (over)
    return {
      title: `Die Session ${season.label} ist vorbei.`,
      description: "Alle Termine findest du weiterhin über die Monate.",
    };
  return { title: "Weitere Termine stehen noch nicht fest." };
}

export function AgendaEmpty({
  hasEvents,
  month,
  today,
}: {
  hasEvents: boolean;
  month: string | null;
  today: string;
}) {
  const { title, description } = emptyMessage(hasEvents, month, today);
  return (
    <Empty className="mt-5.5 rounded-none bg-muted px-5 py-12 max-md:px-3.5">
      <EmptyHeader className="max-w-[46ch]">
        <EmptyMedia className="mb-1 text-primary">
          <CalendarDays size={28} />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-semibold tracking-normal">{title}</EmptyTitle>
        {description && <EmptyDescription className="text-[13px]">{description}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  );
}
