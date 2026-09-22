import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "./components/shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seite nicht gefunden | Knallköpp Golkrath",
  robots: { index: false },
};
export default function NotFound() {
  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-12 max-lg:px-7.5 max-md:px-5 max-[370px]:px-3.75 min-[1500px]:max-w-340 min-h-[calc(100vh-212px)] pt-14 pb-17.5 max-md:pt-8.5 max-md:pb-11.25"
      >
        <h1>Hier ist gerade kein Termin.</h1>
        <p className="my-6">
          Diese Seite gibt es nicht. Alle Veranstaltungen findest du im
          Sessionsplan.
        </p>
        <Button
          variant="default"
          size="default"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Zum Sessionsplan
        </Button>
      </main>
      <Footer />
    </>
  );
}
