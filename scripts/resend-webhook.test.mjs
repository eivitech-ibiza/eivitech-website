import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const server = readFileSync("api/src/server.ts", "utf8");
const webhook = readFileSync("api/src/resendWebhook.ts", "utf8");

test("Resend webhook route receives raw JSON before the global JSON parser", () => {
  const route = server.indexOf('"/api/webhooks/resend/owner"');
  const jsonParser = server.indexOf('app.use(express.json');
  assert.notEqual(route, -1);
  assert.notEqual(jsonParser, -1);
  assert.ok(route < jsonParser);
  assert.match(server, /express\.raw\(\{ type: "application\/json"/);
});

test("Resend webhook verifies Svix signatures and tracks delivery failures", () => {
  assert.match(webhook, /RESEND_OWNER_WEBHOOK_SECRET/);
  assert.match(webhook, /timingSafeEqual/);
  assert.match(webhook, /email\.suppressed/);
  assert.match(webhook, /email\.bounced/);
  assert.match(webhook, /email\.failed/);
  assert.match(webhook, /ON CONFLICT \(svix_id\) DO NOTHING/);
  assert.match(webhook, /UPDATE crm_email_notifications/);
});
