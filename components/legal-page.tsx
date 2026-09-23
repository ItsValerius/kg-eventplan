import type { ReactNode } from "react";
import { club } from "@/lib/club";
import { Footer, Header, Main } from "./shell";

// Shared frame and reading typography for the Impressum and the Datenschutzerklärung.
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Header />
      <Main standalone>
        <article className="max-w-[68ch] [&_a]:text-primary [&_a]:underline [&_address]:mt-3 [&_address]:not-italic [&_address]:leading-[1.75] [&_address]:text-muted-foreground [&_h2]:mt-11 [&_h2]:font-sans [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-normal [&_h3]:mt-7 [&_h3]:text-[15px] [&_h3]:font-semibold [&_li]:mt-1.5 [&_li]:text-muted-foreground [&_p]:mt-3 [&_p]:leading-[1.75] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-[1.75]">
          <h1 className="text-[clamp(2.5rem,7vw,3.5rem)]">{title}</h1>
          {children}
        </article>
      </Main>
      <Footer />
    </>
  );
}

// Name, postal address and contact block used on both pages.
export function ClubAddress() {
  return (
    <address>
      {club.legalName}
      <br />
      ({club.name})
      <br />
      {club.street}
      <br />
      {club.city}
      <br />
      E-Mail: <a href={`mailto:${club.email}`}>{club.email}</a>
    </address>
  );
}
