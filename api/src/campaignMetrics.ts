import { query } from "./db.js";
import { mapResendBroadcastState, type MarketingDeliveryMode } from "./marketingSchedule.js";
import { getResendBroadcast } from "./resendMarketing.js";

type ActiveCampaignForReconciliation = {
  id: string;
  status: "scheduled" | "sending" | "paused";
  scheduled_at: Date | string | null;
  resend_broadcast_id: string;
};

async function reconcileCampaign(campaign: ActiveCampaignForReconciliation) {
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
}

export async function reconcileActiveMarketingCampaigns() {
  const active = await query<ActiveCampaignForReconciliation>(
    `SELECT id, status, scheduled_at, resend_broadcast_id
     FROM crm_marketing_campaigns
     WHERE resend_broadcast_id IS NOT NULL
       AND status IN ('scheduled', 'sending', 'paused')
       AND updated_at <= now() - interval '30 seconds'
     ORDER BY updated_at ASC
     LIMIT 30`,
  );

  for (let index = 0; index < active.rows.length; index += 5) {
    const batch = active.rows.slice(index, index + 5);
    const results = await Promise.allSettled(batch.map(reconcileCampaign));
    results.forEach((result, resultIndex) => {
      if (result.status === "rejected") {
        console.warn(
          "[marketing] unable to reconcile Broadcast state",
          batch[resultIndex]?.id,
          result.reason,
        );
      }
    });
  }
}

export function derivedCampaignMetricsSql() {
  return `
    WITH unsubscribe_clicks AS (
      SELECT DISTINCT
        lower(recipient.email) AS email,
        c.id AS campaign_id,
        COALESCE(rwe.event_created_at, rwe.received_at) AS clicked_at
      FROM crm_resend_webhook_events rwe
      CROSS JOIN LATERAL jsonb_array_elements_text(
        COALESCE(rwe.payload #> '{data,to}', '[]'::jsonb)
      ) AS recipient(email)
      JOIN crm_marketing_campaigns c
        ON c.resend_broadcast_id = rwe.payload #>> '{data,broadcast_id}'
      WHERE rwe.event_type = 'email.clicked'
        AND lower(COALESCE(rwe.payload #>> '{data,click,link}', '')) LIKE '%unsubscribe.resend.com%'
    ),
    confirmed_click_unsubscribes AS (
      SELECT DISTINCT
        uc.email,
        uc.campaign_id
      FROM unsubscribe_clicks uc
      WHERE EXISTS (
        SELECT 1
        FROM crm_resend_webhook_events rwe
        WHERE rwe.event_type = 'contact.updated'
          AND lower(COALESCE(rwe.payload #>> '{data,email}', '')) = uc.email
          AND lower(COALESCE(rwe.payload #>> '{data,unsubscribed}', 'false')) = 'true'
          AND COALESCE(rwe.event_created_at, rwe.received_at) >= uc.clicked_at
          AND COALESCE(rwe.event_created_at, rwe.received_at) <= uc.clicked_at + interval '15 minutes'
      )
    ),
    strongly_attributed_recipient_events AS (
      SELECT DISTINCT
        lower(cre.recipient) AS email,
        cre.campaign_id
      FROM crm_marketing_campaign_recipient_events cre
      WHERE cre.event_type = 'contact.unsubscribed'
        AND cre.recipient IS NOT NULL
        AND COALESCE(cre.payload #>> '{_eivitech,unsubscribeAttribution}', '')
          IN ('broadcast', 'unsubscribe-click')
    ),
    attributed_unsubscribes AS (
      SELECT email, campaign_id FROM confirmed_click_unsubscribes
      UNION
      SELECT email, campaign_id FROM strongly_attributed_recipient_events
    ),
    unsubscribe_counts AS (
      SELECT campaign_id, COUNT(DISTINCT email)::int AS unsubscribed_count
      FROM attributed_unsubscribes
      GROUP BY campaign_id
    )
    SELECT
      c.*,
      s.name AS segment_name,
      COALESCE(uc.unsubscribed_count, 0)::int AS unsubscribed_count
    FROM crm_marketing_campaigns c
    LEFT JOIN crm_marketing_segments s ON s.id = c.segment_id
    LEFT JOIN unsubscribe_counts uc ON uc.campaign_id = c.id
    ORDER BY c.created_at DESC
    LIMIT 200
  `;
}

export async function listCampaignsWithDerivedUnsubscribes() {
  await reconcileActiveMarketingCampaigns();
  return query(derivedCampaignMetricsSql());
}
