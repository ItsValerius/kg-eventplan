import { revalidateLogic, useForm, useSelector } from "@tanstack/react-form";
import { useState } from "react";
import { focusFirstInvalid } from "@/components/admin/form-field";
import { emailSchema, newPasswordSchema } from "@/lib/account";
import { authClient } from "@/lib/auth-client";

const failed = "Das hat nicht geklappt. Bitte versuche es erneut.";

// What the server said to a password request: a message when it said no, `done` once
// it went through.
function useOutcome() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function run(request: () => Promise<string | null>) {
    setError("");
    try {
      const problem = await request();
      if (problem) setError(problem);
      else setDone(true);
    } catch {
      setError(failed);
    }
  }
  return { error, done, run, clear: () => setError("") };
}

// Requests a reset link. The answer is the same whether or not the address has an account.
export function useForgotPassword() {
  const outcome = useOutcome();
  const form = useForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: emailSchema },
    onSubmit: ({ value }) =>
      outcome.run(async () => {
        const { error } = await authClient.requestPasswordReset({
          email: emailSchema.parse(value).email,
          redirectTo: `${location.origin}/admin/passwort`,
        });
        if (error?.status === 429) return "Zu viele Anfragen. Bitte warte eine Minute.";
        return error ? failed : null;
      }),
    onSubmitInvalid: ({ formApi }) => {
      outcome.clear();
      focusFirstInvalid(formApi, ["email"]);
    },
  });
  const busy = useSelector(form.store, (state) => state.isSubmitting);
  return { form, busy, error: outcome.error, done: outcome.done };
}

// Sets the password with the token from an invitation or reset link.
export function useSetPassword(token: string) {
  const outcome = useOutcome();
  const form = useForm({
    defaultValues: { password: "", repeat: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: newPasswordSchema },
    onSubmit: ({ value }) =>
      outcome.run(async () => {
        const { error } = await authClient.resetPassword({ newPassword: value.password, token });
        if (error?.code === "INVALID_TOKEN")
          return "Der Link ist abgelaufen oder wurde schon benutzt.";
        return error ? failed : null;
      }),
    onSubmitInvalid: ({ formApi }) => {
      outcome.clear();
      focusFirstInvalid(formApi, ["password", "repeat"]);
    },
  });
  const busy = useSelector(form.store, (state) => state.isSubmitting);
  return { form, busy, error: outcome.error, done: outcome.done };
}
