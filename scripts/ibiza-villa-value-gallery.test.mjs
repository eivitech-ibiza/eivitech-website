import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const projectsSource = readFileSync("src/data/projects.ts", "utf8");
const captionsSource = readFileSync("src/data/projectCaptions.ts", "utf8");
const projectPageSource = readFileSync("src/pages/Proyecto.tsx", "utf8");
const caseStudySource = readFileSync(
  "src/components/CaseStudyTemplate.tsx",
  "utf8",
);

function extract(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test("Ibiza Villa Value keeps Cala Carbó across project and metadata", () => {
  const project = extract(
    projectsSource,
    '    slug: "investment-oriented-villa-makeover",',
    "  },\n  {",
  );

  assert.match(project, /zone: "Cala Carbó"/);
  assert.match(
    project, /folderHint: "public\/media\/projects\/casa-vadella\/"/,
  );
  assert.match(project, /metaTitle: tr\([^\n]*Cala Carbó[^\n]*\)/);
  assert.match(project, /metaDescription: tr\([^\n]*Cala Carbó[^\n]*\)/);
  assert.doesNotMatch(project, /zone: "Ibiza"/);
});

test("Ibiza Villa Value has a caption in four languages for every non-cover image", () => {
  const project = extract(
    projectsSource,
    '    slug: "investment-oriented-villa-makeover",',
    "  },\n  {",
  );
  const projectCaptions = extract(
    captionsSource,
    '  "investment-oriented-villa-makeover": [',
    "  ],\n};",
  );

  const galleryFiles = [
    ...project.matchAll(/"(casa-vadella-ibiza-[^"]+\.webp)"/g),
  ]
    .map((match) => match[1])
    .filter((file) => !file.includes("mediterranean-garden-cover"));
  const translationCalls = [
    ...projectCaptions.matchAll(
      /tr\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\s*\)/gs,
    ),
  ];

  assert.equal(galleryFiles.length, 9);
  assert.equal(translationCalls.length, galleryFiles.length);
  for (const call of translationCalls) {
    assert.equal(
      call.slice(1).every((translation) => translation.trim().length > 0),
      true,
    );
  }
});

test("gallery captions feed hero, grid and lightbox alt text on desktop and mobile", () => {
  assert.match(
    projectPageSource, /gallery: \[project\.cover, \.\.\.project\.gallery\.filter/,
  );
  assert.match(captionsSource, /if \(index === 0\) return coverCaption/);
  assert.match(captionsSource, /captions\[slug\]\?\.\[index - 1\]/);
  assert.match(caseStudySource, /alt=\{heroCaption\}/);
  assert.match(caseStudySource, /alt=\{caption\}/);
  assert.match(caseStudySource, /alt=\{activeCaption\}/);
  assert.match(
    caseStudySource,
    /<figcaption[^>]*>[\s\S]*?\{caption\}[\s\S]*?<\/figcaption>/,
  );
});
