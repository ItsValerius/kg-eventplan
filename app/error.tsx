"use client";
import { Button } from "@/components/ui/button";
import { Footer, Main } from "@/components/shell";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <Main standalone>
        <h1>Kurze Pause im Programm.</h1>
        <p className="my-6">
          Die Termine konnten nicht geladen werden. Bitte versuche es erneut.
        </p>
        <Button variant="default" size="default" onClick={reset}>
          Erneut versuchen
        </Button>
      </Main>
      <Footer />
    </>
  );
}
