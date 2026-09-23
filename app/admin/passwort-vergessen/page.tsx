import type { Metadata } from "next";
import { ForgotPassword } from "@/components/admin/password-forms";
import { Footer, Header, Main } from "@/components/shell";

export const metadata: Metadata = {
  title: "Passwort vergessen | Knallköpp Golkrath",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <Main standalone>
        <ForgotPassword />
      </Main>
      <Footer />
    </>
  );
}
