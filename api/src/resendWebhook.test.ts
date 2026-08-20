import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const {
  reconcileUnsubscribeCountSql,
  resolveUnsubscribeCampaignSql,
} = await import("./resendWebhook.js");

test("unsubscribe campaign lookup prefers broadcast, then local segment membership, then latest recipient event", () => {
  const sql = resolveUnsubscribeCampaignSql();
  assert.match(sql, /resend_broadcast_id = \$1/);
  assert.match(sql, /crm_marketing_segment_members/);
  assert.match(sql, /crm_marketing_contacts/);
  assert.match(sql, /mc\.email = \$2/);
  assert.match(sql, /crm_marketing_campaign_recipient_events/);
  assert.match(sql, /recipient = \$2/);
  assert.match(sql, /contact:/);
  assert.match(sql, /ORDER BY COALESCE\(c\.sent_at, c\.created_at\) DESC/);
  assert.match(sql, /ORDER BY cre\.occurred_at DESC/);
  assert.match(sql, /LIMIT 1/);
});

test("unsubscribe counter is reconciled from distinct recipient events", () => {
  const sql = reconcileUnsubscribeCountSql();
  assert.match(sql, /COUNT\(DISTINCT lower\(cre\.recipient\)\)/);
  assert.match(sql, /event_type = 'contact\.unsubscribed'/);
  assert.match(sql, /unsubscribed_count =/);
  assert.match(sql, /WHERE c\.id = \$1/);
});
