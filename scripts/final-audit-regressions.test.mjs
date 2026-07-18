import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

import { indexableRoutes } from "./site-routes.mjs";

const ROOT = resolve(new URL("../", import.meta.url).pathname);
const PROJECTS_SOURCE = readFileSync(join(ROOT, "src/data/projects.ts"), "utf8");
const CAPTIONS_SOURCE = readFileSync(join(ROOT, "src/data/projectCaptions.ts"), "utf8");

const PROJECT_SLUGS = [
  "investment-oriented-villa-makeover",
  "luxury-mediterranean-villa-renovation",
  "warm-contemporary-apartment-transformation",
  "authentic-ibiza-finca-restoration",
  "modern-minimal-apartment-marina-botafoch",
  "low-maintenance-mediterranean-landscape",
];

function projectBlock(slug) {
  const start = PROJECTS_SOURCE.indexOf(`    slug: "${slug}",`);
  assert.notEqual(start, -1, `Missing project ${slug}`);
  const next = PROJECTS_SOURCE.indexOf("\n  },\n  {", start);
  return PROJECTS_SOURCE.slice(start, next === -1 ? PROJECTS_SOURCE.length : next);
}

function captionsBlock(slug) {
  const start = CAPTIONS_SOURCE.indexOf(`  "${slug}": [`);
  assert.notEqual(start, -1, `Missing captions for ${slug}`);
  const next = CAPTIONS_SOURCE.indexOf("\n  ],", start);
  return CAPTIONS_SOURCE.slice(start, next === -1 ? CAPTIONS_SOURCE.length : next);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("all six project records have descriptive cover metadata and valid active media", () => {
  const activeHashes = new Map();

  for (const slug of PROJECT_SLUGS) {
    const block = projectBlock(slug);
    const cover = block.match(/cover: media\("([^"]+)", "([^"]+)"\)/);
    assert.ok(cover, `Missing cover for ${slug}`);
    assert.match(block, /coverAlt: tr\([\s\S]*?\),\n    coverWidth: \d+,\n    coverHeight: \d+,/);

    const [, folder, coverFile] = cover;
    const gallery = block.match(/gallery: \[([\s\S]*?)\]\.map/);
    assert.ok(gallery, `Missing gallery for ${slug}`);
    const files = [coverFile, ...[...gallery[1].matchAll(/"([^"]+\.(?:webp|jpe?g|png|avif))"/g)].map((match) => match[1])];
    assert.equal(new Set(files).size, files.length, `Duplicate active file reference in ${slug}`);

    for (const file of files) {
      const path = join(ROOT, "public/media/projects", folder, file);
      assert.equal(existsSync(path), true, `Missing active project image: ${path}`);
      const hash = sha256(path);
      assert.equal(activeHashes.has(hash), false, `Duplicate active project image bytes: ${file} and ${activeHashes.get(hash)}`);
      activeHashes.set(hash, file);
    }
  }
});

test("all project WebP files have complete RIFF containers and no byte-for-byte duplicates", () => {
  const files = walk(join(ROOT, "public/media/projects")).filter((path) => path.endsWith(".webp"));
  const hashes = new Map();

  for (const path of files) {
    const buffer = readFileSync(path);
    assert.equal(buffer.subarray(0, 4).toString("ascii"), "RIFF", `Invalid WebP RIFF header: ${path}`);
    assert.equal(buffer.subarray(8, 12).toString("ascii"), "WEBP", `Invalid WebP signature: ${path}`);
    assert.equal(buffer.readUInt32LE(4) + 8, buffer.length, `Truncated or malformed WebP container: ${path}`);

    const hash = createHash("sha256").update(buffer).digest("hex");
    assert.equal(hashes.has(hash), false, `Duplicate project image bytes: ${path} and ${hashes.get(hash)}`);
    hashes.set(hash, path);
  }
});

test("Daniele project corrections remain aligned with verified content", () => {
  const medium = projectBlock("warm-contemporary-apartment-transformation");
  const mediumCaptions = captionsBlock("warm-contemporary-apartment-transformation");
  assert.match(medium, /La carpintería a medida integra los muebles de cocina y la mesa de comedor/);
  assert.match(mediumCaptions, /Baño de tonos cálidos con lavabo integrado/);
  assert.match(mediumCaptions, /Dormitorio acogedor con cabecero tapizado/);

  const villaValue = projectBlock("investment-oriented-villa-makeover");
  assert.match(villaValue, /zone: "Cala Carbó"/);

  const luxury = projectBlock("luxury-mediterranean-villa-renovation");
  assert.match(luxury, /zone: "San Antonio"/);
  assert.doesNotMatch(luxury, /aeroterm|aerotherm/i);

  const rustic = projectBlock("authentic-ibiza-finca-restoration");
  const rusticCaptions = captionsBlock("authentic-ibiza-finca-restoration");
  assert.match(rustic, /mortero de cal natural/);
  assert.match(rustic, /malta naturale a base di calce/);
  assert.match(rustic, /natural lime mortar/);
  assert.match(rustic, /natuurlijke kalkmortel/);
  assert.ok(
    rusticCaptions.indexOf("Fachada original de piedra restaurada") < rusticCaptions.indexOf("Muro de piedra con estantes integrados"),
    "Rustic Finca photo 3 must describe the exterior façade and photo 4 the stone wall with shelves",
  );
  assert.doesNotMatch(rusticCaptions, /microcement/i);
  assert.match(rusticCaptions, /mortero decorativo/);

  const modern = captionsBlock("modern-minimal-apartment-marina-botafoch");
  assert.doesNotMatch(modern, /cromoter|chromotherap/i);
  assert.match(modern, /Jacuzzi privada con panel de control/);

  const desert = projectBlock("low-maintenance-mediterranean-landscape");
  assert.match(desert, /paisajismo-exterior-ibiza-dry-beach-cactus-garden\.webp/);
  assert.doesNotMatch(desert, /pool-shade-sail-cactus-landscape/);
});

test("project static SEO metadata mirrors precise locations and exposes CreativeWork structured data", () => {
  const projectRoutes = indexableRoutes.filter((route) => route.path.startsWith("/transformations/") && PROJECT_SLUGS.some((slug) => route.path.endsWith(slug)));
  assert.equal(projectRoutes.length, PROJECT_SLUGS.length);

  for (const route of projectRoutes) {
    assert.ok(route.socialImage?.endsWith(".webp"), `Missing project social image for ${route.path}`);
    assert.ok(route.socialImageAlt?.trim(), `Missing project social image alt for ${route.path}`);
    assert.ok(route.socialImageWidth > 0 && route.socialImageHeight > 0, `Missing project social dimensions for ${route.path}`);
    assert.equal(route.jsonLd?.["@type"], "CreativeWork", `Missing CreativeWork JSON-LD for ${route.path}`);
    assert.equal(route.jsonLd?.image?.["@type"], "ImageObject", `Missing ImageObject JSON-LD for ${route.path}`);
    assert.equal(route.jsonLd?.contentLocation?.["@type"], "Place", `Missing contentLocation for ${route.path}`);
  }

  const valueRoute = projectRoutes.find((route) => route.path.endsWith("investment-oriented-villa-makeover"));
  assert.match(valueRoute.title, /Cala Carbó/);
  assert.match(valueRoute.description, /Cala Carbó/);
  assert.match(valueRoute.jsonLd.contentLocation.name, /Cala Carbó/);

  const luxuryRoute = projectRoutes.find((route) => route.path.endsWith("luxury-mediterranean-villa-renovation"));
  assert.match(luxuryRoute.title, /San Antonio/);
  assert.match(luxuryRoute.description, /San Antonio/);
  assert.match(luxuryRoute.jsonLd.contentLocation.name, /San Antonio/);
  assert.doesNotMatch(luxuryRoute.description, /aeroterm|aerotherm/i);
});

test("technical SEO, language fallback and canonical internal links keep regression guards", () => {
  const i18n = readFileSync(join(ROOT, "src/lib/i18n.ts"), "utf8");
  const generator = readFileSync(join(ROOT, "scripts/generate-seo-files.mjs"), "utf8");
  const index = readFileSync(join(ROOT, "index.html"), "utf8");
  const serviceTemplate = readFileSync(join(ROOT, "src/components/ServicePageTemplate.tsx"), "utf8");
  const contact = readFileSync(join(ROOT, "src/pages/Contacto.tsx"), "utf8");
  const mediaResolver = readFileSync(join(ROOT, "src/lib/projectMedia.ts"), "utf8");

  assert.match(i18n, /UNSUPPORTED_BROWSER_FALLBACK: Language = "en"/);
  assert.match(generator, /OG_LOCALE_BY_LANGUAGE/);
  assert.match(generator, /data-rh="true"/);
  assert.match(index, /<link rel="canonical"[^>]*data-rh="true"/);
  assert.match(index, /<script type="application\/ld\+json" data-rh="true">/);
  assert.doesNotMatch(serviceTemplate, /to="\/proyectos"/);
  assert.doesNotMatch(contact, /href="\/privacidad"/);
  assert.doesNotMatch(mediaResolver, /stone-shower-detail|bathroom-blue-microcement|dining-living-space|pool-shade-sail-cactus-landscape/);
});
