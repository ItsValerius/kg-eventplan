import type { Metadata } from "next";
import localFont from "next/font/local";
import { LucideProvider } from "lucide-react";
import "./globals.css";
import { season } from "@/lib/season";
import { siteUrl } from "@/lib/seo/structured-data";
import { ThemeProvider } from "@/components/theme-provider";

const display = localFont({
  src: "../public/fonts/barlow-condensed-bold.woff2",
  variable: "--font-barlow",
  display: "swap",
});
const title = `Sessionsplan ${season.label} | Knallköpp Golkrath`;
// The PDF is optional, so the description does not promise it.
const description = `Der Sessionsplan der KG Knallköpp Golkrath e.V.: alle Termine der Karnevalssession ${season.label} mit Datum, Uhrzeit und Ort auf einen Blick.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  // Search Console ownership; removing it unverifies the property.
  verification: { google: "1yRwO21vlaOTOE1KRUQzk_DCseEy-P5UMHhV7sh7Jh0" },
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
    // next-themes sets the dark class before hydration.
    <html lang="de" className={display.variable} suppressHydrationWarning>
      <body>
        <a
          className="sr-only fixed top-2 left-4 z-50 bg-primary p-3 text-primary-foreground focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-4 focus-visible:p-3"
          href="#main-content"
        >
          Zum Inhalt
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Lucide's default stroke is heavier than the club's line icons. */}
          <LucideProvider strokeWidth={1.7}>{children}</LucideProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
