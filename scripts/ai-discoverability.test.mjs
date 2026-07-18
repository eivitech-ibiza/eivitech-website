import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { indexableRoutes } from "./site-routes.mjs";

const seoSource = readFileSync("src/lib/seo.ts", "utf8");
const seoComponentSource = readFileSync("src/components/SEO.tsx", "utf8");
const generatorSource = readFileSync("scripts/generate-seo-files.mjs", "utf8");
const robots = readFileSync("public/robots.txt", "utf8");

const ORGANIZATION_ID = "https://eivitech.com/#organization";

function structuredDataFor(route) {
  if (!route.jsonLd) return [];
  return Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd];
}

test("site entity graph uses a specific construction-business type and stable entity ids", () => {
  assert.match(seoSource, /"@type": "HomeAndConstructionBusiness"/);
  assert.match(seoSource, /export const ORGANIZATION_ID/);
  assert.match(seoSource, /export const WEBSITE_ID/);
  assert.match(seoSource, /export const websiteJsonLd/);
  assert.match(seoSource, /export const webPageJsonLd/);
  assert.match(seoSource, /export const breadcrumbJsonLd/);
});

test("runtime SEO links pages, services and projects into the same entity graph", () => {
  assert.match(seoComponentSource, /webPageJsonLd/);
  assert.match(seoComponentSource, /websiteJsonLd/);
  assert.match(seoComponentSource, /breadcrumbJsonLd/);
  assert.match(seoComponentSource, /type === "CreativeWork"/);
  assert.match(seoComponentSource, /creator: block\.creator \|\| \{ "@id": ORGANIZATION_ID \}/);
  assert.match(seoComponentSource, /type === "Service"/);
  assert.match(seoComponentSource, /provider: block\.provider \|\| \{ "@id": ORGANIZATION_ID \}/);
  assert.match(seoComponentSource, /og:locale:alternate/);
});

test("static service and project routes expose provider and creator relationships", () => {
  const services = indexableRoutes.filter((route) => route.path.startsWith("/servicios/"));
  const projects = indexableRoutes.filter((route) => route.path.startsWith("/transformations/"));

  assert.ok(services.length >= 8);
  assert.ok(projects.length >= 6);

  for (const route of services) {
    const service = structuredDataFor(route).find((block) => block["@type"] === "Service");
    assert.ok(service, `Missing Service JSON-LD for ${route.path}`);
    assert.equal(service.provider?.["@id"], ORGANIZATION_ID);
    assert.equal(service.url, `https://eivitech.com${route.path}/`);
    assert.equal(service.mainEntityOfPage?.["@id"], `https://eivitech.com${route.path}/#webpage`);
  }

  for (const route of projects) {
    const project = structuredDataFor(route).find((block) => block["@type"] === "CreativeWork");
    assert.ok(project, `Missing CreativeWork JSON-LD for ${route.path}`);
    assert.equal(project.creator?.["@id"], ORGANIZATION_ID);
    assert.equal(project.mainEntityOfPage?.["@id"], `https://eivitech.com${route.path}/#webpage`);
  }
});

test("static entry pages prerender WebPage and breadcrumb structured data", () => {
  assert.match(generatorSource, /"@type": "WebPage"/);
  assert.match(generatorSource, /"@type": "BreadcrumbList"/);
  assert.match(generatorSource, /structuredDataBlocks/);
  assert.match(generatorSource, /if \(noIndex\) return \[\]/);
  assert.match(generatorSource, /isPartOf: \{ "@id": WEBSITE_ID \}/);
  assert.match(generatorSource, /about: \{ "@id": ORGANIZATION_ID \}/);
});

test("robots policy keeps public content crawlable and advertises the sitemap", () => {
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \/\s*$/m);
  assert.match(robots, /Sitemap: https:\/\/eivitech\.com\/sitemap\.xml/);
});
