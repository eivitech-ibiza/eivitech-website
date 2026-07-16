import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { indexableRoutes, noIndexRoutes, redirects } from "./site-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GENERATED_MEDIA = new Set([
  "media/social/eivitech-og-brand-preview-v1.png",
]);

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

test("the sitemap inventory contains 27 unique canonical routes", () => {
  assert.equal(indexableRoutes.length, 27);

  const paths = indexableRoutes.map((route) => route.path);
  assert.equal(new Set(paths).size, paths.length, "Canonical routes must be unique");

  for (const route of indexableRoutes) {
    assert.match(route.path, /^\//, `Invalid route path: ${route.path}`);
    assert.ok(route.title.trim().length >= 10, `Missing title for ${route.path}`);
    assert.ok(route.description.trim().length >= 40, `Description is too short for ${route.path}`);
  }
});

test("private routes stay out of the sitemap and redirects target canonical routes", () => {
  const canonicalPaths = new Set(indexableRoutes.map((route) => route.path));
  const privatePaths = new Set(noIndexRoutes.map((route) => route.path));

  assert.deepEqual([...privatePaths].sort(), ["/dashboard", "/gracias"]);
  for (const path of privatePaths) assert.equal(canonicalPaths.has(path), false);

  for (const [from, to] of redirects) {
    assert.notEqual(from, to, `Self redirect detected for ${from}`);
    assert.equal(canonicalPaths.has(to), true, `Redirect target is not canonical: ${to}`);
  }
});

test("literal public media references resolve to existing or build-generated files", () => {
  const sourceFiles = [
    ...walk(resolve(ROOT, "src")).filter((path) => /\.[cm]?[jt]sx?$/.test(path)),
    resolve(ROOT, "index.html"),
  ].filter((path) => !path.endsWith("src/lib/projectMedia.ts"));

  const references = new Set();
  const mediaPattern = /\bmedia\/[A-Za-z0-9_./-]+\.(?:avif|jpe?g|png|svg|webp)\b/g;

  for (const sourceFile of sourceFiles) {
    const source = readFileSync(sourceFile, "utf8");
    for (const match of source.matchAll(mediaPattern)) references.add(match[0]);
  }

  const missing = [...references]
    .filter((reference) => !GENERATED_MEDIA.has(reference))
    .filter((reference) => !existsSync(resolve(ROOT, "public", reference)))
    .map((reference) => `${reference} (referenced from src/ or index.html)`);

  assert.deepEqual(missing, [], `Missing public media:\n${missing.join("\n")}`);
  assert.ok(references.size > 0, `No media references found while scanning ${relative(ROOT, resolve(ROOT, "src"))}`);
});
