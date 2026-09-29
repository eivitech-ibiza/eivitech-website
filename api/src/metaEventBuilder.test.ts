import assert from "node:assert/strict";
import test from "node:test";
import { buildCrmMetaEvent, buildWebMetaEvent, normalizeAndHashEmail, normalizeAndHashPhone } from "./meta/events.js";

test("CRM lead events use Meta Conversion Leads source contract", () => {
  const event = buildCrmMetaEvent({
    eventName: "qualified",
    eventId: "evt-1",
    eventTime: "2026-09-29T18:00:00.000Z",
    metaLeadId: "900719925474099312345",
    leadEventSource: "Eivitech CRM",
    email: " Ada@Example.COM ",
    phone: "+34 600 000 000",
  });
  assert.equal(event.action_source, "system_generated");
  assert.equal(event.user_data.lead_id, "900719925474099312345");
  assert.equal(event.custom_data.event_source, "crm");
  assert.equal(event.custom_data.lead_event_source, "Eivitech CRM");
  assert.equal(event.event_id, "evt-1");
  assert.deepEqual(event.user_data.em, [normalizeAndHashEmail(" Ada@Example.COM ")]);
  assert.deepEqual(event.user_data.ph, [normalizeAndHashPhone("+34 600 000 000")]);
});

test("website events preserve website source and validated public URL", () => {
  const event = buildWebMetaEvent({
    eventName: "Lead",
    eventId: "evt-web",
    eventTime: "2026-09-29T18:00:00.000Z",
    eventSourceUrl: "https://eivitech.com/it/contatto",
    email: "ada@example.com",
    phone: "+34600000000",
    fbp: "fb.1.1.1",
    fbc: "fb.1.1.abc",
    clientUserAgent: "Mozilla/5.0 Eivitech-Test",
  });
  assert.equal(event.action_source, "website");
  assert.equal(event.event_source_url, "https://eivitech.com/it/contatto");
  assert.equal(event.event_id, "evt-web");
  assert.equal(event.user_data.client_user_agent, "Mozilla/5.0 Eivitech-Test");
});

test("invalid website URLs are rejected instead of forwarded", () => {
  assert.throws(() => buildWebMetaEvent({
    eventName: "Lead",
    eventId: "bad",
    eventTime: "2026-09-29T18:00:00.000Z",
    eventSourceUrl: "https://evil.example/private?email=ada@example.com",
    email: "ada@example.com",
    phone: "+34600000000",
  }), /public Eivitech URL/i);
});
