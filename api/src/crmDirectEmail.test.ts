import assert from "node:assert/strict";
import test from "node:test";
import { createDirectEmailPayload, renderDirectEmailText, mapDirectEmailEvent } from "./crmDirectEmail.js";

test("outbound payload is one recipient with fixed corporate reply-to and stable request id", () => {
  const result = createDirectEmailPayload({
    id: "2b4484e8-e95b-4e18-90ca-b7272ee5ed09",
    from: "Eivitech Ibiza <info@eivitech.com>",
    replyTo: "info@eivitech.com",
    recipient: "cliente@example.com",
    subject: "Sopralluogo",
    body: "Buongiorno, possiamo fissare un appuntamento?",
  });
  assert.deepEqual(result.to, ["cliente@example.com"]);
  assert.equal(result.reply_to, "info@eivitech.com");
  assert.equal(result.subject, "Sopralluogo");
  assert.ok(result.text.includes("Buongiorno"));
  assert.ok(result.tags?.some((tag) => tag.name === "kind" && tag.value === "crm_direct"));
  assert.equal(Object.keys(result).includes("broadcast_id"), false);
});

test("text renderer never silently drops multiline customer correspondence", () => {
  assert.equal(renderDirectEmailText("Prima riga\nSeconda riga"), "Prima riga\nSeconda riga");
});

test("delivery-state mapping never regresses a delivered or bounced message to accepted", () => {
  assert.equal(mapDirectEmailEvent("accepted", "email.delivered"), "delivered");
  assert.equal(mapDirectEmailEvent("delivered", "email.sent"), "delivered");
  assert.equal(mapDirectEmailEvent("bounced", "email.sent"), "bounced");
  assert.equal(mapDirectEmailEvent("accepted", "email.bounced"), "bounced");
  assert.equal(mapDirectEmailEvent("accepted", "email.opened"), null);
  assert.equal(mapDirectEmailEvent("unknown", "email.delivered"), "delivered");
});

test("retries must use same request ID to prevent duplicates", () => {
  const requestId = "2b4484e8-e95b-4e18-90ca-b7272ee5ed09";
  const payload = createDirectEmailPayload({
    id: requestId,
    from: "Eivitech Ibiza <info@eivitech.com>",
    replyTo: "info@eivitech.com",
    recipient: "cliente@example.com",
    subject: "Proposta",
    body: "Gentile cliente",
  });
  assert.equal(payload.tags?.find((tag) => tag.name === "message_id")?.value, requestId);
});
