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

test("the CRM exposes the protected email marketing workspace", () => {
  const app = read("src/App.tsx");
  const layout = read("src/components/Layout.tsx");
  const page = read("src/pages/EmailMarketing.tsx");
  assert.match(app, /path: "\/dashboard\/email-marketing"/);
  assert.match(layout, /to="\/dashboard\/email-marketing"/);
  assert.match(page, /parseMarketingContactsCsv/);
  assert.match(page, /Bulk sending stays disabled/);
});

test("CSV import supports the Digitalempower and Mailchimp headers", () => {
  const parser = read("src/lib/marketingCsv.ts");
  for (const header of ["indirizzoemail", "nome", "cognome", "numeroditelefono", "region", "cc", "tags", "mcstatus", "sourcefile"]) {
    assert.match(parser, new RegExp(`${header}:`));
  }
});
