"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-[1280px] px-12 max-lg:px-[30px] max-md:px-5 max-[370px]:px-[15px] min-[1500px]:max-w-[1360px] min-h-[calc(100vh-212px)] pt-14 pb-[70px] max-md:pt-[34px] max-md:pb-[45px]"
    >
      <h1>Kurze Pause im Programm.</h1>
      <p className="my-6">
        Die Termine konnten nicht geladen werden. Bitte versuche es erneut.
      </p>
      <Button variant="default" size="default" onClick={reset}>
        Erneut versuchen
      </Button>
    </main>
  );
}
