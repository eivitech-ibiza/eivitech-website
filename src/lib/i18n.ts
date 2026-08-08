export type Language = "es" | "it" | "en" | "nl";
export type LanguageSelection = Language | "auto";

const FALLBACK_LANGUAGE: Language = "es";
const UNSUPPORTED_BROWSER_FALLBACK: Language = "en";
const STORAGE_KEY = "eivitech_language";
export const SUPPORTED_LANGUAGES: Language[] = ["es", "it", "en", "nl"];

let dutchTranslations: Readonly<Record<string, string>> = {};

function normalisedBasePath() {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") return "";
  return `/${base.replace(/^\/+|\/+$/g, "")}`;
}

function appPathname(pathname: string) {
  const base = normalisedBasePath();
  if (!base) return pathname || "/";
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || "/";
  return pathname || "/";
}

function withBasePath(pathname: string) {
  const base = normalisedBasePath();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}` || "/";
}

export function normaliseLanguage(value?: string | null): Language | null {
  if (!value) return null;
  const code = value.toLowerCase().split("-")[0];
  if (SUPPORTED_LANGUAGES.includes(code as Language)) return code as Language;
  return null;
}

export function stripLanguagePrefix(pathname: string) {
  const appPath = appPathname(pathname);
  const match = appPath.match(/^\/(es|it|en|nl)(?=\/|$)/i);
  if (!match) return appPath || "/";
  const stripped = appPath.slice(match[0].length);
  return stripped || "/";
}

export function localizePath(pathname: string, language: Language) {
  const cleanPath = stripLanguagePrefix(pathname);
  const suffix = cleanPath === "/" ? "/" : cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return withBasePath(`/${language}${suffix}`);
}

export function languageBasename(language: Language) {
  const base = normalisedBasePath();
  return `${base}/${language}`;
}

function readLanguageFromPath(): Language | null {
  if (typeof window === "undefined") return null;
  const path = appPathname(window.location.pathname);
  const match = path.match(/^\/(es|it|en|nl)(?=\/|$)/i);
  return normaliseLanguage(match?.[1]);
}

function readLanguageFromUrl(): LanguageSelection | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("lang");
  if (value === "auto") return "auto";
  return normaliseLanguage(value);
}

function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;
  for (const candidate of window.navigator.languages || [window.navigator.language]) {
    const lang = normaliseLanguage(candidate);
    if (lang) return lang;
  }
  return UNSUPPORTED_BROWSER_FALLBACK;
}

export function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  return normaliseLanguage(window.localStorage.getItem(STORAGE_KEY));
}

export function detectLanguage(): Language {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;

  const pathLanguage = readLanguageFromPath();
  if (pathLanguage) return pathLanguage;

  // Legacy support for pre-migration links such as ?lang=en.
  const urlLanguage = readLanguageFromUrl();
  if (urlLanguage === "auto") return detectBrowserLanguage();
  if (urlLanguage) return urlLanguage;

  return getStoredLanguage() || FALLBACK_LANGUAGE;
}

export const CURRENT_LANGUAGE: Language = detectLanguage();

export const htmlLocaleByLanguage: Record<Language, string> = {
  es: "es-ES",
  it: "it-IT",
  en: "en-GB",
  nl: "nl-NL",
};

export const openGraphLocaleByLanguage: Record<Language, string> = {
  es: "es_ES",
  it: "it_IT",
  en: "en_GB",
  nl: "nl_NL",
};

export const hreflangByLanguage: Record<Language, string> = {
  es: "es",
  it: "it",
  en: "en",
  nl: "nl",
};

export function initLanguage() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = htmlLocaleByLanguage[CURRENT_LANGUAGE];
}

export function registerDutchTranslations(translations: Readonly<Record<string, string>>) {
  dutchTranslations = translations;
}

export function persistLanguageSelection(selection: LanguageSelection) {
  if (typeof window === "undefined") return;
  if (selection === "auto") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, selection);
  }
}

export function languageSelectionHref(selection: LanguageSelection) {
  if (typeof window === "undefined") {
    const language = selection === "auto" ? FALLBACK_LANGUAGE : selection;
    return localizePath("/", language);
  }

  const url = new URL(window.location.href);
  const language = selection === "auto" ? detectBrowserLanguage() : selection;
  url.pathname = localizePath(url.pathname, language);
  url.searchParams.delete("lang");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function changeLanguage(selection: LanguageSelection) {
  if (typeof window === "undefined") return;
  persistLanguageSelection(selection);
  window.location.assign(languageSelectionHref(selection));
}

function translateDutchDynamic(english: string) {
  const exact = dutchTranslations[english];
  if (exact) return exact;

  const languageOption = english.match(/^Change language to (.+)$/);
  if (languageOption) return `Taal wijzigen naar ${languageOption[1]}`;

  const partnerMessage = english.match(/^Hi (.+), thanks for applying as an Eivitech professional partner\. Could you send us your portfolio, work area, availability and indicative terms\?$/);
  if (partnerMessage) {
    return `Hallo ${partnerMessage[1]}, bedankt voor je aanmelding als professionele samenwerkingspartner van Eivitech. Kun je ons je portfolio, werkgebied, beschikbaarheid en indicatieve voorwaarden sturen?`;
  }

  const clientMessage = english.match(/^Hi (.+), thanks for contacting Eivitech\. Could you send us photos, videos or plans so we can assess the next step\?$/);
  if (clientMessage) {
    return `Hallo ${clientMessage[1]}, bedankt dat je contact hebt opgenomen met Eivitech. Kun je ons foto’s, video’s of plannen sturen, zodat we de volgende stap kunnen beoordelen?`;
  }

  return null;
}

export function tr(es: string, it: string, en: string, nl?: string) {
  if (CURRENT_LANGUAGE === "nl") return nl || translateDutchDynamic(en) || en || es || it;
  if (CURRENT_LANGUAGE === "it") return it || es || en || nl || dutchTranslations[en];
  if (CURRENT_LANGUAGE === "en") return en || es || it || nl || dutchTranslations[en];
  return es || en || it || nl || dutchTranslations[en];
}

export const languageLabels: Record<Language, string> = {
  es: "Español",
  it: "Italiano",
  en: "English",
  nl: "Nederlands",
};
