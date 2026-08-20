import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const { resolveUnsubscribeCampaignSql } = await import("./resendWebhook.js");

test("unsubscribe campaign lookup prefers exact broadcast and falls back to latest recipient event", () => {
  const sql = resolveUnsubscribeCampaignSql();
  assert.match(sql, /resend_broadcast_id = \$1/);
  assert.match(sql, /crm_marketing_campaign_recipient_events/);
  assert.match(sql, /recipient = \$2/);
  assert.match(sql, /ORDER BY cre\.occurred_at DESC/);
  assert.match(sql, /LIMIT 1/);
});
