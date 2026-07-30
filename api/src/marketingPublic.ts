import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { query } from "./db.js";
import { markResendContactUnsubscribed } from "./resendMarketing.js";

const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/i);

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@", 2);
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}

export const marketingPublicRouter = Router();

marketingPublicRouter.get("/unsubscribe/:token", asyncRoute(async (req, res) => {
  const token = tokenSchema.safeParse(req.params.token);
  if (!token.success) return res.status(404).json({ error: "Unsubscribe link not found" });

  const result = await query<{
    email: string;
    language: "es" | "it" | "en" | "nl" | null;
    status: string;
    unsubscribed_at: Date | string | null;
  }>(
    `SELECT email, language, status, unsubscribed_at
     FROM crm_marketing_contacts
     WHERE unsubscribe_token = $1`,
    [token.data.toLowerCase()],
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Unsubscribe link not found" });
  const contact = result.rows[0];
  return res.json({
    email_hint: maskEmail(contact.email),
    language: contact.language || "it",
    unsubscribed: contact.status === "unsubscribed" || contact.status === "suppressed",
    unsubscribed_at: contact.unsubscribed_at,
  });
}));

marketingPublicRouter.post("/unsubscribe/:token", asyncRoute(async (req, res) => {
  const token = tokenSchema.safeParse(req.params.token);
  if (!token.success) return res.status(404).json({ error: "Unsubscribe link not found" });

  const current = await query<{
    id: string;
    email: string;
    resend_contact_id: string | null;
    status: string;
  }>(
    `SELECT id, email, resend_contact_id, status
     FROM crm_marketing_contacts
     WHERE unsubscribe_token = $1`,
    [token.data.toLowerCase()],
  );

  if (current.rows.length === 0) return res.status(404).json({ error: "Unsubscribe link not found" });
  const contact = current.rows[0];

  if (contact.status !== "unsubscribed" && contact.status !== "suppressed") {
    await query(
      `UPDATE crm_marketing_contacts
       SET status = 'unsubscribed',
           marketing_consent = false,
           consent_at = NULL,
           unsubscribed_at = COALESCE(unsubscribed_at, now()),
           updated_at = now()
       WHERE id = $1`,
      [contact.id],
    );

    await query(
      `INSERT INTO crm_marketing_consent_events (contact_id, event_type, source, metadata)
       VALUES ($1, 'unsubscribed', 'public-unsubscribe', $2::jsonb)`,
      [contact.id, JSON.stringify({ method: "public-token", userAgent: req.get("user-agent") || null })],
    );
  }

  const resendIdentity = contact.resend_contact_id || contact.email;
  try {
    await markResendContactUnsubscribed(resendIdentity);
  } catch (error) {
    console.error("[marketing-public] Resend unsubscribe sync failed", error);
  }

  return res.json({ ok: true, unsubscribed: true });
}));

marketingPublicRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[marketing-public] request failed", error);
  return res.status(500).json({ error: "Unsubscribe request failed" });
});
