import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Header, Footer, Main } from "@/components/shell";
import AdminPanel from "@/components/admin/panel";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { Accounts } from "@/components/admin/accounts";
import { Login } from "@/components/admin/login";
import { listAdmins } from "@/lib/server/accounts";
import { currentAdmin } from "@/lib/server/auth";
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
  const admin = await currentAdmin();
  if (!admin) return <Login />;
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminEvents selfId={admin.id} />
    </Suspense>
  );
}

async function AdminEvents({ selfId }: { selfId: string }) {
  const [events, accounts] = await Promise.all([readEvents(), listAdmins()]);
  return (
    <>
      <AdminPanel initialEvents={events} />
      <Accounts initialAccounts={accounts} selfId={selfId} />
    </>
  );
}
