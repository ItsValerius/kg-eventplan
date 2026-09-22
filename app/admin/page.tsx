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
        className="mx-auto max-w-[1280px] px-12 max-lg:px-[30px] max-md:px-5 max-[370px]:px-[15px] min-[1500px]:max-w-[1360px] min-h-[calc(100vh-212px)] pt-14 pb-[70px] max-md:pt-[34px] max-md:pb-[45px]"
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
