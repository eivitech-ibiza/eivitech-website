from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}, found {count}: {old[:180]!r}")
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")
    print(f"updated {path}")


replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''    let providerStatus: string | null = null;
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
''',
    '''    let providerStatus: string | null = null;
    let localStatus = deliveryMode === "scheduled" ? "scheduled" : "sending";
    let providerStatePersisted = false;

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
      if (persisted) {
        localStatus = persisted;
        providerStatePersisted = true;
      }
    } catch (reconcileError) {
      console.warn("[marketing] Broadcast accepted but immediate reconciliation failed", reconcileError);
    }

    if (!providerStatePersisted) {
      const fallbackStatus = deliveryMode === "scheduled" ? "scheduled" : "sending";
      const fallback = await query<Pick<MarketingCampaignRow, "status">>(
        `UPDATE crm_marketing_campaigns
         SET status = $1, updated_at = now()
         WHERE id = $2 AND status = 'sending'
         RETURNING status`,
        [fallbackStatus, campaign.id],
      );
      if (fallback.rows[0]) {
        localStatus = fallback.rows[0].status;
      } else {
        const current = await query<Pick<MarketingCampaignRow, "status">>(
          `SELECT status FROM crm_marketing_campaigns WHERE id = $1`,
          [campaign.id],
        );
        localStatus = current.rows[0]?.status || fallbackStatus;
      }
    }
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''      if (providerStatus === "draft" || providerStatus === "canceled" || providerStatus === "cancelled") {
        await query(
          `UPDATE crm_marketing_campaigns SET status = 'cancelled', updated_at = now() WHERE id = $1`,
          [campaign.id],
        );
''',
    '''      if (providerStatus === "canceled" || providerStatus === "cancelled") {
        await query(
          `UPDATE crm_marketing_campaigns
           SET status = 'cancelled', updated_at = now()
           WHERE id = $1 AND status <> 'sent'`,
          [campaign.id],
        );
''',
)

replace_once(
    "api/src/marketingCampaignDelivery.ts",
    '''      if (
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
''',
    '''      if (
        (providerStatus === "draft" || providerStatus === "scheduled" || providerStatus === "queued")
        && error instanceof ResendMarketingError
        && error.status >= 400
        && error.status < 500
      ) {
        await query(
          `UPDATE crm_marketing_campaigns
           SET status = $1, updated_at = now()
           WHERE id = $2 AND status = 'paused'`,
          [previousStatus, campaign.id],
        );
''',
)

replace_once(
    "api/src/marketingConcurrencyIntegration.test.ts",
    '''test("cancellation claims and terminal states cannot be overwritten by stale queued reconciliation", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  const metrics = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(delivery, /status IN \('draft', 'scheduled', 'sending'\)/);
  assert.match(delivery, /status = 'paused' AND \$1 IN \('sent', 'cancelled'\)/);
  assert.match(delivery, /status = 'cancelled' AND \$1 = 'sent'/);
  assert.match(delivery, /SEND_CANCELLED_DURING_ACCEPTANCE/);
  assert.match(metrics, /campaign\.status === "paused"/);
  assert.match(metrics, /AND status = \$5/);
});
''',
    '''test("cancellation claims and terminal states cannot be overwritten by stale queued reconciliation", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  const metrics = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(delivery, /status IN \('draft', 'scheduled', 'sending'\)/);
  assert.match(delivery, /status = 'paused' AND \$1 IN \('sent', 'cancelled'\)/);
  assert.match(delivery, /status = 'cancelled' AND \$1 = 'sent'/);
  assert.match(delivery, /WHERE id = \$2 AND status = 'sending'/);
  assert.match(delivery, /providerStatePersisted/);
  assert.match(delivery, /SEND_CANCELLED_DURING_ACCEPTANCE/);
  assert.match(metrics, /campaign\.status === "paused"/);
  assert.match(metrics, /AND status = \$5/);
});
''',
)

replace_once(
    "api/src/marketingConcurrencyIntegration.test.ts",
    '''test("only explicit provider rejections release an uncertain send immediately", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /error instanceof ResendMarketingError/);
  assert.match(source, /error\.status >= 400/);
  assert.match(source, /error\.status < 500/);
});
''',
    '''test("only explicit provider rejections release an uncertain operation immediately", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /error instanceof ResendMarketingError/);
  assert.match(source, /error\.status >= 400/);
  assert.match(source, /error\.status < 500/);
  assert.match(source, /providerStatus === "draft" \|\| providerStatus === "scheduled" \|\| providerStatus === "queued"/);
  assert.match(source, /\[previousStatus, campaign\.id\]/);
});
''',
)

print("atomic send fallback hardening applied")
