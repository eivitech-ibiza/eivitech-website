import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const emailSource = readFileSync("api/src/email.ts", "utf8");
const envExample = readFileSync("api/.env.example", "utf8");

const templateId = "b42fd5b2-ed86-49e5-a779-20023e47ea35";
const templateVariables = [
  "NAME",
  "REFERENCE",
  "SUBMITTED_AT",
  "CLIENT_TYPE",
  "PROPERTY_TYPE",
  "AREA",
  "INTERVENTION",
  "TIMING",
  "BUDGET",
  "MESSAGE",
];

test("published Italian requester template is wired with all dynamic variables", () => {
  assert.match(emailSource, new RegExp(templateId));
  assert.match(envExample, new RegExp(templateId));

  for (const variable of templateVariables) {
    assert.match(emailSource, new RegExp(`${variable}:`));
  }

  assert.match(emailSource, /template:\s*requesterTemplate/);
});

test("Resend template is limited to Italian client requests and keeps fallbacks", () => {
  assert.match(
    emailSource,
    /confirmationLanguage\(lead\) !== "it" \|\| isPartnerRequest\(lead\)/,
  );
  assert.match(
    emailSource,
    /requesterTemplate\s*\?\s*\{ template: requesterTemplate \}\s*:\s*\{ subject, text \}/s,
  );
});
