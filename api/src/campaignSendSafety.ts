import { audienceIsSafeForSend, normalizeAudienceEmails } from "./audienceSafety.js";
import { query } from "./db.js";
import { listResendSegmentContacts } from "./resendMarketing.js";

type CampaignAudienceContext = {
  id: string;
  status: string;
  segment_id: string | null;
  recipient_count: number;
  resend_broadcast_id: string | null;
  resend_segment_id: string | null;
};

export type CampaignAudienceSafetyResult =
  | {
      ok: true;
      skipped?: "not_prepared";
      preparedCount?: number;
      currentEligibleCount?: number;
      remoteActiveCount?: number;
    }
  | {
      ok: false;
      reason: "audience_changed" | "segment_not_synced";
      preparedCount: number;
      currentEligibleCount: number;
      remoteActiveCount: number;
    };

export async function verifyCampaignAudienceBeforeSend(campaignId: string): Promise<CampaignAudienceSafetyResult> {
  const campaignResult = await query<CampaignAudienceContext>(
    `SELECT c.id,
            c.status,
            c.segment_id,
            c.recipient_count,
            c.resend_broadcast_id,
            s.resend_segment_id
     FROM crm_marketing_campaigns c
     LEFT JOIN crm_marketing_segments s ON s.id = c.segment_id
     WHERE c.id = $1`,
    [campaignId],
  );

  const campaign = campaignResult.rows[0];
  if (!campaign) {
    return {
      ok: true,
      skipped: "not_prepared",
    };
  }

  if (!campaign.resend_broadcast_id || !campaign.segment_id) {
    return {
      ok: true,
      skipped: "not_prepared",
    };
  }

  if (!campaign.resend_segment_id) {
    return {
      ok: false,
      reason: "segment_not_synced",
      preparedCount: campaign.recipient_count || 0,
      currentEligibleCount: 0,
      remoteActiveCount: 0,
    };
  }

  const eligibleResult = await query<{ email: string }>(
    `SELECT lower(c.email) AS email
     FROM crm_marketing_contacts c
     JOIN crm_marketing_segment_members sm ON sm.contact_id = c.id
     WHERE sm.segment_id = $1
       AND c.status = 'subscribed'
       AND c.marketing_consent = true
       AND c.unsubscribed_at IS NULL
       AND c.suppressed_at IS NULL
     ORDER BY lower(c.email) ASC`,
    [campaign.segment_id],
  );

  const currentEligibleEmails = normalizeAudienceEmails(eligibleResult.rows.map((row) => row.email));
  const remoteContacts = await listResendSegmentContacts(campaign.resend_segment_id);
  const remoteActiveEmails = normalizeAudienceEmails(
    remoteContacts
      .filter((contact) => contact.unsubscribed !== true)
      .map((contact) => contact.email),
  );

  const preparedCount = Number(campaign.recipient_count || 0);
  if (!audienceIsSafeForSend(preparedCount, currentEligibleEmails, remoteActiveEmails)) {
    return {
      ok: false,
      reason: "audience_changed",
      preparedCount,
      currentEligibleCount: currentEligibleEmails.length,
      remoteActiveCount: remoteActiveEmails.length,
    };
  }

  return {
    ok: true,
    preparedCount,
    currentEligibleCount: currentEligibleEmails.length,
    remoteActiveCount: remoteActiveEmails.length,
  };
}
