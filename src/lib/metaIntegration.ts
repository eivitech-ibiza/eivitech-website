import { CRM_ENDPOINT } from "@/lib/crm";

export type MetaPublicWebConfig = {
  configured: boolean;
  enabled: boolean;
  pixelId: string | null;
  updatedAt: string | null;
  source?: "runtime" | "vite_fallback";
};

export type MetaAdminWebConfig = MetaPublicWebConfig & {
  capiMode: "disabled" | "test" | "production";
  testEventCode: string | null;
};

export type MetaCrmConfig = {
  configured: boolean;
  datasetId: string | null;
  pageId: string | null;
  allowedFormIds: string[];
  formMappings: Record<string, Record<string, string>>;
  eventMappings: Record<string, string>;
  mode: "disabled" | "test" | "production";
  testEventCode: string | null;
  graphApiVersion: string;
  updatedAt: string | null;
};

export type MetaCredentialsStatus = {
  capiAccessToken: boolean;
  pageAccessToken: boolean;
  appSecret: boolean;
  webhookVerifyToken: boolean;
};

export type MetaAdminConfig = {
  web: MetaAdminWebConfig;
  crm: MetaCrmConfig;
  credentials: MetaCredentialsStatus;
};

export type MetaOperationalStatus = {
  credentials: MetaCredentialsStatus;
  outbox: Array<{ status: string; total: number }>;
  inbox: Array<{ status: string; total: number }>;
  lastSuccess: { sent_at?: string; event_name?: string; event_id?: string } | null;
  lastError: {
    updated_at?: string;
    event_name?: string;
    event_id?: string;
    last_error_code?: string;
    last_error_message?: string;
  } | null;
  lastPendingError: {
    updated_at?: string;
    event_name?: string;
    event_id?: string;
    status?: string;
    attempts?: number;
    next_attempt_at?: string;
    last_error_code?: string;
    last_error_message?: string;
  } | null;
  audit: Array<{ scope: string; created_at: string; changed_by?: string | null }>;
};

export type MetaLeadInboxItem = {
  id: string;
  meta_lead_id: string;
  page_id?: string | null;
  form_id?: string | null;
  ad_id?: string | null;
  adset_id?: string | null;
  campaign_id?: string | null;
  meta_created_time?: string | null;
  mapped_data?: Record<string, string>;
  missing_fields?: string[];
  status: string;
  promoted_lead_id?: string | null;
  last_error?: string | null;
  created_at?: string;
  updated_at?: string;
};

async function readError(response: Response, fallback: string) {
  const body = await response.text().catch(() => "");
  if (!body) return fallback;
  try {
    const parsed = JSON.parse(body) as { error?: string };
    return parsed.error || fallback;
  } catch {
    return body;
  }
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchPublicMetaConfig(): Promise<{ web: MetaPublicWebConfig }> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/public-config`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta public config unavailable"));
  return response.json() as Promise<{ web: MetaPublicWebConfig }>;
}

export async function fetchMetaAdminConfig(token: string): Promise<MetaAdminConfig> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/config`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta config unavailable"));
  return response.json() as Promise<MetaAdminConfig>;
}

export async function updateMetaAdminConfig(
  token: string,
  payload: {
    pixelId: string | null;
    enabled: boolean;
    capiMode: "disabled" | "test" | "production";
    testEventCode: string | null;
  },
): Promise<MetaAdminConfig> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/config`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await readError(response, "Meta config update failed"));
  return response.json() as Promise<MetaAdminConfig>;
}

export async function updateMetaCrmConfig(
  token: string,
  payload: {
    datasetId: string | null;
    pageId: string | null;
    allowedFormIds: string[];
    formMappings: Record<string, Record<string, string>>;
    eventMappings: Record<string, string>;
    mode: "disabled" | "test" | "production";
    testEventCode: string | null;
  },
): Promise<MetaAdminConfig> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/crm-config`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await readError(response, "Meta CRM config update failed"));
  return response.json() as Promise<MetaAdminConfig>;
}

export async function fetchMetaOperationalStatus(token: string): Promise<MetaOperationalStatus> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/status`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta status unavailable"));
  return response.json() as Promise<MetaOperationalStatus>;
}

export async function fetchMetaLeadInbox(token: string): Promise<{ leads: MetaLeadInboxItem[] }> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/lead-inbox`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta lead inbox unavailable"));
  return response.json() as Promise<{ leads: MetaLeadInboxItem[] }>;
}

export async function processMetaLeadInbox(token: string, limit = 20) {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/lead-inbox/process`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ limit }),
  });
  if (!response.ok) throw new Error(await readError(response, "Meta lead processing failed"));
  return response.json() as Promise<{
    ok: boolean;
    processed: number;
    fallback: { forms: number; fetched: number; synced: number };
  }>;
}

export async function processMetaOutbox(token: string, limit = 20) {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/outbox/process`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ limit }),
  });
  if (!response.ok) throw new Error(await readError(response, "Meta CAPI processing failed"));
  return response.json() as Promise<{ ok: boolean; processed: number }>;
}

export async function retryFailedMetaEvents(token: string) {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/outbox/retry-failed`, {
    method: "POST",
    headers: authHeaders(token),
    body: "{}",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta retry failed"));
  return response.json() as Promise<{ ok: boolean; retried: number }>;
}
