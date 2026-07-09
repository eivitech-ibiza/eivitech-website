export type TrackEvent =
  | "page_view"
  | "service_page_view"
  | "project_view"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "form_start"
  | "form_submit"
  | "form_error"
  | "quote_request"
  | "lead"
  | "partner_application"
  | "meta_landing_view"
  | "google_landing_view";

export type ConsentState = {
  version: 2;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

export const COOKIE_CONSENT_KEY = "eivitech_cookie_consent_v2";

const DEFAULT_CONSENT: ConsentState = {
  version: 2,
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  updatedAt: "",
};

const trackingConfig = {
  gtmId: import.meta.env.VITE_GTM_ID || "",
  ga4Id: import.meta.env.VITE_GA4_ID || "",
  googleAdsId: import.meta.env.VITE_GOOGLE_ADS_ID || "",
  googleAdsLeadLabel: import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL || "",
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || "",
};

let gtmLoaded = false;
let gtagLoaded = false;
let metaLoaded = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
    __eivitechEvents?: Array<{ event: TrackEvent; payload: Record<string, unknown>; ts: number }>;
  }
}

function canUseDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function ensureDataLayer() {
  if (!canUseDom()) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtagProxy(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
}

function loadScript(id: string, src: string) {
  if (!canUseDom() || document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function getGoogleConsent(consent: ConsentState) {
  return {
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
    functionality_storage: consent.preferences ? "granted" : "denied",
    personalization_storage: consent.preferences ? "granted" : "denied",
    security_storage: "granted",
  };
}

export function setDefaultConsent() {
  if (!canUseDom()) return;
  ensureDataLayer();
  window.gtag?.("consent", "default", {
    ...getGoogleConsent(DEFAULT_CONSENT),
    wait_for_update: 500,
  });
}

export function getStoredConsent(): ConsentState | null {
  if (!canUseDom()) return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== 2) return null;
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      necessary: true,
      version: 2,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(consent: Omit<ConsentState, "version" | "necessary" | "updatedAt">) {
  if (!canUseDom()) return;
  const next: ConsentState = {
    version: 2,
    necessary: true,
    preferences: consent.preferences,
    analytics: consent.analytics,
    marketing: consent.marketing,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(next));
  applyTrackingConsent(next);
}

export function rejectOptionalConsent() {
  saveConsent({ preferences: false, analytics: false, marketing: false });
}

export function acceptAllConsent() {
  saveConsent({ preferences: true, analytics: true, marketing: true });
}

function loadGoogleStack(consent: ConsentState) {
  ensureDataLayer();
  window.gtag?.("consent", "update", getGoogleConsent(consent));

  if ((consent.analytics || consent.marketing) && trackingConfig.gtmId && !gtmLoaded) {
    gtmLoaded = true;
    loadScript("eivitech-gtm", `https://www.googletagmanager.com/gtm.js?id=${trackingConfig.gtmId}`);
    window.dataLayer?.push({ event: "gtm.js", "gtm.start": Date.now() });
  }

  if ((consent.analytics || consent.marketing) && !trackingConfig.gtmId && !gtagLoaded && (trackingConfig.ga4Id || trackingConfig.googleAdsId)) {
    gtagLoaded = true;
    const firstId = trackingConfig.ga4Id || trackingConfig.googleAdsId;
    loadScript("eivitech-gtag", `https://www.googletagmanager.com/gtag/js?id=${firstId}`);
    window.gtag?.("js", new Date());
  }

  if (consent.analytics && trackingConfig.ga4Id) {
    window.gtag?.("config", trackingConfig.ga4Id, { send_page_view: false });
  }

  if (consent.marketing && trackingConfig.googleAdsId) {
    window.gtag?.("config", trackingConfig.googleAdsId);
  }
}

function loadMetaPixel(consent: ConsentState) {
  if (!canUseDom() || !consent.marketing || !trackingConfig.metaPixelId || metaLoaded) return;

  const fbq: Fbq = function fbqProxy(...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  };

  if (!window.fbq) {
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
  }

  metaLoaded = true;
  loadScript("eivitech-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq?.("init", trackingConfig.metaPixelId);
  window.fbq?.("track", "PageView");
}

export function applyTrackingConsent(consent: ConsentState) {
  if (!canUseDom()) return;
  setDefaultConsent();
  loadGoogleStack(consent);
  loadMetaPixel(consent);
}

export function initTrackingFromStoredConsent() {
  if (!canUseDom()) return;
  setDefaultConsent();
  const stored = getStoredConsent();
  if (stored) applyTrackingConsent(stored);
}

function metaEventName(event: TrackEvent) {
  if (event === "page_view") return "PageView";
  if (event === "lead" || event === "quote_request") return "Lead";
  if (event === "whatsapp_click" || event === "phone_click" || event === "email_click") return "Contact";
  return null;
}

export function track(event: TrackEvent, payload: Record<string, unknown> = {}) {
  if (!canUseDom()) return;

  const entry = { event, payload, ts: Date.now() };
  window.__eivitechEvents = window.__eivitechEvents || [];
  window.__eivitechEvents.push(entry);

  ensureDataLayer();
  window.dataLayer?.push({ event, ...payload });

  const consent = getStoredConsent();

  if (consent?.analytics) {
    window.gtag?.("event", event, payload);
  }

  if (consent?.marketing) {
    const metaEvent = metaEventName(event);
    if (metaEvent && window.fbq) {
      if (metaEvent === "PageView") window.fbq("track", "PageView");
      else window.fbq("track", metaEvent, payload);
    }

    if (event === "lead" && trackingConfig.googleAdsId && trackingConfig.googleAdsLeadLabel) {
      window.gtag?.("event", "conversion", {
        send_to: `${trackingConfig.googleAdsId}/${trackingConfig.googleAdsLeadLabel}`,
        ...payload,
      });
    }
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, payload, { consent });
  }
}
