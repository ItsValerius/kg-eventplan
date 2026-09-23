import type { Metadata } from "next";
import localFont from "next/font/local";
import { LucideProvider } from "lucide-react";
import "./globals.css";
import { season } from "@/lib/season";
import { siteUrl } from "@/lib/seo/structured-data";

const display = localFont({
  src: "../public/fonts/barlow-condensed-bold.woff2",
  variable: "--font-barlow",
  display: "swap",
});
const title = `Sessionsplan ${season.label} | Knallköpp Golkrath`;
const description = `Alle Termine der KG Knallköpp Golkrath für die Karnevalssession ${season.label}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Knallköpp Golkrath",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={display.variable}>
      <body>
        <a
          className="sr-only fixed top-2 left-4 z-50 bg-primary p-3 text-white focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-4 focus-visible:p-3"
          href="#main-content"
        >
          Zum Inhalt
        </a>
        {/* Lucide's default stroke is heavier than the club's line icons. */}
        <LucideProvider strokeWidth={1.7}>{children}</LucideProvider>
      </body>
    </html>
  );
}
