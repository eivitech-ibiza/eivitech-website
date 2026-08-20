import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const {
  reconcileUnsubscribeCountSql,
  resolveUnsubscribeEvidenceSql,
} = await import("./resendWebhook.js");

test("unsubscribe evidence accepts an explicit broadcast or a tracked unsubscribe click", () => {
  const sql = resolveUnsubscribeEvidenceSql();
  assert.match(sql, /resend_broadcast_id = \$1/);
  assert.match(sql, /event_type = 'email\.clicked'/);
  assert.match(sql, /unsubscribe\.resend\.com/);
  assert.match(sql, /\{data,broadcast_id\}/);
  assert.match(sql, /jsonb_array_elements_text/);
  assert.match(sql, /lower\(recipient\.email\) = lower\(\$2\)/);
  assert.match(sql, /'broadcast'::text AS attribution_source/);
  assert.match(sql, /'unsubscribe-click'::text AS attribution_source/);
});

test("tracked click attribution is bounded to the contact update window", () => {
  const sql = resolveUnsubscribeEvidenceSql();
  assert.match(sql, />= \$3::timestamptz - interval '15 minutes'/);
  assert.match(sql, /<= \$3::timestamptz/);
});

test("unsubscribe evidence does not use segment membership or current contact status", () => {
  const sql = resolveUnsubscribeEvidenceSql();
  assert.doesNotMatch(sql, /crm_marketing_segment_members/);
  assert.doesNotMatch(sql, /mc\.status/);
  assert.doesNotMatch(sql, /unsubscribed_at/);
});

test("stored unsubscribe counter only counts strongly attributed recipient events", () => {
  const sql = reconcileUnsubscribeCountSql();
  assert.match(sql, /COUNT\(DISTINCT lower\(cre\.recipient\)\)/);
  assert.match(sql, /event_type = 'contact\.unsubscribed'/);
  assert.match(sql, /_eivitech,unsubscribeAttribution/);
  assert.match(sql, /'broadcast', 'unsubscribe-click'/);
  assert.match(sql, /WHERE c\.id = \$1/);
});
