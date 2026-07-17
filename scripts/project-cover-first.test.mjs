import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectPage = readFileSync(resolve("src/pages/Proyecto.tsx"), "utf8");
const captions = readFileSync(resolve("src/data/projectCaptions.ts"), "utf8");

test("every project detail gallery starts with the project cover", () => {
  assert.match(
    projectPage,
    /gallery:\s*\[project\.cover,\s*\.\.\.project\.gallery\.filter\(\(image\) => image !== project\.cover\)\]/,
  );
});

test("gallery captions stay aligned after the cover slide is inserted", () => {
  assert.match(captions, /if \(index === 0\) return coverCaption;/);
  assert.match(captions, /captions\[slug\]\?\.\[index - 1\]/);
});
