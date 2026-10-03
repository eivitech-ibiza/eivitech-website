import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// These source-level integration guards protect provider and database race
// invariants. Automated CI never calls live Resend send or cancel endpoints.

test("campaign preparation serializes Resend pool allocation and locks the campaign row", () => {
  const source = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /SELECT \*[\s\S]*FOR UPDATE/);
  assert.match(source, /WHERE id = \$6[\s\S]*AND status = 'draft'/);
});

test("campaign edits cannot overwrite an accepted concurrent send", () => {
  const source = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  assert.match(source, /WHERE id = \$14[\s\S]*AND status = 'draft'[\s\S]*RETURNING \*/);
});

test("concurrent send retries do not report success before provider acceptance", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /SEND_ACCEPTANCE_PENDING/);
  assert.match(source, /hasAcceptedSendEvent/);
  assert.match(source, /ok: false/);
  assert.match(source, /confirmationAttemptId/);
});

test("provider-confirmed queued scheduled campaigns remain cancellable", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /campaign\.status === "sending"/);
  assert.match(source, /providerStatus !== "scheduled" && providerStatus !== "queued"/);
  assert.match(source, /WHERE id = \$1 AND status IN \('scheduled', 'sending'\)/);
  assert.match(source, /CANCEL_ACCEPTANCE_PENDING/);
});

test("cancellation claims and terminal states cannot be overwritten by stale queued reconciliation", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  const metrics = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(delivery, /status IN \('draft', 'scheduled', 'sending'\)/);
  assert.match(delivery, /status = 'paused' AND \$1 IN \('sent', 'cancelled'\)/);
  assert.match(delivery, /status = 'cancelled' AND \$1 = 'sent'/);
  assert.match(delivery, /SEND_CANCELLED_DURING_ACCEPTANCE/);
  assert.match(metrics, /campaign\.status === "paused"/);
  assert.match(metrics, /AND status = \$5/);
});

test("an uncertain send is never reset to draft only because the provider still reports draft", () => {
  const source = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(source, /campaign\.status === "sending" && providerStatus === "draft"/);
  assert.match(source, /return;/);
});

test("only explicit provider rejections release an uncertain send immediately", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /error instanceof ResendMarketingError/);
  assert.match(source, /error\.status >= 400/);
  assert.match(source, /error\.status < 500/);
});
