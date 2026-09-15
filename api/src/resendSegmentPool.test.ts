import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { selectResendSegmentPool } from "./resendSegmentPool.js";

test("reuses the campaign's current Resend pool when it is still free", () => {
  const selected = selectResendSegmentPool({
    availableSegmentIds: ["pool-a", "pool-b", "pool-c"],
    reservedSegmentIds: new Set(["pool-b"]),
    currentSegmentId: "pool-a",
  });

  assert.equal(selected, "pool-a");
});

test("allocates an existing Resend segment instead of requiring a new segment", () => {
  const selected = selectResendSegmentPool({
    availableSegmentIds: ["pool-a", "pool-b", "pool-c"],
    reservedSegmentIds: new Set(["pool-a", "pool-b"]),
    currentSegmentId: null,
  });

  assert.equal(selected, "pool-c");
});

test("does not steal a current pool that another active campaign has reserved", () => {
  const selected = selectResendSegmentPool({
    availableSegmentIds: ["pool-a", "pool-b", "pool-c"],
    reservedSegmentIds: new Set(["pool-a"]),
    currentSegmentId: "pool-a",
  });

  assert.equal(selected, "pool-b");
});

test("returns null when all existing Resend segments are reserved", () => {
  const selected = selectResendSegmentPool({
    availableSegmentIds: ["pool-a", "pool-b", "pool-c"],
    reservedSegmentIds: new Set(["pool-a", "pool-b", "pool-c"]),
    currentSegmentId: null,
  });

  assert.equal(selected, null);
});

test("campaign preparation never creates a new Resend segment", () => {
  const marketingSource = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");

  assert.doesNotMatch(marketingSource, /\bcreateResendSegment\b/);
  assert.match(marketingSource, /\blistResendSegments\b/);
  assert.match(marketingSource, /\bselectResendSegmentPool\b/);
});
