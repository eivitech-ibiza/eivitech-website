from pathlib import Path
import re


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}, found {count}: {old[:180]!r}")
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")
    print(f"updated {path}")


def replace_regex_once(path: str, pattern: str, replacement: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, replacement, source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Expected exactly one regex match in {path}, found {count}: {pattern[:180]!r}")
    file_path.write_text(updated, encoding="utf-8")
    print(f"updated {path}")


# Do not let a send-state reconciliation overwrite a cancellation already
# claimed as paused. Terminal provider states may still complete the transition.
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''  await query(
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
''',
    '''  const persisted = await query<Pick<MarketingCampaignRow, "status">>(
    `UPDATE crm_marketing_campaigns
     SET status = $1,
         scheduled_at = COALESCE($2::timestamptz, scheduled_at),
         sent_at = CASE
           WHEN $1 = 'sent' THEN COALESCE($3::timestamptz, sent_at, now())
           ELSE sent_at
         END,
         updated_at = now()
     WHERE id = $4
       AND (status <> 'paused' OR $1 IN ('sent', 'cancelled'))
     RETURNING status`,
    [mapped.localStatus, providerScheduledAt || null, providerSentAt || null, campaign.id],
  );
  if (persisted.rows[0]) return persisted.rows[0].status;

  const current = await query<Pick<MarketingCampaignRow, "status">>(
    `SELECT status FROM crm_marketing_campaigns WHERE id = $1`,
    [campaign.id],
  );
  return current.rows[0]?.status || null;
''',
)

# A concurrent cancellation may have claimed the campaign after the provider
# accepted the send. Report the pending cancellation instead of a fake send
# success.
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''    await recordCampaignEvent(campaign.id, "send_started", req.crmUser?.id || null, {
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
''',
    '''    await recordCampaignEvent(campaign.id, "send_started", req.crmUser?.id || null, {
      broadcastId,
      resendResponseId: accepted.id,
      deliveryMode,
      scheduledAt: isoString(campaign.scheduled_at),
      providerStatus,
    });
    const cancellationPending = localStatus === "paused";
    return res.status(localStatus === "sent" ? 200 : 202).json({
      ok: !cancellationPending,
      status: localStatus,
      code: cancellationPending ? "CANCEL_ACCEPTANCE_PENDING" : undefined,
      message: cancellationPending
        ? "L'invio è stato accettato, ma è già in corso una richiesta di annullamento."
        : undefined,
      broadcast_id: broadcastId,
      scheduled_at: isoString(campaign.scheduled_at),
      provider_status: providerStatus,
    });
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''        return res.status(recoveredStatus === "sent" ? 200 : 202).json({
          ok: true,
          status: recoveredStatus,
          broadcast_id: broadcastId,
          scheduled_at: provider.scheduled_at || isoString(campaign.scheduled_at),
          provider_status: provider.status,
          reconciled: true,
        });
''',
    '''        const cancellationPending = recoveredStatus === "paused";
        return res.status(recoveredStatus === "sent" ? 200 : 202).json({
          ok: !cancellationPending,
          status: recoveredStatus,
          code: cancellationPending ? "CANCEL_ACCEPTANCE_PENDING" : undefined,
          message: cancellationPending
            ? "L'invio è stato accettato, ma è già in corso una richiesta di annullamento."
            : undefined,
          broadcast_id: broadcastId,
          scheduled_at: provider.scheduled_at || isoString(campaign.scheduled_at),
          provider_status: provider.status,
          reconciled: true,
        });
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''      "L'esito della richiesta a Resend è incerto. La campagna resta bloccata e verrà riconciliata automaticamente: aggiorna l'elenco e non ripetere l'invio.",
''',
    '''      "L'esito della richiesta a Resend è incerto. La campagna resta bloccata: aggiorna l'elenco e non ripetere l'invio. Se Resend continua a mostrarla come bozza, serve una verifica operativa prima di prepararla di nuovo.",
''',
)

new_cancel_route = r'''marketingCampaignDeliveryRouter.post("/campaigns/:id/cancel", asyncRoute(async (req, res) => {
  let campaign = await loadCampaign(req.params.id);
  if (campaign.status === "cancelled") {
    return res.json({ ok: true, status: "cancelled", broadcast_id: campaign.resend_broadcast_id, idempotent: true });
  }
  if (!campaign.scheduled_at) {
    return res.status(409).json({ error: "Only scheduled campaigns can be cancelled" });
  }
  if (!campaign.resend_broadcast_id) {
    return res.status(409).json({ error: "Campaign has no Resend Broadcast to cancel" });
  }
  if (campaign.status === "paused") {
    return res.status(202).json({
      ok: false,
      status: "paused",
      code: "CANCEL_ACCEPTANCE_PENDING",
      message: "La richiesta di annullamento è in verifica presso Resend.",
      broadcast_id: campaign.resend_broadcast_id,
      idempotent: true,
    });
  }
  if (!["scheduled", "sending"].includes(campaign.status)) {
    return res.status(409).json({ error: `Campaign cannot be cancelled from status ${campaign.status}` });
  }

  const broadcastId = campaign.resend_broadcast_id;
  const previousStatus = campaign.status;

  // A local `sending` state can mean either an immediate send or a scheduled
  // Broadcast that Resend has moved to `queued`. Only the latter is cancellable.
  if (campaign.status === "sending") {
    let provider: Awaited<ReturnType<typeof getResendBroadcast>>;
    try {
      provider = await getResendBroadcast(broadcastId);
    } catch (error) {
      throw new MarketingDeliveryOperationError(
        502,
        "Non è stato possibile verificare se il Broadcast è già in coda. Aggiorna l'elenco prima di riprovare.",
        "CANCEL_STATUS_UNAVAILABLE",
      );
    }

    const providerStatus = String(provider.status || "").toLowerCase();
    if (providerStatus === "draft") {
      return res.status(409).json({
        error: "Resend non ha ancora confermato che il Broadcast sia programmato o in coda. Non ripetere l'operazione.",
        code: "CANCEL_NOT_READY",
        provider_status: provider.status,
      });
    }
    if (providerStatus === "canceled" || providerStatus === "cancelled") {
      await query(
        `UPDATE crm_marketing_campaigns SET status = 'cancelled', updated_at = now() WHERE id = $1`,
        [campaign.id],
      );
      await recordCampaignEvent(campaign.id, "resend_synced", req.crmUser?.id || null, {
        action: "cancelled",
        broadcastId,
        providerStatus: provider.status,
        reconciledBeforeCancel: true,
      });
      return res.json({
        ok: true,
        status: "cancelled",
        broadcast_id: broadcastId,
        provider_status: provider.status,
        reconciled: true,
      });
    }
    if (providerStatus === "sent") {
      await persistAcceptedBroadcastState(
        campaign,
        "scheduled",
        provider.status,
        provider.scheduled_at,
        provider.sent_at,
      );
      return res.status(409).json({
        error: "L'invio è già iniziato o terminato e non può più essere annullato.",
        code: "CANCEL_TOO_LATE",
      });
    }
    if (providerStatus !== "scheduled" && providerStatus !== "queued") {
      return res.status(409).json({
        error: `Resend non consente l'annullamento dallo stato ${provider.status}.`,
        code: "CANCEL_NOT_AVAILABLE",
        provider_status: provider.status,
      });
    }
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
        ok: false,
        status: campaign.status,
        code: "CANCEL_ACCEPTANCE_PENDING",
        message: "La richiesta di annullamento è in verifica presso Resend.",
        broadcast_id: campaign.resend_broadcast_id,
        idempotent: true,
      });
    }
    return res.status(409).json({
      error: `Campaign cannot be cancelled from status ${campaign.status}`,
      code: "CANCEL_TOO_LATE",
    });
  }
  campaign = claimed.rows[0];

  try {
    const cancelled = await cancelResendBroadcast(broadcastId);
    let provider: Awaited<ReturnType<typeof getResendBroadcast>> | null = null;
    try {
      provider = await getResendBroadcast(broadcastId);
    } catch (reconcileError) {
      console.warn("[marketing] Broadcast cancellation accepted but immediate reconciliation failed", reconcileError);
    }

    if (!provider) {
      await recordCampaignEvent(campaign.id, "resend_synced", req.crmUser?.id || null, {
        action: "cancel_requested",
        broadcastId,
        resendResponseId: cancelled.id,
        providerStatus: null,
      });
      return res.status(202).json({
        ok: false,
        status: "paused",
        code: "CANCEL_ACCEPTANCE_PENDING",
        message: "Resend ha accettato la richiesta di annullamento; lo stato effettivo è ancora in verifica.",
        broadcast_id: broadcastId,
        provider_status: null,
      });
    }

    const providerStatus = String(provider.status || "").toLowerCase();
    if (providerStatus === "draft" || providerStatus === "canceled" || providerStatus === "cancelled") {
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
        providerStatus: provider.status,
      });
      return res.json({
        ok: true,
        status: "cancelled",
        broadcast_id: broadcastId,
        provider_status: provider.status,
      });
    }

    if (providerStatus === "sent") {
      await persistAcceptedBroadcastState(
        campaign,
        "scheduled",
        provider.status,
        provider.scheduled_at,
        provider.sent_at,
      );
      return res.status(409).json({
        error: "L'invio è già iniziato o terminato e non può più essere annullato.",
        code: "CANCEL_TOO_LATE",
      });
    }

    await recordCampaignEvent(campaign.id, "resend_synced", req.crmUser?.id || null, {
      action: "cancel_requested",
      broadcastId,
      resendResponseId: cancelled.id,
      providerStatus: provider.status,
    });
    return res.status(202).json({
      ok: false,
      status: "paused",
      code: "CANCEL_ACCEPTANCE_PENDING",
      message: "Resend ha accettato la richiesta di annullamento; lo stato effettivo è ancora in verifica.",
      broadcast_id: broadcastId,
      provider_status: provider.status,
    });
  } catch (error) {
    let provider: Awaited<ReturnType<typeof getResendBroadcast>> | null = null;
    try {
      provider = await getResendBroadcast(broadcastId);
    } catch (reconcileError) {
      console.warn("[marketing] unable to reconcile uncertain Broadcast cancellation", reconcileError);
    }

    if (provider) {
      const providerStatus = String(provider.status || "").toLowerCase();
      if (providerStatus === "draft" || providerStatus === "canceled" || providerStatus === "cancelled") {
        await query(
          `UPDATE crm_marketing_campaigns SET status = 'cancelled', updated_at = now() WHERE id = $1`,
          [campaign.id],
        );
        await recordCampaignEvent(campaign.id, "resend_synced", req.crmUser?.id || null, {
          action: "cancelled",
          broadcastId,
          providerStatus: provider.status,
          reconciledAfterError: true,
        });
        return res.json({
          ok: true,
          status: "cancelled",
          broadcast_id: broadcastId,
          provider_status: provider.status,
          reconciled: true,
        });
      }
      if (providerStatus === "sent") {
        await persistAcceptedBroadcastState(
          campaign,
          "scheduled",
          provider.status,
          provider.scheduled_at,
          provider.sent_at,
        );
        return res.status(409).json({
          error: "L'invio è già iniziato o terminato e non può più essere annullato.",
          code: "CANCEL_TOO_LATE",
        });
      }
      if (
        (providerStatus === "scheduled" || providerStatus === "queued")
        && error instanceof ResendMarketingError
        && error.status >= 400
        && error.status < 500
      ) {
        const restoredStatus = providerStatus === "scheduled" ? "scheduled" : "sending";
        await query(
          `UPDATE crm_marketing_campaigns
           SET status = $1, updated_at = now()
           WHERE id = $2 AND status = 'paused'`,
          [restoredStatus, campaign.id],
        );
        return res.status(409).json({
          error: `Resend non ha accettato l'annullamento: ${readableResendError(error)}`,
          code: "CANCEL_REJECTED",
          provider_status: provider.status,
        });
      }
    } else if (
      error instanceof ResendMarketingError
      && error.status >= 400
      && error.status < 500
    ) {
      await query(
        `UPDATE crm_marketing_campaigns
         SET status = $1, updated_at = now()
         WHERE id = $2 AND status = 'paused'`,
        [previousStatus, campaign.id],
      );
      return res.status(409).json({
        error: `Resend non ha accettato l'annullamento: ${readableResendError(error)}`,
        code: "CANCEL_REJECTED",
      });
    }

    await recordCampaignEvent(campaign.id, "resend_synced", req.crmUser?.id || null, {
      action: "cancel_uncertain",
      broadcastId,
      message: readableResendError(error),
      providerStatus: provider?.status || null,
    });
    throw new MarketingDeliveryOperationError(
      502,
      "L'esito dell'annullamento è incerto. La campagna resta bloccata: aggiorna l'elenco e verifica lo stato Resend prima di qualsiasi altra azione.",
      "CANCEL_OUTCOME_UNCERTAIN",
    );
  }
}));'''

replace_regex_once(
    "api/src/marketingCampaignDelivery.ts",
    r'marketingCampaignDeliveryRouter\.post\("/campaigns/:id/cancel", asyncRoute\(async \(req, res\) => \{.*?\n\}\)\);(?=\n\nmarketingCampaignDeliveryRouter\.use)',
    new_cancel_route,
)

# Reconciliation remains conservative: a provider draft does not prove that an
# in-flight/uncertain send was rejected. Paused cancellation claims are never
# downgraded back to queued/scheduled by a read-side refresh.
new_reconcile = r'''async function reconcileCampaign(campaign: ActiveCampaignForReconciliation) {
  const provider = await getResendBroadcast(campaign.resend_broadcast_id);
  const providerStatus = String(provider.status || "").toLowerCase();
  const mode: MarketingDeliveryMode = campaign.scheduled_at ? "scheduled" : "now";
  const mapped = mapResendBroadcastState(providerStatus, mode);
  let localStatus = mapped.localStatus;

  if (campaign.status === "paused") {
    if (providerStatus === "draft" || providerStatus === "canceled" || providerStatus === "cancelled") {
      localStatus = "cancelled";
    } else if (providerStatus === "sent") {
      localStatus = "sent";
    } else {
      return;
    }
  } else if (campaign.status === "sending" && providerStatus === "draft") {
    return;
  } else if (providerStatus === "draft") {
    localStatus = "cancelled";
  } else if (!mapped.accepted) {
    return;
  }

  await query(
    `UPDATE crm_marketing_campaigns
     SET status = $1,
         scheduled_at = COALESCE($2::timestamptz, scheduled_at),
         sent_at = CASE
           WHEN $1 = 'sent' THEN COALESCE($3::timestamptz, sent_at, now())
           ELSE sent_at
         END,
         updated_at = now()
     WHERE id = $4
       AND status = $5`,
    [
      localStatus,
      provider.scheduled_at || null,
      provider.sent_at || null,
      campaign.id,
      campaign.status,
    ],
  );
}'''

replace_regex_once(
    "api/src/campaignMetrics.ts",
    r'async function reconcileCampaign\(campaign: ActiveCampaignForReconciliation\) \{.*?\n\}(?=\n\nexport async function reconcileActiveMarketingCampaigns)',
    new_reconcile,
)

# The cancel action remains visible after Resend moves a scheduled Broadcast to
# queued (local sending); the API performs the authoritative provider check.
replace_once(
    "src/components/marketing/CampaignWorkspace.tsx",
    '''{campaign.scheduled_at && campaign.status === "scheduled" && <button type="button" onClick={() => void cancelSchedule(campaign)}''',
    '''{campaign.scheduled_at && ["scheduled", "sending"].includes(campaign.status) && <button type="button" onClick={() => void cancelSchedule(campaign)}''',
)

replace_once(
    "src/components/marketing/CampaignWorkspace.tsx",
    '''      if (!result.ok) {
        setNotice(tr(
          "La aceptación del envío está en verificación. No repitas la operación; actualiza el listado.",
          "L’accettazione dell’invio è in verifica. Non ripetere l’operazione; aggiorna l’elenco.",
          "Send acceptance is being verified. Do not repeat the operation; refresh the list.",
          "De acceptatie van de verzending wordt gecontroleerd. Herhaal de actie niet; vernieuw de lijst.",
        ));
''',
    '''      if (!result.ok && result.status === "paused") {
        setNotice(tr(
          "El envío fue aceptado, pero la cancelación ya está en verificación.",
          "L’invio è stato accettato, ma l’annullamento è già in verifica.",
          "The send was accepted, but cancellation is already being verified.",
          "De verzending is geaccepteerd, maar de annulering wordt al gecontroleerd.",
        ));
      } else if (!result.ok) {
        setNotice(tr(
          "La aceptación del envío está en verificación. No repitas la operación; actualiza el listado.",
          "L’accettazione dell’invio è in verifica. Non ripetere l’operazione; aggiorna l’elenco.",
          "Send acceptance is being verified. Do not repeat the operation; refresh the list.",
          "De acceptatie van de verzending wordt gecontroleerd. Herhaal de actie niet; vernieuw de lijst.",
        ));
''',
)

# Keep client typing aligned with pending cancellation responses.
replace_once(
    "src/lib/marketing.ts",
    '''    idempotent?: boolean;
    reconciled?: boolean;
  }>(`/campaigns/${campaignId}/cancel`,''',
    '''    idempotent?: boolean;
    reconciled?: boolean;
    code?: string;
    message?: string;
  }>(`/campaigns/${campaignId}/cancel`,''',
)

# Static and integration guards for the newly reviewed race conditions.
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

test("provider-confirmed queued scheduled campaigns remain cancellable", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /campaign\.status === "sending"/);
  assert.match(source, /providerStatus !== "scheduled" && providerStatus !== "queued"/);
  assert.match(source, /WHERE id = \$1 AND status IN \('scheduled', 'sending'\)/);
  assert.match(source, /CANCEL_ACCEPTANCE_PENDING/);
});

test("cancellation claims cannot be overwritten by a queued-state reconciliation", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  const metrics = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(delivery, /status <> 'paused'/);
  assert.match(delivery, /\$1 IN \('sent', 'cancelled'\)/);
  assert.match(metrics, /campaign\.status === "paused"/);
  assert.match(metrics, /AND status = \$5/);
});

test("an uncertain send is never reset to draft only because the provider still reports draft", () => {
  const source = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(source, /campaign\.status === "sending" && providerStatus === "draft"/);
  assert.match(source, /return;/);
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
print("updated api/src/marketingConcurrencyIntegration.test.ts")

replace_once(
    "scripts/marketing-scheduling.test.mjs",
    '''  assert.match(workspace, /campaign\\.status === "scheduled"/);
''',
    '''  assert.match(workspace, /\\["scheduled", "sending"\\]\\.includes\\(campaign\\.status\\)/);
  assert.match(workspace, /Annullamento in verifica/);
''',
)

replace_once(
    "api/README.md",
    '''- `POST /api/marketing/campaigns/:id/cancel` accepts cancellation while the campaign is provider-confirmed as scheduled; Resend may also complete that cancellation after it has internally moved the Broadcast to its queue.

Resend executes future sends independently of the browser, user session, computer, GitHub Actions, or Railway cron. Scheduled/sending/cancellation-verification campaigns retain exclusive use of their Resend transport pool. Provider acceptance, queueing/sending, final Broadcast completion, and per-email delivery metrics remain distinct states.''',
    '''- `POST /api/marketing/campaigns/:id/cancel` verifies the provider state and supports both Resend-cancellable states: `scheduled` (which returns to provider `draft`) and `queued` (which becomes provider `canceled`). Local status changes to `cancelled` only after one of those effective provider outcomes is observed.

Resend executes future sends independently of the browser, user session, computer, GitHub Actions, or Railway cron. Scheduled/sending/cancellation-verification campaigns retain exclusive use of their Resend transport pool. Provider acceptance, queueing/sending, final Broadcast completion, and per-email delivery metrics remain distinct states. A send with an uncertain network outcome remains blocked rather than being automatically reset to draft; it requires provider reconciliation before a new preparation can be allowed.''',
)

print("final scheduled newsletter cancellation hardening applied")
