import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { indexableRoutes, noIndexRoutes } from "./site-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const SITE_URL = "https://eivitech.com";
const SOCIAL_IMAGE_PATH = "media/social/eivitech-og-brand-preview-v1.png";
const SOCIAL_IMAGE_URL = `${SITE_URL}/${SOCIAL_IMAGE_PATH}`;
const MAX_ENTRY_RAW_BYTES = 450_000;
const MAX_ENTRY_GZIP_BYTES = 145_000;
const OG_LOCALE_BY_LANGUAGE = { es: "es_ES", it: "it_IT", en: "en_GB", nl: "nl_NL" };

function pageUrl(path) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path.replace(/\/+$/, "")}/`;
}

function routeFile(path) {
  return path === "/"
    ? resolve(DIST, "index.html")
    : resolve(DIST, path.replace(/^\//, ""), "index.html");
}

function readRoute(path) {
  const file = routeFile(path);
  assert.equal(existsSync(file), true, `Missing generated page: ${file}`);
  return readFileSync(file, "utf8");
}

assert.equal(
  existsSync(DIST), true, "dist/ does not exist; run npm run build first",
);

const sitemap = readFileSync(resolve(DIST, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
const expectedUrls = indexableRoutes.map((route) => pageUrl(route.path));
assert.deepEqual(
  sitemapUrls, expectedUrls, "sitemap.xml does not match the canonical route inventory",
);
assert.equal(
  new Set(sitemapUrls).size, 27, "sitemap.xml must contain 27 unique URLs",
);

for (const route of indexableRoutes) {
  const html = readRoute(route.path);
  const canonical = pageUrl(route.path);
  assert.ok(
    html.includes(`<link rel="canonical" href="${canonical}"`), `Wrong canonical for ${route.path}`,
  );
  assert.ok(
    html.includes(`<link rel="canonical" href="${canonical}" data-rh="true"`),
    `Canonical is not marked for Helmet reconciliation: ${route.path}`,
  );
  const expectedLocale = OG_LOCALE_BY_LANGUAGE[route.language || "es"] || "es_ES";
  assert.ok(
    html.includes(`<meta property="og:locale" content="${expectedLocale}" data-rh="true"`),
    `Wrong Open Graph locale for ${route.path}`,
  );
  assert.ok(
    html.includes(`<meta property="og:url" content="${canonical}"`), `Wrong Open Graph URL for ${route.path}`,
  );
  const expectedSocialImage = route.socialImage
    ? `${SITE_URL}${route.socialImage}`
    : SOCIAL_IMAGE_URL;
  assert.ok(
    html.includes(`<meta property="og:image" content="${expectedSocialImage}"`), `Wrong Open Graph image for ${route.path}`,
  );
  assert.ok(
    html.includes(
      `<meta name="twitter:image" content="${expectedSocialImage}"`,
    ), `Wrong Twitter image for ${route.path}`,
  );
  if (route.socialImageAlt) {
    assert.ok(
      html.includes(
        `<meta property="og:image:alt" content="${route.socialImageAlt}"`,
      ),
      `Wrong Open Graph image alt for ${route.path}`,
    );
    assert.ok(
      html.includes(
        `<meta name="twitter:image:alt" content="${route.socialImageAlt}"`,
      ),
      `Wrong Twitter image alt for ${route.path}`,
    );
  }
  if (route.jsonLd) {
    assert.ok(
      html.includes(JSON.stringify(route.jsonLd)),
      `Structured data missing for ${route.path}`,
    );
    assert.ok(
      html.includes('<script type="application/ld+json" data-rh="true">'),
      `Structured data is not marked for Helmet reconciliation: ${route.path}`,
    );
  }
  assert.ok(
    html.includes("index, follow, max-image-preview:large"), `Indexing directive missing for ${route.path}`,
  );
  assert.equal(
    html.includes("noindex, nofollow"), false, `Canonical route is noindex: ${route.path}`,
  );
}

for (const route of noIndexRoutes) {
  const html = readRoute(route.path);
  assert.ok(
    html.includes("noindex, nofollow"), `Private route is indexable: ${route.path}`,
  );
}

const socialImageFile = resolve(DIST, SOCIAL_IMAGE_PATH);
assert.equal(
  existsSync(socialImageFile), true, `Missing branded social preview: ${socialImageFile}`,
);
const socialImage = readFileSync(socialImageFile);
assert.deepEqual(
  [...socialImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Social preview is not a PNG",
);
assert.equal(
  socialImage.readUInt32BE(16), 1200, "Social preview width must be 1200px",
);
assert.equal(
  socialImage.readUInt32BE(20), 630, "Social preview height must be 630px",
);

const notFound = readFileSync(resolve(DIST, "404.html"), "utf8");
assert.ok(
  notFound.includes('<meta name="robots" content="noindex, nofollow"'), "Static 404 page must be noindex",
);

const robots = readFileSync(resolve(DIST, "robots.txt"), "utf8");
assert.ok(
  robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "robots.txt does not reference the canonical sitemap",
);

const homepage = readRoute("/");
const entryMatch = homepage.match(
  /<script[^>]+type="module"[^>]+src="([^"]+\.js)"/,
);
assert.ok(
  entryMatch, "Unable to find the JavaScript entry point in dist/index.html",
);

const entryFile = resolve(DIST, entryMatch[1].replace(/^\//, ""));
assert.equal(
  existsSync(entryFile), true, `Missing JavaScript entry bundle: ${entryFile}`,
);
const entryRaw = statSync(entryFile).size;
const entryGzip = gzipSync(readFileSync(entryFile)).length;
assert.ok(
  entryRaw <= MAX_ENTRY_RAW_BYTES, `Entry bundle is too large: ${entryRaw} bytes`,
);
assert.ok(
  entryGzip <= MAX_ENTRY_GZIP_BYTES, `Gzipped entry bundle is too large: ${entryGzip} bytes`,
);

console.log(`SEO output verified: ${sitemapUrls.length} canonical URLs`);
console.log("Branded social preview verified: 1200x630 PNG");
console.log(
  `Entry bundle verified: ${entryRaw} bytes raw, ${entryGzip} bytes gzip`,
);
