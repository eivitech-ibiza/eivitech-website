import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { query } from "./db.js";

type ResendWebhookData = {
  email_id?: string;
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
