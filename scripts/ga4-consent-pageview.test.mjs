import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// Exercise the actual TS tracking module with browser/gtag mocks rather than
// relying on static source assertions or producing test leads in the CRM.
function trackingHarness({ initialConsent = null, pathname = "/es/" } = {}) {
  let consent = initialConsent;
  const scripts = new Map();
  const window = {
    location: {
      pathname,
      search: "",
      href: `https://eivitech.com${pathname}`,
    },
    setTimeout,
    localStorage: {
      getItem: () => consent ? JSON.stringify(consent) : null,
      setItem: (_key, value) => { consent = JSON.parse(value); },
      removeItem: () => { consent = null; },
    },
  };
  const document = {
    title: "Eivitech Ibiza",
    getElementById: (id) => scripts.get(id) || null,
    createElement: () => ({ id: "", async: false, src: "" }),
    head: { appendChild: (script) => scripts.set(script.id, script) },
  };
  const context = vm.createContext({
    exports: {},
    window,
    document,
    setTimeout,
    console,
    __viteEnv: {
      DEV: false,
      VITE_GA4_ID: "G-63XMVCDJ7W",
      VITE_GTM_ID: "",
      VITE_GOOGLE_ADS_ID: "",
      VITE_META_PIXEL_ID: "",
    },
    require: (module) => {
      if (module === "@/lib/metaAttribution") return { clearMetaAttributionCookies() {} };
      if (module === "@/lib/metaIntegration") {
        return { fetchPublicMetaConfig: async () => ({ web: { enabled: false } }) };
      }
      throw new Error(`Unexpected dependency: ${module}`);
    },
  });
  const source = read("src/lib/tracking.ts").replaceAll("import.meta.env", "globalThis.__viteEnv");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInContext(js, context);

  const commands = () => (window.dataLayer || []).filter(Array.isArray);
  return {
    ...context.exports,
    window,
    scripts,
    commands,
    events: (name) => commands().filter(([action, event]) => action === "event" && event === name),
    navigate: (path, search = "") => {
      window.location.pathname = path;
      window.location.search = search;
      window.location.href = `https://eivitech.com${path}${search}`;
      document.title = "Eivitech Ibiza - Nueva página";
    },
  };
}

const analyticsConsent = () => ({
  preferences: false,
  analytics: true,
  marketing: false,
});
const storedAnalyticsConsent = () => ({
  ...analyticsConsent(),
  version: 3,
  necessary: true,
  updatedAt: new Date().toISOString(),
});

test("fresh visitor: GA4 stays off before consent and emits the initial page once after acceptance", async () => {
  const h = trackingHarness();
  await h.track("google_landing_view", { path: "/es/" });

  assert.equal(h.events("page_view").length, 0);
  assert.equal(h.scripts.size, 0);

  h.saveConsent(analyticsConsent());
  assert.equal(h.events("page_view").length, 1);
  assert.equal(h.events("google_landing_view").length, 0, "do not replay pre-consent custom events");
  assert.equal(h.events("page_view")[0][2].page_location, "https://eivitech.com/es/");
  assert.equal(h.events("page_view")[0][2].send_to, "G-63XMVCDJ7W");
  assert.equal(h.scripts.get("eivitech-gtag")?.src, "https://www.googletagmanager.com/gtag/js?id=G-63XMVCDJ7W");

  h.saveConsent(analyticsConsent());
  await h.track("google_landing_view", { path: "/es/" });
  assert.equal(h.events("page_view").length, 1, "preference saves and re-renders cannot double count");
  assert.equal(h.commands().filter(([action, id]) => action === "config" && id === "G-63XMVCDJ7W").length, 1);
});

test("returning visitor: first SEO effect can initialise GA4 before Layout bootstrap", async () => {
  const h = trackingHarness({ initialConsent: storedAnalyticsConsent() });
  await h.track("page_view", { path: "/es/" });
  h.initTrackingFromStoredConsent();
  await h.track("page_view", { path: "/es/" });

  const commands = h.commands();
  const configIndex = commands.findIndex(([action]) => action === "config");
  const eventIndex = commands.findIndex(([action, event]) => action === "event" && event === "page_view");
  assert.ok(configIndex >= 0 && eventIndex > configIndex, "config must precede first page event");
  assert.equal(h.events("page_view").length, 1);
  assert.equal(h.scripts.size, 1);
});

test("SPA navigation emits one canonical GA4 page_view per location and keeps custom view signals", async () => {
  const h = trackingHarness({ initialConsent: storedAnalyticsConsent() });
  await h.track("page_view", { path: "/es/" });
  h.navigate("/es/servicios", "?utm_source=ads");
  await h.track("service_page_view", { path: "/es/servicios" });
  await h.track("service_page_view", { path: "/es/servicios" });

  assert.equal(h.events("page_view").length, 2);
  assert.equal(h.events("service_page_view").length, 1);
  assert.equal(h.events("page_view")[1][2].page_path, "/es/servicios?utm_source=ads");

  h.navigate("/es/");
  await h.track("page_view", { path: "/es/" });
  assert.equal(h.events("page_view").length, 3, "returning to an earlier SPA route counts once again");
});

test("granting consent never replays form or conversion events", async () => {
  const h = trackingHarness();
  await h.track("form_submit", { source: "contacto" });
  await h.track("lead", { source: "contacto" });
  assert.equal(h.events("form_submit").length, 0);
  assert.equal(h.events("lead").length, 0);

  h.saveConsent(analyticsConsent());
  assert.equal(h.events("page_view").length, 1);
  assert.equal(h.events("form_submit").length, 0);
  assert.equal(h.events("lead").length, 0);
});

test("rejecting analytics prevents sending and private CRM routes never trigger page views", async () => {
  const h = trackingHarness();
  await h.track("page_view", { path: "/es/" });
  h.rejectOptionalConsent();
  assert.equal(h.events("page_view").length, 0);
  assert.equal(h.scripts.size, 0);

  const admin = trackingHarness({ pathname: "/es/dashboard" });
  admin.saveConsent(analyticsConsent());
  await admin.track("page_view", { path: "/es/dashboard" });
  assert.equal(admin.events("page_view").length, 0);
});

test("re-granting analytics measures the current view but never doubles a single grant", async () => {
  const h = trackingHarness();
  await h.track("page_view", { path: "/es/" });
  h.saveConsent(analyticsConsent());
  h.rejectOptionalConsent();
  await h.track("page_view", { path: "/es/" });
  assert.equal(h.events("page_view").length, 1);

  h.saveConsent(analyticsConsent());
  h.saveConsent(analyticsConsent());
  assert.equal(h.events("page_view").length, 2);
});
