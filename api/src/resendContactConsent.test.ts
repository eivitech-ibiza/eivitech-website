import assert from "node:assert/strict";
import test from "node:test";
import { resubscribeResendMarketingContact } from "./resendContactConsent.js";

test("Resend resubscribe is skipped when marketing sync is not configured", async () => {
  let called = false;
  const fetchImpl = (async () => {
    called = true;
    throw new Error("fetch should not be called");
  }) as typeof fetch;

  const result = await resubscribeResendMarketingContact("person@example.com", {
    apiKey: null,
    fetchImpl,
  });

  assert.deepEqual(result, { synced: false, reason: "not_configured" });
  assert.equal(called, false);
});

test("explicit restoration clears the Resend unsubscribed flag", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({ id: "contact_123" }), { status: 200 });
  }) as typeof fetch;

  const result = await resubscribeResendMarketingContact("person@example.com", {
    apiKey: "re_test_key",
    fetchImpl,
  });

  assert.deepEqual(result, { synced: true });
  assert.equal(requestUrl, "https://api.resend.com/contacts/person%40example.com");
  assert.equal(requestInit?.method, "PATCH");
  assert.deepEqual(JSON.parse(String(requestInit?.body)), { unsubscribed: false });
  assert.equal((requestInit?.headers as Record<string, string>).Authorization, "Bearer re_test_key");
});

test("Resend restoration failures are surfaced to the caller", async () => {
  const fetchImpl = (async () => new Response("invalid contact", { status: 400 })) as typeof fetch;

  await assert.rejects(
    () => resubscribeResendMarketingContact("contact_123", {
      apiKey: "re_test_key",
      fetchImpl,
    }),
    /Resend resubscribe failed \(400\): invalid contact/,
  );
});
