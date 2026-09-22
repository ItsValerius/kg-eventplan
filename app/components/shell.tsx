import Image from "next/image";
import Link from "next/link";
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-12 max-lg:px-[30px] max-md:px-5 max-[370px]:px-[15px] min-[1500px]:max-w-[1360px] flex h-[100px] items-center justify-between gap-6 max-md:h-[82px] max-md:gap-3">
        <Link
          className="flex items-center gap-3 max-md:gap-2 [&>span]:font-display [&>span]:text-[27px] [&>span]:leading-[1.1] [&>span]:tracking-[.025em] [&>span>span]:mt-1.5 [&>span>span]:block [&>span>span]:font-sans [&>span>span]:text-[9px] [&>span>span]:font-semibold [&>span>span]:tracking-[.12em] max-md:[&>span]:text-[23px] max-md:[&>span>span]:mt-[5px] max-md:[&>span>span]:text-[7px] max-md:[&>img]:size-[43px]"
          href="/"
          aria-label="Knallköpp Golkrath – zum Sessionsplan"
        >
          <Image
            src="/images/club-logo.png"
            alt=""
            width={54}
            height={54}
            priority
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
    <footer className="mx-auto max-w-[1280px] px-12 max-lg:px-[30px] max-md:px-5 max-[370px]:px-[15px] min-[1500px]:max-w-[1360px] flex items-center justify-between gap-6 border-t border-border pt-[27px] pb-8 text-xs [&>div>span]:text-muted-foreground [&>p]:text-xs [&>p]:italic max-md:flex-wrap max-md:items-start max-md:gap-5 max-md:py-6 max-md:[&>p]:hidden print:hidden">
      <div>
        <Link href="/" className="mb-[5px] block font-semibold">
          KG Knallköpp Golkrath e.V.
        </Link>
        <span>Karneval zum Anfassen. Seit 1929.</span>
      </div>
      <p>Jolkere Knall Mött!</p>
      <div className="flex gap-5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a:hover]:underline max-md:gap-[15px]">
        <a href="https://www.knallkoepp-golkrath.de/impressum/">Impressum</a>
        <a href="https://www.knallkoepp-golkrath.de/datenschutzerklärung/">
          Datenschutz
        </a>
      </div>
    </footer>
  );
}
