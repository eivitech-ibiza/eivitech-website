import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = new URL("../", import.meta.url).pathname;
const read = (path) => readFileSync(join(ROOT, path), "utf8");

test("email marketing database tables are created", () => {
  const migrations = read("api/src/migrations.ts");
  for (const table of [
    "crm_marketing_contacts",
    "crm_marketing_segments",
    "crm_marketing_segment_members",
    "crm_marketing_campaigns",
    "crm_marketing_consent_events",
    "crm_marketing_import_jobs",
  ]) {
    assert.match(migrations, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(migrations, /marketing_consent boolean NOT NULL DEFAULT false/);
  assert.match(migrations, /unsubscribe_token text UNIQUE NOT NULL/);
});

test("marketing API is protected and bulk sending is not exposed yet", () => {
  const server = read("api/src/server.ts");
  const marketing = read("api/src/marketing.ts");
  assert.match(server, /app\.use\(\s*"\/api\/marketing"/);
  assert.match(server, /requireRole\(\["admin", "manager"\]\)/);
  assert.match(marketing, /marketingRouter\.post\("\/contacts\/import"/);
  assert.match(marketing, /marketingRouter\.post\("\/campaigns"/);
  assert.doesNotMatch(marketing, /marketingRouter\.post\("\/campaigns\/:id\/send"/);
});

test("large but bounded marketing payloads can reach validation", () => {
  const server = read("api/src/server.ts");
  const marketing = read("api/src/marketing.ts");
  assert.match(server, /const marketingJsonParser = express\.json\(\{ limit: "12mb" \}\)/);
  assert.match(marketing, /html: z\.string\(\)\.max\(500_000\)/);
  assert.match(marketing, /contacts: z\.array\(z\.unknown\(\)\)\.max\(1000\)/);
});

test("terminal unsubscribe and suppression states require explicit audited restoration", () => {
  const marketing = read("api/src/marketing.ts");
  const client = read("src/lib/marketing.ts");
  const page = read("src/pages/EmailMarketing.tsx");
  assert.match(marketing, /crm_marketing_contacts\.status IN \('unsubscribed', 'suppressed'\) AND NOT \$21/);
  assert.match(marketing, /allow_resubscribe: z\.boolean\(\)\.optional\(\)/);
  assert.match(marketing, /RESUBSCRIBE_CONFIRMATION_REQUIRED/);
  assert.match(marketing, /eventType: ContactEventType = allowResubscribe\s*\? "restored"/);
  assert.match(client, /allow_resubscribe\?: boolean/);
  assert.match(page, /window\.confirm/);
  assert.match(page, /allow_resubscribe: allowResubscribe/);
});

test("the CRM exposes the protected email marketing workspace", () => {
  const app = read("src/App.tsx");
  const layout = read("src/components/Layout.tsx");
  const page = read("src/pages/EmailMarketing.tsx");
  assert.match(app, /path: "\/dashboard\/email-marketing"/);
  assert.match(layout, /to="\/dashboard\/email-marketing"/);
  assert.match(page, /parseMarketingContactsCsv/);
  assert.match(page, /Bulk sending stays disabled/);
});

test("CSV import supports Digitalempower and Mailchimp headers and reports rejected rows", () => {
  const parser = read("src/lib/marketingCsv.ts");
  const page = read("src/pages/EmailMarketing.tsx");
  for (const header of ["indirizzoemail", "nome", "cognome", "numeroditelefono", "region", "cc", "tags", "mcstatus", "sourcefile"]) {
    assert.match(parser, new RegExp(`${header}:`));
  }
  assert.match(page, /clientIssues: parsed\.issues/);
  assert.match(page, /totalRows: parsed\.totalRows/);
  assert.match(page, /result\.errors\s*\.slice\(0, 5\)/);
});

test("database dates are normalized before Zod update validation", () => {
  const marketing = read("api/src/marketing.ts");
  assert.match(marketing, /function isoString\(value: unknown\)/);
  assert.match(marketing, /consent_at: requestedConsent \? parsed\.data\.consent_at \?\? isoString\(existing\.consent_at\) : null/);
  assert.match(marketing, /data\.scheduled_at === undefined \? isoString\(existing\.scheduled_at\)/);
});


test("marketing consent and import safeguards cover final review findings", () => {
  const marketing = read("api/src/marketing.ts");
  const client = read("src/lib/marketing.ts");
  const parser = read("src/lib/marketingCsv.ts");
  assert.match(marketing, /const marketingConsent = terminalStatus[\s\S]*?\? false/);
  assert.match(marketing, /preserveExistingState = !contact\.stateProvided/);
  assert.match(marketing, /client_issues/);
  assert.match(marketing, /contact_rows/);
  assert.match(marketing, /total_rows/);
  const patchRoute = marketing.match(/marketingRouter\.patch\("\/contacts\/:id"[\s\S]*?marketingRouter\.post\("\/contacts\/import"/)?.[0] || "";
  assert.match(patchRoute, /UPDATE crm_marketing_contacts/);
  assert.match(patchRoute, /WHERE id = \$20/);
  assert.doesNotMatch(patchRoute, /upsertContact\(/);
  assert.match(client, /contact_rows: metadata\.contactRows/);
  assert.match(client, /client_issues: metadata\.clientIssues/);
  assert.match(parser, /contactRows/);
  assert.match(parser, /totalRows/);
  assert.match(parser, /hasConsentColumn/);
});

test("large marketing bodies are parsed only after CRM authorization", () => {
  const server = read("api/src/server.ts");
  assert.doesNotMatch(server, /app\.use\(express\.json/);
  assert.match(server, /const marketingJsonParser = express\.json\(\{ limit: "12mb" \}\)/);
  assert.match(server, /"\/api\/marketing",[\s\S]*?requireCrmUser,[\s\S]*?requireRole\(\["admin", "manager"\]\),[\s\S]*?marketingJsonParser/);
  assert.match(server, /app\.post\("\/api\/leads", publicLeadLimiter, publicJsonParser/);
  assert.match(server, /app\.use\("\/api\/leads", crmJsonParser\)/);
});
