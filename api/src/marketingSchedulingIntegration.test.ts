import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("scheduled campaigns reserve their Resend audience pool until completion or cancellation", () => {
  const source = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  assert.match(source, /c\.status IN \('scheduled', 'sending', 'paused'\)/);
  assert.match(source, /sendResendBroadcast\(broadcastId, isoString\(campaign\.scheduled_at\)\)/);
  assert.match(source, /campaigns\/:id\/cancel/);
});

test("accepted Broadcast operations are not reported as delivered messages", () => {
  const source = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  assert.doesNotMatch(
    source,
    /sendResendBroadcast\([\s\S]{0,300}SET status = 'sent', sent_at = now\(\)/,
  );
  assert.match(source, /provider_status/);
  assert.match(source, /outcomeUncertain/);
});

test("campaign-list reconciliation is delayed to avoid racing a provider acceptance request", () => {
  const source = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(source, /updated_at <= now\(\) - interval '30 seconds'/);
  assert.match(source, /scheduled_at <= now\(\) \+ interval '5 minutes'/);
});
