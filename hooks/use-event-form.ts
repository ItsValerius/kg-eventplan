import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { z } from "zod";
import {
  blank,
  copyOf,
  fieldOrder,
  focusFor,
  type Draft,
  type FieldName,
} from "@/components/admin/draft";
import { fail } from "@/components/admin/feedback";
import { focusFirstInvalid } from "@/components/admin/form-field";
import { eventSchema, validationMessage, type ClubEvent, type EventInput } from "@/lib/events";

// The event form dialog: what it opened with (null when closed), the field it focuses
// first, and the TanStack form holding the edits. `save` resolves to whether it worked.
// The schema checks what the form holds; its preprocessing accepts any input.
const draftSchema = eventSchema as z.ZodType<EventInput, Draft>;

export function useEventForm(
  events: ClubEvent[],
  save: (draft: Draft, event: EventInput) => Promise<boolean>,
) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [focusField, setFocusField] = useState<FieldName>("host");

  const form = useForm({
    // Always the draft the dialog opened with: useForm re-applies changed defaults to an
    // untouched form on every render, so anything else would overwrite the opened values.
    defaultValues: draft ?? blank(events),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: draftSchema },
    onSubmit: async ({ value }) => {
      if (await save(value, draftSchema.parse(value))) close();
    },
    // Each problem shows under its field and focus moves to the first one.
    onSubmitInvalid: ({ value, formApi }) => {
      if (focusFirstInvalid(formApi, fieldOrder, (field) => `field-${field}`)) return;
      const { error } = draftSchema.safeParse(value);
      if (error) fail(validationMessage(error));
    },
  });

  function open(event?: ClubEvent, copy = false) {
    const next = event ? (copy ? copyOf(event) : { ...event }) : blank(events);
    form.reset(next);
    setDraft(next);
    setFocusField(focusFor(event, copy));
  }

  // The dialog returns focus to the button that opened it.
  function close() {
    setDraft(null);
  }

  // Keeps an open form in step with a publication change made from the list.
  function syncPublished(id: string, published: boolean) {
    if (form.getFieldValue("id") === id) form.setFieldValue("published", published);
  }

  return { form, draft, focusField, open, close, syncPublished };
}

export type EventFormApi = ReturnType<typeof useEventForm>["form"];
