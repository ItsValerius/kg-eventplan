import { revalidateLogic, useForm, useSelector } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { focusFirstInvalid } from "@/components/admin/form-field";
import { loginSchema } from "@/lib/account";
import { authClient } from "@/lib/auth-client";

// Better Auth answers wrong credentials with 401 and too many attempts with 429.
function signInError(status: number) {
  if (status === 401)
    return "E-Mail-Adresse oder Passwort stimmen nicht. Bitte versuche es erneut.";
  if (status === 429)
    return "Zu viele Versuche. Bitte warte ein paar Minuten und versuche es erneut.";
  return "Anmelden fehlgeschlagen. Bitte versuche es erneut.";
}

// Signs in, then refreshes so the page renders the admin; busy until it has. `error` is
// what the server said no with.
export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [transitioning, startTransition] = useTransition();
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        const { error } = await authClient.signIn.email(loginSchema.parse(value));
        if (error) setError(signInError(error.status));
        else startTransition(() => router.refresh());
      } catch {
        setError(signInError(0));
      }
    },
    onSubmitInvalid: ({ formApi }) => {
      setError("");
      focusFirstInvalid(formApi, ["email", "password"]);
    },
  });
  const submitting = useSelector(form.store, (state) => state.isSubmitting);
  return { form, error, busy: submitting || transitioning };
}
