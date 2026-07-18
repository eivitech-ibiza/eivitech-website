import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { indexableRoutes, noIndexRoutes, redirects } from "./site-routes.mjs";

const SITE_URL = (process.env.SITE_URL || "https://eivitech.com").replace(
  /\/$/,
  "",
);
const DEFAULT_IMAGE = `${SITE_URL}/media/social/eivitech-og-brand-preview-v1.png`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const OG_LOCALE_BY_LANGUAGE = {
  es: "es_ES",
  it: "it_IT",
  en: "en_GB",
  nl: "nl_NL",
};
const HTML_LOCALE_BY_LANGUAGE = {
  es: "es-ES",
  it: "it-IT",
  en: "en-GB",
  nl: "nl-NL",
};

function pageUrl(path) {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.replace(/\/+$/, "")}/`;
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function breadcrumbTitle(title) {
  return title
    .replace(/\s*[|–]\s*Eivitech(?:\s+Ibiza)?\s*$/i, "")
    .trim();
}

function breadcrumbEntries(route) {
  if (route.path === "/") return [];

  const home = { name: "Eivitech", path: "/" };
  const current = { name: breadcrumbTitle(route.title), path: route.path };

  if (route.path.startsWith("/servicios/")) {
    return [home, { name: "Servicios", path: "/servicios" }, current];
  }

  if (route.path.startsWith("/transformations/")) {
    return [home, { name: "Transformaciones", path: "/transformations" }, current];
  }

  return [home, current];
}

function buildWebPageJsonLd(route, url, socialImage) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    inLanguage: HTML_LOCALE_BY_LANGUAGE[route.language || "es"] || "es-ES",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: socialImage,
    },
  };
}

function buildBreadcrumbJsonLd(route) {
  const entries = breadcrumbEntries(route);
  if (entries.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

function enrichStructuredData(block, url) {
  if (!block || typeof block !== "object") return block;
  const pageId = `${url}#webpage`;

  if (block["@type"] === "CreativeWork") {
    return {
      ...block,
      "@id": block["@id"] || `${url}#project`,
      mainEntityOfPage: block.mainEntityOfPage || { "@id": pageId },
      creator: block.creator || { "@id": ORGANIZATION_ID },
    };
  }

  if (block["@type"] === "Service") {
    return {
      ...block,
      "@id": block["@id"] || `${url}#service`,
      url: block.url || url,
      mainEntityOfPage: block.mainEntityOfPage || { "@id": pageId },
      provider: block.provider || { "@id": ORGANIZATION_ID },
    };
  }

  return block;
}

function structuredDataBlocks(route, noIndex, url, socialImage) {
  if (noIndex) return [];

  const supplied = route.jsonLd
    ? (Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd])
    : [];
  const breadcrumb = buildBreadcrumbJsonLd(route);

  return [
    buildWebPageJsonLd(route, url, socialImage),
    ...(breadcrumb ? [breadcrumb] : []),
    ...supplied.map((block) => enrichStructuredData(block, url)),
  ];
}

function writeSitemap() {
  const urls = indexableRoutes
    .map(
      ({ path }) => `  <url>\n    <loc>${xmlEscape(pageUrl(path))}</loc>\n  </url>`,
    )
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(resolve("public/sitemap.xml"), sitemap);
  console.log(`sitemap.xml written (${indexableRoutes.length} canonical URLs)`);
}

function replaceMeta(html, route, noIndex) {
  const url = pageUrl(route.path);
  const title = htmlEscape(route.title);
  const description = htmlEscape(route.description);
  const robots = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const socialImage = route.socialImage
    ? `${SITE_URL}${route.socialImage}`
    : DEFAULT_IMAGE;
  const ogLocale = OG_LOCALE_BY_LANGUAGE[route.language || "es"] || "es_ES";
  const socialImageAlt = htmlEscape(route.socialImageAlt || route.title);
  const socialImageType = route.socialImageType || "image/png";
  const socialImageWidth = String(route.socialImageWidth || 1200);
  const socialImageHeight = String(route.socialImageHeight || 630);

  let output = html
    .replace(/<html lang="[^"]*">/, `<html lang="${route.language || "es"}">`)
    .replace(/<title[^>]*>[^<]*<\/title>/, `<title data-rh="true">${title}</title>`)
    .replace(
      /<meta name="description"[^>]*>/, `<meta name="description" content="${description}" data-rh="true" />`,
    )
    .replace(
      /<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" data-rh="true" />`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:locale"[^>]*>/, `<meta property="og:locale" content="${ogLocale}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${route.type || "website"}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${socialImage}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:image:secure_url"[^>]*>/, `<meta property="og:image:secure_url" content="${socialImage}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:image:type"[^>]*>/,
      `<meta property="og:image:type" content="${socialImageType}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:image:width"[^>]*>/,
      `<meta property="og:image:width" content="${socialImageWidth}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:image:height"[^>]*>/,
      `<meta property="og:image:height" content="${socialImageHeight}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:image:alt"[^>]*>/,
      `<meta property="og:image:alt" content="${socialImageAlt}" data-rh="true" />`,
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" data-rh="true" />`,
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" data-rh="true" />`,
    )
    .replace(
      /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${socialImage}" data-rh="true" />`,
    )
    .replace(
      /<meta name="twitter:image:alt"[^>]*>/,
      `<meta name="twitter:image:alt" content="${socialImageAlt}" data-rh="true" />`,
    );

  const jsonLd = structuredDataBlocks(route, noIndex, url, socialImage)
    .map((block) => JSON.stringify(block).replaceAll("<", "\\u003c"))
    .map((block) => `    <script type="application/ld+json" data-rh="true">${block}</script>`)
    .join("\n");

  if (jsonLd) {
    output = output.replace("</head>", `${jsonLd}\n  </head>`);
  }

  return output;
}

function writeRouteFile(path, html) {
  const file = resolve("dist", path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function redirectHtml(from, to) {
  const target = pageUrl(to);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${target}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <title>Redirigiendo… | Eivitech</title>
    <script>window.location.replace(${JSON.stringify(to)});</script>
  </head>
  <body><p><a href="${target}">Continuar a Eivitech</a></p></body>
</html>\n`;
}

function writeStaticPages() {
  const template = readFileSync(resolve("dist/index.html"), "utf8");

  for (const route of indexableRoutes) {
    if (route.path === "/") {
      writeFileSync(
        resolve("dist/index.html"), replaceMeta(template, route, false),
      );
    } else {
      writeRouteFile(route.path, replaceMeta(template, route, false));
    }
  }
  for (const route of noIndexRoutes) {
    writeRouteFile(route.path, replaceMeta(template, route, true));
  }
  for (const [from, to] of redirects) {
    writeRouteFile(from, redirectHtml(from, to));
  }

  writeFileSync(resolve("dist/.nojekyll"), "");
  console.log(
    `Static entry pages written (${indexableRoutes.length - 1} canonical, ${noIndexRoutes.length} noindex, ${redirects.length} redirects)`,
  );
}

if (process.argv.includes("--sitemap")) writeSitemap();
if (process.argv.includes("--pages")) writeStaticPages();
