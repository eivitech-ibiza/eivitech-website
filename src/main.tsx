import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { setDefaultConsent } from "./lib/tracking";

const GITHUB_PAGES_REDIRECT_KEY = "eivitech_github_pages_redirect";
const LANGUAGE_PREFIX_PATTERN = /^\/(es|it|en|nl)(?=\/|$)/i;
const SUPPORTED_LANGUAGE_CODES = new Set(["es", "it", "en", "nl"]);

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

function migrateLegacyLanguageQuery() {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const requested = (url.searchParams.get("lang") || "").toLowerCase().split("-")[0];
  if (!SUPPORTED_LANGUAGE_CODES.has(requested)) return false;

  const base = import.meta.env.BASE_URL || "/";
  const normalisedBase = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;
  const appPath = normalisedBase && url.pathname.startsWith(normalisedBase)
    ? url.pathname.slice(normalisedBase.length) || "/"
    : url.pathname || "/";
  const unprefixedPath = appPath.replace(LANGUAGE_PREFIX_PATTERN, "") || "/";
  const suffix = unprefixedPath === "/" ? "/" : unprefixedPath.startsWith("/") ? unprefixedPath : `/${unprefixedPath}`;
  const canonicalPath = `${normalisedBase}/${requested}${suffix}`;

  url.searchParams.delete("lang");
  const query = url.searchParams.toString();
  const target = `${canonicalPath}${query ? `?${query}` : ""}${url.hash}`;

  if (`${url.pathname}${url.search}${url.hash}` === target) return false;
  window.location.replace(target);
  return true;
}

async function bootstrap() {
  setDefaultConsent();
  restoreGitHubPagesRedirect();

  // Canonicalize pre-migration links such as /?lang=it before React starts.
  if (migrateLegacyLanguageQuery()) return;

  // Import i18n only after a GitHub Pages 404 redirect has restored the real URL.
  // CURRENT_LANGUAGE can therefore be derived from /es/, /en/, /it/ or /nl/.
  const {
    CURRENT_LANGUAGE,
    initLanguage,
    registerDutchTranslations,
  } = await import("./lib/i18n");

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
