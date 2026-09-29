import { Link, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CookieConsent } from "@/components/CookieConsent";
import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";
import { initTrackingFromStoredConsent, track } from "@/lib/tracking";
import { tr } from "@/lib/i18n";

export function Layout() {
  const { pathname } = useLocation();
  const crmWorkspace = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!crmWorkspace) {
      captureUtm();
      initTrackingFromStoredConsent();
    }

    const handleTrackedContactClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      const href = target.getAttribute("href") || "";
      const path = window.location.pathname;
      if (/^(?:https?:\/\/)?(?:wa\.me\/|api\.whatsapp\.com\/|web\.whatsapp\.com\/)/i.test(href)) {
        track("whatsapp_click", { path, contact_channel: "whatsapp" });
      } else if (href.startsWith("tel:")) {
        track("phone_click", { path, contact_channel: "phone" });
      } else if (href.startsWith("mailto:")) {
        track("email_click", { path, contact_channel: "email" });
      }
    };

    document.addEventListener("click", handleTrackedContactClick);
    return () => document.removeEventListener("click", handleTrackedContactClick);
    // Tracking bootstrap must run once for the initial route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {crmWorkspace && (
        <nav className="border-b border-border bg-card" aria-label="CRM workspace">
          <div className="container-x flex flex-wrap items-center gap-2 py-2 text-sm">
            <Link
              to="/dashboard"
              className={`rounded-sm px-3 py-2 transition ${pathname === "/dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              CRM
            </Link>
            <Link
              to="/dashboard/email-marketing"
              className={`rounded-sm px-3 py-2 transition ${pathname.startsWith("/dashboard/email-marketing") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              {tr("Email marketing", "Email marketing", "Email marketing", "E-mailmarketing")}
            </Link>
            <Link
              to="/dashboard/meta"
              className={`rounded-sm px-3 py-2 transition ${pathname.startsWith("/dashboard/meta") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              Meta
            </Link>
          </div>
        </nav>
      )}
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
