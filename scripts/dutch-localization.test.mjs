import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const ROOT = new URL("../", import.meta.url).pathname;
const SOURCE_ROOT = join(ROOT, "src");

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

function scanTrCalls(text) {
  const calls = [];
  let index = 0;

  while (index < text.length - 2) {
    const isCall = text.startsWith("tr(", index)
      && (index === 0 || !/[A-Za-z0-9_$]/.test(text[index - 1]));

    if (!isCall) {
      index += 1;
      continue;
    }

    const start = index;
    let cursor = index + 3;
    let depth = 1;
    let quote = null;
    let escaped = false;

    while (cursor < text.length && depth > 0) {
      const character = text[cursor];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = null;
      } else if (character === "'" || character === '"' || character === "`") {
        quote = character;
      } else if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        depth -= 1;
      }
      cursor += 1;
    }

    if (depth === 0) {
      calls.push(text.slice(start, cursor));
      index = cursor;
    } else {
      index += 1;
    }
  }

  return calls;
}

function splitArguments(call) {
  const inner = call.slice(3, -1);
  const argumentsList = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < inner.length; index += 1) {
    const character = inner[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }

    if (character === "'" || character === '"' || character === "`") quote = character;
    else if ("([{ ".replace(" ", "").includes(character)) depth += 1;
    else if (")] }".replace(" ", "").includes(character)) depth -= 1;
    else if (character === "," && depth === 0) {
      argumentsList.push(inner.slice(start, index).trim());
      start = index + 1;
    }
  }

  argumentsList.push(inner.slice(start).trim());
  return argumentsList;
}

function decodeDoubleQuotedLiteral(value) {
  if (!value.startsWith('"') || !value.endsWith('"')) return null;
  return JSON.parse(value);
}

function loadDutchTranslations() {
  return JSON.parse(readFileSync(join(SOURCE_ROOT, "lib", "nlTranslations.generated.json"), "utf8"));
}

test("Dutch locale is registered throughout the runtime", () => {
  const i18n = readFileSync(join(SOURCE_ROOT, "lib", "i18n.ts"), "utf8");
  const footer = readFileSync(join(SOURCE_ROOT, "components", "Footer.tsx"), "utf8");
  const main = readFileSync(join(SOURCE_ROOT, "main.tsx"), "utf8");
  const seo = readFileSync(join(SOURCE_ROOT, "components", "SEO.tsx"), "utf8");
  const email = readFileSync(join(ROOT, "api", "src", "email.ts"), "utf8");

  assert.match(i18n, /"es" \| "it" \| "en" \| "nl"/);
  assert.match(i18n, /nl: "nl-NL"/);
  assert.match(i18n, /nl: "Nederlands"/);
  assert.match(i18n, /translateDutchDynamic/);
  assert.match(footer, /value: "nl", label: "NL"/);
  assert.match(main, /import\("\.\/lib\/nlTranslations"\)/);
  assert.match(seo, /openGraphLocaleByLanguage\[CURRENT_LANGUAGE\]/);
  assert.match(email, /queryLanguage === "nl"/);
  assert.match(email, /nl: \{/);
  assert.match(email, /"nl-NL"/);
});

test("every static translation call has Dutch coverage", () => {
  const translations = loadDutchTranslations();
  const missing = [];
  const dynamicCalls = [];

  for (const path of sourceFiles(SOURCE_ROOT)) {
    if (path.endsWith("nlTranslations.ts")) continue;
    const text = readFileSync(path, "utf8");

    for (const call of scanTrCalls(text)) {
      const args = splitArguments(call);
      if (args.length === 4) continue;
      if (args.length !== 3) continue;

      const english = decodeDoubleQuotedLiteral(args[2]);
      if (english === null) {
        dynamicCalls.push(`${relative(ROOT, path)}: ${args[2]}`);
        continue;
      }

      if (!translations[english]?.trim()) {
        missing.push(`${relative(ROOT, path)}: ${english}`);
      }
    }
  }

  assert.deepEqual(missing, [], "Static English source strings must exist in the Dutch dictionary");
  assert.ok(Object.keys(translations).length >= 990, "Dutch dictionary unexpectedly lost content");
  assert.equal(
    Object.values(translations).some((value) => !value.trim() || value.includes("ZXQ")),
    false,
    "Dutch translations must be non-empty and must not contain generator placeholders",
  );

  const allowedDynamicSources = [
    "LEGAL.",
    "provider.en",
    "option.label",
    "lead.nombre",
  ];
  assert.equal(
    dynamicCalls.every((entry) => allowedDynamicSources.some((source) => entry.includes(source))),
    true,
    `Unexpected dynamic translation calls:\n${dynamicCalls.join("\n")}`,
  );

  for (const key of [
    "EIVITECH PLUS SL uses technologies required for the website to work. Analytics, advertising, remarketing, Meta Pixel and Google campaign measurement are activated only with your consent.",
    "Last updated: 10 July 2026. This policy incorporates EIVITECH PLUS SL's legal documentation and explains the actual use of cookies, local storage and similar technologies on eivitech.com.",
    "GitHub Pages, for frontend hosting",
    "Meta Pixel and Meta Conversions API, when configured and the relevant legal basis applies",
  ]) {
    assert.ok(translations[key], `Missing rendered dynamic Dutch translation: ${key}`);
  }
});
