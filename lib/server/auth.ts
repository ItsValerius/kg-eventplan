import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
export const demoMode =
  process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD;
export const configured = Boolean(process.env.ADMIN_PASSWORD) || demoMode;
const password =
  process.env.ADMIN_PASSWORD || (demoMode ? "knallkoepp-demo" : "");
export const cookieName = "kg-admin";
function signature(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || password)
    .update(value)
    .digest("hex");
}
function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function checkPassword(input: string) {
  return configured && equal(signature(input), signature(password));
}
export function newSession() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expires}.${signature(expires)}`;
}
export async function isAdmin() {
  if (!configured) return false;
  const token = (await cookies()).get(cookieName)?.value || "";
  const [expires, signed] = token.split(".");
  return Boolean(
    expires &&
    signed &&
    Number(expires) > Date.now() &&
    equal(signed, signature(expires)),
  );
}
