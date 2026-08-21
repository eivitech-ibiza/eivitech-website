import { query } from "./db.js";

export type CampaignMetricKey = "delivered" | "opened" | "clicked" | "bounced" | "unsubscribed";

export type CampaignMetricRecipient = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  contact_status: string | null;
  occurred_at: string | Date;
  detail: string | null;
  source: string;
};

const EVENT_TYPE_BY_METRIC: Record<Exclude<CampaignMetricKey, "unsubscribed">, string> = {
  delivered: "email.delivered",
  opened: "email.opened",
  clicked: "email.clicked",
  bounced: "email.bounced",
};

export function campaignMetricRecipientsSql() {
  return `
    WITH latest_event AS (
      SELECT DISTINCT ON (lower(cre.recipient))
        lower(cre.recipient) AS email,
        cre.occurred_at,
        CASE
          WHEN cre.event_type = 'email.clicked'
            THEN NULLIF(cre.payload #>> '{data,click,link}', '')
          WHEN cre.event_type = 'email.bounced'
            THEN COALESCE(
              NULLIF(cre.payload #>> '{data,bounce,message}', ''),
              NULLIF(cre.payload #>> '{data,bounce,type}', '')
            )
          ELSE NULL
        END AS detail
      FROM crm_marketing_campaign_recipient_events cre
      WHERE cre.campaign_id = $1
        AND cre.event_type = $2
        AND cre.recipient IS NOT NULL
      ORDER BY lower(cre.recipient), cre.occurred_at DESC
    )
    SELECT
      le.email,
      mc.first_name,
      mc.last_name,
      mc.status AS contact_status,
      le.occurred_at,
      le.detail,
      $3::text AS source
    FROM latest_event le
    LEFT JOIN crm_marketing_contacts mc ON lower(mc.email) = le.email
    ORDER BY le.occurred_at DESC
  `;
}

export function campaignUnsubscribeRecipientsSql() {
  return `
    WITH target_campaign AS (
      SELECT id, resend_broadcast_id
      FROM crm_marketing_campaigns
      WHERE id = $1
      LIMIT 1
    ),
    unsubscribe_clicks AS (
      SELECT DISTINCT
        lower(recipient.email) AS email,
        COALESCE(rwe.event_created_at, rwe.received_at) AS clicked_at
      FROM target_campaign c
      JOIN crm_resend_webhook_events rwe
        ON rwe.payload #>> '{data,broadcast_id}' = c.resend_broadcast_id
      CROSS JOIN LATERAL jsonb_array_elements_text(
        COALESCE(rwe.payload #> '{data,to}', '[]'::jsonb)
      ) AS recipient(email)
      WHERE rwe.event_type = 'email.clicked'
        AND lower(COALESCE(rwe.payload #>> '{data,click,link}', '')) LIKE '%unsubscribe.resend.com%'
    ),
    confirmed_clicks AS (
      SELECT
        uc.email,
        confirmation.occurred_at,
        'unsubscribe-link'::text AS source,
        'Disiscrizione confermata da Resend'::text AS detail
      FROM unsubscribe_clicks uc
      JOIN LATERAL (
        SELECT COALESCE(rwe.event_created_at, rwe.received_at) AS occurred_at
        FROM crm_resend_webhook_events rwe
        WHERE rwe.event_type = 'contact.updated'
          AND lower(COALESCE(rwe.payload #>> '{data,email}', '')) = uc.email
          AND lower(COALESCE(rwe.payload #>> '{data,unsubscribed}', 'false')) = 'true'
          AND COALESCE(rwe.event_created_at, rwe.received_at) >= uc.clicked_at
          AND COALESCE(rwe.event_created_at, rwe.received_at) <= uc.clicked_at + interval '15 minutes'
        ORDER BY COALESCE(rwe.event_created_at, rwe.received_at) ASC
        LIMIT 1
      ) confirmation ON true
    ),
    strong_recipient_events AS (
      SELECT
        lower(cre.recipient) AS email,
        cre.occurred_at,
        'campaign-event'::text AS source,
        'Disiscrizione attribuita alla campagna'::text AS detail
      FROM crm_marketing_campaign_recipient_events cre
      WHERE cre.campaign_id = $1
        AND cre.event_type = 'contact.unsubscribed'
        AND cre.recipient IS NOT NULL
        AND COALESCE(cre.payload #>> '{_eivitech,unsubscribeAttribution}', '')
          IN ('broadcast', 'unsubscribe-click')
    ),
    combined AS (
      SELECT * FROM confirmed_clicks
      UNION ALL
      SELECT * FROM strong_recipient_events
    ),
    deduplicated AS (
      SELECT DISTINCT ON (email)
        email,
        occurred_at,
        detail,
        source
      FROM combined
      ORDER BY email, occurred_at DESC
    )
    SELECT
      d.email,
      mc.first_name,
      mc.last_name,
      mc.status AS contact_status,
      d.occurred_at,
      d.detail,
      d.source
    FROM deduplicated d
    LEFT JOIN crm_marketing_contacts mc ON lower(mc.email) = d.email
    ORDER BY d.occurred_at DESC
  `;
}

export async function listCampaignMetricRecipients(campaignId: string, metric: CampaignMetricKey) {
  if (metric === "unsubscribed") {
    return query<CampaignMetricRecipient>(campaignUnsubscribeRecipientsSql(), [campaignId]);
  }

  return query<CampaignMetricRecipient>(
    campaignMetricRecipientsSql(),
    [campaignId, EVENT_TYPE_BY_METRIC[metric], metric],
  );
}
