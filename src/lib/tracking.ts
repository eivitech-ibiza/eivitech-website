import { clearMetaAttributionCookies } from "@/lib/metaAttribution";
import { fetchPublicMetaConfig, type MetaPublicWebConfig } from "@/lib/metaIntegration";

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
  version: 3;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type TrackOptions = {
  eventId?: string;
};

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

export const COOKIE_CONSENT_KEY = "eivitech_cookie_consent_v3";
export const CONSENT_VALIDITY_MONTHS = 24;

const DEFAULT_CONSENT: ConsentState = {
  version: 3,
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
  fallbackMetaPixelId: import.meta.env.VITE_META_PIXEL_ID || "",
};

let gtmLoaded = false;
let gtagLoaded = false;
let ga4Configured = false;
let metaLoadedPixelId: string | null = null;

type PendingGa4PageView = {
  url: string;
  payload: Record<string, unknown>;
};

const GA4_PAGE_EVENTS = new Set<TrackEvent>([
  "page_view",
  "service_page_view",
  "project_view",
  "meta_landing_view",
  "google_landing_view",
]);

let pendingGa4PageView: PendingGa4PageView | null = null;
let lastGa4PageLocation: string | null = null;
let metaConfigPromise: Promise<MetaPublicWebConfig> | null = null;
let metaConsentGranted = false;

const META_CONVERSION_READY_TIMEOUT_MS = 1200;

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

function isPrivateCrmPath() {
  if (!canUseDom()) return false;
  return window.location.pathname.startsWith("/dashboard") || /\/(?:es|it|en|nl)\/dashboard(?:\/|$)/.test(window.location.pathname);
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
    if (parsed.version !== 3 || !parsed.updatedAt) {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }

    const updatedAt = new Date(parsed.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }

    const expiresAt = new Date(updatedAt);
    expiresAt.setMonth(expiresAt.getMonth() + CONSENT_VALIDITY_MONTHS);
    if (Date.now() >= expiresAt.getTime()) {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }

    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      necessary: true,
      version: 3,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    return null;
  }
}

export function saveConsent(consent: Omit<ConsentState, "version" | "necessary" | "updatedAt">) {
  if (!canUseDom()) return;
  const next: ConsentState = {
    version: 3,
    necessary: true,
    preferences: consent.preferences,
    analytics: consent.analytics,
    marketing: consent.marketing,
    updatedAt: new Date().toISOString(),
  };
  const previous = getStoredConsent();
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(next));
  applyTrackingConsent(next);

  // A visitor may accept analytics after SEO already tracked the initial route
  // without consent. Send exactly one page_view for the current page on the
  // denied -> granted transition, without replaying form/conversion events.
  if (!previous?.analytics && next.analytics && !isPrivateCrmPath()) {
    const currentUrl = window.location.href;
    const pageView = pendingGa4PageView?.url === currentUrl
      ? pendingGa4PageView
      : captureGa4PageView({});
    sendGa4PageView(pageView);
  }
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

  if (consent.analytics && trackingConfig.ga4Id && !ga4Configured) {
    window.gtag?.("config", trackingConfig.ga4Id, { send_page_view: false });
    ga4Configured = true;
  }

  if (consent.marketing && trackingConfig.googleAdsId) {
    window.gtag?.("config", trackingConfig.googleAdsId);
  }
}

function captureGa4PageView(payload: Record<string, unknown>): PendingGa4PageView {
  return {
    url: window.location.href,
    payload: {
      ...payload,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search,
      page_title: document.title,
    },
  };
}

// GA4 automatic page views are disabled above because React Router handles
// navigation. Centralise page views here so late consent and SPA route changes
// are measured once per location; keep the other custom view events as before.
function sendGa4PageView(pageView: PendingGa4PageView): boolean {
  if (!trackingConfig.ga4Id || !window.gtag || lastGa4PageLocation === pageView.url) {
    return false;
  }
  window.gtag("event", "page_view", {
    ...pageView.payload,
    send_to: trackingConfig.ga4Id,
  });
  lastGa4PageLocation = pageView.url;
  pendingGa4PageView = null;
  return true;
}

async function resolveMetaConfig() {
  if (!metaConfigPromise) {
    metaConfigPromise = fetchPublicMetaConfig()
      .then(({ web }) => {
        if (web.configured) return web;
        const fallback = trackingConfig.fallbackMetaPixelId.trim();
        if (fallback) {
          return {
            configured: false,
            enabled: true,
            pixelId: fallback,
            updatedAt: null,
            source: "vite_fallback" as const,
          };
        }
        return { ...web, source: "runtime" as const };
      })
      .catch(() => ({
        configured: true,
        enabled: false,
        pixelId: null,
        updatedAt: null,
        source: "runtime" as const,
      }));
  }
  return metaConfigPromise;
}

function createFbq() {
  const fbq: Fbq = function fbqProxy(...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  return fbq;
}

async function loadMetaPixel(consent: ConsentState) {
  if (!canUseDom() || isPrivateCrmPath() || !consent.marketing) return false;
  const currentConsent = getStoredConsent();
  if (!currentConsent?.marketing) return false;

  const config = await resolveMetaConfig();
  // Consent can be withdrawn while the asynchronous config request is pending.
  if (!getStoredConsent()?.marketing || isPrivateCrmPath()) return false;
  if (!config.enabled || !config.pixelId) return false;

  if (metaLoadedPixelId && metaLoadedPixelId !== config.pixelId) {
    return false;
  }

  if (!window.fbq) {
    const fbq = createFbq();
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!metaLoadedPixelId) {
    metaLoadedPixelId = config.pixelId;
    loadScript("eivitech-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq?.("init", config.pixelId);
  }
  // loadMetaPixel also runs on route changes and for each event: grant only
  // on the consent transition so tracking cannot flood the Pixel with grants.
  if (!metaConsentGranted) {
    window.fbq?.("consent", "grant");
    metaConsentGranted = true;
  }
  return true;
}

// A queued fbq stub call is not evidence that fbevents.js has actually loaded.
// Give conversion events a bounded chance to reach the real Pixel library
// before routing to the thank-you page. Never wait indefinitely on blockers.
async function waitForMetaPixelLibrary() {
  if (typeof window.fbq?.callMethod === "function") return true;
  const deadline = Date.now() + META_CONVERSION_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    if (!getStoredConsent()?.marketing || isPrivateCrmPath()) return false;
    if (typeof window.fbq?.callMethod === "function") return true;
  }
  return false;
}

function revokeMetaPixel() {
  if (!canUseDom()) return;
  if (metaConsentGranted) window.fbq?.("consent", "revoke");
  metaConsentGranted = false;
  clearMetaAttributionCookies();
}

export function applyTrackingConsent(consent: ConsentState) {
  if (!canUseDom()) return;
  setDefaultConsent();
  loadGoogleStack(consent);
  if (!consent.analytics) lastGa4PageLocation = null;
  if (consent.marketing) {
    void loadMetaPixel(consent);
  } else {
    revokeMetaPixel();
  }
}

export function initTrackingFromStoredConsent() {
  if (!canUseDom() || isPrivateCrmPath()) return;
  setDefaultConsent();
  const stored = getStoredConsent();
  if (stored) applyTrackingConsent(stored);
}

function metaEventDescriptor(event: TrackEvent) {
  if (["page_view", "service_page_view", "project_view", "meta_landing_view", "google_landing_view"].includes(event)) {
    return { name: "PageView", custom: false };
  }
  if (event === "lead") return { name: "Lead", custom: false };
  if (event === "whatsapp_click" || event === "phone_click" || event === "email_click") {
    return { name: "Contact", custom: false };
  }
  if (event === "partner_application") return { name: "PartnerApplication", custom: true };
  return null;
}

function safeMetaPayload(payload: Record<string, unknown>) {
  const allowed = new Set([
    "source",
    "mode",
    "tipoCliente",
    "intervencion",
    "categoria",
    "path",
    "content_type",
    "content_name",
    "contact_channel",
  ]);
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => allowed.has(key) && ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 160) : value])
  );
}

async function emitMetaEvent(event: TrackEvent, payload: Record<string, unknown>, eventId?: string) {
  const consent = getStoredConsent();
  if (!consent?.marketing || isPrivateCrmPath()) return;
  const descriptor = metaEventDescriptor(event);
  if (!descriptor) return;

  const ready = await loadMetaPixel(consent);
  if (!ready || !getStoredConsent()?.marketing || !window.fbq) return;

  // Wait only for post-CRM conversion events. The library can be delayed or
  // blocked by browser privacy settings; in that case retain fbq's queue
  // behaviour and let the separately consent-gated CAPI event proceed.
  if (event === "lead" || event === "partner_application") {
    await waitForMetaPixelLibrary();
    if (!getStoredConsent()?.marketing || isPrivateCrmPath()) return;
  }

  const params = safeMetaPayload(payload);
  const options = eventId ? { eventID: eventId } : undefined;
  if (descriptor.custom) {
    window.fbq("trackCustom", descriptor.name, params, options);
  } else {
    window.fbq("track", descriptor.name, params, options);
  }
}

export function track(event: TrackEvent, payload: Record<string, unknown> = {}, options: TrackOptions = {}): Promise<void> {
  if (!canUseDom()) return Promise.resolve();

  const entry = { event, payload, ts: Date.now() };
  window.__eivitechEvents = window.__eivitechEvents || [];
  window.__eivitechEvents.push(entry);

  if (isPrivateCrmPath()) return Promise.resolve();

  ensureDataLayer();
  window.dataLayer?.push({ event, ...payload });

  const consent = getStoredConsent();
  const isPageView = GA4_PAGE_EVENTS.has(event);
  if (isPageView) pendingGa4PageView = captureGa4PageView(payload);

  if (consent?.analytics) {
    // SEO effects can run before the Layout bootstrap on a returning visit.
    // Initialise GA4 first so the first route event is not lost in that race.
    if (trackingConfig.ga4Id && !ga4Configured) loadGoogleStack(consent);

    if (isPageView && trackingConfig.ga4Id && pendingGa4PageView) {
      const sent = sendGa4PageView(pendingGa4PageView);
      if (sent && event !== "page_view") {
        window.gtag?.("event", event, payload);
      }
    } else if (!isPageView || !trackingConfig.ga4Id) {
      window.gtag?.("event", event, payload);
    }
  }

  // Always absorb Pixel script/config failures: a successful CRM submission
  // must never be turned into a user-visible form error by optional analytics.
  const pixelDispatch = consent?.marketing
    ? emitMetaEvent(event, payload, options.eventId).catch(() => undefined)
    : Promise.resolve();

  if (consent?.marketing) {
    if (event === "lead" && trackingConfig.googleAdsId && trackingConfig.googleAdsLeadLabel) {
      window.gtag?.("event", "conversion", {
        send_to: `${trackingConfig.googleAdsId}/${trackingConfig.googleAdsLeadLabel}`,
        ...payload,
      });
    }
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, payload, { consent, eventId: options.eventId });
  }
  // Callers sending a confirmed Lead await this promise before SPA navigation.
  // This confirms fbq dispatch/queueing, never an HTTP 200 from Meta.
  return pixelDispatch;
}
