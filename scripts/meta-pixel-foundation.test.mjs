import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Meta Pixel lead signal is emitted only after CRM success and partner applications stay separate", () => {
  const form = read("src/components/LeadQualificationForm.tsx");
  const tracking = read("src/lib/tracking.ts");

  const submitIndex = form.indexOf("await submitLeadToCrm");
  const leadIndex = form.indexOf('"lead"', submitIndex);
  assert.ok(submitIndex >= 0, "client submit must call CRM");
  assert.ok(leadIndex > submitIndex, "Lead tracking must happen only after CRM success");
  assert.equal(
    tracking.includes('event === "lead" || event === "quote_request"'),
    false,
    "quote_request must not be mapped to Meta Lead",
  );

  const partnerStart = form.indexOf("const onPartnerSubmit");
  const partnerEnd = form.indexOf("\n  return (", partnerStart);
  const partnerBlock = form.slice(partnerStart, partnerEnd);
  assert.ok(partnerStart >= 0 && partnerEnd > partnerStart, "partner submit block must be found");
  assert.equal(
    /track\("lead"[\s\S]*mode:\s*"partner"/.test(partnerBlock),
    false,
    "partner applications must not emit the commercial Lead signal",
  );
});

test("Meta foundation exposes runtime config, idempotent submission identity and private-area exclusion", () => {
  const migrations = read("api/src/migrations.ts");
  const app = read("src/App.tsx");
  const layout = read("src/components/Layout.tsx");
  const tracking = read("src/lib/tracking.ts");
  const server = read("api/src/server.ts");

  assert.match(migrations, /submission_id/);
  assert.match(migrations, /meta_event_id/);
  assert.match(migrations, /crm_meta_settings/);
  assert.match(server, /submission_id/);
  assert.match(server, /meta_event_id/);
  assert.match(app, /dashboard\/meta/);
  assert.match(layout, /dashboard\/meta/);
  assert.match(tracking, /startsWith\("\/dashboard"\)/);
  assert.match(tracking, /eventID/);
});

test("Consent and Meta attribution are separate from email marketing consent", () => {
  const tracking = read("src/lib/tracking.ts");
  const form = read("src/components/LeadQualificationForm.tsx");
  const attribution = read("src/lib/metaAttribution.ts");

  assert.match(tracking, /version:\s*3/);
  assert.match(form, /marketingConsent/);
  assert.match(form, /meta_consent/);
  assert.match(attribution, /fbclid/);
  assert.match(attribution, /_fbp/);
  assert.match(attribution, /_fbc/);
  assert.match(attribution, /revokeStoredMetaConsents/);
});
