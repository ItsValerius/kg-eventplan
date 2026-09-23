import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Header, Footer, Main } from "@/components/shell";
import AdminPanel from "@/components/admin/panel";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { Login } from "@/components/admin/login";
import { configured, demoMode, isAdmin } from "@/lib/server/auth";
import { readEvents } from "@/lib/server/store";
export const metadata: Metadata = {
  title: "Terminverwaltung | Knallköpp Golkrath",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return (
    <>
      <Header />
      <Main standalone>
        <Suspense fallback={<AdminFallback />}>
          <AdminContent />
        </Suspense>
      </Main>
      <Footer />
    </>
  );
}

async function AdminContent() {
  await connection();
  if (!(await isAdmin())) return <Login configured={configured} demo={demoMode} />;
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminEvents />
    </Suspense>
  );
}

async function AdminEvents() {
  return <AdminPanel initialEvents={await readEvents()} />;
}
