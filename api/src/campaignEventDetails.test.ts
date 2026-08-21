import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const {
  campaignMetricRecipientsSql,
  campaignUnsubscribeRecipientsSql,
} = await import("./campaignEventDetails.js");

test("standard campaign metric details are deduplicated by recipient", () => {
  const sql = campaignMetricRecipientsSql();
  assert.match(sql, /DISTINCT ON \(lower\(cre\.recipient\)\)/);
  assert.match(sql, /cre\.campaign_id = \$1/);
  assert.match(sql, /cre\.event_type = \$2/);
  assert.match(sql, /crm_marketing_contacts/);
  assert.match(sql, /data,click,link/);
  assert.match(sql, /data,bounce,message/);
});

test("unsubscribe details use the same strong evidence as campaign metrics", () => {
  const sql = campaignUnsubscribeRecipientsSql();
  assert.match(sql, /email\.clicked/);
  assert.match(sql, /unsubscribe\.resend\.com/);
  assert.match(sql, /contact\.updated/);
  assert.match(sql, /data,unsubscribed/);
  assert.match(sql, /clicked_at \+ interval '15 minutes'/);
  assert.match(sql, /_eivitech,unsubscribeAttribution/);
  assert.match(sql, /'broadcast', 'unsubscribe-click'/);
  assert.match(sql, /DISTINCT ON \(email\)/);
});
