const CRM_ENDPOINT = "https://ibiza-project-accelerator-production.up.railway.app";

export type MarketingLanguage = "es" | "it" | "en" | "nl";
export type MarketingContactStatus = "pending" | "subscribed" | "unsubscribed" | "suppressed";
export type MarketingCampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled" | "failed";

export type MarketingContactInput = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  region?: string | null;
  country_code?: string | null;
  language?: MarketingLanguage | null;
  contact_type?: string | null;
  source?: string | null;
  source_file?: string | null;
  status?: MarketingContactStatus;
  tags?: string[];
  marketing_consent?: boolean;
  consent_source?: string | null;
  consent_at?: string | null;
  suppression_reason?: string | null;
  allow_resubscribe?: boolean;
};

export type MarketingContact = MarketingContactInput & {
  id: string;
  unsubscribe_token: string;
  resend_contact_id?: string | null;
  created_at: string;
  updated_at: string;
  unsubscribed_at?: string | null;
  suppressed_at?: string | null;
  segments?: { id: string; name: string }[];
};

export type MarketingSegment = {
  id: string;
  name: string;
  description?: string | null;
  filters?: Record<string, unknown>;
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type MarketingCampaignInput = {
  name: string;
  subject: string;
  preview_text?: string | null;
  from_name?: string | null;
  from_email?: string | null;
  reply_to?: string | null;
  language?: MarketingLanguage;
  status?: MarketingCampaignStatus;
  segment_id?: string | null;
  topic?: string | null;
  editor_json?: Record<string, unknown>;
  html?: string;
  scheduled_at?: string | null;
};

export type MarketingCampaign = MarketingCampaignInput & {
  id: string;
  segment_name?: string | null;
  recipient_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  complained_count: number;
  unsubscribed_count: number;
  created_at: string;
  updated_at: string;
};

export type MarketingStats = {
  contacts: {
    total: number;
    subscribed: number;
    pending: number;
    unsubscribed: number;
    suppressed: number;
  };
  campaigns: {
    total: number;
    drafts: number;
    scheduled: number;
    sent: number;
  };
  segments: { total: number };
};

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH";
  token: string;
  body?: unknown;
};

async function marketingRequest<T>(path: string, options: ApiOptions) {
  const response = await fetch(`${CRM_ENDPOINT}/api/marketing${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${options.token}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Email marketing request failed");
    throw new Error(message || "Email marketing request failed");
  }

  return response.json() as Promise<T>;
}

export function fetchMarketingStats(token: string) {
  return marketingRequest<MarketingStats>("/stats", { token });
}

export function fetchMarketingContacts(
  token: string,
  filters: { search?: string; status?: MarketingContactStatus | ""; language?: MarketingLanguage | ""; segmentId?: string } = {}
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.language) params.set("language", filters.language);
  if (filters.segmentId) params.set("segment_id", filters.segmentId);
  const query = params.toString();
  return marketingRequest<{ contacts: MarketingContact[]; total: number }>(`/contacts${query ? `?${query}` : ""}`, { token });
}

export function createMarketingContact(token: string, payload: MarketingContactInput) {
  return marketingRequest<{ contact: MarketingContact }>("/contacts", { method: "POST", token, body: payload });
}

export function updateMarketingContact(token: string, contactId: string, payload: Partial<MarketingContactInput>) {
  return marketingRequest<{ contact: MarketingContact }>(`/contacts/${contactId}`, { method: "PATCH", token, body: payload });
}

export type MarketingImportIssue = { row: number; email?: string; message: string };

export type MarketingImportMetadata = {
  contactRows: number[];
  clientIssues: MarketingImportIssue[];
  totalRows: number;
};

export function importMarketingContacts(
  token: string,
  fileName: string,
  contacts: MarketingContactInput[],
  metadata: MarketingImportMetadata
) {
  return marketingRequest<{
    importJob: Record<string, unknown>;
    inserted: number;
    updated: number;
    skipped: number;
    errors: MarketingImportIssue[];
  }>("/contacts/import", {
    method: "POST",
    token,
    body: {
      file_name: fileName,
      contacts,
      contact_rows: metadata.contactRows,
      client_issues: metadata.clientIssues,
      total_rows: metadata.totalRows,
    },
  });
}

export function fetchMarketingSegments(token: string) {
  return marketingRequest<{ segments: MarketingSegment[] }>("/segments", { token });
}

export function createMarketingSegment(token: string, payload: { name: string; description?: string }) {
  return marketingRequest<{ segment: MarketingSegment }>("/segments", { method: "POST", token, body: payload });
}

export function updateMarketingSegmentMembers(token: string, segmentId: string, payload: { add?: string[]; remove?: string[] }) {
  return marketingRequest<{ ok: boolean; memberCount: number }>(`/segments/${segmentId}/members`, { method: "POST", token, body: payload });
}

export function fetchMarketingCampaigns(token: string) {
  return marketingRequest<{ campaigns: MarketingCampaign[] }>("/campaigns", { token });
}

export function createMarketingCampaign(token: string, payload: MarketingCampaignInput) {
  return marketingRequest<{ campaign: MarketingCampaign }>("/campaigns", { method: "POST", token, body: payload });
}

export function updateMarketingCampaign(token: string, campaignId: string, payload: Partial<MarketingCampaignInput>) {
  return marketingRequest<{ campaign: MarketingCampaign }>(`/campaigns/${campaignId}`, { method: "PATCH", token, body: payload });
}
