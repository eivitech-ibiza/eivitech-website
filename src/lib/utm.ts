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
    fromUrl.landing_page = window.location.pathname;
    fromUrl.referrer = document.referrer || "direct";
    fromUrl.timestamp = new Date().toISOString();
    inMemoryUtm = fromUrl;

    if (hasAttributionConsent()) saveSessionAttribution(fromUrl);
    else clearSessionAttribution();

    return fromUrl;
  }

  if (inMemoryUtm) {
    if (hasAttributionConsent()) saveSessionAttribution(inMemoryUtm);
    return inMemoryUtm;
  }

  if (hasAttributionConsent()) {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        inMemoryUtm = JSON.parse(raw) as UTM;
        return inMemoryUtm;
      }
    } catch {
      /* noop */
    }
  } else {
    clearSessionAttribution();
  }

  return {
    landing_page: window.location.pathname,
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
  };
}
