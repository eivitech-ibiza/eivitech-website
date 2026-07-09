import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CookieConsent } from "@/components/CookieConsent";
import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";
import { initTrackingFromStoredConsent } from "@/lib/tracking";

export function Layout() {
  useEffect(() => {
    captureUtm();
    initTrackingFromStoredConsent();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CookieConsent />
      <ScrollRestoration />
    </div>
  );
}
