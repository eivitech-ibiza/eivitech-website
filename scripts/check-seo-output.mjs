import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { indexableRoutes, noIndexRoutes, redirects } from "./site-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const SITE_URL = "https://eivitech.com";
const SOCIAL_IMAGE_PATH = "media/social/eivitech-og-brand-preview-v1.png";
const SOCIAL_IMAGE_URL = `${SITE_URL}/${SOCIAL_IMAGE_PATH}`;
const MAX_ENTRY_RAW_BYTES = 450_000;
const MAX_ENTRY_GZIP_BYTES = 145_000;
const LANGUAGES = ["es", "it", "en", "nl"];
const OG_LOCALE_BY_LANGUAGE = { es: "es_ES", it: "it_IT", en: "en_GB", nl: "nl_NL" };
const HREFLANG_BY_LANGUAGE = { es: "es", it: "it", en: "en", nl: "nl" };

function localizedPath(pathname, language) {
  const suffix = pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${language}${suffix}`;
}

function pageUrl(pathname) {
  return pathname === "/"
    ? `${SITE_URL}/`
    : `${SITE_URL}${pathname.replace(/\/+$/, "")}/`;
}

function routeFile(pathname) {
  return pathname === "/"
    ? resolve(DIST, "index.html")
    : resolve(DIST, pathname.replace(/^\//, ""), "index.html");
}

function readRoute(pathname) {
  const file = routeFile(pathname);
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
const expectedUrls = indexableRoutes.flatMap((route) =>
  LANGUAGES.map((language) => pageUrl(localizedPath(route.path, language))),
);
assert.deepEqual(
  sitemapUrls, expectedUrls, "sitemap.xml does not match the multilingual canonical inventory",
);
assert.equal(
  new Set(sitemapUrls).size,
  indexableRoutes.length * LANGUAGES.length,
  "sitemap.xml contains duplicate or missing multilingual URLs",
);
assert.ok(
  sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'),
  "sitemap.xml is missing the xhtml namespace required for hreflang alternates",
);

for (const route of indexableRoutes) {
  for (const language of LANGUAGES) {
    const path = localizedPath(route.path, language);
    const html = readRoute(path);
    const canonical = pageUrl(path);

    assert.ok(html.includes(`<html lang="${language}">`), `Wrong html lang for ${path}`);
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}" data-rh="true"`),
      `Wrong canonical for ${path}`,
    );
    assert.ok(
      html.includes(`<meta property="og:url" content="${canonical}" data-rh="true"`),
      `Wrong Open Graph URL for ${path}`,
    );
    assert.ok(
      html.includes(`<meta property="og:locale" content="${OG_LOCALE_BY_LANGUAGE[language]}" data-rh="true"`),
      `Wrong Open Graph locale for ${path}`,
    );

    for (const alternateLanguage of LANGUAGES) {
      const href = pageUrl(localizedPath(route.path, alternateLanguage));
      assert.ok(
        html.includes(`<link rel="alternate" hreflang="${HREFLANG_BY_LANGUAGE[alternateLanguage]}" href="${href}" data-rh="true"`),
        `Missing ${alternateLanguage} hreflang on ${path}`,
      );
    }
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="x-default" href="${pageUrl(localizedPath(route.path, "es"))}" data-rh="true"`),
      `Missing x-default hreflang on ${path}`,
    );

    const expectedSocialImage = route.socialImage
      ? `${SITE_URL}${route.socialImage}`
      : SOCIAL_IMAGE_URL;
    assert.ok(
      html.includes(`<meta property="og:image" content="${expectedSocialImage}"`),
      `Wrong Open Graph image for ${path}`,
    );
    assert.ok(
      html.includes(`<meta name="twitter:image" content="${expectedSocialImage}"`),
      `Wrong Twitter image for ${path}`,
    );

    assert.ok(html.includes('"@type":"WebPage"'), `WebPage JSON-LD missing for ${path}`);
    assert.ok(
      html.includes(`"url":"${canonical}"`),
      `Localized WebPage URL missing from JSON-LD for ${path}`,
    );
    if (route.path !== "/") {
      assert.ok(
        html.includes('"@type":"BreadcrumbList"'),
        `Breadcrumb JSON-LD missing for ${path}`,
      );
    }

    assert.ok(
      html.includes("index, follow, max-image-preview:large"),
      `Indexing directive missing for ${path}`,
    );
    assert.equal(html.includes("noindex, nofollow"), false, `Canonical route is noindex: ${path}`);
  }
}

for (const route of noIndexRoutes) {
  for (const language of LANGUAGES) {
    const path = localizedPath(route.path, language);
    const html = readRoute(path);
    const canonical = pageUrl(path);
    assert.ok(html.includes("noindex, nofollow"), `Private route is indexable: ${path}`);
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}" data-rh="true"`),
      `Wrong noindex canonical for ${path}`,
    );
    assert.equal(
      html.includes('rel="alternate" hreflang='),
      false,
      `Noindex route exposes hreflang alternates: ${path}`,
    );
    assert.equal(
      html.includes('"@type":"WebPage"'),
      false,
      `Noindex route exposes indexable WebPage JSON-LD: ${path}`,
    );
  }
}

const rootRedirect = readRoute("/");
assert.ok(rootRedirect.includes("noindex, follow"), "Legacy root must be a noindex redirect");
assert.ok(
  rootRedirect.includes(`<link rel="canonical" href="${SITE_URL}/es/"`),
  "Legacy root must canonicalize to the Spanish homepage",
);

for (const route of indexableRoutes.filter((route) => route.path !== "/")) {
  const legacy = readRoute(route.path);
  assert.ok(legacy.includes("noindex, follow"), `Legacy path must redirect: ${route.path}`);
  assert.ok(
    legacy.includes(`<link rel="canonical" href="${pageUrl(localizedPath(route.path, "es"))}"`),
    `Legacy path does not canonicalize to Spanish: ${route.path}`,
  );
}

for (const [from, to] of redirects) {
  for (const language of LANGUAGES) {
    const redirectPath = localizedPath(from, language);
    const target = pageUrl(localizedPath(to, language));
    const html = readRoute(redirectPath);
    assert.ok(html.includes("noindex, follow"), `Redirect route must be noindex: ${redirectPath}`);
    assert.ok(
      html.includes(`<link rel="canonical" href="${target}"`),
      `Localized redirect points to the wrong target: ${redirectPath}`,
    );
  }
}

const socialImageFile = resolve(DIST, SOCIAL_IMAGE_PATH);
assert.equal(existsSync(socialImageFile), true, `Missing branded social preview: ${socialImageFile}`);
const socialImage = readFileSync(socialImageFile);
assert.deepEqual(
  [...socialImage.subarray(0, 8)],
  [137, 80, 78, 71, 13, 10, 26, 10],
  "Social preview is not a PNG",
);
assert.equal(socialImage.readUInt32BE(16), 1200, "Social preview width must be 1200px");
assert.equal(socialImage.readUInt32BE(20), 630, "Social preview height must be 630px");

const notFound = readFileSync(resolve(DIST, "404.html"), "utf8");
assert.ok(
  notFound.includes('<meta name="robots" content="noindex, nofollow"'),
  "Static 404 page must be noindex",
);

const robots = readFileSync(resolve(DIST, "robots.txt"), "utf8");
assert.ok(
  robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
  "robots.txt does not reference the canonical sitemap",
);

const homepage = readRoute("/es/");
const entryMatch = homepage.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/);
assert.ok(entryMatch, "Unable to find the JavaScript entry point in the Spanish homepage");

const entryFile = resolve(DIST, entryMatch[1].replace(/^\//, ""));
assert.equal(existsSync(entryFile), true, `Missing JavaScript entry bundle: ${entryFile}`);
const entryRaw = statSync(entryFile).size;
const entryGzip = gzipSync(readFileSync(entryFile)).length;
assert.ok(entryRaw <= MAX_ENTRY_RAW_BYTES, `Entry bundle is too large: ${entryRaw} bytes`);
assert.ok(entryGzip <= MAX_ENTRY_GZIP_BYTES, `Gzipped entry bundle is too large: ${entryGzip} bytes`);

console.log(`SEO output verified: ${sitemapUrls.length} multilingual canonical URLs`);
console.log("hreflang/canonical migration verified for ES, IT, EN and NL");
console.log("Branded social preview verified: 1200x630 PNG");
console.log(`Entry bundle verified: ${entryRaw} bytes raw, ${entryGzip} bytes gzip`);
