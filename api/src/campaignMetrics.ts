import { query } from "./db.js";

export async function listCampaignsWithDerivedUnsubscribes() {
  return query(`
    WITH unsubscribed_contacts AS (
      SELECT lower(email) AS email, unsubscribed_at
      FROM crm_marketing_contacts
      WHERE status = 'unsubscribed'
        AND unsubscribed_at IS NOT NULL
    ),
    tracked_unsubscribe_clicks AS (
      SELECT DISTINCT ON (lower(recipient.email))
        lower(recipient.email) AS email,
        c.id AS campaign_id,
        COALESCE(rwe.event_created_at, rwe.received_at) AS occurred_at
      FROM crm_resend_webhook_events rwe
      CROSS JOIN LATERAL jsonb_array_elements_text(
        COALESCE(rwe.payload #> '{data,to}', '[]'::jsonb)
      ) AS recipient(email)
      JOIN unsubscribed_contacts uc
        ON uc.email = lower(recipient.email)
      JOIN crm_marketing_campaigns c
        ON c.resend_broadcast_id = rwe.payload #>> '{data,broadcast_id}'
      WHERE rwe.event_type = 'email.clicked'
        AND lower(COALESCE(rwe.payload #>> '{data,click,link}', '')) LIKE '%unsubscribe.resend.com%'
        AND COALESCE(rwe.event_created_at, rwe.received_at) <= uc.unsubscribed_at + interval '10 minutes'
      ORDER BY lower(recipient.email), COALESCE(rwe.event_created_at, rwe.received_at) DESC
    ),
    fallback_unsubscribes AS (
      SELECT DISTINCT ON (uc.email)
        uc.email,
        c.id AS campaign_id
      FROM unsubscribed_contacts uc
      JOIN crm_marketing_campaign_recipient_events cre
        ON lower(cre.recipient) = uc.email
      JOIN crm_marketing_campaigns c
        ON c.id = cre.campaign_id
      WHERE c.status = 'sent'
        AND COALESCE(c.sent_at, c.created_at) <= uc.unsubscribed_at
        AND cre.occurred_at <= uc.unsubscribed_at + interval '10 minutes'
      ORDER BY uc.email, COALESCE(c.sent_at, c.created_at) DESC, cre.occurred_at DESC
    ),
    attributed_unsubscribes AS (
      SELECT email, campaign_id
      FROM tracked_unsubscribe_clicks

      UNION ALL

      SELECT f.email, f.campaign_id
      FROM fallback_unsubscribes f
      WHERE NOT EXISTS (
        SELECT 1
        FROM tracked_unsubscribe_clicks t
        WHERE t.email = f.email
      )
    ),
    unsubscribe_counts AS (
      SELECT campaign_id, count(DISTINCT email)::int AS unsubscribed_count
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
  `);
}
