// Server action failures carry a German message; anything else gets the fallback.
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
