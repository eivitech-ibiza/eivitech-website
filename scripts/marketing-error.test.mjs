import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

function loadMarketingErrorModule() {
  const fileUrl = new URL("../src/lib/marketingError.ts", import.meta.url);

  assert.equal(
    existsSync(fileUrl),
    true,
    "src/lib/marketingError.ts must exist"
  );

  const source = readFileSync(fileUrl, "utf8");

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const module = { exports: {} };
  const require = createRequire(import.meta.url);

  new Function("exports", "module", "require", outputText)(
    module.exports,
    module,
    require
  );

  return module.exports;
}

test("audience recovery parses AUDIENCE_CHANGED_AFTER_PREPARE details", () => {
  const {
    parseMarketingApiError,
    getAudienceChangedAfterPrepareDetails,
  } = loadMarketingErrorModule();

  const error = parseMarketingApiError(
    409,
    JSON.stringify({
      error:
        "L'audience è cambiata dopo la preparazione. Prepara nuovamente la campagna prima di inviare.",
      code: "AUDIENCE_CHANGED_AFTER_PREPARE",
      reason: "segment_not_synced",
      prepared_count: 38,
      current_eligible_count: 0,
      resend_active_count: 0,
    })
  );

  assert.equal(error.status, 409);
  assert.equal(
    error.message,
    "L'audience è cambiata dopo la preparazione. Prepara nuovamente la campagna prima di inviare."
  );

  assert.deepEqual(getAudienceChangedAfterPrepareDetails(error), {
    reason: "segment_not_synced",
    preparedCount: 38,
    currentEligibleCount: 0,
    resendActiveCount: 0,
  });
});

test("audience recovery ignores unrelated API errors", () => {
  const {
    parseMarketingApiError,
    getAudienceChangedAfterPrepareDetails,
  } = loadMarketingErrorModule();

  const error = parseMarketingApiError(
    400,
    JSON.stringify({
      error: "Invalid request",
      code: "OTHER_ERROR",
    })
  );

  assert.equal(getAudienceChangedAfterPrepareDetails(error), null);
});
