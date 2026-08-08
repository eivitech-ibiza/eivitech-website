import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const redirects = new Map([
  ["public/portfolio/index.html", "https://eivitech.com/es/transformations/"],
  [
    "public/portfolio/casa-sant-josep/index.html",
    "https://eivitech.com/es/transformations/investment-oriented-villa-makeover/",
  ],
  [
    "public/portfolio/apartamento-marina-botafoch/index.html",
    "https://eivitech.com/es/transformations/modern-minimal-apartment-marina-botafoch/",
  ],
  ["public/portfolio/true-bar/index.html", "https://eivitech.com/es/transformations/"],
  ["public/portfolio/urbanizacion-valverde/index.html", "https://eivitech.com/es/transformations/"],
]);

test("legacy WordPress portfolio URLs redirect directly to current canonical pages", () => {
  for (const [file, target] of redirects) {
    const html = readFileSync(resolve(file), "utf8");
    assert.match(html, /<meta name="robots" content="noindex, follow" \/>/);
    assert.ok(html.includes(`<link rel="canonical" href="${target}" />`));
    assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=${target}" />`));
  }
});
