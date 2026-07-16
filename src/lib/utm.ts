import { CURRENT_LANGUAGE } from "@/lib/i18n";
import { getStoredConsent } from "@/lib/tracking";

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "eivitech_utm";

export type UTM = Partial<Record<(typeof KEYS)[number], string>> & {
  landing_page?: string;
  referrer?: string;
  timestamp?: string;
};

let inMemoryUtm: UTM | null = null;

function hasAttributionConsent() {
  const consent = getStoredConsent();
  return Boolean(consent?.analytics || consent?.marketing);
}

function saveSessionAttribution(value: UTM) {
  if (!hasAttributionConsent()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

function clearSessionAttribution() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

function languageAwareLandingPage(pathname: string) {
  const url = new URL(pathname || "/", window.location.origin);
  url.searchParams.set("lang", CURRENT_LANGUAGE);
  return `${url.pathname}${url.search}`;
}

function withCurrentLanguage(value: UTM): UTM {
  return {
    ...value,
    landing_page: languageAwareLandingPage(value.landing_page || window.location.pathname),
  };
}

export function captureUtm(): UTM {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: UTM = {};
  let hasNew = false;

  for (const key of KEYS) {
    const value = params.get(key);
    if (value) {
      fromUrl[key] = value;
      hasNew = true;
    }
  }

  if (hasNew) {
    fromUrl.landing_page = languageAwareLandingPage(window.location.pathname);
    fromUrl.referrer = document.referrer || "direct";
    fromUrl.timestamp = new Date().toISOString();
    inMemoryUtm = fromUrl;

    if (hasAttributionConsent()) saveSessionAttribution(fromUrl);
    else clearSessionAttribution();

    return fromUrl;
  }

  if (inMemoryUtm) {
    const current = withCurrentLanguage(inMemoryUtm);
    inMemoryUtm = current;
    if (hasAttributionConsent()) saveSessionAttribution(current);
    return current;
  }

  if (hasAttributionConsent()) {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = withCurrentLanguage(JSON.parse(raw) as UTM);
        inMemoryUtm = stored;
        saveSessionAttribution(stored);
        return stored;
      }
    } catch {
      /* noop */
    }
  } else {
    clearSessionAttribution();
  }

  return {
    landing_page: languageAwareLandingPage(window.location.pathname),
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
  };
}
