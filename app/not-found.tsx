import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-[1280px] px-12 max-lg:px-[30px] max-md:px-5 max-[370px]:px-[15px] min-[1500px]:max-w-[1360px] min-h-[calc(100vh-212px)] pt-14 pb-[70px] max-md:pt-[34px] max-md:pb-[45px]"
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
  );
}
