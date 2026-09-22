import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Header, Footer } from "../components/shell";
import AdminPanel from "./panel";
import { configured, demoMode, isAdmin } from "@/lib/auth";
import { readEvents } from "@/lib/store";
export const metadata: Metadata = {
  title: "Terminverwaltung | Knallköpp Golkrath",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-12 max-lg:px-7.5 max-md:px-5 max-[370px]:px-3.75 min-[1500px]:max-w-340 min-h-[calc(100vh-212px)] pt-14 pb-17.5 max-md:pt-8.5 max-md:pb-11.25"
      >
        <Suspense fallback={<p role="status">Terminverwaltung wird geladen …</p>}>
          <AdminContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function AdminContent() {
  await connection();
  const authenticated = await isAdmin();
  return (
        <AdminPanel
          key={authenticated ? "authenticated" : "anonymous"}
          authenticated={authenticated}
          configured={configured}
          demo={demoMode}
          initialEvents={authenticated ? await readEvents() : []}
        />
  );
}
