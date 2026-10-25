import assert from "node:assert/strict";
import test from "node:test";
import { evaluateProductionAudit } from "./audit-production-dependencies.mjs";

test("accepts audit with no high or critical vulnerabilities", () => {
  assert.deepEqual(evaluateProductionAudit({
    vulnerabilities: { x: { severity: "moderate" } },
  }), { ok: true, waived: false, reasons: [] });
});

test("does not exempt the former braces advisory after withdrawal", () => {
  const result = evaluateProductionAudit({ vulnerabilities: { braces: { severity: "high" } } });
  assert.equal(result.ok, false);
  assert.equal(result.waived, false);
  assert.match(result.reasons.join(" "), /braces.*high/i);
});

test("rejects unpatched Zod and critical dependencies", () => {
  const result = evaluateProductionAudit({ vulnerabilities: {
    zod: { severity: "high" }, another: { severity: "critical" },
  } });
  assert.equal(result.ok, false);
  assert.equal(result.reasons.length, 2);
});

test("rejects malformed and unsuccessful audit responses", () => {
  assert.equal(evaluateProductionAudit(null).ok, false);
  assert.equal(evaluateProductionAudit({ error: { code: "EHTTP" } }).ok, false);
  assert.equal(evaluateProductionAudit({}).ok, false);
});
