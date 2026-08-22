import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const form = readFileSync(new URL("../src/components/LeadQualificationForm.tsx", import.meta.url), "utf8");
const crm = readFileSync(new URL("../src/lib/crm.ts", import.meta.url), "utf8");
const server = readFileSync(new URL("../api/src/server.ts", import.meta.url), "utf8");
const migrations = readFileSync(new URL("../api/src/migrations.ts", import.meta.url), "utf8");
const leadMarketing = readFileSync(new URL("../api/src/leadMarketing.ts", import.meta.url), "utf8");

test("client and partner forms expose an unchecked optional marketing consent", () => {
  assert.equal((form.match(/marketingConsent: z\.boolean\(\)\.optional\(\)/g) || []).length, 2);
  assert.equal((form.match(/marketingConsent: false/g) || []).length, 2);
  assert.equal((form.match(/register\("marketingConsent"\)/g) || []).length, 2);
  assert.match(form, /Opcional\./);
  assert.match(form, /comunicaciones comerciales de Eivitech/);
});

test("partner conversion preserves the optional marketing consent", () => {
  assert.match(crm, /marketingConsent: payload\.marketingConsent \?\? false/);
});

test("CRM stores and validates marketing consent independently from privacy consent", () => {
  assert.match(server, /marketingConsent: z\.boolean\(\)\.optional\(\)\.default\(false\)/);
  assert.match(server, /consent_privacy, consent_marketing, next_action/);
  assert.match(server, /data\.consentimiento,\s*data\.marketingConsent,\s*nextAction/s);
  assert.match(migrations, /consent_marketing boolean NOT NULL DEFAULT false/);
});

test("explicit opt-in subscribes while suppressed contacts remain protected", () => {
  assert.match(leadMarketing, /WHEN crm_marketing_contacts\.status = 'suppressed' THEN 'suppressed'/);
  assert.match(leadMarketing, /WHEN \$9 THEN 'subscribed'/);
  assert.match(leadMarketing, /web-form-marketing-opt-in/);
  assert.match(leadMarketing, /marketingConsentEventType/);
});
