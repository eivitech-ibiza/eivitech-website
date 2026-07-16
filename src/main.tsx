import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { CURRENT_LANGUAGE, initLanguage, registerDutchTranslations } from "./lib/i18n";
import { setDefaultConsent } from "./lib/tracking";

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

async function bootstrap() {
  setDefaultConsent();
  restoreGitHubPagesRedirect();
  initLanguage();

  if (CURRENT_LANGUAGE === "nl") {
    const { DUTCH_TRANSLATIONS } = await import("./lib/nlTranslations");
    registerDutchTranslations(DUTCH_TRANSLATIONS);
  }

  const { default: App } = await import("./App.tsx");

  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}

void bootstrap();
