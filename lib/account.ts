import { z } from "zod";

// Admin account forms. Password limits match emailAndPassword in lib/server/auth.ts.
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 256;

const email = z.email({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }).trim().toLowerCase();

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Bitte gib das Passwort ein." })
    .min(1, "Bitte gib das Passwort ein.")
    .max(1024, "Das Passwort ist zu lang."),
});

export const emailSchema = z.object({ email });

export const inviteSchema = z.object({
  name: z
    .string({ error: "Bitte gib einen Namen ein." })
    .trim()
    .min(1, "Bitte gib einen Namen ein.")
    .max(80, "Der Name darf höchstens 80 Zeichen lang sein."),
  email,
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Das Passwort muss mindestens ${PASSWORD_MIN} Zeichen lang sein.`)
      .max(PASSWORD_MAX, `Das Passwort darf höchstens ${PASSWORD_MAX} Zeichen lang sein.`),
    repeat: z.string(),
  })
  .refine((value) => value.password === value.repeat, {
    error: "Die Passwörter stimmen nicht überein.",
    path: ["repeat"],
  });

export const adminIdSchema = z.object({ id: z.string().trim().min(1, "Der Zugang fehlt.") });
