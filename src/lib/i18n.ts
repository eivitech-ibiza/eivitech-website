export type Language = "es" | "it" | "en";
export type LanguageSelection = Language | "auto";

const FALLBACK_LANGUAGE: Language = "es";
const STORAGE_KEY = "eivitech_language";
const SUPPORTED_LANGUAGES: Language[] = ["es", "it", "en"];

export function normaliseLanguage(value?: string | null): Language | null {
  if (!value) return null;
  const code = value.toLowerCase().split("-")[0];
  if (SUPPORTED_LANGUAGES.includes(code as Language)) return code as Language;
  return null;
}

function readLanguageFromUrl(): LanguageSelection | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("lang");
  if (value === "auto") return "auto";
  return normaliseLanguage(value);
}

export function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  return normaliseLanguage(window.localStorage.getItem(STORAGE_KEY));
}

export function detectLanguage(): Language {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;

  const urlLanguage = readLanguageFromUrl();
  if (urlLanguage === "auto") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else if (urlLanguage) {
    window.localStorage.setItem(STORAGE_KEY, urlLanguage);
    return urlLanguage;
  }

  const stored = getStoredLanguage();
  if (stored) return stored;

  for (const candidate of window.navigator.languages || [window.navigator.language]) {
    const lang = normaliseLanguage(candidate);
    if (lang) return lang;
  }

  return FALLBACK_LANGUAGE;
}

export const CURRENT_LANGUAGE: Language = detectLanguage();

export function initLanguage() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = CURRENT_LANGUAGE === "es" ? "es-ES" : CURRENT_LANGUAGE === "it" ? "it-IT" : "en-GB";
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
  if (typeof window === "undefined") return `?lang=${selection}`;
  const url = new URL(window.location.href);
  url.searchParams.set("lang", selection);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function changeLanguage(selection: LanguageSelection) {
  if (typeof window === "undefined") return;
  persistLanguageSelection(selection);
  window.location.assign(languageSelectionHref(selection));
}

export function tr(es: string, it: string, en: string) {
  if (CURRENT_LANGUAGE === "it") return it || es || en;
  if (CURRENT_LANGUAGE === "en") return en || es || it;
  return es || en || it;
}

export const languageLabels: Record<Language, string> = {
  es: "Español",
  it: "Italiano",
  en: "English",
};
