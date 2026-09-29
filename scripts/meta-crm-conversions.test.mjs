import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Meta CRM migrations keep lead IDs as text and create durable inbox/outbox", () => {
  const migrations = read("api/src/migrations.ts");
  assert.match(migrations, /meta_lead_id text/);
  assert.match(migrations, /crm_meta_webhook_events/);
  assert.match(migrations, /crm_meta_lead_inbox/);
  assert.match(migrations, /crm_meta_outbox/);
  assert.match(migrations, /crm_lead_outcomes/);
});

test("Lead Ads webhook uses raw JSON before Clerk and Graph API v26.0 is explicit", () => {
  const server = read("api/src/server.ts");
  const config = read("api/src/meta/crmConfig.ts");
  const leadAds = read("api/src/meta/leadAds.ts");
  const rawIndex = server.indexOf('"/api/webhooks/meta/leadgen"');
  const clerkIndex = server.indexOf("app.use(clerkMiddleware())");
  assert.ok(rawIndex >= 0 && rawIndex < clerkIndex);
  assert.match(server, /express\.raw/);
  assert.match(config, /v26\.0/);
  assert.match(leadAds, /leadgen_id/);
  assert.match(leadAds, /field_data/);
});

test("CRM workflow is atomic and replaces the old two-request Dashboard write path", () => {
  const dashboard = read("src/pages/Dashboard.tsx");
  const crm = read("src/lib/crm.ts");
  const workflow = read("api/src/leadWorkflow.ts");
  assert.match(dashboard, /submitCrmWorkflow/);
  assert.equal(dashboard.includes("await updateCrmLead(token, lead.id"), false);
  assert.equal(dashboard.includes("await addCrmLeadActivity(token, lead.id"), false);
  assert.match(crm, /\/workflow/);
  assert.match(workflow, /BEGIN/);
  assert.match(workflow, /crm_lead_outcomes/);
  assert.match(workflow, /enqueueCrmEvent/);
  assert.match(workflow, /COMMIT/);
});

test("Meta CRM worker preserves event identity and has bounded retry states", () => {
  const outbox = read("api/src/meta/outbox.ts");
  for (const state of ["queued", "processing", "retry", "failed", "skipped"]) {
    assert.match(outbox, new RegExp(state));
  }
  assert.match(outbox, /event_id/);
  assert.match(outbox, /FOR UPDATE SKIP LOCKED/);
});
