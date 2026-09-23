import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/server/auth";

// Sign-in and sign-out go through here, so Better Auth's rate limiting applies.
export const { GET, POST } = toNextJsHandler(auth);
