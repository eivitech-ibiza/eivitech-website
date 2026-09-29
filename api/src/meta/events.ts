import { createHash } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeAndHashEmail(value: string) {
  return sha256(value.trim().toLowerCase());
}

export function normalizeAndHashPhone(value: string) {
  const normalized = value.trim().replace(/[^0-9]/g, "");
  if (!normalized) throw new Error("Phone cannot be empty after normalization");
  return sha256(normalized);
}

function unixSeconds(value: string) {
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) throw new Error("Invalid Meta event time");
  return Math.floor(ms / 1000);
}

function hashedUserData(input: { email?: string | null; phone?: string | null }) {
  return {
    ...(input.email ? { em: [normalizeAndHashEmail(input.email)] } : {}),
    ...(input.phone ? { ph: [normalizeAndHashPhone(input.phone)] } : {}),
  };
}

export type CrmMetaEventInput = {
  eventName: string;
  eventId: string;
  eventTime: string;
  metaLeadId?: string | null;
  leadEventSource?: string;
  email?: string | null;
  phone?: string | null;
};

export function buildCrmMetaEvent(input: CrmMetaEventInput) {
  if (!input.eventName.trim()) throw new Error("Meta event name is required");
  if (!input.eventId.trim()) throw new Error("Meta event ID is required");

  return {
    event_name: input.eventName.trim(),
    event_time: unixSeconds(input.eventTime),
    event_id: input.eventId,
    action_source: "system_generated" as const,
    user_data: {
      ...(input.metaLeadId ? { lead_id: String(input.metaLeadId) } : {}),
      ...hashedUserData(input),
    },
    custom_data: {
      lead_event_source: input.leadEventSource || "Eivitech CRM",
      event_source: "crm" as const,
    },
  };
}

export type WebMetaEventInput = {
  eventName: string;
  eventId: string;
  eventTime: string;
  eventSourceUrl: string;
  email?: string | null;
  phone?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export function validatePublicEivitechUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !["eivitech.com", "www.eivitech.com"].includes(url.hostname)) {
    throw new Error("A public Eivitech URL is required");
  }
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, url.pathname === "/" ? "/" : "");
}

export function buildWebMetaEvent(input: WebMetaEventInput) {
  if (!input.eventName.trim()) throw new Error("Meta event name is required");
  if (!input.eventId.trim()) throw new Error("Meta event ID is required");

  return {
    event_name: input.eventName.trim(),
    event_time: unixSeconds(input.eventTime),
    event_id: input.eventId,
    action_source: "website" as const,
    event_source_url: validatePublicEivitechUrl(input.eventSourceUrl),
    user_data: {
      ...hashedUserData(input),
      ...(input.fbp ? { fbp: input.fbp } : {}),
      ...(input.fbc ? { fbc: input.fbc } : {}),
    },
  };
}
