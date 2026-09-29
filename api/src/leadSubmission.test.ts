import assert from "node:assert/strict";
import test from "node:test";
import { buildLeadSubmissionFingerprint, isPgUniqueViolation } from "./leadSubmission.js";

const base = {
  nombre: "Ada Lovelace",
  email: "ADA@example.com",
  telefono: "+34 600 000 000",
  tipoCliente: "propietario",
  tipoPropiedad: "villa",
  intervencion: "reforma-integral",
  tieneFotos: "si",
  tieneProyecto: "no",
  plazo: "1-3-meses",
  consentimiento: true,
  marketingConsent: false,
  source: "contacto",
  timestamp: "2026-09-29T18:00:00.000Z",
  submission_id: "8ce145bd-b3f8-44ef-9616-c6c82ef32ea4",
  meta_consent: true,
  meta_consent_version: 3,
  meta_consent_at: "2026-09-29T17:59:00.000Z",
};

test("submission fingerprint is stable across transport timestamp retries", () => {
  const first = buildLeadSubmissionFingerprint(base);
  const retry = buildLeadSubmissionFingerprint({
    ...base,
    timestamp: "2026-09-29T18:05:00.000Z",
  });
  assert.equal(first, retry);
});

test("submission fingerprint changes when the request payload changes", () => {
  const first = buildLeadSubmissionFingerprint(base);
  const changed = buildLeadSubmissionFingerprint({
    ...base,
    telefono: "+34 611 111 111",
  });
  assert.notEqual(first, changed);
});

test("Postgres unique violations are recognized without swallowing unrelated errors", () => {
  assert.equal(isPgUniqueViolation({ code: "23505" }), true);
  assert.equal(isPgUniqueViolation({ code: "23503" }), false);
  assert.equal(isPgUniqueViolation(new Error("boom")), false);
});
