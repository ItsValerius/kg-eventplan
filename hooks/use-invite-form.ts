import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useState } from "react";
import { focusFirstInvalid } from "@/components/admin/form-field";
import { inviteSchema, type InviteInput } from "@/lib/account";

const fields = ["name", "email"] as const;

// The invitation dialog and its form. `invite` resolves to whether it worked; the dialog
// then closes.
export function useInviteForm(invite: (input: InviteInput) => Promise<boolean>) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    defaultValues: { name: "", email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: inviteSchema },
    onSubmit: async ({ value }) => {
      if (await invite(inviteSchema.parse(value))) setIsOpen(false);
    },
    // Each problem shows under its field and focus moves to the first one, like the event form.
    onSubmitInvalid: ({ formApi }) =>
      void focusFirstInvalid(formApi, fields, (field) => `invite-${field}`),
  });

  function open() {
    form.reset();
    setIsOpen(true);
  }

  return { form, isOpen, open, close: () => setIsOpen(false) };
}
