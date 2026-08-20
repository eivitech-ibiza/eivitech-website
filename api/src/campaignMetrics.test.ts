import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const { derivedCampaignMetricsSql } = await import("./campaignMetrics.js");

test("campaign unsubscribe requires immutable click and contact-update history", () => {
  const sql = derivedCampaignMetricsSql();
  assert.match(sql, /event_type = 'email\.clicked'/);
  assert.match(sql, /unsubscribe\.resend\.com/);
  assert.match(sql, /c\.resend_broadcast_id = rwe\.payload #>> '\{data,broadcast_id\}'/);
  assert.match(sql, /event_type = 'contact\.updated'/);
  assert.match(sql, /\{data,unsubscribed\}/);
  assert.match(sql, /\{data,email\}/);
});

test("unsubscribe click must be confirmed within a bounded time window", () => {
  const sql = derivedCampaignMetricsSql();
  assert.match(sql, />= uc\.clicked_at/);
  assert.match(sql, /<= uc\.clicked_at \+ interval '15 minutes'/);
});

test("derived metric does not depend on current contact status or unsubscribed_at", () => {
  const sql = derivedCampaignMetricsSql();
  assert.doesNotMatch(sql, /crm_marketing_contacts/);
  assert.doesNotMatch(sql, /unsubscribed_at/);
  assert.match(sql, /COUNT\(DISTINCT email\)/i);
});

test("only strongly attributed recipient events are accepted as a second source", () => {
  const sql = derivedCampaignMetricsSql();
  assert.match(sql, /event_type = 'contact\.unsubscribed'/);
  assert.match(sql, /_eivitech,unsubscribeAttribution/);
  assert.match(sql, /'broadcast', 'unsubscribe-click'/);
});
