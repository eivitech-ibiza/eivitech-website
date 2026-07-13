import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { indexableRoutes, noIndexRoutes, redirects } from "./site-routes.mjs";

const SITE_URL = (process.env.SITE_URL || "https://eivitech.com").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/media/hero/eivitech-ibiza-ristrutturazione-villa-mediterranea-top-banner.webp`;

function pageUrl(path) {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.replace(/\/+$/, "")}/`;
}

function xmlEscape(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function writeSitemap() {
  const urls = indexableRoutes
    .map(({ path }) => `  <url>\n    <loc>${xmlEscape(pageUrl(path))}</loc>\n  </url>`)
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

  return html
    .replace(/<html lang="[^"]*">/, `<html lang="${route.language || "es"}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${route.type || "website"}" />`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${DEFAULT_IMAGE}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${DEFAULT_IMAGE}" />`);
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
      writeFileSync(resolve("dist/index.html"), replaceMeta(template, route, false));
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
  console.log(`Static entry pages written (${indexableRoutes.length - 1} canonical, ${noIndexRoutes.length} noindex, ${redirects.length} redirects)`);
}

if (process.argv.includes("--sitemap")) writeSitemap();
if (process.argv.includes("--pages")) writeStaticPages();
