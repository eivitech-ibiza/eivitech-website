// Tracking placeholder utility.
// Real pixels (GA4, GTM, Meta Pixel, Google Ads) MUST NOT be activated
// until cookie/privacy consent is verified. This file only pushes events
// to a local dataLayer + console for debugging.

export type TrackEvent =
  | "page_view"
  | "service_page_view"
  | "project_view"
  | "whatsapp_click"
  | "phone_click"
  | "form_start"
  | "form_submit"
  | "form_error"
  | "quote_request"
  | "meta_landing_view"
  | "google_landing_view";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __eivitechEvents?: Array<{ event: TrackEvent; payload: Record<string, unknown>; ts: number }>;
  }
}

export function track(event: TrackEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const entry = { event, payload, ts: Date.now() };
  window.__eivitechEvents = window.__eivitechEvents || [];
  window.__eivitechEvents.push(entry);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, payload);
  }
}
