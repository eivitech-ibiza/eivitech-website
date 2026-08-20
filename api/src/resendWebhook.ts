import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { query } from "./db.js";

type ResendWebhookData = {
  id?: string;
  email?: string;
  unsubscribed?: boolean;
  email_id?: string;
  broadcast_id?: string;
  to?: string[];
  suppressed?: { message?: string; type?: string };
  bounce?: { message?: string; type?: string; subType?: string };
  failed?: { message?: string };
  [key: string]: unknown;
};

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: ResendWebhookData;
};

const EVENT_STATUS: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.failed": "failed",
  "email.complained": "complained",
  "email.suppressed": "suppressed",
};

function headerValue(req: Request, name: string) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function verifySvixSignature(payload: Buffer, req: Request) {
  const secret = process.env.RESEND_OWNER_WEBHOOK_SECRET;
  const id = headerValue(req, "svix-id");
  const timestamp = headerValue(req, "svix-timestamp");
  const signatureHeader = headerValue(req, "svix-signature");

  if (!secret || !id || !timestamp || !signatureHeader) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 5 * 60) return false;

  const encodedSecret = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  let key: Buffer;
  try {
    key = Buffer.from(encodedSecret, "base64");
  } catch {
    return false;
  }

  const signedContent = `${id}.${timestamp}.${payload.toString("utf8")}`;
  const expected = createHmac("sha256", key).update(signedContent).digest("base64");

  return signatureHeader.split(" ").some((candidate) => {
    const [version, signature] = candidate.split(",", 2);
    if (version !== "v1" || !signature) return false;

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
  });
}

function eventErrorMessage(event: ResendWebhookEvent) {
  return event.data?.suppressed?.message
    || event.data?.bounce?.message
    || event.data?.failed?.message
    || null;
}

export function resolveUnsubscribeCampaignSql() {
  return `
    WITH exact_match AS (
      SELECT c.id AS campaign_id, cre.resend_email_id, cre.occurred_at
      FROM crm_marketing_campaigns c
      JOIN crm_marketing_campaign_recipient_events cre ON cre.campaign_id = c.id
      WHERE $1::text IS NOT NULL
        AND c.resend_broadcast_id = $1
        AND cre.recipient = $2
      ORDER BY cre.occurred_at DESC
      LIMIT 1
    ),
    fallback_match AS (
      SELECT c.id AS campaign_id, cre.resend_email_id, cre.occurred_at
      FROM crm_marketing_campaign_recipient_events cre
      JOIN crm_marketing_campaigns c ON c.id = cre.campaign_id
      WHERE cre.recipient = $2
        AND c.status = 'sent'
        AND cre.occurred_at <= $3::timestamptz
      ORDER BY cre.occurred_at DESC
      LIMIT 1
    )
    SELECT campaign_id, resend_email_id FROM exact_match
    UNION ALL
    SELECT campaign_id, resend_email_id FROM fallback_match
    WHERE NOT EXISTS (SELECT 1 FROM exact_match)
    LIMIT 1
  `;
}

export async function handleResendOwnerWebhook(req: Request, res: Response) {
  const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");

  if (!verifySvixSignature(payload, req)) {
    return res.status(400).json({ error: "Invalid Resend webhook signature" });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(payload.toString("utf8")) as ResendWebhookEvent;
  } catch {
    return res.status(400).json({ error: "Invalid Resend webhook payload" });
  }

  const svixId = headerValue(req, "svix-id");
  const eventType = event.type || "unknown";
  const resendEmailId = event.data?.email_id || null;
  const eventAt = event.created_at && !Number.isNaN(Date.parse(event.created_at))
    ? event.created_at
    : new Date().toISOString();

  if (!svixId) return res.status(400).json({ error: "Missing webhook id" });

  try {
    const inserted = await query<{ id: string }>(
      `INSERT INTO crm_resend_webhook_events (
         svix_id, account_key, event_type, resend_email_id, event_created_at, payload
       ) VALUES ($1, 'owner', $2, $3, $4::timestamptz, $5::jsonb)
       ON CONFLICT (svix_id) DO NOTHING
       RETURNING id`,
      [svixId, eventType, resendEmailId, eventAt, JSON.stringify(event)]
    );

    if (inserted.rows.length === 0) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    if (eventType === "contact.updated" && event.data?.unsubscribed === true) {
      const contactId = event.data.id || null;
      const email = event.data.email?.toLowerCase() || null;
      const updated = await query<{ id: string; email: string }>(
        `UPDATE crm_marketing_contacts
         SET status = 'unsubscribed',
             marketing_consent = false,
             consent_at = NULL,
             unsubscribed_at = COALESCE(unsubscribed_at, $1::timestamptz),
             updated_at = now()
         WHERE ($2::text IS NOT NULL AND resend_contact_id = $2)
            OR ($3::text IS NOT NULL AND email = $3)
         RETURNING id, email`,
        [eventAt, contactId, email],
      );
      for (const contact of updated.rows) {
        await query(
          `INSERT INTO crm_marketing_consent_events (contact_id, event_type, source, metadata)
           VALUES ($1, 'unsubscribed', 'resend-webhook', $2::jsonb)`,
          [contact.id, JSON.stringify({ eventType, svixId })],
        );
      }

      const resolvedEmail = email || updated.rows[0]?.email?.toLowerCase() || null;
      if (resolvedEmail) {
        const attributed = await query<{ campaign_id: string; resend_email_id: string }>(
          resolveUnsubscribeCampaignSql(),
          [event.data?.broadcast_id || null, resolvedEmail, eventAt],
        );
        const match = attributed.rows[0];
        if (match) {
          const recipientEvent = await query<{ id: string }>(
            `INSERT INTO crm_marketing_campaign_recipient_events (
               campaign_id, resend_email_id, recipient, event_type, occurred_at, payload
             ) VALUES ($1, $2, $3, 'contact.unsubscribed', $4::timestamptz, $5::jsonb)
             ON CONFLICT (campaign_id, resend_email_id, event_type) DO NOTHING
             RETURNING id`,
            [match.campaign_id, match.resend_email_id, resolvedEmail, eventAt, JSON.stringify(event)],
          );
          if (recipientEvent.rows.length > 0) {
            await query(
              `UPDATE crm_marketing_campaigns
               SET unsubscribed_count = unsubscribed_count + 1, updated_at = now()
               WHERE id = $1`,
              [match.campaign_id],
            );
          }
        }
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
          const terminalStatus = "suppressed";
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

    const status = EVENT_STATUS[eventType];
    if (status && resendEmailId) {
      const errorMessage = eventErrorMessage(event);
      await query(
        `UPDATE crm_email_notifications
         SET status = CASE
               WHEN $1 IN ('sent', 'delayed')
                 AND status IN ('delivered', 'bounced', 'failed', 'complained', 'suppressed')
                 THEN status
               WHEN $1 = 'delivered'
                 AND status IN ('bounced', 'failed', 'complained', 'suppressed')
                 THEN status
               ELSE $1
             END,
             last_event_at = GREATEST(COALESCE(last_event_at, $2::timestamptz), $2::timestamptz),
             delivered_at = CASE WHEN $1 = 'delivered' THEN $2::timestamptz ELSE delivered_at END,
             bounced_at = CASE WHEN $1 = 'bounced' THEN $2::timestamptz ELSE bounced_at END,
             failed_at = CASE WHEN $1 = 'failed' THEN $2::timestamptz ELSE failed_at END,
             delayed_at = CASE WHEN $1 = 'delayed' THEN $2::timestamptz ELSE delayed_at END,
             complained_at = CASE WHEN $1 = 'complained' THEN $2::timestamptz ELSE complained_at END,
             error_message = CASE
               WHEN $1 IN ('suppressed', 'bounced', 'failed') THEN $3
               ELSE error_message
             END,
             payload = payload || $4::jsonb,
             updated_at = now()
         WHERE resend_email_id = $5`,
        [status, eventAt, errorMessage, JSON.stringify({ lastResendEvent: eventType, resendEvent: event }), resendEmailId]
      );
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[resend-webhook] failed to persist event", error);
    return res.status(500).json({ error: "Failed to process Resend webhook" });
  }
}
