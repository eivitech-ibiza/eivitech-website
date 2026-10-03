import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("scheduled campaigns reserve their Resend audience pool until completion or cancellation", () => {
  const marketing = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(marketing, /c\.status IN \('scheduled', 'sending', 'paused'\)/);
  assert.match(delivery, /sendResendBroadcast\([\s\S]*?broadcastId,[\s\S]*?isoString\(campaign\.scheduled_at\),[\s\S]*?confirmationAttemptId/);
  assert.match(delivery, /campaigns\/:id\/cancel/);
});

test("accepted Broadcast operations are not reported as delivered messages", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.doesNotMatch(
    delivery,
    /sendResendBroadcast\([\s\S]{0,300}SET status = 'sent', sent_at = now\(\)/,
  );
  assert.match(delivery, /provider_status/);
  assert.match(delivery, /outcomeUncertain/);
});

test("campaign-list reconciliation is delayed to avoid racing a provider acceptance request", () => {
  const source = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(source, /status IN \('scheduled', 'sending', 'paused'\)/);
  assert.match(source, /updated_at <= now\(\) - interval '30 seconds'/);
  assert.doesNotMatch(source, /scheduled_at <= now\(\) \+ interval '5 minutes'/);
});

test("delivery audit events use the existing created_by database column", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(delivery, /campaign_id, event_type, created_by, payload/);
  assert.doesNotMatch(delivery, /campaign_id, event_type, actor_id, payload/);
});
