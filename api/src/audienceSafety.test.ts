import assert from "node:assert/strict";
import test from "node:test";
import {
  audienceFingerprint,
  audienceMatchesPreparedSnapshot,
  normalizeAudienceEmails,
} from "./audienceSafety.js";

test("audience normalization is case-insensitive, deduplicated and order-independent", () => {
  assert.deepEqual(
    normalizeAudienceEmails([" B@example.com ", "a@example.com", "b@example.com", ""]),
    ["a@example.com", "b@example.com"],
  );
});

test("audience fingerprint is stable regardless of input order and casing", () => {
  const first = audienceFingerprint(["A@example.com", "b@example.com"]);
  const second = audienceFingerprint(["B@example.com", "a@example.com"]);
  assert.equal(first, second);
});

test("prepared audience matches only when the exact eligible email set is unchanged", () => {
  const prepared = audienceFingerprint(["a@example.com", "b@example.com"]);
  assert.equal(audienceMatchesPreparedSnapshot(prepared, ["B@example.com", "a@example.com"]), true);
  assert.equal(audienceMatchesPreparedSnapshot(prepared, ["a@example.com"]), false);
  assert.equal(audienceMatchesPreparedSnapshot(prepared, ["a@example.com", "b@example.com", "c@example.com"]), false);
  assert.equal(audienceMatchesPreparedSnapshot(null, ["a@example.com", "b@example.com"]), false);
});
