import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const server = readFileSync("api/src/server.ts", "utf8");
const marketing = readFileSync("api/src/marketing.ts", "utf8");
const resend = readFileSync("api/src/resendMarketing.ts", "utf8");
const webhook = readFileSync("api/src/resendWebhook.ts", "utf8");
const migrations = readFileSync("api/src/migrations.ts", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const workspace = readFileSync("src/components/marketing/CampaignWorkspace.tsx", "utf8");
const publicApi = readFileSync("api/src/marketingPublic.ts", "utf8");

test("public unsubscribe is rate limited and mounted before Clerk", () => {
  assert.ok(server.indexOf('"/api/marketing-public"') < server.indexOf("app.use(clerkMiddleware())"));
  assert.match(server, /publicMarketingLimiter/);
  assert.match(publicApi, /marketing_consent = false/);
  assert.match(publicApi, /crm_marketing_consent_events/);
  assert.match(app, /path: "\/unsubscribe"/);
});

test("bulk sends require server flag, one-time token and exact phrase", () => {
  assert.match(marketing, /MARKETING_BULK_SEND_ENABLED/);
  assert.match(marketing, /send_confirmation_token_hash/);
  assert.match(marketing, /send_confirmation_expires_at > now\(\)/);
  assert.match(marketing, /INVIA \$\{campaign\.recipient_count\} EMAIL/);
  assert.match(marketing, /Only draft campaigns can be prepared/);
  assert.match(migrations, /crm_marketing_campaign_events/);
});

test("only eligible consenting contacts are synchronized", () => {
  assert.match(marketing, /c\.status = 'subscribed'/);
  assert.match(marketing, /c\.marketing_consent = true/);
  assert.match(marketing, /c\.unsubscribed_at IS NULL/);
  assert.match(marketing, /c\.suppressed_at IS NULL/);
  assert.match(marketing, /contacts\.rows\.length > capabilities\.maxRecipients/);
});

test("campaign UI includes sandbox preview, test send and double confirmation", () => {
  assert.match(workspace, /sandbox=""/);
  assert.match(workspace, /sendMarketingCampaignTest/);
  assert.match(workspace, /reviewConfirmed/);
  assert.match(workspace, /confirmationPhrase !== preparation\.data\.confirmation_phrase/);
  assert.match(workspace, /bulk_send_enabled/);
});

test("Resend broadcasts contain the provider-managed unsubscribe link", () => {
  assert.match(resend, /RESEND_UNSUBSCRIBE_URL/);
  assert.match(resend, /createOrUpdateResendBroadcast/);
  assert.match(webhook, /contact\.updated/);
  assert.match(webhook, /crm_marketing_campaign_recipient_events/);
});
