// Sitemap generator. Runs in predev/prebuild.
// BASE_URL stays empty until project name or custom domain is set.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const SERVICES = [
  "reformas-integrales",
  "electricidad-iluminacion",
  "albanileria-acabados",
  "fontaneria",
  "cocinas-banos",
  "carpinteria",
  "terrazas-exteriores",
  "locales-comerciales",
];

const PROJECTS = ["casa-sant-josep", "true-bar", "apartamento-marina-botafoch", "urbanizacion-valverde"];

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/empresa", changefreq: "monthly", priority: "0.7" },
  { path: "/servicios", changefreq: "monthly", priority: "0.9" },
  ...SERVICES.map((s) => ({ path: `/servicios/${s}`, changefreq: "monthly" as const, priority: "0.8" })),
  { path: "/proyectos", changefreq: "monthly", priority: "0.9" },
  ...PROJECTS.map((p) => ({ path: `/proyectos/${p}`, changefreq: "monthly" as const, priority: "0.8" })),
  { path: "/contacto", changefreq: "monthly", priority: "0.9" },
  { path: "/reformas-ibiza", changefreq: "weekly", priority: "0.9" },
  { path: "/proyectos-reformas-ibiza", changefreq: "weekly", priority: "0.8" },
  { path: "/renovation-company-ibiza", changefreq: "monthly", priority: "0.7" },
  { path: "/privacidad", changefreq: "yearly", priority: "0.3" },
  { path: "/aviso-legal", changefreq: "yearly", priority: "0.3" },
];

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
// eslint-disable-next-line no-console
console.log(`sitemap.xml written (${entries.length} entries)`);
