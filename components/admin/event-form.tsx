import { useSelector } from "@tanstack/react-form";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import type { EventFormApi } from "@/hooks/use-event-form";
import { eventLabel } from "@/lib/format";
import { season } from "@/lib/season";
import type { Draft, FieldName } from "./draft";
import { FormField } from "./form-field";

const id = (field: FieldName) => `field-${field}`;

export function EventForm({
  form,
  draft,
  busy,
  focusField,
  onClose,
}: {
  form: EventFormApi;
  // What the form opened with, to name the event being edited.
  draft: Draft;
  busy: boolean;
  focusField: FieldName;
  onClose: () => void;
}) {
  // Tells a stray dismissal from abandoning real edits.
  const edited = !useSelector(form.store, (state) => state.isDefaultValue);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  return (
    // Nothing closes it while saving. The close button closes right away, like "Abbrechen";
    // Escape or a backdrop click only ask first once something was changed.
    <Dialog
      open
      onOpenChange={(open, { reason }) => {
        if (open || busy) return;
        if (edited && reason !== "close-press") setConfirmingDiscard(true);
        else onClose();
      }}
    >
      <DialogContent
        // On touch screens focusing a text field pops the keyboard over the form, so start on
        // the panel itself there; the date of a copy opens no keyboard and stays focused.
        initialFocus={() =>
          focusField !== "date" && matchMedia("(pointer: coarse)").matches
            ? document.querySelector<HTMLElement>("[data-slot=dialog-content]")
            : document.getElementById(id(focusField))
        }
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto bg-background p-7.5 max-md:px-4 max-md:py-5 sm:max-w-2xl"
      >
        <form
          id="event-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogTitle className="pr-12 font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]">
            {draft.id ? "Termin bearbeiten" : "Ein neuer Grund zum Feiern."}
          </DialogTitle>
          {/* The list is hidden behind the scrim, so name the event being edited. */}
          {draft.id && (
            <DialogDescription className="mt-2 text-[13px]">{eventLabel(draft)}</DialogDescription>
          )}
          <FieldGroup className="mt-6.25 grid grid-cols-2 gap-5 max-md:gap-x-3 max-md:gap-y-4">
            <form.Field name="host">
              {(field) => (
                <FormField
                  field={field}
                  id={id("host")}
                  label="Verein"
                  optional
                  className="max-md:col-span-full"
                >
                  {(control) => (
                    <Input
                      {...control}
                      maxLength={120}
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value || null)}
                      placeholder="z. B. KG Knallköpp"
                    />
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="title">
              {(field) => (
                <FormField
                  field={field}
                  id={id("title")}
                  label="Titel"
                  className="max-md:col-span-full"
                >
                  {(control) => (
                    <Input
                      {...control}
                      required
                      maxLength={120}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="z. B. Biwak"
                    />
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="date">
              {(field) => (
                <FormField field={field} id={id("date")} label="Datum">
                  {(control) => (
                    <Input
                      {...control}
                      type="date"
                      required
                      min={season.firstDay}
                      max={season.lastDay}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="time">
              {(field) => (
                <FormField field={field} id={id("time")} label="Uhrzeit" optional>
                  {(control) => (
                    // Native time pickers on phones offer no way back to empty, hence the button.
                    <InputGroup>
                      <InputGroupInput
                        {...control}
                        type="time"
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value || null)}
                      />
                      {field.state.value && (
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            aria-label="Uhrzeit entfernen"
                            onClick={() => {
                              field.handleChange(null);
                              // The button goes away, so keep focus in the form; on touch
                              // screens that would reopen the picker.
                              if (!matchMedia("(pointer: coarse)").matches)
                                document.getElementById(id("time"))?.focus();
                            }}
                          >
                            <X size={16} />
                          </InputGroupButton>
                        </InputGroupAddon>
                      )}
                    </InputGroup>
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="location">
              {(field) => (
                <FormField
                  field={field}
                  id={id("location")}
                  label="Veranstaltungsort"
                  optional
                  className="col-span-full"
                >
                  {(control) => (
                    <Input
                      {...control}
                      maxLength={180}
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value || null)}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <FormField
                  field={field}
                  id={id("description")}
                  label="Beschreibung"
                  optional
                  className="col-span-full"
                >
                  {(control) => (
                    <Textarea
                      {...control}
                      rows={4}
                      maxLength={2000}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Was erwartet die Jecken?"
                    />
                  )}
                </FormField>
              )}
            </form.Field>
            <form.Field name="published">
              {(field) => (
                <Field orientation="horizontal" className="col-span-full gap-2.5">
                  <Switch
                    id="field-published"
                    className="mt-0.5"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
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
              )}
            </form.Field>
          </FieldGroup>
          <div className="mt-6.5 flex flex-wrap gap-3">
            <Button type="submit" variant="default" size="default" disabled={busy} aria-busy={busy}>
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
        <AlertDialog open={confirmingDiscard} onOpenChange={setConfirmingDiscard}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-[32px] leading-[1.03] font-bold tracking-[-.02em]">
                Änderungen verwerfen?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Weiter bearbeiten</AlertDialogCancel>
              <Button variant="destructive" onClick={onClose}>
                Verwerfen
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
