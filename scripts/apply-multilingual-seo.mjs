import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { indexableRoutes, noIndexRoutes, redirects } from "./site-routes.mjs";

const SITE_URL = (process.env.SITE_URL || "https://eivitech.com").replace(/\/$/, "");
const LANGUAGES = ["es", "it", "en", "nl"];
const OG_LOCALE_BY_LANGUAGE = {
  es: "es_ES",
  it: "it_IT",
  en: "en_GB",
  nl: "nl_NL",
};
const HREFLANG_BY_LANGUAGE = {
  es: "es",
  it: "it",
  en: "en",
  nl: "nl",
};
const DIST = resolve("dist");

function stripLanguagePrefix(pathname) {
  const match = pathname.match(/^\/(es|it|en|nl)(?=\/|$)/i);
  if (!match) return pathname || "/";
  const stripped = pathname.slice(match[0].length);
  return stripped || "/";
}

function localizedPath(pathname, language) {
  const cleanPath = stripLanguagePrefix(pathname);
  const suffix = cleanPath === "/" ? "/" : cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `/${language}${suffix}`;
}

function pageUrl(pathname) {
  if (pathname === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${pathname.replace(/\/+$/, "")}/`;
}

function routeFile(pathname) {
  if (pathname === "/") return resolve(DIST, "index.html");
  return resolve(DIST, pathname.replace(/^\//, ""), "index.html");
}

function writeRouteFile(pathname, html) {
  const file = routeFile(pathname);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function alternateLinks(pathname) {
  const links = LANGUAGES.map((language) => {
    const href = pageUrl(localizedPath(pathname, language));
    return `    <link rel="alternate" hreflang="${HREFLANG_BY_LANGUAGE[language]}" href="${href}" data-rh="true" />`;
  });
  links.push(
    `    <link rel="alternate" hreflang="x-default" href="${pageUrl(localizedPath(pathname, "es"))}" data-rh="true" />`,
  );
  return links.join("\n");
}

function localizeAbsoluteSiteUrl(value, language) {
  if (typeof value !== "string" || !value.startsWith(SITE_URL)) return value;

  let url;
  try {
    url = new URL(value);
  } catch {
    return value;
  }

  if (url.origin !== SITE_URL) return value;
  if (/^\/(?:media|assets)(?:\/|$)/.test(url.pathname)) return value;
  if (url.hash === "#organization" || url.hash === "#website") return value;

  url.pathname = localizedPath(url.pathname || "/", language);
  return url.toString();
}

function localizeStructuredValue(value, language) {
  if (typeof value === "string") return localizeAbsoluteSiteUrl(value, language);
  if (Array.isArray(value)) return value.map((item) => localizeStructuredValue(item, language));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, localizeStructuredValue(item, language)]),
  );
}

function localizeStructuredData(html, language) {
  return html.replace(
    /<script type="application\/ld\+json" data-rh="true">([\s\S]*?)<\/script>/g,
    (match, json) => {
      try {
        const parsed = JSON.parse(json);
        const localized = localizeStructuredValue(parsed, language);
        if (localized?.["@type"] === "WebPage") {
          localized.inLanguage = OG_LOCALE_BY_LANGUAGE[language].replace("_", "-");
        }
        return `<script type="application/ld+json" data-rh="true">${JSON.stringify(localized).replaceAll("<", "\\u003c")}</script>`;
      } catch {
        return match;
      }
    },
  );
}

function transformPage(html, basePath, language, indexable) {
  const localized = localizedPath(basePath, language);
  const canonical = pageUrl(localized);
  const locale = OG_LOCALE_BY_LANGUAGE[language];

  let output = html
    .replace(/<html lang="[^"]*">/, `<html lang="${language}">`)
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${canonical}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${canonical}" data-rh="true" />`,
    )
    .replace(
      /<meta property="og:locale"[^>]*>/,
      `<meta property="og:locale" content="${locale}" data-rh="true" />`,
    );

  output = localizeStructuredData(output, language);

  if (indexable) {
    output = output.replace("</head>", `${alternateLinks(basePath)}\n  </head>`);
  }

  return output;
}

function redirectHtml(targetPath, title = "Redirigiendo…") {
  const target = pageUrl(targetPath);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${target}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <title>${title}</title>
    <script>window.location.replace(${JSON.stringify(targetPath)});</script>
  </head>
  <body><p><a href="${target}">Continuar a Eivitech</a></p></body>
</html>\n`;
}

function legacyLanguageRedirectHtml(basePath) {
  const targets = Object.fromEntries(
    LANGUAGES.map((language) => [language, pageUrl(localizedPath(basePath, language))]),
  );
  const fallback = targets.es;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${fallback}" />
    <title>Redirigiendo… | Eivitech</title>
    <script>
      (function () {
        var targets = ${JSON.stringify(targets)};
        var params = new URLSearchParams(window.location.search);
        var requested = (params.get("lang") || "").toLowerCase();
        params.delete("lang");
        var target = targets[requested] || targets.es;
        var query = params.toString();
        if (query) target += "?" + query;
        target += window.location.hash || "";
        window.location.replace(target);
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=${fallback}" /></noscript>
  </head>
  <body><p><a href="${fallback}">Continuar a Eivitech</a></p></body>
</html>\n`;
}

function writeLocalizedPages() {
  const snapshots = new Map();

  for (const route of [...indexableRoutes, ...noIndexRoutes]) {
    snapshots.set(route.path, readFileSync(routeFile(route.path), "utf8"));
  }

  for (const route of indexableRoutes) {
    const html = snapshots.get(route.path);
    for (const language of LANGUAGES) {
      writeRouteFile(
        localizedPath(route.path, language),
        transformPage(html, route.path, language, true),
      );
    }
  }

  for (const route of noIndexRoutes) {
    const html = snapshots.get(route.path);
    for (const language of LANGUAGES) {
      writeRouteFile(
        localizedPath(route.path, language),
        transformPage(html, route.path, language, false),
      );
    }
  }

  for (const [from, to] of redirects) {
    for (const language of LANGUAGES) {
      writeRouteFile(
        localizedPath(from, language),
        redirectHtml(localizedPath(to, language)),
      );
    }
    writeRouteFile(from, redirectHtml(localizedPath(to, "es")));
  }

  for (const route of [...indexableRoutes, ...noIndexRoutes]) {
    writeRouteFile(route.path, legacyLanguageRedirectHtml(route.path));
  }
}

function writeLocalizedSitemap() {
  const entries = [];

  for (const route of indexableRoutes) {
    for (const language of LANGUAGES) {
      const loc = pageUrl(localizedPath(route.path, language));
      const alternates = LANGUAGES.map((alternateLanguage) => {
        const href = pageUrl(localizedPath(route.path, alternateLanguage));
        return `    <xhtml:link rel="alternate" hreflang="${HREFLANG_BY_LANGUAGE[alternateLanguage]}" href="${xmlEscape(href)}" />`;
      });
      alternates.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(pageUrl(localizedPath(route.path, "es")))}" />`,
      );
      entries.push(`  <url>\n    <loc>${xmlEscape(loc)}</loc>\n${alternates.join("\n")}\n  </url>`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
  writeFileSync(resolve(DIST, "sitemap.xml"), sitemap);
}

writeLocalizedPages();
writeLocalizedSitemap();
console.log(
  `Multilingual SEO applied (${indexableRoutes.length * LANGUAGES.length} canonical URLs across ${LANGUAGES.length} languages)`,
);
