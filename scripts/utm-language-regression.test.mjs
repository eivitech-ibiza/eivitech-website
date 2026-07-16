import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/lib/utm.ts", import.meta.url), "utf8");

test("lead attribution preserves the selected language in landing_page", () => {
  assert.match(source, /import \{ CURRENT_LANGUAGE \} from "@\/lib\/i18n"/);
  assert.match(source, /url\.searchParams\.set\("lang", CURRENT_LANGUAGE\)/);
  assert.match(source, /landing_page: languageAwareLandingPage\(window\.location\.pathname\)/);
  assert.match(source, /withCurrentLanguage\(inMemoryUtm\)/);
  assert.match(source, /withCurrentLanguage\(JSON\.parse\(raw\) as UTM\)/);
});
