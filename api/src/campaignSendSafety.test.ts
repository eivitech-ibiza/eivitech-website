import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const { campaignAudienceContextSql } = await import("./campaignSendSafety.js");

test("send safety resolves the Resend transport pool from the latest prepared campaign event", () => {
  const sql = campaignAudienceContextSql();

  assert.match(sql, /crm_marketing_campaign_events/);
  assert.match(sql, /event_type = 'prepared'/);
  assert.match(sql, /payload->>'resendSegmentId'/);
  assert.match(sql, /ORDER BY .*created_at DESC/s);
  assert.match(sql, /LIMIT 1/);
});

test("send safety no longer depends on crm_marketing_segments.resend_segment_id", () => {
  const sql = campaignAudienceContextSql();

  assert.doesNotMatch(sql, /crm_marketing_segments/);
  assert.doesNotMatch(sql, /s\.resend_segment_id/);
});


test("campaign send revalidates the prepared audience before provider submission", () => {
  const marketingSource = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");

  assert.match(marketingSource, /verifyCampaignAudienceBeforeSend\(campaign\.id\)/);
  assert.match(marketingSource, /AUDIENCE_CHANGED_AFTER_PREPARE/);
});
