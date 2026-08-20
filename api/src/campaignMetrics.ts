import { query } from "./db.js";

export function derivedCampaignMetricsSql() {
  return `
    WITH tracked_unsubscribe_clicks AS (
      SELECT DISTINCT
        lower(recipient.email) AS email,
        c.id AS campaign_id
      FROM crm_resend_webhook_events rwe
      CROSS JOIN LATERAL jsonb_array_elements_text(
        COALESCE(rwe.payload #> '{data,to}', '[]'::jsonb)
      ) AS recipient(email)
      JOIN crm_marketing_campaigns c
        ON c.resend_broadcast_id = rwe.payload #>> '{data,broadcast_id}'
      WHERE rwe.event_type = 'email.clicked'
        AND lower(COALESCE(rwe.payload #>> '{data,click,link}', '')) LIKE '%unsubscribe.resend.com%'
    ),
    recorded_unsubscribe_events AS (
      SELECT DISTINCT
        lower(cre.recipient) AS email,
        cre.campaign_id
      FROM crm_marketing_campaign_recipient_events cre
      WHERE cre.event_type = 'contact.unsubscribed'
        AND cre.recipient IS NOT NULL
    ),
    raw_contact_unsubscribes AS (
      SELECT
        lower(rwe.payload #>> '{data,email}') AS email,
        COALESCE(rwe.event_created_at, rwe.received_at) AS occurred_at
      FROM crm_resend_webhook_events rwe
      WHERE rwe.event_type = 'contact.updated'
        AND lower(COALESCE(rwe.payload #>> '{data,unsubscribed}', 'false')) = 'true'
        AND COALESCE(rwe.payload #>> '{data,email}', '') <> ''
    ),
    raw_contact_attribution AS (
      SELECT DISTINCT
        r.email,
        matched.campaign_id
      FROM raw_contact_unsubscribes r
      JOIN LATERAL (
        SELECT candidate.id AS campaign_id
        FROM crm_marketing_campaigns candidate
        WHERE candidate.status = 'sent'
          AND COALESCE(candidate.sent_at, candidate.created_at) <= r.occurred_at
          AND EXISTS (
            SELECT 1
            FROM crm_marketing_campaign_recipient_events cre
            WHERE cre.campaign_id = candidate.id
              AND cre.recipient IS NOT NULL
              AND lower(cre.recipient) = r.email
              AND cre.occurred_at <= r.occurred_at
          )
        ORDER BY COALESCE(candidate.sent_at, candidate.created_at) DESC
        LIMIT 1
      ) matched ON true
    ),
    attributed_unsubscribes AS (
      SELECT email, campaign_id FROM tracked_unsubscribe_clicks
      UNION
      SELECT email, campaign_id FROM recorded_unsubscribe_events
      UNION
      SELECT email, campaign_id FROM raw_contact_attribution
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
  return query(derivedCampaignMetricsSql());
}
