import { z } from "zod";
import { query } from "./db.js";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const directEmailSchema = z.object({
  request_id: z.string().uuid(),
  expected_email: z.string().trim().email().max(254),
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(1).max(10000),
  relationship_confirmed: z.literal(true),
}).strict();

export type DirectEmailInput = z.infer<typeof directEmailSchema>;

type ClaimedEmail = {
  id: string;
  lead_id: string;
  recipient_email: string;
  subject: string;
  body_text: string;
  status: string;
  resend_email_id: string | null;
};

export type DirectEmailResult =
  | { status: "not_found" | "recipient_changed" | "conflict" }
  | { status: "accepted" | "failed" | "unknown" | "sending" | "delivered" | "bounced" | "complained" | "suppressed" | "delayed"; id: string; duplicate: boolean; resendEmailId?: string | null };

type ProviderPayload = {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
  tags: Array<{ name: string; value: string }>;
};

export function renderDirectEmailText(body: string) {
  return body;
}

export function createDirectEmailPayload(input: {
  id: string;
  from: string;
  replyTo: string;
  recipient: string;
  subject: string;
  body: string;
}): ProviderPayload {
  return {
    from: input.from,
    to: [input.recipient],
    reply_to: input.replyTo,
    subject: input.subject,
    text: renderDirectEmailText(input.body),
    tags: [
      { name: "kind", value: "crm_direct" },
      { name: "message_id", value: input.id },
    ],
  };
}

const eventStatuses: Readonly<Record<string, string>> = {
  "email.sent": "accepted",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.failed": "failed",
  "email.complained": "complained",
  "email.suppressed": "suppressed",
};

export function mapDirectEmailEvent(currentStatus: string, eventType: string): string | null {
  const next = eventStatuses[eventType];
  if (!next) return null;
  const terminal = ["delivered", "bounced", "failed", "complained", "suppressed"];
  if (terminal.includes(currentStatus) && (next === "accepted" || next === "delayed")) return currentStatus;
  if (terminal.includes(currentStatus) && next === "delivered") return currentStatus;
  return next;
}

function providerConfig() {
  const apiKey = process.env.RESEND_OWNER_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_OWNER_FROM?.trim() || process.env.RESEND_REQUESTER_FROM?.trim();
  const replyTo = process.env.RESEND_REQUESTER_REPLY_TO?.trim()
    || process.env.RESEND_OWNER_TO?.trim() || "info@eivitech.com";
  return apiKey && from ? { apiKey, from, replyTo } : null;
}

async function storeResult(id: string, status: "failed" | "unknown", message: string) {
  await query(
    `UPDATE crm_direct_emails
     SET status = $2, error_message = $3, updated_at = now()
     WHERE id = $1 AND status = 'sending'`,
    [id, status, message.slice(0, 300)],
  );
}

export async function sendCrmDirectEmail(
  leadId: string,
  input: DirectEmailInput,
  actorId: string,
  send: typeof fetch = fetch,
): Promise<DirectEmailResult | { status: "not_configured" }> {
  // A verified sender and owner API key are required. Never fall back to
  // unverified arbitrary addresses or to the newsletter Broadcasts API.
  const config = providerConfig();
  if (!config) return { status: "not_configured" };

  const target = await query<{ id: string; email: string }>(
    `SELECT id, email FROM crm_leads WHERE id = $1`,
    [leadId],
  );
  const lead = target.rows[0];
  if (!lead) return { status: "not_found" };
  if (lead.email.toLowerCase() !== input.expected_email.toLowerCase()) {
    return { status: "recipient_changed" };
  }

  const claimed = await query<ClaimedEmail>(
    `INSERT INTO crm_direct_emails
       (id, lead_id, created_by, recipient_email, subject, body_text,
        sender, reply_to, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sending')
     ON CONFLICT (id) DO NOTHING
     RETURNING id, lead_id, recipient_email, subject, body_text, status, resend_email_id`,
    [
      input.request_id, leadId, actorId, lead.email, input.subject, input.body,
      config.from, config.replyTo,
    ],
  );

  // The client can repeat the same request after a network timeout.
  // Replays NEVER send again; a new request id is needed for a new message.
  if (claimed.rows.length === 0) {
    const previous = await query<ClaimedEmail>(
      `SELECT id, lead_id, recipient_email, subject, body_text, status, resend_email_id
       FROM crm_direct_emails WHERE id = $1`,
      [input.request_id],
    );
    const row = previous.rows[0];
    if (!row || row.lead_id !== leadId || row.recipient_email.toLowerCase() !== lead.email.toLowerCase()
      || row.subject !== input.subject || row.body_text !== input.body) {
      return { status: "conflict" };
    }
    return {
      id: row.id,
      status: row.status as Extract<DirectEmailResult, { id: string }>["status"],
      duplicate: true,
      resendEmailId: row.resend_email_id,
    };
  }

  let response: Response;
  try {
    response = await send(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `eivitech-crm-direct-${input.request_id}`,
      },
      body: JSON.stringify(createDirectEmailPayload({
        id: input.request_id,
        from: config.from,
        replyTo: config.replyTo,
        recipient: lead.email,
        subject: input.subject,
        body: input.body,
      })),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    // A transport timeout can happen AFTER Resend accepted the message.
    // Do not automatically retry or claim it was not delivered.
    await storeResult(input.request_id, "unknown", "Provider response could not be verified");
    return { id: input.request_id, status: "unknown", duplicate: false };
  }

  if (!response.ok) {
    const status = response.status >= 500 ? "unknown" : "failed";
    await storeResult(input.request_id, status, `Resend HTTP ${response.status}`);
    return { id: input.request_id, status, duplicate: false };
  }

  const providerBody = await response.json().catch(() => null) as { id?: unknown } | null;
  if (!providerBody || typeof providerBody.id !== "string" || !providerBody.id) {
    await storeResult(input.request_id, "unknown", "Resend returned no valid message id");
    return { id: input.request_id, status: "unknown", duplicate: false };
  }

  // Provider accepted the message. This is not yet delivery confirmation.
  // Record the send and an activity for the established CRM timeline.
  await query(
    `UPDATE crm_direct_emails
     SET status = 'accepted', resend_email_id = $2,
         accepted_at = now(), updated_at = now(), error_message = NULL
     WHERE id = $1 AND status = 'sending'`,
    [input.request_id, providerBody.id],
  );
  try {
    await query(
      `INSERT INTO crm_activities (lead_id, created_by, type, title, notes)
       VALUES ($1, $2, 'email', $3, $4)`,
      [
        leadId, actorId,
        `Email inviata: ${input.subject}`,
        `Azione: Email individuale\nDestinatario: ${lead.email}\nOggetto: ${input.subject}\nNota: ${input.body}`,
      ],
    );
  } catch (error) {
    // The primary email log is authoritative and must survive a timeline error.
    console.error("[crm-direct-email] could not append CRM activity", error instanceof Error ? error.message : "unknown");
  }

  return { id: input.request_id, status: "accepted", duplicate: false, resendEmailId: providerBody.id };
}
