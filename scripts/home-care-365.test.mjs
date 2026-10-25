import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { indexableRoutes } from "./site-routes.mjs";
import {
  HOME_CARE_PATH,
  HOME_CARE_SOURCE,
  homeCareStaticHtml,
  homeCareStructuredData,
} from "../src/data/homeCare365.seo.mjs";

const LANGUAGES = ["es", "it", "en", "nl"];
const content = JSON.parse(readFileSync("src/data/homeCare365.content.json", "utf8"));
const serverSource = readFileSync("api/src/server.ts", "utf8");
const leadMapper = readFileSync("src/lib/homeCareLead.ts", "utf8");
const formSource = readFileSync("src/components/HomeCareLeadForm.tsx", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const header = readFileSync("src/components/Header.tsx", "utf8");

function shape(value) {
  if (Array.isArray(value)) return ["array", value.length, ...(value.length ? [shape(value[0])] : [])];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]));
  }
  return typeof value;
}

function apiEnum(field) {
  const match = serverSource.match(new RegExp(`const leadSchema = z\\.object\\(\\{[\\s\\S]*?${field}: z\\.enum\\(\\[([^\\]]+)\\]\\)`));
  assert.ok(match, `API enum not found for ${field}`);
  return match[1].split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
}

test("Home Care 365 copy has the same structure in every language", () => {
  const reference = shape(content.es);
  for (const language of LANGUAGES) {
    assert.deepEqual(shape(content[language]), reference, `Structure differs for ${language}`);
  }
});

test("Home Care 365 publishes no prices while the price list is not approved", () => {
  for (const language of LANGUAGES) {
    const text = JSON.stringify(content[language]);
    assert.doesNotMatch(text, /€|\bEUR\b|\b(?:149|279|449)\b/, `Price found in ${language} copy`);
  }
});

test("meta titles and descriptions fit search result snippets", () => {
  for (const language of LANGUAGES) {
    const { title, description } = content[language].meta;
    assert.ok(title.length <= 70, `${language} title is ${title.length} characters`);
    assert.ok(description.length >= 120 && description.length <= 160, `${language} description is ${description.length} characters`);
  }
});

test("structured data exposes the service, its three plans and every FAQ", () => {
  for (const language of LANGUAGES) {
    const [service, faq] = homeCareStructuredData(content, language);
    assert.equal(service["@type"], "Service");
    assert.equal(service.provider["@id"], "https://eivitech.com/#organization");
    assert.equal(service.hasOfferCatalog.itemListElement.length, 3);
    for (const offer of service.hasOfferCatalog.itemListElement) {
      assert.equal("price" in offer, false, "Offers must not carry unapproved prices");
    }
    assert.equal(faq["@type"], "FAQPage");
    assert.equal(faq.mainEntity.length, content[language].faq.items.length);
  }
});

test("static HTML carries the answer-first content for crawlers without JavaScript", () => {
  for (const language of LANGUAGES) {
    const html = homeCareStaticHtml(content, language, { phone: "+34 674 735 188", email: "info@eivitech.com" });
    assert.match(html, /^<main /);
    assert.equal((html.match(/<h1/g) || []).length, 1, "Exactly one h1");
    assert.ok(html.includes(content[language].faq.items[0].a.slice(0, 40)));
    assert.ok(html.includes('href="tel:+34674735188"'));
    assert.doesNotMatch(html, /<script/i);
  }
});

test("the route is indexable, localized and linked from the navigation", () => {
  const route = indexableRoutes.find((entry) => entry.path === HOME_CARE_PATH);
  assert.ok(route, "Home Care route missing from the inventory");
  assert.deepEqual(Object.keys(route.localized).sort(), ["en", "it", "nl"]);
  assert.match(app, /path: "\/home-care-365", element: <HomeCare365 \/>/);
  assert.match(header, /to: "\/home-care-365"/);
});

test("the Home Care form maps onto the existing public lead contract", () => {
  assert.equal(HOME_CARE_SOURCE, "home-care-365");
  assert.match(formSource, /source: HOME_CARE_SOURCE/);

  const fixedValues = {
    intervencion: leadMapper.match(/intervencion: "([^"]+)"/)?.[1],
    tieneFotos: leadMapper.match(/tieneFotos: "([^"]+)"/)?.[1],
    tieneProyecto: leadMapper.match(/tieneProyecto: "([^"]+)"/)?.[1],
    plazo: leadMapper.match(/plazo: "([^"]+)"/)?.[1],
  };
  for (const [field, value] of Object.entries(fixedValues)) {
    assert.ok(apiEnum(field).includes(value), `${field}="${value}" is not accepted by the API`);
  }

  for (const key of Object.keys(content.es.form.profileOptions)) {
    assert.ok(apiEnum("tipoCliente").includes(key), `tipoCliente "${key}" is not accepted by the API`);
  }
  for (const key of Object.keys(content.es.form.propertyOptions)) {
    assert.ok(apiEnum("tipoPropiedad").includes(key), `tipoPropiedad "${key}" is not accepted by the API`);
  }
  assert.match(leadMapper, /MAX_LEAD_MESSAGE_LENGTH = 1500/);
  assert.match(serverSource, /mensaje: z\.string\(\)\.trim\(\)\.max\(1500\)/);
});

test("the form never asks for absence dates or access details", () => {
  for (const language of LANGUAGES) {
    const labels = Object.values(content[language].form)
      .flatMap((value) => (typeof value === "object" ? Object.values(value) : [value]))
      .join(" ");
    assert.doesNotMatch(labels, /alarm|código|codice|wachtwoord|password/i);
  }
  const fields = [...formSource.matchAll(/register\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(fields.length >= 12, "Unexpected form field inventory");
  for (const name of fields) {
    assert.doesNotMatch(name, /fecha|ausencia|llave|key|alarm|acceso|access/i, `Sensitive field in form: ${name}`);
  }
});
