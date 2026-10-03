import assert from "node:assert/strict";
import test from "node:test";
import { localStatusFromResendBroadcast } from "./marketingBroadcastState.js";

test("maps provider scheduling and queue states without overstating delivery", () => {
  assert.equal(localStatusFromResendBroadcast("scheduled", "sending"), "scheduled");
  assert.equal(localStatusFromResendBroadcast("queued", "scheduled"), "sending");
  assert.equal(localStatusFromResendBroadcast("sent", "sending"), "sent");
});

test("maps a scheduled broadcast that reverted to provider draft as cancelled", () => {
  assert.equal(localStatusFromResendBroadcast("draft", "scheduled"), "cancelled");
});

test("allows a failed send attempt that stayed provider draft to return to draft", () => {
  assert.equal(localStatusFromResendBroadcast("draft", "sending"), "draft");
});

test("does not resurrect a cancelled campaign when Resend is draft", () => {
  assert.equal(localStatusFromResendBroadcast("draft", "cancelled"), "cancelled");
});

test("keeps unknown provider states explicit instead of guessing", () => {
  assert.equal(localStatusFromResendBroadcast("mystery", "sending"), null);
  assert.equal(localStatusFromResendBroadcast(undefined, "scheduled"), null);
});
