import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "../public/fonts/barlow-condensed-bold.ttf",
  variable: "--font-barlow",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Sessionsplan 2026/2027 | Knallköpp Golkrath",
  description:
    "Die Karnevalssession der KG Knallköpp Golkrath: Veranstaltungen, Termine und gemeinsame Vorfreude auf 2026/2027.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={display.variable}>
      <body>
        <a
          className="sr-only fixed top-2 left-4 z-50 bg-primary p-3 text-white focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-4 focus-visible:p-3"
          href="#main-content"
        >
          Zum Inhalt
        </a>
        {children}
      </body>
    </html>
  );
}
