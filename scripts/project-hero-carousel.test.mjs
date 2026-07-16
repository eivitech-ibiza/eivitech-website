import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const source = readFileSync(resolve("src/components/CaseStudyTemplate.tsx"), "utf8");

test("project detail hero exposes carousel controls and indicators", () => {
  assert.match(source, /aria-roledescription="carousel"/);
  assert.match(source, /showPreviousHeroImage/);
  assert.match(source, /showNextHeroImage/);
  assert.match(source, /role="tablist"/);
  assert.match(source, /aria-selected=\{heroIndex === index\}/);
});

test("project detail hero supports touch and keyboard navigation", () => {
  assert.match(source, /onTouchStart=\{handleHeroTouchStart\}/);
  assert.match(source, /onTouchEnd=\{handleHeroTouchEnd\}/);
  assert.match(source, /event\.key === "ArrowLeft"/);
  assert.match(source, /event\.key === "ArrowRight"/);
});
