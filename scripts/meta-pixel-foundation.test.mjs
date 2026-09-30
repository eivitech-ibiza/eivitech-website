import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

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
  assert.match(
    tracking,
    /\.catch\(\(\) => \(\{[\s\S]*configured: true,[\s\S]*enabled: false,[\s\S]*pixelId: null/,
    "runtime config errors must fail closed instead of re-enabling the VITE fallback",
  );
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


// Execute the real tracking module with a delayed runtime config and mocked
// Pixel loader. These tests deliberately do not claim to verify Meta's HTTP
// response: fbq dispatch and remote receipt are separate steps.
function trackingHarness({ pixelLoadDelayMs = 20, initialMarketing = true } = {}) {
  let consent = {
    version: 3, necessary: true, preferences: false, analytics: false,
    marketing: initialMarketing, updatedAt: new Date().toISOString(),
  };
  let resolveConfig;
  let appendedPixelScripts = 0;
  const calls = [];
  const scripts = new Map();
  const window = {
    location: { pathname: "/es/reformas-ibiza", search: "" },
    setTimeout,
    localStorage: {
      getItem: () => JSON.stringify(consent),
      setItem: (_key, value) => { consent = JSON.parse(value); },
      removeItem: () => { consent = { ...consent, marketing: false }; },
    },
  };
  const document = {
    getElementById: (id) => scripts.get(id),
    createElement: () => ({ id: "", async: false, src: "" }),
    head: {
      appendChild: (script) => {
        scripts.set(script.id, script);
        if (script.id === "eivitech-meta-pixel") {
          appendedPixelScripts += 1;
          if (pixelLoadDelayMs !== null) {
            setTimeout(() => {
              if (window.fbq) window.fbq.callMethod = (...args) => calls.push(args);
            }, pixelLoadDelayMs);
          }
        }
      },
    },
  };
  const configPromise = new Promise((resolve) => { resolveConfig = resolve; });
  const context = vm.createContext({
    exports: {},
    window,
    document,
    setTimeout,
    URL,
    console,
    __viteEnv: { DEV: false },
    require: (module) => {
      if (module === "@/lib/metaAttribution") return { clearMetaAttributionCookies() {} };
      if (module === "@/lib/metaIntegration") {
        return { fetchPublicMetaConfig: () => configPromise };
      }
      throw new Error(`Unexpected module: ${module}`);
    },
  });
  const source = read("src/lib/tracking.ts").replaceAll("import.meta.env", "globalThis.__viteEnv");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInContext(js, context);

  return {
    track: context.exports.track,
    applyTrackingConsent: context.exports.applyTrackingConsent,
    calls,
    window,
    get scriptsLoaded() { return appendedPixelScripts; },
    resolveConfig: () => resolveConfig({
      web: { configured: true, enabled: true, pixelId: "1521853439751521" },
    }),
    setMarketing: (value) => { consent = { ...consent, marketing: value }; },
  };
}

test("confirmed Lead waits for runtime config and real Pixel library before resolving", async () => {
  const h = trackingHarness({ pixelLoadDelayMs: 50 });
  let complete = false;
  const promise = h.track("lead", { source: "landing_meta" }, { eventId: "shared-lead-id" })
    .then(() => { complete = true; });
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(complete, false);
  assert.equal(h.scriptsLoaded, 0);
  h.resolveConfig();
  await promise;
  assert.equal(complete, true);
  assert.equal(h.scriptsLoaded, 1);
  const leadCalls = h.calls.filter(([action, eventName]) => action === "track" && eventName === "Lead");
  assert.equal(leadCalls.length, 1);
  assert.equal(leadCalls[0][3].eventID, "shared-lead-id");
  await h.track("page_view", { path: "/es/gracias" });
  assert.equal(h.scriptsLoaded, 1);
  assert.equal(h.calls.filter(([action, eventName]) => action === "track" && eventName === "Lead").length, 1);
  // The initial consent grant was queued before fbevents.js loaded, not repeated.
  assert.equal(h.window.fbq.queue.filter(([action, state]) => action === "consent" && state === "grant").length, 1);
  assert.equal(h.calls.filter(([action, state]) => action === "consent" && state === "grant").length, 0);
});

test("Pixel stays disabled if consent is revoked while runtime config is loading", async () => {
  const h = trackingHarness();
  const dispatched = h.track("lead", { source: "contacto" }, { eventId: "revoked-id" });
  h.setMarketing(false);
  h.resolveConfig();
  await dispatched;
  assert.equal(h.scriptsLoaded, 0);
  assert.equal(h.calls.length, 0);
});

test("Lead form awaits Pixel dispatch after CRM success before navigation", () => {
  const form = read("src/components/LeadQualificationForm.tsx");
  const block = form.slice(form.indexOf("const onClientSubmit"), form.indexOf("const onPartnerSubmit"));
  assert.match(block, /await submitLeadToCrm/);
  assert.match(block, /await track\(\s*"lead"/);
  assert.ok(block.indexOf('await track(\n        "lead"') < block.indexOf('navigate("/gracias")'));
});
