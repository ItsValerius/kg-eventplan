import { toast } from "@/components/ui/toast";

// Feedback floats as toasts, so the lists never shift. Errors stay until dismissed.
export const notify = (title: string) => toast.add({ title, type: "success", timeout: 3000 });
export const fail = (title: string) => toast.add({ title, type: "error", timeout: 0 });

// Server action failures carry a German message; anything else gets the fallback.
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
