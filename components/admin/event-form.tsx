import { Check, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormEvent, ReactNode, Ref } from "react";
import { season } from "@/lib/season";
import type { Draft, FieldName } from "./draft";

// Label, control and inline error for one form field; the control gets fieldProps.
function EventField({
  name,
  label,
  optional = false,
  error,
  className,
  children,
}: {
  name: FieldName;
  label: string;
  optional?: boolean;
  error: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={`field-${name}`} className="gap-1 text-xs font-semibold">
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </FieldLabel>
      {children}
      <FieldError id={`field-${name}-error`} className="text-xs">
        {error}
      </FieldError>
    </Field>
  );
}

export function EventForm({
  draft,
  fieldErrors,
  busy,
  firstFieldRef,
  onUpdate,
  onSubmit,
  onClose,
}: {
  draft: Draft;
  fieldErrors: Partial<Record<FieldName, string>>;
  busy: boolean;
  firstFieldRef: Ref<HTMLInputElement>;
  onUpdate: (field: FieldName | "published", value: string | boolean | null) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
}) {
  function fieldProps(field: FieldName) {
    return {
      id: `field-${field}`,
      "aria-invalid": fieldErrors[field] ? true : undefined,
      "aria-describedby": fieldErrors[field] ? `field-${field}-error` : undefined,
    };
  }
  return (
    <form
      className={`scroll-mt-6 rounded-xl border border-border bg-muted p-7.5 max-md:px-4 max-md:py-5 ${draft.id ? "col-span-full mt-2" : "my-7.5"}`}
      id="event-form"
      noValidate
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3 [&_h2]:text-[35px] max-md:[&_h2]:text-[29px]">
        <h2>{draft.id ? "Termin bearbeiten" : "Ein neuer Grund zum Feiern."}</h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Formular schließen"
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      <FieldGroup className="mt-6.25 grid grid-cols-2 gap-5 max-md:gap-x-3 max-md:gap-y-4">
        <EventField
          name="host"
          label="Verein"
          optional
          error={fieldErrors.host}
          className="max-md:col-span-full"
        >
          <Input
            ref={firstFieldRef}
            {...fieldProps("host")}
            maxLength={120}
            value={draft.host ?? ""}
            onChange={(e) => onUpdate("host", e.target.value || null)}
            placeholder="z. B. KG Knallköpp"
          />
        </EventField>
        <EventField name="title" label="Titel" error={fieldErrors.title} className="max-md:col-span-full">
          <Input
            {...fieldProps("title")}
            required
            maxLength={120}
            value={draft.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="z. B. Biwak"
          />
        </EventField>
        <EventField name="date" label="Datum" error={fieldErrors.date}>
          <Input
            {...fieldProps("date")}
            type="date"
            required
            min={season.firstDay}
            max={season.lastDay}
            value={draft.date}
            onChange={(e) => onUpdate("date", e.target.value)}
          />
        </EventField>
        <EventField name="time" label="Uhrzeit" optional error={fieldErrors.time}>
          <Input
            {...fieldProps("time")}
            type="time"
            value={draft.time ?? ""}
            onChange={(e) => onUpdate("time", e.target.value || null)}
          />
        </EventField>
        <EventField
          name="location"
          label="Veranstaltungsort"
          optional
          error={fieldErrors.location}
          className="col-span-full"
        >
          <Input
            {...fieldProps("location")}
            maxLength={180}
            value={draft.location ?? ""}
            onChange={(e) => onUpdate("location", e.target.value || null)}
          />
        </EventField>
        <EventField
          name="description"
          label="Beschreibung"
          optional
          error={fieldErrors.description}
          className="col-span-full"
        >
          <Textarea
            {...fieldProps("description")}
            rows={4}
            maxLength={2000}
            value={draft.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="Was erwartet die Jecken?"
          />
        </EventField>
        <Field orientation="horizontal" className="col-span-full gap-2.5">
          <Checkbox
            id="field-published"
            checked={draft.published}
            onCheckedChange={(checked) => onUpdate("published", checked)}
          />
          <FieldContent>
            <FieldLabel htmlFor="field-published" className="text-xs font-semibold">
              Termin veröffentlichen
            </FieldLabel>
            <FieldDescription className="text-xs">
              Nur veröffentlichte Termine erscheinen im öffentlichen Kalender.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
      <div className="mt-6.5 flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="default"
          size="default"
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? "Wird gespeichert …" : "Termin speichern"}
          {busy ? <Spinner aria-hidden className="size-4.5" /> : <Check size={18} />}
        </Button>
        <Button
          variant="outline"
          size="default"
          type="button"
          disabled={busy}
          onClick={onClose}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
