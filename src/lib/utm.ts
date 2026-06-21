const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "eivitech_utm";

export type UTM = Partial<Record<(typeof KEYS)[number], string>> & {
  landing_page?: string;
  referrer?: string;
  timestamp?: string;
};

export function captureUtm(): UTM {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const fromUrl: UTM = {};
  let hasNew = false;
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) {
      fromUrl[k] = v;
      hasNew = true;
    }
  }
  if (hasNew) {
    fromUrl.landing_page = window.location.pathname;
    fromUrl.referrer = document.referrer || "direct";
    fromUrl.timestamp = new Date().toISOString();
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      /* noop */
    }
    return fromUrl;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UTM;
  } catch {
    /* noop */
  }
  return {
    landing_page: window.location.pathname,
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
  };
}
