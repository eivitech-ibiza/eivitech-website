import assert from "node:assert/strict";
import test from "node:test";
import {
  buildResendBroadcastSendPayload,
  cancelResendBroadcast,
  getResendBroadcast,
  sendResendBroadcast,
} from "./resendMarketing.js";

test("scheduled Broadcast sends use the provider scheduled_at field", () => {
  assert.deepEqual(buildResendBroadcastSendPayload("2026-10-10T08:30:00.000Z"), {
    scheduled_at: "2026-10-10T08:30:00.000Z",
  });
  assert.deepEqual(buildResendBroadcastSendPayload(null), {});
});

test("Resend scheduling, retrieval and cancellation use Broadcast endpoints without real sends", async (t) => {
  process.env.RESEND_MARKETING_API_KEY = "re_test_key";
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    const url = String(input);
    if (url.endsWith("/send")) return new Response(JSON.stringify({ id: "broadcast-1" }), { status: 200 });
    if (url.endsWith("/cancel")) return new Response(JSON.stringify({ id: "broadcast-1" }), { status: 200 });
    return new Response(JSON.stringify({ id: "broadcast-1", status: "scheduled" }), { status: 200 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  await sendResendBroadcast("broadcast-1", "2026-10-10T08:30:00.000Z", "attempt-abc");
  await getResendBroadcast("broadcast-1");
  await cancelResendBroadcast("broadcast-1");

  assert.equal(calls[0].url, "https://api.resend.com/broadcasts/broadcast-1/send");
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
    scheduled_at: "2026-10-10T08:30:00.000Z",
  });
  assert.equal(calls[0].init?.headers && (calls[0].init.headers as Record<string, string>)["Idempotency-Key"], "eivitech-broadcast-send-broadcast-1-attempt-abc");
  assert.equal(calls[1].url, "https://api.resend.com/broadcasts/broadcast-1");
  assert.equal(calls[2].url, "https://api.resend.com/broadcasts/broadcast-1/cancel");
});
