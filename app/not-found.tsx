import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer, Main } from "@/components/shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seite nicht gefunden | Knallköpp Golkrath",
  robots: { index: false },
};
export default function NotFound() {
  return (
    <>
      <Main standalone>
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
      </Main>
      <Footer />
    </>
  );
}
