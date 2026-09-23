import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Centered page width with responsive gutters, shared by header, content and footer.
const pageWidth =
  "mx-auto max-w-7xl px-12 max-lg:px-7.5 max-md:px-5 max-[370px]:px-3.75 min-[1500px]:max-w-340";

// Skip-link target. Standalone pages (admin, errors) fill the viewport with roomier padding.
export function Main({
  standalone = false,
  children,
}: {
  standalone?: boolean;
  children: ReactNode;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        pageWidth,
        standalone && "min-h-[calc(100vh-212px)] pt-14 pb-17.5 max-md:pt-8.5 max-md:pb-11.25",
      )}
    >
      {children}
    </main>
  );
}

export function Header() {
  return (
    <header className="border-b border-border">
      <div className={cn(pageWidth, "flex h-25 items-center justify-between gap-6 max-md:h-20.5 max-md:gap-3")}>
        <Link
          className="flex items-center gap-3 max-md:gap-2 [&>span]:font-display [&>span]:text-[27px] [&>span]:leading-[1.1] [&>span]:tracking-wide [&>span>span]:mt-1.5 [&>span>span]:block [&>span>span]:font-sans [&>span>span]:text-[11px] [&>span>span]:font-semibold [&>span>span]:tracking-[.12em] max-md:[&>span]:text-[23px] max-md:[&>span>span]:mt-1.25 max-md:[&>span>span]:text-[11px] max-md:[&>img]:size-10.75"
          href="/"
          aria-label="Knallköpp Golkrath – zum Sessionsplan"
        >
          <Image
            src="/images/club-logo.png"
            alt=""
            width={54}
            height={54}
            preload
          />
          <span>
            KNALLKÖPP<span>GOLKRATH · SEIT 1929</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className={cn(pageWidth, "flex items-center justify-between gap-6 border-t border-border pt-6.75 pb-8 text-xs [&>div>span]:text-muted-foreground [&>p]:text-xs [&>p]:italic max-md:flex-wrap max-md:items-start max-md:gap-5 max-md:py-6 max-md:[&>p]:hidden print:hidden")}>
      <div>
        <Link href="/" className="block py-1 font-semibold">
          KG Knallköpp Golkrath e.V.
        </Link>
        <span>Karneval zum Anfassen. Seit 1929.</span>
      </div>
      <p>Jolkere Knall Mött!</p>
      <div className="flex gap-5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a:hover]:underline max-md:gap-3.75">
        <a href="https://www.knallkoepp-golkrath.de/impressum/">Impressum</a>
        <a href="https://www.knallkoepp-golkrath.de/datenschutzerklärung/">
          Datenschutz
        </a>
      </div>
    </footer>
  );
}
