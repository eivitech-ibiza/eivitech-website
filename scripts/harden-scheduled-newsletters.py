from pathlib import Path
import re


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}, found {count}: {old[:160]!r}")
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")
    print(f"updated {path}")


def replace_regex_once(path: str, pattern: str, replacement: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, replacement, source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Expected exactly one regex match in {path}, found {count}: {pattern[:160]!r}")
    file_path.write_text(updated, encoding="utf-8")
    print(f"updated {path}")


# ---------------------------------------------------------------------------
# Serialize campaign preparation and pool allocation across API instances.
# The row lock also prevents an old confirmation token from racing a reprepare.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/marketing.ts",
    '''const campaignPrepareSchema = z.object({
  delivery_mode: z.enum(["now", "scheduled"]).default("now"),
  scheduled_local: z.string().trim().max(32).optional(),
  timezone: z.literal(MARKETING_TIME_ZONE).optional(),
});
''',
    '''const campaignPrepareSchema = z.object({
  delivery_mode: z.enum(["now", "scheduled"]).default("now"),
  scheduled_local: z.string().trim().max(32).optional(),
  timezone: z.literal(MARKETING_TIME_ZONE).optional(),
});

const RESEND_POOL_ADVISORY_LOCK = "eivitech:marketing:resend-segment-pool";
''',
)

replace_once(
    "api/src/marketing.ts",
    '''  details: { recipient?: string | null; resendEmailId?: string | null; payload?: Record<string, unknown> } = {},
) {
  await query(
''',
    '''  details: { recipient?: string | null; resendEmailId?: string | null; payload?: Record<string, unknown> } = {},
  client: DbClient = pool,
) {
  await client.query(
''',
)

replace_once(
    "api/src/marketing.ts",
    '''     WHERE id = $14
     RETURNING *`,
''',
    '''     WHERE id = $14
       AND status = 'draft'
     RETURNING *`,
''',
)
replace_once(
    "api/src/marketing.ts",
    '''  );
  return res.json({ campaign: result.rows[0] });
}));

marketingRouter.post("/segments/:id/sync-resend",''',
    '''  );
  if (result.rows.length === 0) {
    return res.status(409).json({ error: "Campaign changed while it was being edited; refresh and try again" });
  }
  return res.json({ campaign: result.rows[0] });
}));

marketingRouter.post("/segments/:id/sync-resend",''',
)

new_prepare_route = r'''marketingRouter.post("/campaigns/:id/prepare", asyncRoute(async (req, res) => {
  const parsed = campaignPrepareSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid campaign delivery options", details: parsed.error.flatten() });
  }

  const deliveryMode = parsed.data.delivery_mode;
  let scheduledAt: string | null = null;
  if (deliveryMode === "scheduled") {
    if (!parsed.data.scheduled_local || parsed.data.timezone !== MARKETING_TIME_ZONE) {
      return res.status(400).json({
        error: "Per programmare l'invio indica data, ora e fuso Europe/Madrid.",
        code: "SCHEDULE_DETAILS_REQUIRED",
      });
    }
    scheduledAt = validateScheduledInstant(localMadridDateTimeToUtc(parsed.data.scheduled_local));
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1)::bigint)",
      [RESEND_POOL_ADVISORY_LOCK],
    );

    const campaignResult = await client.query<MarketingCampaignRow>(
      `SELECT *
       FROM crm_marketing_campaigns
       WHERE id = $1
       FOR UPDATE`,
      [req.params.id],
    );
    if (campaignResult.rows.length === 0) {
      throw new MarketingOperationError(404, "Campaign not found");
    }

    const campaign = campaignResult.rows[0];
    if (campaign.status !== "draft") {
      throw new MarketingOperationError(409, "Only draft campaigns can be prepared");
    }
    if (!campaign.segment_id) {
      throw new MarketingOperationError(400, "Select a segment before preparing the campaign");
    }
    if (!campaign.subject.trim() || !campaign.html.trim()) {
      throw new MarketingOperationError(400, "Subject and HTML are required");
    }

    const sync = await syncSegmentToResend(campaign.segment_id, campaign.id);
    if (sync.eligible === 0) {
      throw new MarketingOperationError(409, "The selected segment has no eligible subscribed contacts");
    }

    const broadcastId = await createOrUpdateResendBroadcast(campaign, sync.resendSegmentId);
    const confirmationToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const confirmationPhrase = confirmationPhraseForDelivery(deliveryMode, sync.eligible);

    const prepared = await client.query(
      `UPDATE crm_marketing_campaigns
       SET resend_broadcast_id = $1,
           recipient_count = $2,
           scheduled_at = $3::timestamptz,
           send_confirmation_token_hash = $4,
           send_confirmation_expires_at = $5::timestamptz,
           updated_at = now()
       WHERE id = $6
         AND status = 'draft'
       RETURNING id`,
      [broadcastId, sync.eligible, scheduledAt, tokenHash(confirmationToken), expiresAt, campaign.id],
    );
    if (prepared.rows.length === 0) {
      throw new MarketingOperationError(409, "Campaign changed while it was being prepared; refresh and try again");
    }

    await recordCampaignEvent(campaign.id, "prepared", req.crmUser?.id || null, {
      payload: {
        broadcastId,
        recipientCount: sync.eligible,
        resendSegmentId: sync.resendSegmentId,
        deliveryMode,
        scheduledAt,
        timezone: MARKETING_TIME_ZONE,
      },
    }, client);

    await client.query("COMMIT");
    return res.json({
      ok: true,
      broadcast_id: broadcastId,
      recipient_count: sync.eligible,
      confirmation_token: confirmationToken,
      confirmation_phrase: confirmationPhrase,
      confirmation_expires_at: expiresAt,
      bulk_send_enabled: marketingCapabilities().bulkSendEnabled,
      delivery_mode: deliveryMode,
      scheduled_at: scheduledAt,
      scheduled_local: deliveryMode === "scheduled" ? parsed.data.scheduled_local : null,
      timezone: MARKETING_TIME_ZONE,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch((rollbackError) => {
      console.error("[marketing] unable to roll back campaign preparation", rollbackError);
    });
    throw error;
  } finally {
    client.release();
  }
}));'''

replace_regex_once(
    "api/src/marketing.ts",
    r'marketingRouter\.post\("/campaigns/:id/prepare", asyncRoute\(async \(req, res\) => \{.*?\n\}\)\);(?=\n\nmarketingRouter\.use)',
    new_prepare_route,
)

# ---------------------------------------------------------------------------
# Make each confirmation attempt its own provider-idempotency scope.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/resendMarketing.ts",
    '''export async function sendResendBroadcast(broadcastId: string, scheduledAt?: string | null) {
  return resendRequest<{ id: string }>(`/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
    method: "POST",
    apiKey: adminKeyOrThrow(),
    idempotencyKey: `eivitech-broadcast-send-${broadcastId}`,
    body: buildResendBroadcastSendPayload(scheduledAt),
  });
}
''',
    '''export async function sendResendBroadcast(
  broadcastId: string,
  scheduledAt: string | null | undefined,
  confirmationAttemptId: string,
) {
  return resendRequest<{ id: string }>(`/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
    method: "POST",
    apiKey: adminKeyOrThrow(),
    idempotencyKey: `eivitech-broadcast-send-${broadcastId}-${confirmationAttemptId}`,
    body: buildResendBroadcastSendPayload(scheduledAt),
  });
}
''',
)

# ---------------------------------------------------------------------------
# Reconcile concurrent/retried sends without reporting provider acceptance
# while the first request is still unresolved.
# ---------------------------------------------------------------------------
helper_code = r'''

type ExistingSendResolution = {
  accepted: boolean;
  campaign: MarketingCampaignRow;
  providerStatus: string | null;
};

async function hasAcceptedSendEvent(campaignId: string) {
  const result = await query<{ accepted: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM crm_marketing_campaign_events
       WHERE campaign_id = $1
         AND event_type = 'send_started'
     ) AS accepted`,
    [campaignId],
  );
  return Boolean(result.rows[0]?.accepted);
}

async function ensureAcceptedSendEvent(
  campaign: MarketingCampaignRow,
  actorId: string | null,
  providerStatus: string | null,
+) {
  await query(
    `INSERT INTO crm_marketing_campaign_events (campaign_id, event_type, created_by, payload)
     SELECT $1, 'send_started', $2, $3::jsonb
     WHERE NOT EXISTS (
       SELECT 1
       FROM crm_marketing_campaign_events
       WHERE campaign_id = $1
         AND event_type = 'send_started'
     )`,
    [
      campaign.id,
      actorId,
      JSON.stringify({
        broadcastId: campaign.resend_broadcast_id,
        deliveryMode: deliveryModeForCampaign(campaign),
        scheduledAt: isoString(campaign.scheduled_at),
        providerStatus,
        reconciledExistingRequest: true,
      }),
    ],
  );
}

async function resolveExistingSend(
  campaign: MarketingCampaignRow,
  actorId: string | null,
): Promise<ExistingSendResolution> {
  try {
    const reconciled = await reconcileCampaignAfterOperation(campaign);
    const latest = await loadCampaign(campaign.id);
    const accepted = Boolean(
      reconciled?.status
      && ["scheduled", "sending", "sent"].includes(reconciled.status),
    );
    if (accepted) {
      await ensureAcceptedSendEvent(latest, actorId, reconciled?.provider.status || null);
    }
    return {
      accepted,
      campaign: latest,
      providerStatus: reconciled?.provider.status || null,
    };
  } catch (error) {
    console.warn("[marketing] unable to reconcile an existing Broadcast send", error);
  }

  const latest = await loadCampaign(campaign.id);
  const accepted = latest.status === "scheduled"
    || latest.status === "sent"
    || (latest.status === "sending" && await hasAcceptedSendEvent(latest.id));
  if (accepted) {
    await ensureAcceptedSendEvent(latest, actorId, null);
  }
  return { accepted, campaign: latest, providerStatus: null };
}

async function respondForExistingSend(
  req: Request,
  res: Response,
  campaign: MarketingCampaignRow,
) {
  const resolution = await resolveExistingSend(campaign, req.crmUser?.id || null);
  const latest = resolution.campaign;
  if (!resolution.accepted) {
    if (latest.status === "sending") {
      return res.status(202).json({
        ok: false,
        status: latest.status,
        code: "SEND_ACCEPTANCE_PENDING",
        message: "La richiesta di invio è già in corso ma Resend non ne ha ancora confermato l'accettazione. Non ripetere l'operazione.",
        broadcast_id: latest.resend_broadcast_id,
        scheduled_at: isoString(latest.scheduled_at),
        provider_status: resolution.providerStatus,
        idempotent: true,
      });
    }
    return res.status(409).json({
      error: `Resend non conferma un invio attivo per la campagna in stato ${latest.status}. Aggiorna l'elenco prima di riprovare.`,
      code: "SEND_NOT_ACCEPTED",
      status: latest.status,
      provider_status: resolution.providerStatus,
    });
  }

  return res.status(latest.status === "sent" ? 200 : 202).json({
    ok: true,
    status: latest.status,
    broadcast_id: latest.resend_broadcast_id,
    scheduled_at: isoString(latest.scheduled_at),
    provider_status: resolution.providerStatus,
    idempotent: true,
  });
}
'''

# Remove a stray patch marker before inserting.
helper_code = helper_code.replace("\n+) {", "\n) {")
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''async function reconcileCampaignAfterOperation(campaign: MarketingCampaignRow) {
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
''',
    '''async function reconcileCampaignAfterOperation(campaign: MarketingCampaignRow) {
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
''' + helper_code,
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''  if (["scheduled", "sending", "sent"].includes(campaign.status)) {
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
''',
    '''  if (["scheduled", "sending", "sent"].includes(campaign.status)) {
    return respondForExistingSend(req, res, campaign);
  }
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''  const consumed = await query<MarketingCampaignRow>(
''',
    '''  const confirmationAttemptId = tokenHash(parsed.data.confirmation_token.toLowerCase());
  const consumed = await query<MarketingCampaignRow>(
''',
)
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''    [campaign.id, tokenHash(parsed.data.confirmation_token.toLowerCase())],
''',
    '''    [campaign.id, confirmationAttemptId],
''',
)
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''    if (["scheduled", "sending", "sent"].includes(latest.status)) {
      return res.status(latest.status === "sent" ? 200 : 202).json({
        ok: true,
        status: latest.status,
        broadcast_id: latest.resend_broadcast_id,
        scheduled_at: isoString(latest.scheduled_at),
        idempotent: true,
      });
    }
''',
    '''    if (["scheduled", "sending", "sent"].includes(latest.status)) {
      return respondForExistingSend(req, res, latest);
    }
''',
)
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''    const accepted = await sendResendBroadcast(broadcastId, isoString(campaign.scheduled_at));
''',
    '''    const accepted = await sendResendBroadcast(
      broadcastId,
      isoString(campaign.scheduled_at),
      confirmationAttemptId,
    );
''',
)
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''      if (provider.status.toLowerCase() === "draft") {
''',
    '''      if (
        provider.status.toLowerCase() === "draft"
        && error instanceof ResendMarketingError
        && error.status >= 400
        && error.status < 500
      ) {
''',
)

# Cancellation is offered only while the local provider-confirmed state is
# scheduled. This prevents a cancel request from racing the initial send call.
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''  if (!["scheduled", "sending"].includes(campaign.status)) {
    return res.status(409).json({ error: `Campaign cannot be cancelled from status ${campaign.status}` });
  }
''',
    '''  if (campaign.status !== "scheduled") {
    return res.status(409).json({ error: `Campaign cannot be cancelled from status ${campaign.status}` });
  }
''',
)
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''     WHERE id = $1 AND status IN ('scheduled', 'sending')
''',
    '''     WHERE id = $1 AND status = 'scheduled'
''',
)
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''  if (claimed.rows.length === 0) {
    campaign = await loadCampaign(campaign.id);
    return res.status(campaign.status === "cancelled" ? 200 : 202).json({
      ok: true,
      status: campaign.status,
      broadcast_id: campaign.resend_broadcast_id,
      idempotent: true,
    });
  }
''',
    '''  if (claimed.rows.length === 0) {
    campaign = await loadCampaign(campaign.id);
    if (campaign.status === "cancelled") {
      return res.json({
        ok: true,
        status: campaign.status,
        broadcast_id: campaign.resend_broadcast_id,
        idempotent: true,
      });
    }
    if (campaign.status === "paused") {
      return res.status(202).json({
        ok: true,
        status: campaign.status,
        broadcast_id: campaign.resend_broadcast_id,
        idempotent: true,
      });
    }
    return res.status(409).json({
      error: `Campaign cannot be cancelled from status ${campaign.status}`,
      code: "CANCEL_TOO_LATE",
    });
  }
''',
)

# ---------------------------------------------------------------------------
# Reconcile all active provider states on read with a 30-second throttle,
# rather than waiting until five minutes before a scheduled send.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/campaignMetrics.ts",
    '''       AND (
         (status = 'scheduled' AND scheduled_at <= now() + interval '5 minutes')
         OR (status IN ('sending', 'paused') AND updated_at <= now() - interval '30 seconds')
       )
''',
    '''       AND status IN ('scheduled', 'sending', 'paused')
       AND updated_at <= now() - interval '30 seconds'
''',
)

# ---------------------------------------------------------------------------
# Frontend must not claim provider acceptance for an unresolved duplicate.
# ---------------------------------------------------------------------------
replace_once(
    "src/lib/marketing.ts",
    '''    idempotent?: boolean;
    reconciled?: boolean;
  }>(`/campaigns/${campaignId}/send`,''',
    '''    idempotent?: boolean;
    reconciled?: boolean;
    code?: string;
    message?: string;
  }>(`/campaigns/${campaignId}/send`,''',
)

replace_once(
    "src/components/marketing/CampaignWorkspace.tsx",
    '''      setPreparation(null);
      setNotice(result.status === "scheduled"
        ? tr("Programación aceptada por Resend.", "Programmazione accettata da Resend.", "Schedule accepted by Resend.", "Planning geaccepteerd door Resend.")
        : tr("Envío aceptado y en curso.", "Invio accettato e in corso.", "Send accepted and in progress.", "Verzending geaccepteerd en bezig."));
      await onChanged();
''',
    '''      setPreparation(null);
      if (!result.ok) {
        setNotice(tr(
          "La aceptación del envío está en verificación. No repitas la operación; actualiza el listado.",
          "L’accettazione dell’invio è in verifica. Non ripetere l’operazione; aggiorna l’elenco.",
          "Send acceptance is being verified. Do not repeat the operation; refresh the list.",
          "De acceptatie van de verzending wordt gecontroleerd. Herhaal de actie niet; vernieuw de lijst.",
        ));
      } else if (result.status === "scheduled") {
        setNotice(tr("Programación aceptada por Resend.", "Programmazione accettata da Resend.", "Schedule accepted by Resend.", "Planning geaccepteerd door Resend."));
      } else if (result.status === "sent") {
        setNotice(tr(
          "Resend ha completado la expedición; las entregas se actualizan por separado.",
          "Resend ha completato la spedizione; le consegne si aggiornano separatamente.",
          "Resend completed the campaign send; deliveries update separately.",
          "Resend heeft de campagneverzending voltooid; afleveringen worden apart bijgewerkt.",
        ));
      } else {
        setNotice(tr(
          "Envío aceptado y puesto en cola por Resend.",
          "Invio accettato e messo in coda da Resend.",
          "Send accepted and queued by Resend.",
          "Verzending geaccepteerd en in de wachtrij geplaatst door Resend.",
        ));
      }
      await onChanged();
''',
)
replace_once(
    "src/components/marketing/CampaignWorkspace.tsx",
    '''{campaign.scheduled_at && ["scheduled", "sending"].includes(campaign.status) && <button type="button" onClick={() => void cancelSchedule(campaign)}''',
    '''{campaign.scheduled_at && campaign.status === "scheduled" && <button type="button" onClick={() => void cancelSchedule(campaign)}''',
)

# ---------------------------------------------------------------------------
# Tests: provider idempotency, pool locking, cancellation race and truthful
# duplicate responses.
# ---------------------------------------------------------------------------
replace_once(
    "api/src/resendBroadcastScheduling.test.ts",
    '''  await sendResendBroadcast("broadcast-1", "2026-10-10T08:30:00.000Z");
''',
    '''  await sendResendBroadcast("broadcast-1", "2026-10-10T08:30:00.000Z", "attempt-abc");
''',
)
replace_once(
    "api/src/resendBroadcastScheduling.test.ts",
    '''  assert.equal(calls[0].init?.headers && (calls[0].init.headers as Record<string, string>)["Idempotency-Key"], "eivitech-broadcast-send-broadcast-1");
''',
    '''  assert.equal(calls[0].init?.headers && (calls[0].init.headers as Record<string, string>)["Idempotency-Key"], "eivitech-broadcast-send-broadcast-1-attempt-abc");
''',
)

replace_once(
    "api/src/resendSegmentPool.test.ts",
    '''  assert.match(marketingSource, /\blistResendSegments\b/);
  assert.match(marketingSource, /\bselectResendSegmentPool\b/);
});
''',
    '''  assert.match(marketingSource, /\blistResendSegments\b/);
  assert.match(marketingSource, /\bselectResendSegmentPool\b/);
  assert.match(marketingSource, /pg_advisory_xact_lock/);
  assert.match(marketingSource, /FOR UPDATE/);
});
''',
)

replace_once(
    "api/src/marketingSchedulingIntegration.test.ts",
    '''  assert.match(source, /updated_at <= now\(\) - interval '30 seconds'/);
  assert.match(source, /scheduled_at <= now\(\) \+ interval '5 minutes'/);
});
''',
    '''  assert.match(source, /status IN \('scheduled', 'sending', 'paused'\)/);
  assert.match(source, /updated_at <= now\(\) - interval '30 seconds'/);
  assert.doesNotMatch(source, /scheduled_at <= now\(\) \+ interval '5 minutes'/);
});
''',
)

Path("api/src/marketingConcurrencyIntegration.test.ts").write_text(
    '''import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("campaign preparation serializes Resend pool allocation and locks the campaign row", () => {
  const source = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /SELECT \*[\s\S]*FOR UPDATE/);
  assert.match(source, /WHERE id = \$6[\s\S]*AND status = 'draft'/);
});

test("campaign edits cannot overwrite an accepted concurrent send", () => {
  const source = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  assert.match(source, /WHERE id = \$14[\s\S]*AND status = 'draft'[\s\S]*RETURNING \*/);
});

test("concurrent send retries do not report success before provider acceptance", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /SEND_ACCEPTANCE_PENDING/);
  assert.match(source, /hasAcceptedSendEvent/);
  assert.match(source, /ok: false/);
  assert.match(source, /confirmationAttemptId/);
});

test("cancellation cannot race the initial provider send request", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /campaign\.status !== "scheduled"/);
  assert.match(source, /WHERE id = \$1 AND status = 'scheduled'/);
  assert.doesNotMatch(source, /status IN \('scheduled', 'sending'\)/);
});

test("only explicit provider rejections release an uncertain send immediately", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /error instanceof ResendMarketingError/);
  assert.match(source, /error\.status >= 400/);
  assert.match(source, /error\.status < 500/);
});
''',
    encoding="utf-8",
)
print("created api/src/marketingConcurrencyIntegration.test.ts")

replace_once(
    "scripts/marketing-scheduling.test.mjs",
    '''  assert.match(workspace, /cancelMarketingCampaign/);
''',
    '''  assert.match(workspace, /cancelMarketingCampaign/);
  assert.match(workspace, /campaign\.status === "scheduled"/);
''',
)

# ---------------------------------------------------------------------------
# Keep operational documentation aligned with the verified Broadcast API.
# ---------------------------------------------------------------------------
replace_once(
    "api/README.md",
    '''Campaign preparation supports immediate sending or one-time scheduling through the native Resend Broadcast API. Wall-clock values are interpreted strictly in `Europe/Madrid`, stored in UTC, and rejected when they are past, more than 30 days ahead, nonexistent, or ambiguous during daylight-saving transitions.
''',
    '''Campaign preparation supports immediate sending or one-time scheduling through the native Resend Broadcast API. Wall-clock values are interpreted strictly in `Europe/Madrid`, stored in UTC, and rejected when they are past, nonexistent, or ambiguous during daylight-saving transitions. No transactional-email scheduling limit is assumed for Broadcasts.
''',
)
replace_once(
    "api/README.md",
    '''- `POST /api/marketing/campaigns/:id/cancel` cancels a provider-accepted scheduled/queued Broadcast before completion.
''',
    '''- `POST /api/marketing/campaigns/:id/cancel` accepts cancellation while the campaign is provider-confirmed as scheduled; Resend may also complete that cancellation after it has internally moved the Broadcast to its queue.
''',
)

print("scheduled newsletter concurrency hardening applied")
