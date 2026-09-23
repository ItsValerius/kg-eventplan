import type { Metadata } from "next";
import { Suspense } from "react";
import { SetPassword } from "@/components/admin/password-forms";
import { Footer, Header, Main } from "@/components/shell";

export const metadata: Metadata = {
  title: "Passwort festlegen | Knallköpp Golkrath",
  robots: { index: false, follow: false },
};

// Invitation and reset links land here with ?token=… (or ?error=INVALID_TOKEN).
export default function SetPasswordPage() {
  return (
    <>
      <Header />
      <Main standalone>
        <Suspense>
          <SetPassword />
        </Suspense>
      </Main>
      <Footer />
    </>
  );
}
