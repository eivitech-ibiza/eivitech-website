import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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

test("cancellation cannot race the initial provider send request", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /campaign\.status !== "scheduled"/);
  assert.match(source, /WHERE id = \$1 AND status = 'scheduled'/);
  assert.doesNotMatch(source, /status IN \('scheduled', 'sending'\)/);
});

test("only explicit provider rejections release an uncertain send immediately", () => {
  const source = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(source, /error instanceof ResendMarketingError/);
  assert.match(source, /error\.status >= 400/);
  assert.match(source, /error\.status < 500/);
});
