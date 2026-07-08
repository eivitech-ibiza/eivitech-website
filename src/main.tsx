import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
import { CLERK_ENABLED, CLERK_PUBLISHABLE_KEY } from "./lib/config";
import { initLanguage } from "./lib/i18n";

const GITHUB_PAGES_REDIRECT_KEY = "eivitech_github_pages_redirect";

function restoreGitHubPagesRedirect() {
  if (typeof window === "undefined") return;

  const redirect = window.sessionStorage.getItem(GITHUB_PAGES_REDIRECT_KEY);
  if (!redirect) return;

  window.sessionStorage.removeItem(GITHUB_PAGES_REDIRECT_KEY);

  const base = import.meta.env.BASE_URL;
  const normalisedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const redirectPath = normalisedBase && redirect.startsWith(normalisedBase)
    ? redirect.slice(normalisedBase.length) || "/"
    : redirect;

  const finalPath = `${base}${redirectPath.replace(/^\//, "")}`;
  window.history.replaceState(null, "", finalPath);
}

restoreGitHubPagesRedirect();
initLanguage();

const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

createRoot(document.getElementById("root")!).render(
  CLERK_ENABLED ? (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl={`${import.meta.env.BASE_URL}`}
      signInFallbackRedirectUrl={`${import.meta.env.BASE_URL}dashboard`}
      signUpFallbackRedirectUrl={`${import.meta.env.BASE_URL}dashboard`}
    >
      {app}
    </ClerkProvider>
  ) : (
    app
  )
);
