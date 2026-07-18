export type Language = "es" | "it" | "en" | "nl";
export type LanguageSelection = Language | "auto";

const FALLBACK_LANGUAGE: Language = "es";
const UNSUPPORTED_BROWSER_FALLBACK: Language = "en";
const STORAGE_KEY = "eivitech_language";
const SUPPORTED_LANGUAGES: Language[] = ["es", "it", "en", "nl"];

let dutchTranslations: Readonly<Record<string, string>> = {};

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

  return UNSUPPORTED_BROWSER_FALLBACK;
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
