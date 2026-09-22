"use client";
import { Button } from "@/components/ui/button";
import { Footer } from "./components/shell";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-12 max-lg:px-7.5 max-md:px-5 max-[370px]:px-3.75 min-[1500px]:max-w-340 min-h-[calc(100vh-212px)] pt-14 pb-17.5 max-md:pt-8.5 max-md:pb-11.25"
      >
        <h1>Kurze Pause im Programm.</h1>
        <p className="my-6">
          Die Termine konnten nicht geladen werden. Bitte versuche es erneut.
        </p>
        <Button variant="default" size="default" onClick={reset}>
          Erneut versuchen
        </Button>
      </main>
      <Footer />
    </>
  );
}
