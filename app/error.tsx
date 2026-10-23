"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Footer, Main } from "@/components/shell";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // The digest matches the server log entry for errors thrown while rendering on the server.
  useEffect(() => console.error(error.digest ?? error), [error]);

  return (
    <>
      <Main standalone>
        <h1>Kurze Pause im Programm.</h1>
        <p className="my-6">Die Seite konnte nicht geladen werden. Bitte versuche es erneut.</p>
        <Button variant="default" size="default" onClick={reset}>
          Erneut versuchen
        </Button>
      </Main>
      <Footer />
    </>
  );
}
