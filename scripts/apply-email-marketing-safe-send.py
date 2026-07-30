#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def replace_once(path: str, old: str, new: str) -> None:
    content = read(path)
    if content.count(old) != 1:
        raise RuntimeError(f"Expected one occurrence in {path}: {old[:100]!r}; found {content.count(old)}")
    write(path, content.replace(old, new, 1))


# ---------------------------------------------------------------------------
# API server: public unsubscribe route before Clerk, protected marketing after.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/server.ts",
    'import { marketingRouter } from "./marketing.js";\n',
    'import { marketingRouter } from "./marketing.js";\nimport { marketingPublicRouter } from "./marketingPublic.js";\n',
)
replace_once(
    "api/src/server.ts",
    'app.use(clerkMiddleware());\n\nconst publicJsonParser = express.json({ limit: "100kb" });',
    'const publicJsonParser = express.json({ limit: "100kb" });',
)
replace_once(
    "api/src/server.ts",
    '''const publicLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
''',
    '''const publicLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const publicMarketingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(
  "/api/marketing-public",
  publicMarketingLimiter,
  express.json({ limit: "10kb" }),
  marketingPublicRouter
);
app.use(clerkMiddleware());
''',
)

# ---------------------------------------------------------------------------
# Frontend route for the public unsubscribe page.
# ---------------------------------------------------------------------------
replace_once(
    "src/App.tsx",
    'const EmailMarketing = lazy(() => import("./pages/EmailMarketing.tsx"));\n',
    'const EmailMarketing = lazy(() => import("./pages/EmailMarketing.tsx"));\nconst Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));\n',
)
replace_once(
    "src/App.tsx",
    '      { path: "/dashboard/email-marketing", element: <EmailMarketing /> },\n',
    '      { path: "/dashboard/email-marketing", element: <EmailMarketing /> },\n      { path: "/unsubscribe", element: <Unsubscribe /> },\n',
)

# ---------------------------------------------------------------------------
# Database additions for one-time send confirmations and campaign event audit.
# ---------------------------------------------------------------------------
migrations = read("api/src/migrations.ts")
marker = "\n`;\n\nexport async function runMigrations()"
if marker not in migrations:
    raise RuntimeError("Migration terminator not found")
extra_sql = r'''

ALTER TABLE crm_marketing_campaigns
  ADD COLUMN IF NOT EXISTS send_confirmation_token_hash text;
ALTER TABLE crm_marketing_campaigns
  ADD COLUMN IF NOT EXISTS send_confirmation_expires_at timestamptz;
ALTER TABLE crm_marketing_campaigns
  ADD COLUMN IF NOT EXISTS last_test_at timestamptz;

CREATE TABLE IF NOT EXISTS crm_marketing_campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES crm_marketing_campaigns(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('test_sent', 'prepared', 'send_started', 'send_failed', 'resend_synced')),
  recipient text,
  resend_email_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_marketing_campaign_events_campaign
  ON crm_marketing_campaign_events(campaign_id, created_at DESC);

CREATE TABLE IF NOT EXISTS crm_marketing_campaign_recipient_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES crm_marketing_campaigns(id) ON DELETE CASCADE,
  resend_email_id text NOT NULL,
  recipient text,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (campaign_id, resend_email_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_crm_marketing_recipient_events_campaign
  ON crm_marketing_campaign_recipient_events(campaign_id, occurred_at DESC);
'''
migrations = migrations.replace(marker, extra_sql + marker, 1)
write("api/src/migrations.ts", migrations)

# ---------------------------------------------------------------------------
# Marketing API: test send, sync, prepare, one-time confirmation and delete.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/marketing.ts",
    'import type { NextFunction, Request, RequestHandler, Response } from "express";\n',
    'import { createHash, randomBytes } from "node:crypto";\nimport type { NextFunction, Request, RequestHandler, Response } from "express";\n',
)
replace_once(
    "api/src/marketing.ts",
    'import { pool, query } from "./db.js";\n',
    '''import { pool, query } from "./db.js";
import {
  ResendMarketingError,
  createOrUpdateResendBroadcast,
  createResendSegment,
  deleteResendBroadcast,
  marketingCapabilities,
  sendMarketingTestEmail,
  sendResendBroadcast,
  upsertResendContact,
} from "./resendMarketing.js";
''',
)
replace_once(
    "api/src/marketing.ts",
    'const campaignUpdateSchema = campaignSchema.partial();\n',
    '''const campaignUpdateSchema = campaignSchema.partial();

const campaignTestSchema = z.object({
  email: z.string().trim().email().max(254),
  first_name: optionalText(120),
  last_name: optionalText(120),
});

const campaignSendSchema = z.object({
  confirmation_token: z.string().regex(/^[a-f0-9]{64}$/i),
  confirmation_phrase: z.string().trim().min(1).max(200),
});
''',
)

helpers = r'''

type MarketingCampaignRow = {
  id: string;
  name: string;
  subject: string;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  language: "es" | "it" | "en" | "nl";
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled" | "failed";
  segment_id: string | null;
  html: string;
  resend_broadcast_id: string | null;
  recipient_count: number;
  send_confirmation_token_hash: string | null;
  send_confirmation_expires_at: Date | string | null;
};

class MarketingOperationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MarketingOperationError";
    this.status = status;
  }
}

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function loadCampaign(campaignId: string) {
  const result = await query<MarketingCampaignRow>(
    `SELECT * FROM crm_marketing_campaigns WHERE id = $1`,
    [campaignId],
  );
  if (result.rows.length === 0) throw new MarketingOperationError(404, "Campaign not found");
  return result.rows[0];
}

async function recordCampaignEvent(
  campaignId: string,
  eventType: "test_sent" | "prepared" | "send_started" | "send_failed" | "resend_synced",
  createdBy: string | null,
  details: { recipient?: string | null; resendEmailId?: string | null; payload?: Record<string, unknown> } = {},
) {
  await query(
    `INSERT INTO crm_marketing_campaign_events (
       campaign_id, event_type, recipient, resend_email_id, payload, created_by
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [
      campaignId,
      eventType,
      details.recipient || null,
      details.resendEmailId || null,
      JSON.stringify(details.payload || {}),
      createdBy,
    ],
  );
}

async function syncSegmentToResend(segmentId: string) {
  const capabilities = marketingCapabilities();
  if (!capabilities.resendSyncConfigured) {
    throw new MarketingOperationError(503, "RESEND_MARKETING_API_KEY is required for contact and campaign sync");
  }

  const segmentResult = await query<{ id: string; name: string; resend_segment_id: string | null }>(
    `SELECT id, name, resend_segment_id FROM crm_marketing_segments WHERE id = $1`,
    [segmentId],
  );
  if (segmentResult.rows.length === 0) throw new MarketingOperationError(404, "Segment not found");

  const localSegment = segmentResult.rows[0];
  let resendSegmentId = localSegment.resend_segment_id;
  if (!resendSegmentId) {
    const remote = await createResendSegment(`Eivitech — ${localSegment.name} — ${localSegment.id.slice(0, 8)}`);
    resendSegmentId = remote.id;
    await query(
      `UPDATE crm_marketing_segments SET resend_segment_id = $1, updated_at = now() WHERE id = $2`,
      [resendSegmentId, segmentId],
    );
  }

  const contacts = await query<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    resend_contact_id: string | null;
  }>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.resend_contact_id
     FROM crm_marketing_contacts c
     JOIN crm_marketing_segment_members sm ON sm.contact_id = c.id
     WHERE sm.segment_id = $1
       AND c.status = 'subscribed'
       AND c.marketing_consent = true
       AND c.unsubscribed_at IS NULL
       AND c.suppressed_at IS NULL
     ORDER BY c.created_at ASC`,
    [segmentId],
  );

  if (contacts.rows.length > capabilities.maxRecipients) {
    throw new MarketingOperationError(
      409,
      `The segment contains ${contacts.rows.length} eligible contacts; the configured safety limit is ${capabilities.maxRecipients}`,
    );
  }

  let synced = 0;
  for (let index = 0; index < contacts.rows.length; index += 5) {
    const batch = contacts.rows.slice(index, index + 5);
    const results = await Promise.all(batch.map(async (contact) => {
      const resendContactId = await upsertResendContact(contact, resendSegmentId as string);
      await query(
        `UPDATE crm_marketing_contacts SET resend_contact_id = $1, updated_at = now() WHERE id = $2`,
        [resendContactId, contact.id],
      );
      return resendContactId;
    }));
    synced += results.length;
  }

  return { resendSegmentId, eligible: contacts.rows.length, synced };
}
'''
replace_once(
    "api/src/marketing.ts",
    'export const marketingRouter = Router();\n',
    'export const marketingRouter = Router();\n' + helpers + '\nmarketingRouter.get("/capabilities", (_req, res) => {\n  res.json(marketingCapabilities());\n});\n',
)

# Force every newly created campaign to be a draft.
replace_once("api/src/marketing.ts", '      data.status || "draft",', '      "draft",')

# Protect campaign editing and invalidate any old one-time confirmation.
replace_once(
    "api/src/marketing.ts",
    '''  const existing = current.rows[0] as Record<string, unknown>;
  const data = parsed.data;
  const result = await query(
''',
    '''  const existing = current.rows[0] as Record<string, unknown>;
  const data = parsed.data;
  if (existing.status !== "draft") {
    return res.status(409).json({ error: "Only draft campaigns can be edited" });
  }
  if (data.status && data.status !== "draft") {
    return res.status(400).json({ error: "Campaign status cannot be changed from the editor" });
  }
  const result = await query(
''',
)
replace_once(
    "api/src/marketing.ts",
    '''       html = $12,
       scheduled_at = $13,
       updated_at = now()
''',
    '''       html = $12,
       scheduled_at = $13,
       status = 'draft',
       send_confirmation_token_hash = NULL,
       send_confirmation_expires_at = NULL,
       updated_at = now()
''',
)
replace_once("api/src/marketing.ts", '      data.status ?? existing.status,', '      "draft",')

endpoints = r'''

marketingRouter.post("/segments/:id/sync-resend", asyncRoute(async (req, res) => {
  const result = await syncSegmentToResend(req.params.id);
  return res.json(result);
}));

marketingRouter.post("/campaigns/:id/test", asyncRoute(async (req, res) => {
  const parsed = campaignTestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid test email request", details: parsed.error.flatten() });

  const campaign = await loadCampaign(req.params.id);
  if (campaign.status !== "draft") return res.status(409).json({ error: "Only draft campaigns can send tests" });
  if (!campaign.subject.trim() || !campaign.html.trim()) return res.status(400).json({ error: "Subject and HTML are required" });

  const sent = await sendMarketingTestEmail(campaign, parsed.data.email, {
    firstName: cleanText(parsed.data.first_name) || undefined,
    lastName: cleanText(parsed.data.last_name) || undefined,
  });
  await query(`UPDATE crm_marketing_campaigns SET last_test_at = now(), updated_at = now() WHERE id = $1`, [campaign.id]);
  await recordCampaignEvent(campaign.id, "test_sent", req.crmUser?.id || null, {
    recipient: parsed.data.email,
    resendEmailId: sent.id,
  });
  return res.json({ ok: true, resend_email_id: sent.id });
}));

marketingRouter.delete("/campaigns/:id", asyncRoute(async (req, res) => {
  const campaign = await loadCampaign(req.params.id);
  if (campaign.status !== "draft") return res.status(409).json({ error: "Only draft campaigns can be deleted" });

  if (campaign.resend_broadcast_id) {
    try {
      await deleteResendBroadcast(campaign.resend_broadcast_id);
    } catch (error) {
      if (!(error instanceof ResendMarketingError) || error.status !== 404) throw error;
    }
  }

  await query(`DELETE FROM crm_marketing_campaigns WHERE id = $1`, [campaign.id]);
  return res.json({ ok: true, deleted: true });
}));

marketingRouter.post("/campaigns/:id/prepare", asyncRoute(async (req, res) => {
  const campaign = await loadCampaign(req.params.id);
  if (campaign.status !== "draft") return res.status(409).json({ error: "Only draft campaigns can be prepared" });
  if (!campaign.segment_id) return res.status(400).json({ error: "Select a segment before preparing the campaign" });
  if (!campaign.subject.trim() || !campaign.html.trim()) return res.status(400).json({ error: "Subject and HTML are required" });

  const sync = await syncSegmentToResend(campaign.segment_id);
  if (sync.eligible === 0) return res.status(409).json({ error: "The selected segment has no eligible subscribed contacts" });

  const broadcastId = await createOrUpdateResendBroadcast(campaign, sync.resendSegmentId);
  const confirmationToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const confirmationPhrase = `INVIA ${sync.eligible} EMAIL`;

  await query(
    `UPDATE crm_marketing_campaigns
     SET resend_broadcast_id = $1,
         recipient_count = $2,
         send_confirmation_token_hash = $3,
         send_confirmation_expires_at = $4::timestamptz,
         updated_at = now()
     WHERE id = $5`,
    [broadcastId, sync.eligible, tokenHash(confirmationToken), expiresAt, campaign.id],
  );
  await recordCampaignEvent(campaign.id, "prepared", req.crmUser?.id || null, {
    payload: { broadcastId, recipientCount: sync.eligible, resendSegmentId: sync.resendSegmentId },
  });

  return res.json({
    ok: true,
    broadcast_id: broadcastId,
    recipient_count: sync.eligible,
    confirmation_token: confirmationToken,
    confirmation_phrase: confirmationPhrase,
    confirmation_expires_at: expiresAt,
    bulk_send_enabled: marketingCapabilities().bulkSendEnabled,
  });
}));

marketingRouter.post("/campaigns/:id/send", asyncRoute(async (req, res) => {
  const capabilities = marketingCapabilities();
  if (!capabilities.bulkSendEnabled) {
    return res.status(403).json({ error: "Bulk sending is disabled by MARKETING_BULK_SEND_ENABLED" });
  }

  const parsed = campaignSendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid send confirmation", details: parsed.error.flatten() });

  const campaign = await loadCampaign(req.params.id);
  const expectedPhrase = `INVIA ${campaign.recipient_count} EMAIL`;
  if (parsed.data.confirmation_phrase !== expectedPhrase) {
    return res.status(400).json({ error: "The confirmation phrase does not match" });
  }
  if (!campaign.resend_broadcast_id) return res.status(409).json({ error: "Prepare the campaign before sending" });

  const consumed = await query<MarketingCampaignRow>(
    `UPDATE crm_marketing_campaigns
     SET send_confirmation_token_hash = NULL,
         send_confirmation_expires_at = NULL,
         status = 'sending',
         updated_at = now()
     WHERE id = $1
       AND status = 'draft'
       AND send_confirmation_token_hash = $2
       AND send_confirmation_expires_at > now()
     RETURNING *`,
    [campaign.id, tokenHash(parsed.data.confirmation_token.toLowerCase())],
  );
  if (consumed.rows.length === 0) {
    return res.status(409).json({ error: "The send confirmation expired or was already used; prepare the campaign again" });
  }

  try {
    const sent = await sendResendBroadcast(campaign.resend_broadcast_id);
    await query(
      `UPDATE crm_marketing_campaigns SET status = 'sent', sent_at = now(), updated_at = now() WHERE id = $1`,
      [campaign.id],
    );
    await recordCampaignEvent(campaign.id, "send_started", req.crmUser?.id || null, {
      payload: { broadcastId: campaign.resend_broadcast_id, resendResponseId: sent.id },
    });
    return res.json({ ok: true, status: "sent", broadcast_id: campaign.resend_broadcast_id });
  } catch (error) {
    await query(`UPDATE crm_marketing_campaigns SET status = 'failed', updated_at = now() WHERE id = $1`, [campaign.id]);
    await recordCampaignEvent(campaign.id, "send_failed", req.crmUser?.id || null, {
      payload: { message: error instanceof Error ? error.message : "Unknown send error" },
    });
    throw error;
  }
}));
'''
replace_once(
    "api/src/marketing.ts",
    'marketingRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {',
    endpoints + '\nmarketingRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {',
)
replace_once(
    "api/src/marketing.ts",
    '''  if (code === "23503") {
    return res.status(400).json({ error: "A referenced marketing record does not exist" });
  }
  return res.status(500).json({ error: "Email marketing request failed" });
''',
    '''  if (code === "23503") {
    return res.status(400).json({ error: "A referenced marketing record does not exist" });
  }
  if (error instanceof MarketingOperationError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error instanceof ResendMarketingError) {
    return res.status(502).json({ error: "Resend marketing request failed", details: error.responseBody });
  }
  return res.status(500).json({ error: "Email marketing request failed" });
''',
)

# ---------------------------------------------------------------------------
# Resend webhook: contact opt-outs and unique campaign recipient metrics.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/resendWebhook.ts",
    '''type ResendWebhookData = {
  email_id?: string;
''',
    '''type ResendWebhookData = {
  id?: string;
  email?: string;
  unsubscribed?: boolean;
  email_id?: string;
  broadcast_id?: string;
  to?: string[];
''',
)
webhook_insert = r'''

    if (eventType === "contact.updated" && event.data?.unsubscribed === true) {
      const contactId = event.data.id || null;
      const email = event.data.email?.toLowerCase() || null;
      const updated = await query<{ id: string }>(
        `UPDATE crm_marketing_contacts
         SET status = 'unsubscribed',
             marketing_consent = false,
             consent_at = NULL,
             unsubscribed_at = COALESCE(unsubscribed_at, $1::timestamptz),
             updated_at = now()
         WHERE ($2::text IS NOT NULL AND resend_contact_id = $2)
            OR ($3::text IS NOT NULL AND email = $3)
         RETURNING id`,
        [eventAt, contactId, email],
      );
      for (const contact of updated.rows) {
        await query(
          `INSERT INTO crm_marketing_consent_events (contact_id, event_type, source, metadata)
           VALUES ($1, 'unsubscribed', 'resend-webhook', $2::jsonb)`,
          [contact.id, JSON.stringify({ eventType, svixId })],
        );
      }
    }

    const broadcastId = event.data?.broadcast_id || null;
    if (broadcastId && resendEmailId) {
      const campaign = await query<{ id: string }>(
        `SELECT id FROM crm_marketing_campaigns WHERE resend_broadcast_id = $1`,
        [broadcastId],
      );
      const campaignId = campaign.rows[0]?.id;
      const recipient = event.data?.to?.[0]?.toLowerCase() || null;
      if (campaignId) {
        const recipientEvent = await query<{ id: string }>(
          `INSERT INTO crm_marketing_campaign_recipient_events (
             campaign_id, resend_email_id, recipient, event_type, occurred_at, payload
           ) VALUES ($1, $2, $3, $4, $5::timestamptz, $6::jsonb)
           ON CONFLICT (campaign_id, resend_email_id, event_type) DO NOTHING
           RETURNING id`,
          [campaignId, resendEmailId, recipient, eventType, eventAt, JSON.stringify(event)],
        );

        if (recipientEvent.rows.length > 0) {
          const counterColumn: Record<string, string> = {
            "email.delivered": "delivered_count",
            "email.opened": "opened_count",
            "email.clicked": "clicked_count",
            "email.bounced": "bounced_count",
            "email.complained": "complained_count",
          };
          const column = counterColumn[eventType];
          if (column) {
            await query(
              `UPDATE crm_marketing_campaigns SET ${column} = ${column} + 1, updated_at = now() WHERE id = $1`,
              [campaignId],
            );
          }
        }

        if (recipient && ["email.bounced", "email.complained", "email.suppressed"].includes(eventType)) {
          const terminalStatus = eventType === "email.bounced" ? "suppressed" : "suppressed";
          const reason = eventErrorMessage(event) || eventType;
          const contacts = await query<{ id: string }>(
            `UPDATE crm_marketing_contacts
             SET status = $1,
                 marketing_consent = false,
                 consent_at = NULL,
                 suppressed_at = COALESCE(suppressed_at, $2::timestamptz),
                 suppression_reason = $3,
                 updated_at = now()
             WHERE email = $4
             RETURNING id`,
            [terminalStatus, eventAt, reason, recipient],
          );
          for (const contact of contacts.rows) {
            await query(
              `INSERT INTO crm_marketing_consent_events (contact_id, event_type, source, metadata)
               VALUES ($1, 'suppressed', 'resend-webhook', $2::jsonb)`,
              [contact.id, JSON.stringify({ eventType, broadcastId, resendEmailId })],
            );
          }
        }
      }
    }
'''
replace_once(
    "api/src/resendWebhook.ts",
    '''    const status = EVENT_STATUS[eventType];
    if (status && resendEmailId) {
''',
    webhook_insert + '\n    const status = EVENT_STATUS[eventType];\n    if (status && resendEmailId) {\n',
)

# ---------------------------------------------------------------------------
# Frontend API client.
# ---------------------------------------------------------------------------
replace_once(
    "src/lib/marketing.ts",
    '  method?: "GET" | "POST" | "PATCH";\n',
    '  method?: "GET" | "POST" | "PATCH" | "DELETE";\n',
)
replace_once(
    "src/lib/marketing.ts",
    '''export type MarketingCampaign = MarketingCampaignInput & {
  id: string;
''',
    '''export type MarketingCampaign = MarketingCampaignInput & {
  id: string;
  resend_broadcast_id?: string | null;
  last_test_at?: string | null;
''',
)
client_additions = r'''

export type MarketingCapabilities = {
  testSendConfigured: boolean;
  resendSyncConfigured: boolean;
  bulkSendEnabled: boolean;
  maxRecipients: number;
  freeContactLimit: number;
};

export type MarketingCampaignPreparation = {
  ok: true;
  broadcast_id: string;
  recipient_count: number;
  confirmation_token: string;
  confirmation_phrase: string;
  confirmation_expires_at: string;
  bulk_send_enabled: boolean;
};

export function fetchMarketingCapabilities(token: string) {
  return marketingRequest<MarketingCapabilities>("/capabilities", { token });
}

export function deleteMarketingCampaign(token: string, campaignId: string) {
  return marketingRequest<{ ok: boolean; deleted: boolean }>(`/campaigns/${campaignId}`, { method: "DELETE", token });
}

export function sendMarketingCampaignTest(token: string, campaignId: string, payload: { email: string; first_name?: string; last_name?: string }) {
  return marketingRequest<{ ok: boolean; resend_email_id: string }>(`/campaigns/${campaignId}/test`, { method: "POST", token, body: payload });
}

export function syncMarketingSegment(token: string, segmentId: string) {
  return marketingRequest<{ resendSegmentId: string; eligible: number; synced: number }>(`/segments/${segmentId}/sync-resend`, { method: "POST", token, body: {} });
}

export function prepareMarketingCampaign(token: string, campaignId: string) {
  return marketingRequest<MarketingCampaignPreparation>(`/campaigns/${campaignId}/prepare`, { method: "POST", token, body: {} });
}

export function sendMarketingCampaign(token: string, campaignId: string, payload: { confirmation_token: string; confirmation_phrase: string }) {
  return marketingRequest<{ ok: boolean; status: string; broadcast_id: string }>(`/campaigns/${campaignId}/send`, { method: "POST", token, body: payload });
}
'''
write("src/lib/marketing.ts", read("src/lib/marketing.ts") + client_additions)

# ---------------------------------------------------------------------------
# Dedicated campaign workspace keeps the existing contacts/segments UI small.
# ---------------------------------------------------------------------------
campaign_component = r'''import { useEffect, useState, type FormEvent } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Eye, MailCheck, Pencil, Send, ShieldCheck, Trash2, X } from "lucide-react";
import {
  createMarketingCampaign,
  deleteMarketingCampaign,
  fetchMarketingCapabilities,
  prepareMarketingCampaign,
  sendMarketingCampaign,
  sendMarketingCampaignTest,
  updateMarketingCampaign,
  type MarketingCampaign,
  type MarketingCampaignInput,
  type MarketingCampaignPreparation,
  type MarketingCapabilities,
  type MarketingLanguage,
  type MarketingSegment,
} from "@/lib/marketing";
import { tr } from "@/lib/i18n";

const EMPTY_CAMPAIGN: MarketingCampaignInput = {
  name: "",
  subject: "",
  preview_text: "",
  from_name: "Eivitech",
  from_email: "newsletter@notifications.eivitech.com",
  reply_to: "info@eivitech.com",
  language: "it",
  status: "draft",
  segment_id: null,
  topic: "",
  html: "<p>Ciao {{first_name}},</p><p>scrivi qui il contenuto della campagna Eivitech.</p>",
};

const LANGUAGE_OPTIONS: { value: MarketingLanguage; label: string }[] = [
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "nl", label: "Nederlands" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-sm"><span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span><input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="block text-sm"><span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span><select className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 font-medium">{value}</div></div>;
}

export function CampaignWorkspace({ campaigns, segments, onChanged }: { campaigns: MarketingCampaign[]; segments: MarketingSegment[]; onChanged: () => Promise<void> }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [form, setForm] = useState<MarketingCampaignInput>(EMPTY_CAMPAIGN);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<MarketingCampaign | null>(null);
  const [testCampaign, setTestCampaign] = useState<MarketingCampaign | null>(null);
  const [testEmail, setTestEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [capabilities, setCapabilities] = useState<MarketingCapabilities | null>(null);
  const [preparation, setPreparation] = useState<{ campaign: MarketingCampaign; data: MarketingCampaignPreparation } | null>(null);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  async function tokenOrThrow() {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    return token;
  }

  useEffect(() => {
    void (async () => {
      try { setCapabilities(await fetchMarketingCapabilities(await tokenOrThrow())); }
      catch (err) { console.error("[campaign-workspace] capabilities failed", err); }
    })();
  }, []);

  function resetEditor() {
    setEditingId(null);
    setForm(EMPTY_CAMPAIGN);
  }

  function startEdit(campaign: MarketingCampaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      subject: campaign.subject,
      preview_text: campaign.preview_text || "",
      from_name: campaign.from_name || "Eivitech",
      from_email: campaign.from_email || "newsletter@notifications.eivitech.com",
      reply_to: campaign.reply_to || "info@eivitech.com",
      language: campaign.language || "it",
      status: "draft",
      segment_id: campaign.segment_id || null,
      topic: campaign.topic || "",
      html: campaign.html || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(null); setNotice(null);
    try {
      const token = await tokenOrThrow();
      if (editingId) {
        await updateMarketingCampaign(token, editingId, form);
        setNotice(tr("Borrador actualizado.", "Bozza aggiornata.", "Draft updated.", "Concept bijgewerkt."));
      } else {
        await createMarketingCampaign(token, form);
        setNotice(tr("Borrador guardado.", "Bozza salvata.", "Draft saved.", "Concept opgeslagen."));
      }
      resetEditor();
      await onChanged();
    } catch (err) {
      console.error("[campaign-workspace] save failed", err);
      setError(err instanceof Error ? err.message : "Campaign save failed");
    } finally { setSaving(false); }
  }

  async function remove(campaign: MarketingCampaign) {
    if (!window.confirm(tr("¿Eliminar definitivamente este borrador?", "Eliminare definitivamente questa bozza?", "Permanently delete this draft?", "Dit concept definitief verwijderen?"))) return;
    setSaving(true); setError(null);
    try {
      await deleteMarketingCampaign(await tokenOrThrow(), campaign.id);
      if (editingId === campaign.id) resetEditor();
      setNotice(tr("Borrador eliminado.", "Bozza eliminata.", "Draft deleted.", "Concept verwijderd."));
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); }
    finally { setSaving(false); }
  }

  async function sendTest(event: FormEvent) {
    event.preventDefault();
    if (!testCampaign) return;
    setSaving(true); setError(null);
    try {
      await sendMarketingCampaignTest(await tokenOrThrow(), testCampaign.id, { email: testEmail });
      setNotice(`${tr("Email de prueba enviada a", "Email di prova inviata a", "Test email sent to", "Testmail verzonden naar")} ${testEmail}.`);
      setTestCampaign(null);
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Test send failed"); }
    finally { setSaving(false); }
  }

  async function prepare(campaign: MarketingCampaign) {
    if (!window.confirm(tr("¿Sincronizar el segmento y preparar el envío sin enviarlo todavía?", "Sincronizzare il segmento e preparare l’invio senza spedire ancora nulla?", "Sync the segment and prepare the send without sending anything yet?", "Het segment synchroniseren en de verzending voorbereiden zonder nog iets te verzenden?"))) return;
    setSaving(true); setError(null); setNotice(null);
    try {
      const data = await prepareMarketingCampaign(await tokenOrThrow(), campaign.id);
      setPreparation({ campaign, data });
      setConfirmationPhrase("");
      setReviewConfirmed(false);
      setNotice(tr("Campaña preparada. Todavía no se ha enviado nada.", "Campagna preparata. Non è stata ancora inviata alcuna email.", "Campaign prepared. Nothing has been sent yet.", "Campagne voorbereid. Er is nog niets verzonden."));
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Preparation failed"); }
    finally { setSaving(false); }
  }

  async function confirmSend() {
    if (!preparation) return;
    setSaving(true); setError(null);
    try {
      await sendMarketingCampaign(await tokenOrThrow(), preparation.campaign.id, {
        confirmation_token: preparation.data.confirmation_token,
        confirmation_phrase: confirmationPhrase,
      });
      setPreparation(null);
      setNotice(tr("Envío iniciado.", "Invio avviato.", "Send started.", "Verzending gestart."));
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Send failed"); }
    finally { setSaving(false); }
  }

  return <div className="mt-6 grid gap-6 xl:grid-cols-[480px_1fr]">
    <form onSubmit={save} className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3"><div className="font-medium">{editingId ? tr("Editar campaña", "Modifica campagna", "Edit campaign", "Campagne bewerken") : tr("Nueva campaña", "Nuova campagna", "New campaign", "Nieuwe campagne")}</div>{editingId && <button type="button" onClick={resetEditor} className="text-xs text-primary hover:underline">{tr("Cancelar", "Annulla", "Cancel", "Annuleren")}</button>}</div>
      {error && <div className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
      {notice && <div className="mt-4 rounded-sm border border-secondary/30 bg-secondary/10 p-3 text-xs">{notice}</div>}
      <div className="mt-4 space-y-3">
        <Input label={tr("Nombre interno", "Nome interno", "Internal name", "Interne naam")} required value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
        <Input label={tr("Asunto", "Oggetto", "Subject", "Onderwerp")} required value={form.subject} onChange={(value) => setForm((current) => ({ ...current, subject: value }))} />
        <Input label="Preview text" value={form.preview_text || ""} onChange={(value) => setForm((current) => ({ ...current, preview_text: value }))} />
        <div className="grid grid-cols-2 gap-3"><Select label={tr("Idioma", "Lingua", "Language", "Taal")} value={form.language || "it"} options={LANGUAGE_OPTIONS} onChange={(value) => setForm((current) => ({ ...current, language: value as MarketingLanguage }))} /><Select label={tr("Segmento", "Segmento", "Segment", "Segment")} value={form.segment_id || ""} options={[{ value: "", label: tr("Sin segmento", "Nessun segmento", "No segment", "Geen segment") }, ...segments.map((segment) => ({ value: segment.id, label: segment.name }))]} onChange={(value) => setForm((current) => ({ ...current, segment_id: value || null }))} /></div>
        <Input label="Topic" value={form.topic || ""} onChange={(value) => setForm((current) => ({ ...current, topic: value }))} />
        <label className="block text-sm"><span className="text-xs uppercase tracking-wide text-muted-foreground">HTML</span><textarea className="mt-1 min-h-72 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs" value={form.html || ""} onChange={(event) => setForm((current) => ({ ...current, html: event.target.value }))} /></label>
        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setPreview({ ...(form as MarketingCampaign), id: editingId || "preview", recipient_count: 0, delivered_count: 0, opened_count: 0, clicked_count: 0, bounced_count: 0, complained_count: 0, unsubscribed_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })} className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-sm"><Eye size={16} />{tr("Vista previa", "Anteprima", "Preview", "Voorbeeld")}</button><button disabled={saving} className="rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{editingId ? tr("Actualizar", "Aggiorna", "Update", "Bijwerken") : tr("Guardar borrador", "Salva bozza", "Save draft", "Concept opslaan")}</button></div>
      </div>
    </form>

    <div className="space-y-4">
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 text-sm"><div className="font-medium">{tr("Protecciones de envío", "Protezioni invio", "Send protections", "Verzendbeveiliging")}</div><div className="mt-1 text-muted-foreground">Test: {capabilities?.testSendConfigured ? "OK" : "non configurato"} · Resend sync: {capabilities?.resendSyncConfigured ? "OK" : "non configurato"} · Bulk: {capabilities?.bulkSendEnabled ? "ABILITATO" : "DISABILITATO"} · limite {capabilities?.maxRecipients || "—"}</div></div>
      {campaigns.map((campaign) => <div key={campaign.id} className="rounded-sm border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-medium">{campaign.name}</div><div className="mt-1 text-sm text-muted-foreground">{campaign.subject}</div></div><span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide">{campaign.status}</span></div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4"><Info label={tr("Idioma", "Lingua", "Language", "Taal")} value={(campaign.language || "it").toUpperCase()} /><Info label={tr("Segmento", "Segmento", "Segment", "Segment")} value={campaign.segment_name || "—"} /><Info label={tr("Destinatarios", "Destinatari", "Recipients", "Ontvangers")} value={String(campaign.recipient_count || 0)} /><Info label={tr("Creada", "Creata", "Created", "Aangemaakt")} value={formatDate(campaign.created_at)} /></div>
        <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => startEdit(campaign)} disabled={campaign.status !== "draft"} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-40"><Pencil size={14} />{tr("Editar", "Modifica", "Edit", "Bewerken")}</button><button onClick={() => setPreview(campaign)} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs"><Eye size={14} />{tr("Vista previa", "Anteprima", "Preview", "Voorbeeld")}</button><button onClick={() => setTestCampaign(campaign)} disabled={campaign.status !== "draft" || !capabilities?.testSendConfigured} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-40"><MailCheck size={14} />Test</button><button onClick={() => void prepare(campaign)} disabled={saving || campaign.status !== "draft" || !campaign.segment_id || !capabilities?.resendSyncConfigured} className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs text-primary-foreground disabled:opacity-40"><ShieldCheck size={14} />{tr("Preparar envío", "Prepara invio", "Prepare send", "Verzending voorbereiden")}</button><button onClick={() => void remove(campaign)} disabled={campaign.status !== "draft"} className="inline-flex items-center gap-2 rounded-sm border border-destructive/30 px-3 py-2 text-xs text-destructive disabled:opacity-40"><Trash2 size={14} />{tr("Eliminar", "Elimina", "Delete", "Verwijderen")}</button></div>
      </div>)}
      {campaigns.length === 0 && <div className="rounded-sm border border-dashed border-border p-8 text-sm text-muted-foreground">{tr("Aún no hay campañas.", "Non ci sono ancora campagne.", "No campaigns yet.", "Nog geen campagnes.")}</div>}
    </div>

    {preview && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-sm bg-card shadow-2xl"><div className="flex items-center justify-between border-b border-border p-4"><div><div className="font-medium">{preview.subject || tr("Sin asunto", "Senza oggetto", "No subject", "Geen onderwerp")}</div><div className="text-xs text-muted-foreground">{preview.preview_text}</div></div><button onClick={() => setPreview(null)}><X /></button></div><iframe title="Email preview" sandbox="" srcDoc={preview.html || ""} className="min-h-[70vh] w-full bg-white" /></div></div>}

    {testCampaign && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><form onSubmit={sendTest} className="w-full max-w-md rounded-sm bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><div className="font-medium">{tr("Enviar email de prueba", "Invia email di prova", "Send test email", "Testmail verzenden")}</div><button type="button" onClick={() => setTestCampaign(null)}><X /></button></div><div className="mt-5"><Input label="Email" type="email" required value={testEmail} onChange={setTestEmail} /></div><p className="mt-3 text-xs text-muted-foreground">{tr("Solo se enviará una prueba a esta dirección.", "Verrà inviata soltanto una prova a questo indirizzo.", "Only one test will be sent to this address.", "Er wordt slechts één test naar dit adres verzonden.")}</p><button disabled={saving} className="mt-5 w-full rounded-sm bg-primary px-4 py-3 text-sm text-primary-foreground">{tr("Enviar prueba", "Invia prova", "Send test", "Test verzenden")}</button></form></div>}

    {preparation && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-xl rounded-sm bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><div className="font-medium">{tr("Confirmación final", "Conferma finale", "Final confirmation", "Definitieve bevestiging")}</div><button onClick={() => setPreparation(null)}><X /></button></div><div className="mt-5 rounded-sm border border-primary/20 bg-primary/5 p-4"><div className="text-3xl font-medium">{preparation.data.recipient_count}</div><div className="text-sm text-muted-foreground">{tr("destinatarios elegibles", "destinatari idonei", "eligible recipients", "geschikte ontvangers")}</div></div><label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} /><span>{tr("He revisado asunto, contenido, segmento y destinatarios.", "Ho controllato oggetto, contenuto, segmento e destinatari.", "I reviewed the subject, content, segment and recipients.", "Ik heb onderwerp, inhoud, segment en ontvangers gecontroleerd.")}</span></label><div className="mt-4"><Input label={`${tr("Escribe", "Scrivi", "Type", "Typ")}: ${preparation.data.confirmation_phrase}`} value={confirmationPhrase} onChange={setConfirmationPhrase} /></div>{!preparation.data.bulk_send_enabled && <div className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{tr("El envío masivo permanece desactivado en Railway.", "L’invio massivo è ancora disattivato su Railway.", "Bulk sending is still disabled in Railway.", "Bulkverzending is nog uitgeschakeld in Railway.")}</div>}<button onClick={() => void confirmSend()} disabled={saving || !reviewConfirmed || confirmationPhrase !== preparation.data.confirmation_phrase || !preparation.data.bulk_send_enabled} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-40"><Send size={16} />{tr("Enviar campaña", "Invia campagna", "Send campaign", "Campagne verzenden")}</button><p className="mt-3 text-center text-xs text-muted-foreground">Token monouso, valido per 10 minuti.</p></div></div>}
  </div>;
}
'''
write("src/components/marketing/CampaignWorkspace.tsx", campaign_component)

# Remove old campaign editor state and use the dedicated component.
replace_once(
    "src/pages/EmailMarketing.tsx",
    'import { parseMarketingContactsCsv } from "@/lib/marketingCsv";\n',
    'import { parseMarketingContactsCsv } from "@/lib/marketingCsv";\nimport { CampaignWorkspace } from "@/components/marketing/CampaignWorkspace";\n',
)
for old in [
    '  createMarketingCampaign,\n',
    '  type MarketingCampaignInput,\n',
]:
    replace_once("src/pages/EmailMarketing.tsx", old, "")
content = read("src/pages/EmailMarketing.tsx")
start = content.index('const EMPTY_CAMPAIGN: MarketingCampaignInput = {')
end = content.index('\n\nconst LANGUAGE_OPTIONS:', start)
content = content[:start] + content[end + 2:]
content = content.replace('  const [campaignForm, setCampaignForm] = useState<MarketingCampaignInput>(EMPTY_CAMPAIGN);\n', '')
start = content.index('  async function saveCampaign(event: FormEvent) {')
end = content.index('\n\n  if (!hasAccess)', start)
content = content[:start] + content[end:]
start = content.index('      {activeTab === "campaigns" && (')
end = content.index('\n      )}\n    </section>', start) + len('\n      )}')
content = content[:start] + '      {activeTab === "campaigns" && <CampaignWorkspace campaigns={campaigns} segments={segments} onChanged={loadWorkspace} />}'+ content[end:]
write("src/pages/EmailMarketing.tsx", content)

# ---------------------------------------------------------------------------
# Environment and documentation.
# ---------------------------------------------------------------------------
env = read("api/.env.example")
insert_after = 'PUBLIC_SITE_URL=https://www.eivitech.com\n'
marketing_env = '''PUBLIC_SITE_URL=https://www.eivitech.com

# Email marketing. Test sends may fall back to RESEND_OWNER_API_KEY.
# Contact/segment/broadcast management requires a Full access key.
RESEND_MARKETING_API_KEY=re_marketing_full_access_replace_me
RESEND_MARKETING_FROM=Eivitech <newsletter@notifications.eivitech.com>
RESEND_MARKETING_REPLY_TO=info@eivitech.com
MARKETING_MAX_RECIPIENTS=100
# Keep false until test sends, unsubscribe and segment sync have been verified in production.
MARKETING_BULK_SEND_ENABLED=false
'''
if insert_after not in env:
    raise RuntimeError("PUBLIC_SITE_URL marker not found")
env = env.replace(insert_after, marketing_env, 1)
write("api/.env.example", env)

readme = read("api/README.md")
readme += r'''

## Email marketing safe-send workflow

The protected CRM workspace supports draft editing/deletion, sandboxed HTML preview, test sends, Resend segment/contact sync and a two-step campaign preparation flow.

Required only for Resend contact, segment and broadcast management:

- `RESEND_MARKETING_API_KEY` — a separate Resend key with Full access;
- `RESEND_MARKETING_FROM`;
- `RESEND_MARKETING_REPLY_TO`;
- `MARKETING_MAX_RECIPIENTS` — server-side recipient ceiling, default 100;
- `MARKETING_BULK_SEND_ENABLED=false` — must remain false until production verification is complete.

A real campaign can be sent only when all of the following are true:

1. the campaign is still a draft and has a segment;
2. every recipient is subscribed, has documented consent and is neither unsubscribed nor suppressed;
3. the segment and contacts have been synchronized with Resend;
4. the operator prepares the campaign and receives a one-time 10-minute token;
5. the operator checks the review checkbox and types the exact recipient-count phrase;
6. `MARKETING_BULK_SEND_ENABLED` is explicitly set to `true` on Railway.

Public unsubscribe API:

- `GET /api/marketing-public/unsubscribe/:token`
- `POST /api/marketing-public/unsubscribe/:token`

Public page:

- `/unsubscribe?token=<64-character-token>&lang=it|es|en|nl`
'''
write("api/README.md", readme)

# ---------------------------------------------------------------------------
# Regression tests.
# ---------------------------------------------------------------------------
test = r'''import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const server = readFileSync("api/src/server.ts", "utf8");
const marketing = readFileSync("api/src/marketing.ts", "utf8");
const resend = readFileSync("api/src/resendMarketing.ts", "utf8");
const webhook = readFileSync("api/src/resendWebhook.ts", "utf8");
const migrations = readFileSync("api/src/migrations.ts", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const workspace = readFileSync("src/components/marketing/CampaignWorkspace.tsx", "utf8");
const publicApi = readFileSync("api/src/marketingPublic.ts", "utf8");

test("public unsubscribe is rate limited and mounted before Clerk", () => {
  assert.ok(server.indexOf('"/api/marketing-public"') < server.indexOf("app.use(clerkMiddleware())"));
  assert.match(server, /publicMarketingLimiter/);
  assert.match(publicApi, /marketing_consent = false/);
  assert.match(publicApi, /crm_marketing_consent_events/);
  assert.match(app, /path: "\/unsubscribe"/);
});

test("bulk sends require server flag, one-time token and exact phrase", () => {
  assert.match(marketing, /MARKETING_BULK_SEND_ENABLED/);
  assert.match(marketing, /send_confirmation_token_hash/);
  assert.match(marketing, /send_confirmation_expires_at > now\(\)/);
  assert.match(marketing, /INVIA \$\{campaign\.recipient_count\} EMAIL/);
  assert.match(marketing, /Only draft campaigns can be prepared/);
  assert.match(migrations, /crm_marketing_campaign_events/);
});

test("only eligible consenting contacts are synchronized", () => {
  assert.match(marketing, /c\.status = 'subscribed'/);
  assert.match(marketing, /c\.marketing_consent = true/);
  assert.match(marketing, /c\.unsubscribed_at IS NULL/);
  assert.match(marketing, /c\.suppressed_at IS NULL/);
  assert.match(marketing, /contacts\.rows\.length > capabilities\.maxRecipients/);
});

test("campaign UI includes sandbox preview, test send and double confirmation", () => {
  assert.match(workspace, /sandbox=""/);
  assert.match(workspace, /sendMarketingCampaignTest/);
  assert.match(workspace, /reviewConfirmed/);
  assert.match(workspace, /confirmationPhrase !== preparation\.data\.confirmation_phrase/);
  assert.match(workspace, /bulk_send_enabled/);
});

test("Resend broadcasts contain the provider-managed unsubscribe link", () => {
  assert.match(resend, /RESEND_UNSUBSCRIBE_URL/);
  assert.match(resend, /createOrUpdateResendBroadcast/);
  assert.match(webhook, /contact\.updated/);
  assert.match(webhook, /crm_marketing_campaign_recipient_events/);
});
'''
write("scripts/email-marketing-safe-send.test.mjs", test)

# Remove this one-shot generator and its workflow from the generated commit.
(ROOT / "scripts/apply-email-marketing-safe-send.py").unlink(missing_ok=True)
(ROOT / ".github/workflows/apply-email-marketing-safe-send.yml").unlink(missing_ok=True)
