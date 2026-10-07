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


test("website CAPI captures and forwards the browser user agent", () => {
  const server = read("api/src/server.ts");
  const outbox = read("api/src/meta/outbox.ts");
  const events = read("api/src/meta/events.ts");
  assert.match(server, /req\.get\("user-agent"\)/);
  assert.match(outbox, /clientUserAgent/);
  assert.match(events, /client_user_agent/);
});


test("Meta admin form reloads saved configuration independently from diagnostics", () => {
  const page = read("src/pages/MetaIntegration.tsx");
  const configIndex = page.indexOf("const nextConfig = await fetchMetaAdminConfig(token)");
  const applyIndex = page.indexOf("applyConfig(nextConfig)", configIndex);
  const optionalIndex = page.indexOf("Promise.allSettled", applyIndex);
  assert.ok(configIndex >= 0, "admin config fetch must exist");
  assert.ok(applyIndex > configIndex, "saved config must hydrate the form");
  assert.ok(optionalIndex > applyIndex, "diagnostics must be optional and run after config hydration");
  assert.equal(
    page.includes("const [nextConfig, nextStatus, nextInbox] = await Promise.all("),
    false,
    "config hydration must not depend on status/inbox success"
  );
});


test("Meta admin exposes CAPI sent state and manual processing", () => {
  const routes = read("api/src/meta/routes.ts");
  const client = read("src/lib/metaIntegration.ts");
  const page = read("src/pages/MetaIntegration.tsx");
  assert.match(routes, /\/outbox\/process/);
  assert.match(routes, /processMetaOutboxBatch/);
  assert.match(client, /processMetaOutbox/);
  assert.match(page, /Elabora CAPI ora/);
  assert.match(page, /Outbox sent/);
  assert.match(page, /Ultimo evento CAPI inviato/);
});

test("website CAPI source URLs and worker recovery preserve existing queued leads", () => {
  const server = read("api/src/server.ts");
  const events = read("api/src/meta/events.ts");
  const outbox = read("api/src/meta/outbox.ts");
  const routes = read("api/src/meta/routes.ts");
  assert.match(server, /new URL\(safeLandingPage \|\| "\/", "https:\/\/eivitech\.com"\)/);
  assert.match(events, /value\.startsWith\("\/"\)/);
  assert.match(outbox, /recoverUnhandledProcessingError/);
  assert.match(outbox, /WORKER_EXCEPTION/);
  assert.match(routes, /lastPendingError/);
});


test("manual Lead Ads processing falls back to Graph API polling and reports it in the admin UI", () => {
  const leadAds = read("api/src/meta/leadAds.ts");
  const routes = read("api/src/meta/routes.ts");
  const client = read("src/lib/metaIntegration.ts");
  const page = read("src/pages/MetaIntegration.tsx");

  assert.match(leadAds, /syncMetaLeadForms/);
  assert.match(leadAds, /\/leads/);
  assert.match(leadAds, /ON CONFLICT \(meta_lead_id\) DO UPDATE/);
  assert.match(routes, /const fallback = await syncMetaLeadForms/);
  assert.match(client, /fallback: \{ forms: number; fetched: number; synced: number \}/);
  assert.match(page, /Graph \$\{result\.fallback\.synced\}\/\$\{result\.fallback\.fetched\}/);
});


test("ready Meta leads can be promoted into the native CRM from the admin UI", () => {
  const routes = read("api/src/meta/routes.ts");
  const client = read("src/lib/metaIntegration.ts");
  const page = read("src/pages/MetaIntegration.tsx");
  const inbox = read("api/src/meta/leadInbox.ts");

  assert.match(routes, /\/lead-inbox\/:id\/promote/);
  assert.match(client, /promoteMetaLeadInbox/);
  assert.match(page, /Promuovi nel CRM/);
  assert.match(page, /item\.status === "ready"/);
  assert.match(inbox, /Lead Meta importado al CRM/);
  assert.match(inbox, /source, utm_source/);
});
