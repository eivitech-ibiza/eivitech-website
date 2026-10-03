import { createHash } from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { query } from "./db.js";
import {
  ResendMarketingError,
  cancelResendBroadcast,
  getResendBroadcast,
  marketingCapabilities,
  sendResendBroadcast,
} from "./resendMarketing.js";
import {
  MarketingScheduleError,
  confirmationPhraseForDelivery,
  mapResendBroadcastState,
  validateScheduledInstant,
  type MarketingDeliveryMode,
} from "./marketingSchedule.js";

export const marketingCampaignDeliveryRouter = Router();

const campaignSendSchema = z.object({
  confirmation_token: z.string().regex(/^[a-f0-9]{64}$/i),
  confirmation_phrase: z.string().trim().min(1).max(200),
});

type MarketingCampaignRow = {
  id: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled" | "failed";
  recipient_count: number;
  scheduled_at: Date | string | null;
  sent_at: Date | string | null;
  resend_broadcast_id: string | null;
};

class MarketingDeliveryOperationError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "MarketingDeliveryOperationError";
    this.status = status;
    this.code = code;
  }
}

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isoString(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

async function loadCampaign(id: string) {
  const result = await query<MarketingCampaignRow>(
    `SELECT id, status, recipient_count, scheduled_at, sent_at, resend_broadcast_id
     FROM crm_marketing_campaigns
     WHERE id = $1`,
    [id],
  );
  if (result.rows.length === 0) {
    throw new MarketingDeliveryOperationError(404, "Campaign not found");
  }
  return result.rows[0];
}

async function recordCampaignEvent(
  campaignId: string,
  eventType: "send_started" | "send_failed" | "resend_synced",
  actorId: string | null,
  payload: Record<string, unknown>,
) {
  await query(
    `INSERT INTO crm_marketing_campaign_events (campaign_id, event_type, created_by, payload)
     VALUES ($1, $2, $3, $4)`,
    [campaignId, eventType, actorId, JSON.stringify(payload)],
  );
}

function deliveryModeForCampaign(campaign: MarketingCampaignRow): MarketingDeliveryMode {
  return campaign.scheduled_at ? "scheduled" : "now";
}

function readableResendError(error: unknown) {
  if (!(error instanceof ResendMarketingError)) {
    return error instanceof Error ? error.message : "Errore sconosciuto del provider";
  }
  try {
    const parsed = JSON.parse(error.responseBody) as { message?: string; error?: string };
    return parsed.message || parsed.error || error.responseBody || error.message;
  } catch {
    return error.responseBody || error.message;
  }
}

async function persistAcceptedBroadcastState(
  campaign: MarketingCampaignRow,
  mode: MarketingDeliveryMode,
  providerStatus: string,
  providerScheduledAt?: string | null,
  providerSentAt?: string | null,
) {
  const mapped = mapResendBroadcastState(providerStatus, mode);
  if (!mapped.accepted) return null;

  await query(
    `UPDATE crm_marketing_campaigns
     SET status = $1,
         scheduled_at = COALESCE($2::timestamptz, scheduled_at),
         sent_at = CASE
           WHEN $1 = 'sent' THEN COALESCE($3::timestamptz, sent_at, now())
           ELSE sent_at
         END,
         updated_at = now()
     WHERE id = $4`,
    [mapped.localStatus, providerScheduledAt || null, providerSentAt || null, campaign.id],
  );

  return mapped.localStatus;
}

async function reconcileCampaignAfterOperation(campaign: MarketingCampaignRow) {
  const broadcastId = campaign.resend_broadcast_id;
  if (!broadcastId) return null;
  const provider = await getResendBroadcast(broadcastId);
  const status = await persistAcceptedBroadcastState(
    campaign,
    deliveryModeForCampaign(campaign),
    provider.status,
    provider.scheduled_at,
    provider.sent_at,
  );
  return { provider, status };
}

marketingCampaignDeliveryRouter.post("/campaigns/:id/send", asyncRoute(async (req, res) => {
  const capabilities = marketingCapabilities();
  if (!capabilities.bulkSendEnabled) {
    return res.status(403).json({ error: "Bulk sending is disabled by MARKETING_BULK_SEND_ENABLED" });
  }

  const parsed = campaignSendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid send confirmation", details: parsed.error.flatten() });

  let campaign = await loadCampaign(req.params.id);
  if (["scheduled", "sending", "sent"].includes(campaign.status)) {
    try {
      const reconciled = await reconcileCampaignAfterOperation(campaign);
      campaign = await loadCampaign(campaign.id);
      return res.status(campaign.status === "sent" ? 200 : 202).json({
        ok: true,
        status: campaign.status,
        broadcast_id: campaign.resend_broadcast_id,
        scheduled_at: isoString(campaign.scheduled_at),
        provider_status: reconciled?.provider.status || null,
        idempotent: true,
      });
    } catch {
      return res.status(202).json({
        ok: true,
        status: campaign.status,
        broadcast_id: campaign.resend_broadcast_id,
        scheduled_at: isoString(campaign.scheduled_at),
        provider_status: null,
        idempotent: true,
      });
    }
  }
  if (campaign.status !== "draft") {
    return res.status(409).json({ error: `Campaign cannot be sent from status ${campaign.status}` });
  }

  const deliveryMode = deliveryModeForCampaign(campaign);
  const expectedPhrase = confirmationPhraseForDelivery(deliveryMode, campaign.recipient_count);
  if (parsed.data.confirmation_phrase !== expectedPhrase) {
    return res.status(400).json({ error: "The confirmation phrase does not match" });
  }
  if (!campaign.resend_broadcast_id) return res.status(409).json({ error: "Prepare the campaign before sending" });
  if (deliveryMode === "scheduled" && campaign.scheduled_at) {
    validateScheduledInstant(new Date(campaign.scheduled_at).toISOString());
  }

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
     RETURNING id, status, recipient_count, scheduled_at, sent_at, resend_broadcast_id`,
    [campaign.id, tokenHash(parsed.data.confirmation_token.toLowerCase())],
  );
  if (consumed.rows.length === 0) {
    const latest = await loadCampaign(campaign.id);
    if (["scheduled", "sending", "sent"].includes(latest.status)) {
      return res.status(latest.status === "sent" ? 200 : 202).json({
        ok: true,
        status: latest.status,
        broadcast_id: latest.resend_broadcast_id,
        scheduled_at: isoString(latest.scheduled_at),
        idempotent: true,
      });
    }
    return res.status(409).json({ error: "The send confirmation expired or was already used; prepare the campaign again" });
  }
  campaign = consumed.rows[0];
  const broadcastId = campaign.resend_broadcast_id;
  if (!broadcastId) {
    throw new MarketingDeliveryOperationError(409, "Prepare the campaign before sending");
  }

  try {
    const accepted = await sendResendBroadcast(broadcastId, isoString(campaign.scheduled_at));
    let providerStatus: string | null = null;
    let localStatus = deliveryMode === "scheduled" ? "scheduled" : "sending";

    try {
      const provider = await getResendBroadcast(broadcastId);
      providerStatus = provider.status;
      const persisted = await persistAcceptedBroadcastState(
        campaign,
        deliveryMode,
        provider.status,
        provider.scheduled_at,
        provider.sent_at,
      );
      if (persisted) localStatus = persisted;
    } catch (reconcileError) {
      console.warn("[marketing] Broadcast accepted but immediate reconciliation failed", reconcileError);
    }

    if (!providerStatus || localStatus === "draft" || localStatus === "failed") {
      localStatus = deliveryMode === "scheduled" ? "scheduled" : "sending";
      await query(
        `UPDATE crm_marketing_campaigns
         SET status = $1, updated_at = now()
         WHERE id = $2`,
        [localStatus, campaign.id],
      );
    }

    await recordCampaignEvent(campaign.id, "send_started", req.crmUser?.id || null, {
      broadcastId,
      resendResponseId: accepted.id,
      deliveryMode,
      scheduledAt: isoString(campaign.scheduled_at),
      providerStatus,
    });
    return res.status(localStatus === "sent" ? 200 : 202).json({
      ok: true,
      status: localStatus,
      broadcast_id: broadcastId,
      scheduled_at: isoString(campaign.scheduled_at),
      provider_status: providerStatus,
    });
  } catch (error) {
    let provider: Awaited<ReturnType<typeof getResendBroadcast>> | null = null;
    try {
      provider = await getResendBroadcast(broadcastId);
    } catch (reconcileError) {
      console.warn("[marketing] unable to reconcile uncertain Broadcast send", reconcileError);
    }

    if (provider) {
      const recoveredStatus = await persistAcceptedBroadcastState(
        campaign,
        deliveryMode,
        provider.status,
        provider.scheduled_at,
        provider.sent_at,
      );
      if (recoveredStatus) {
        await recordCampaignEvent(campaign.id, "send_started", req.crmUser?.id || null, {
          broadcastId,
          deliveryMode,
          scheduledAt: isoString(campaign.scheduled_at),
          providerStatus: provider.status,
          recoveredAfterError: true,
        });
        return res.status(recoveredStatus === "sent" ? 200 : 202).json({
          ok: true,
          status: recoveredStatus,
          broadcast_id: broadcastId,
          scheduled_at: provider.scheduled_at || isoString(campaign.scheduled_at),
          provider_status: provider.status,
          reconciled: true,
        });
      }

      if (provider.status.toLowerCase() === "draft") {
        await query(
          `UPDATE crm_marketing_campaigns
           SET status = 'draft', updated_at = now()
           WHERE id = $1 AND status = 'sending'`,
          [campaign.id],
        );
        await recordCampaignEvent(campaign.id, "send_failed", req.crmUser?.id || null, {
          message: readableResendError(error),
          providerStatus: provider.status,
        });
        throw new MarketingDeliveryOperationError(
          502,
          `Resend non ha accettato l'operazione: ${readableResendError(error)}. Prepara nuovamente la campagna prima di riprovare.`,
        );
      }
    }

    await recordCampaignEvent(campaign.id, "send_failed", req.crmUser?.id || null, {
      message: readableResendError(error),
      outcomeUncertain: true,
    });
    throw new MarketingDeliveryOperationError(
      502,
      "L'esito della richiesta a Resend è incerto. La campagna resta bloccata e verrà riconciliata automaticamente: aggiorna l'elenco e non ripetere l'invio.",
    );
  }
}));

marketingCampaignDeliveryRouter.post("/campaigns/:id/cancel", asyncRoute(async (req, res) => {
  let campaign = await loadCampaign(req.params.id);
  if (campaign.status === "cancelled") {
    return res.json({ ok: true, status: "cancelled", broadcast_id: campaign.resend_broadcast_id, idempotent: true });
  }
  if (!campaign.scheduled_at) {
    return res.status(409).json({ error: "Only scheduled campaigns can be cancelled" });
  }
  if (!campaign.resend_broadcast_id) return res.status(409).json({ error: "Campaign has no Resend Broadcast to cancel" });
  if (campaign.status === "paused") {
    return res.status(202).json({
      ok: true,
      status: "paused",
      broadcast_id: campaign.resend_broadcast_id,
      idempotent: true,
    });
  }
  if (!["scheduled", "sending"].includes(campaign.status)) {
    return res.status(409).json({ error: `Campaign cannot be cancelled from status ${campaign.status}` });
  }

  const claimed = await query<MarketingCampaignRow>(
    `UPDATE crm_marketing_campaigns
     SET status = 'paused', updated_at = now()
     WHERE id = $1 AND status IN ('scheduled', 'sending')
     RETURNING id, status, recipient_count, scheduled_at, sent_at, resend_broadcast_id`,
    [campaign.id],
  );
  if (claimed.rows.length === 0) {
    campaign = await loadCampaign(campaign.id);
    return res.status(campaign.status === "cancelled" ? 200 : 202).json({
      ok: true,
      status: campaign.status,
      broadcast_id: campaign.resend_broadcast_id,
      idempotent: true,
    });
  }
  campaign = claimed.rows[0];
  const broadcastId = campaign.resend_broadcast_id;
  if (!broadcastId) throw new MarketingDeliveryOperationError(409, "Campaign has no Resend Broadcast to cancel");

  try {
    const cancelled = await cancelResendBroadcast(broadcastId);
    let providerStatus: string | null = null;
    try {
      const provider = await getResendBroadcast(broadcastId);
      providerStatus = provider.status;
      if (provider.status.toLowerCase() === "sent") {
        await persistAcceptedBroadcastState(campaign, "scheduled", provider.status, provider.scheduled_at, provider.sent_at);
        return res.status(409).json({ error: "L'invio è già iniziato o terminato e non può più essere annullato.", code: "CANCEL_TOO_LATE" });
      }
    } catch (reconcileError) {
      console.warn("[marketing] Broadcast cancellation accepted but immediate reconciliation failed", reconcileError);
    }

    await query(
      `UPDATE crm_marketing_campaigns
       SET status = 'cancelled', updated_at = now()
       WHERE id = $1 AND status = 'paused'`,
      [campaign.id],
    );
    await recordCampaignEvent(campaign.id, "resend_synced", req.crmUser?.id || null, {
      action: "cancelled",
      broadcastId,
      resendResponseId: cancelled.id,
      providerStatus,
    });
    return res.json({
      ok: true,
      status: "cancelled",
      broadcast_id: broadcastId,
      provider_status: providerStatus,
    });
  } catch (error) {
    let provider: Awaited<ReturnType<typeof getResendBroadcast>> | null = null;
    try {
      provider = await getResendBroadcast(broadcastId);
    } catch (reconcileError) {
      console.warn("[marketing] unable to reconcile uncertain Broadcast cancellation", reconcileError);
    }

    if (provider) {
      const providerStatus = provider.status.toLowerCase();
      if (providerStatus === "draft" || providerStatus === "canceled" || providerStatus === "cancelled") {
        await query(`UPDATE crm_marketing_campaigns SET status = 'cancelled', updated_at = now() WHERE id = $1`, [campaign.id]);
        return res.json({
          ok: true,
          status: "cancelled",
          broadcast_id: broadcastId,
          provider_status: provider.status,
          reconciled: true,
        });
      }
      if (providerStatus === "sent") {
        await persistAcceptedBroadcastState(campaign, "scheduled", provider.status, provider.scheduled_at, provider.sent_at);
        return res.status(409).json({ error: "L'invio è già iniziato o terminato e non può più essere annullato.", code: "CANCEL_TOO_LATE" });
      }
      if (providerStatus === "scheduled" || providerStatus === "queued") {
        const restoredStatus = providerStatus === "scheduled" ? "scheduled" : "sending";
        await query(`UPDATE crm_marketing_campaigns SET status = $1, updated_at = now() WHERE id = $2`, [restoredStatus, campaign.id]);
        return res.status(409).json({
          error: `Resend non ha annullato la campagna: ${readableResendError(error)}`,
          code: "CANCEL_REJECTED",
          provider_status: provider.status,
        });
      }
    }

    throw new MarketingDeliveryOperationError(
      502,
      "L'esito dell'annullamento è incerto. La campagna resta bloccata e verrà riconciliata automaticamente: aggiorna l'elenco prima di qualsiasi altra azione.",
    );
  }
}));

marketingCampaignDeliveryRouter.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof MarketingScheduleError) {
    return res.status(error.status).json({ error: error.message, code: error.code });
  }
  if (error instanceof MarketingDeliveryOperationError) {
    return res.status(error.status).json({ error: error.message, code: error.code });
  }
  if (error instanceof ResendMarketingError) {
    return res.status(502).json({ error: "Resend marketing request failed", details: error.responseBody });
  }
  return next(error);
});
