import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { errorMessage, fail } from "@/components/admin/feedback";
import { authClient } from "@/lib/auth-client";

// Signs out, then refreshes so the page renders the login. `leaving` stays set until then.
export function useLogout() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [transitioning, startTransition] = useTransition();

  async function logout() {
    setSigningOut(true);
    setLeaving(true);
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error();
      startTransition(() => router.refresh());
    } catch (e) {
      fail(errorMessage(e, "Abmelden fehlgeschlagen. Bitte versuche es erneut."));
      setLeaving(false);
    } finally {
      setSigningOut(false);
    }
  }

  return { leaving, signingOut, transitioning, logout };
}
