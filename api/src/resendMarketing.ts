import { randomUUID } from "node:crypto";

const RESEND_API = "https://api.resend.com";

export type MarketingContactForResend = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  resend_contact_id?: string | null;
};

export type MarketingCampaignForResend = {
  id: string;
  name: string;
  subject: string;
  preview_text?: string | null;
  from_name?: string | null;
  from_email?: string | null;
  reply_to?: string | null;
  html?: string | null;
  resend_broadcast_id?: string | null;
};

export class ResendMarketingError extends Error {
  status: number;
  responseBody: string;

  constructor(status: number, responseBody: string) {
    super(`Resend HTTP ${status}: ${responseBody}`);
    this.name = "ResendMarketingError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

type ResendRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  apiKey: string;
  idempotencyKey?: string;
};

function marketingAdminApiKey() {
  return process.env.RESEND_MARKETING_API_KEY?.trim() || null;
}

function marketingSendApiKey() {
  return marketingAdminApiKey()
    || process.env.RESEND_OWNER_API_KEY?.trim()
    || process.env.RESEND_API_KEY?.trim()
    || null;
}

export function marketingCapabilities() {
  const maxRecipients = Math.min(
    Math.max(Number(process.env.MARKETING_MAX_RECIPIENTS || 100), 1),
    1000,
  );

  return {
    testSendConfigured: Boolean(marketingSendApiKey()),
    resendSyncConfigured: Boolean(marketingAdminApiKey()),
    bulkSendEnabled: process.env.MARKETING_BULK_SEND_ENABLED === "true",
    maxRecipients,
    freeContactLimit: 1000,
  };
}

async function resendRequest<T>(path: string, options: ResendRequestOptions): Promise<T> {
  const response = await fetch(`${RESEND_API}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const responseText = await response.text().catch(() => "");
  if (!response.ok) throw new ResendMarketingError(response.status, responseText);

  if (!responseText) return {} as T;
  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(`Invalid Resend response: ${responseText}`);
  }
}

function cleanEmailHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

function replaceEditorMergeTags(html: string, testValues?: { firstName?: string; lastName?: string; email?: string }) {
  if (testValues) {
    return html
      .replace(/\{\{\s*first_name\s*\}\}/gi, testValues.firstName || "Luciano")
      .replace(/\{\{\s*last_name\s*\}\}/gi, testValues.lastName || "Novello")
      .replace(/\{\{\s*email\s*\}\}/gi, testValues.email || "test@example.com");
  }

  return html
    .replace(/\{\{\s*first_name\s*\}\}/gi, "{{{contact.first_name|there}}}")
    .replace(/\{\{\s*last_name\s*\}\}/gi, "{{{contact.last_name|}}}")
    .replace(/\{\{\s*email\s*\}\}/gi, "{{{contact.email}}}");
}

function preheader(previewText?: string | null) {
  if (!previewText) return "";
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(previewText)}</div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wrapMarketingHtml(content: string, previewText?: string | null, footer = true) {
  const footerHtml = footer
    ? `<div style="margin-top:36px;padding-top:18px;border-top:1px solid #e4ddd7;font:12px/1.5 Arial,sans-serif;color:#756d66;text-align:center">Ricevi questa email perché hai fornito un consenso marketing documentato a Eivitech. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#aa4f2d">Disiscriviti</a>.</div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f6f3f0;color:#2d2723"><div style="max-width:680px;margin:0 auto;padding:28px 20px;background:#ffffff">${preheader(previewText)}${content}${footerHtml}</div></body></html>`;
}

export function renderBroadcastHtml(campaign: MarketingCampaignForResend) {
  const content = replaceEditorMergeTags(cleanEmailHtml(campaign.html || ""));
  return wrapMarketingHtml(content, campaign.preview_text, true);
}

export function renderTestHtml(
  campaign: MarketingCampaignForResend,
  recipient: string,
  sample?: { firstName?: string; lastName?: string },
) {
  const content = replaceEditorMergeTags(cleanEmailHtml(campaign.html || ""), {
    firstName: sample?.firstName,
    lastName: sample?.lastName,
    email: recipient,
  });
  const banner = `<div style="margin-bottom:20px;padding:12px 14px;background:#fff3cd;border:1px solid #ffe69c;font:700 12px Arial,sans-serif;color:#664d03;text-align:center">EMAIL DI PROVA — nessuna campagna è stata inviata</div>`;
  return wrapMarketingHtml(`${banner}${content}`, campaign.preview_text, false);
}

export function campaignFromAddress(campaign: MarketingCampaignForResend) {
  const configured = process.env.RESEND_MARKETING_FROM?.trim();
  if (configured) return configured;
  const email = campaign.from_email?.trim() || "newsletter@notifications.eivitech.com";
  const name = campaign.from_name?.trim() || "Eivitech";
  return `${name} <${email}>`;
}

export function campaignReplyTo(campaign: MarketingCampaignForResend) {
  return process.env.RESEND_MARKETING_REPLY_TO?.trim()
    || campaign.reply_to?.trim()
    || "info@eivitech.com";
}

export async function sendMarketingTestEmail(
  campaign: MarketingCampaignForResend,
  recipient: string,
  sample?: { firstName?: string; lastName?: string },
) {
  const apiKey = marketingSendApiKey();
  if (!apiKey) throw new Error("RESEND_MARKETING_API_KEY or RESEND_OWNER_API_KEY missing");

  return resendRequest<{ id: string }>("/emails", {
    method: "POST",
    apiKey,
    idempotencyKey: `eivitech-marketing-test-${campaign.id}-${randomUUID()}`,
    body: {
      from: campaignFromAddress(campaign),
      to: [recipient],
      reply_to: campaignReplyTo(campaign),
      subject: `[TEST] ${campaign.subject}`,
      html: renderTestHtml(campaign, recipient, sample),
      tags: [
        { name: "category", value: "marketing_test" },
        { name: "campaign_id", value: campaign.id },
      ],
    },
  });
}

function adminKeyOrThrow() {
  const apiKey = marketingAdminApiKey();
  if (!apiKey) throw new Error("RESEND_MARKETING_API_KEY missing or not configured with Full access");
  return apiKey;
}

export async function createResendSegment(name: string) {
  return resendRequest<{ id: string; name: string }>("/segments", {
    method: "POST",
    apiKey: adminKeyOrThrow(),
    body: { name },
  });
}

export async function upsertResendContact(contact: MarketingContactForResend, segmentId: string) {
  const apiKey = adminKeyOrThrow();
  const updatePayload = {
    first_name: contact.first_name || undefined,
    last_name: contact.last_name || undefined,
  };
  const createPayload = {
    ...updatePayload,
    unsubscribed: false,
  };

  if (contact.resend_contact_id) {
    const updated = await resendRequest<{ id: string }>(`/contacts/${encodeURIComponent(contact.resend_contact_id)}`, {
      method: "PATCH",
      apiKey,
      body: updatePayload,
    });
    await addResendContactToSegment(updated.id || contact.resend_contact_id, segmentId);
    return updated.id || contact.resend_contact_id;
  }

  try {
    const created = await resendRequest<{ id: string }>("/contacts", {
      method: "POST",
      apiKey,
      body: {
        email: contact.email,
        ...createPayload,
        segments: [{ id: segmentId }],
      },
    });
    return created.id;
  } catch (error) {
    if (!(error instanceof ResendMarketingError) || error.status !== 409) throw error;
    const updated = await resendRequest<{ id: string }>(`/contacts/${encodeURIComponent(contact.email)}`, {
      method: "PATCH",
      apiKey,
      body: updatePayload,
    });
    await addResendContactToSegment(updated.id || contact.email, segmentId);
    return updated.id;
  }
}

export async function markResendContactUnsubscribed(contactIdOrEmail: string) {
  if (!marketingAdminApiKey()) return null;
  return resendRequest<{ id: string }>(`/contacts/${encodeURIComponent(contactIdOrEmail)}`, {
    method: "PATCH",
    apiKey: adminKeyOrThrow(),
    body: { unsubscribed: true },
  });
}

export async function addResendContactToSegment(contactIdOrEmail: string, segmentId: string) {
  return resendRequest<{ id: string }>(
    `/contacts/${encodeURIComponent(contactIdOrEmail)}/segments/${encodeURIComponent(segmentId)}`,
    { method: "POST", apiKey: adminKeyOrThrow() },
  );
}


export type ResendSegmentContact = {
  id: string;
  email: string;
  unsubscribed?: boolean;
};

export async function listResendSegmentContacts(segmentId: string) {
  const contacts: ResendSegmentContact[] = [];
  let after: string | null = null;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (after) params.set("after", after);
    const page = await resendRequest<{
      data?: ResendSegmentContact[];
      has_more?: boolean;
    }>(`/segments/${encodeURIComponent(segmentId)}/contacts?${params.toString()}`, {
      apiKey: adminKeyOrThrow(),
    });
    const rows = page.data || [];
    contacts.push(...rows);
    after = page.has_more && rows.length > 0 ? rows[rows.length - 1].id : null;
  } while (after);

  return contacts;
}

export async function removeResendContactFromSegment(contactIdOrEmail: string, segmentId: string) {
  return resendRequest<{ id: string; deleted?: boolean }>(
    `/contacts/${encodeURIComponent(contactIdOrEmail)}/segments/${encodeURIComponent(segmentId)}`,
    { method: "DELETE", apiKey: adminKeyOrThrow() },
  );
}

export async function createOrUpdateResendBroadcast(
  campaign: MarketingCampaignForResend,
  segmentId: string,
) {
  const body = {
    name: campaign.name,
    segment_id: segmentId,
    from: campaignFromAddress(campaign),
    reply_to: campaignReplyTo(campaign),
    subject: campaign.subject,
    preview_text: campaign.preview_text || undefined,
    html: renderBroadcastHtml(campaign),
  };

  if (campaign.resend_broadcast_id) {
    const updated = await resendRequest<{ id: string }>(
      `/broadcasts/${encodeURIComponent(campaign.resend_broadcast_id)}`,
      { method: "PATCH", apiKey: adminKeyOrThrow(), body },
    );
    return updated.id || campaign.resend_broadcast_id;
  }

  const created = await resendRequest<{ id: string }>("/broadcasts", {
    method: "POST",
    apiKey: adminKeyOrThrow(),
    body,
  });
  return created.id;
}

export async function sendResendBroadcast(broadcastId: string) {
  return resendRequest<{ id: string }>(`/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
    method: "POST",
    apiKey: adminKeyOrThrow(),
    idempotencyKey: `eivitech-broadcast-send-${broadcastId}`,
    body: {},
  });
}

export async function deleteResendBroadcast(broadcastId: string) {
  return resendRequest<{ id: string; deleted?: boolean }>(`/broadcasts/${encodeURIComponent(broadcastId)}`, {
    method: "DELETE",
    apiKey: adminKeyOrThrow(),
  });
}
