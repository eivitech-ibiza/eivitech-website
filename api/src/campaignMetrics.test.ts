import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const { derivedCampaignMetricsSql } = await import("./campaignMetrics.js");

test("derived unsubscribe metrics use immutable webhook history", () => {
  const sql = derivedCampaignMetricsSql();
  assert.match(sql, /crm_resend_webhook_events/);
  assert.match(sql, /event_type = 'contact\.updated'/);
  assert.match(sql, /\{data,unsubscribed\}/);
  assert.match(sql, /\{data,email\}/);
  assert.match(sql, /crm_marketing_campaign_recipient_events/);
  assert.match(sql, /event_type = 'contact\.unsubscribed'/);
  assert.match(sql, /COUNT\(DISTINCT email\)/i);
});

test("raw contact updates are attributed only to a campaign that actually reached that recipient", () => {
  const sql = derivedCampaignMetricsSql();
  assert.match(sql, /EXISTS\s*\([\s\S]*crm_marketing_campaign_recipient_events/);
  assert.match(sql, /lower\(cre\.recipient\) = r\.email/);
  assert.match(sql, /cre\.occurred_at <= r\.occurred_at/);
  assert.match(sql, /ORDER BY COALESCE\(candidate\.sent_at, candidate\.created_at\) DESC/);
});

test("tracked unsubscribe clicks still retain exact broadcast attribution", () => {
  const sql = derivedCampaignMetricsSql();
  assert.match(sql, /event_type = 'email\.clicked'/);
  assert.match(sql, /unsubscribe\.resend\.com/);
  assert.match(sql, /c\.resend_broadcast_id = rwe\.payload #>> '\{data,broadcast_id\}'/);
});
