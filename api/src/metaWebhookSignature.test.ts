import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyMetaWebhookSignature } from "./meta/webhookSignature.js";

test("Meta webhook HMAC verifies the original request bytes", () => {
  const body = Buffer.from('{"object":"page","entry":[]}');
  const secret = "test-secret";
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyMetaWebhookSignature(body, `sha256=${digest}`, secret), true);
  assert.equal(verifyMetaWebhookSignature(Buffer.from('{"object":"page"}'), `sha256=${digest}`, secret), false);
  assert.equal(verifyMetaWebhookSignature(body, "sha256=bad", secret), false);
});
