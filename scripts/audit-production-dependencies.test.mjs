import assert from "node:assert/strict";
import test from "node:test";
import {
  TEMPORARY_AUDIT_EXCEPTION,
  evaluateProductionAudit,
} from "./audit-production-dependencies.mjs";

const beforeExpiry = new Date("2026-10-03T12:00:00.000Z");

function knownBracesReport(overrides = {}) {
  const vulnerabilities = {
    braces: {
      name: "braces",
      severity: "high",
      via: [{
        source: 123,
        name: "braces",
        dependency: "braces",
        title: "braces vulnerable to stack-exhaustion denial of service",
        url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
        severity: "high",
      }],
      effects: ["chokidar", "micromatch"],
      fixAvailable: { name: "tailwindcss", version: "4.3.3", isSemVerMajor: true },
    },
    chokidar: {
      name: "chokidar",
      severity: "high",
      via: ["braces"],
      effects: ["tailwindcss"],
      fixAvailable: { name: "tailwindcss", version: "4.3.3", isSemVerMajor: true },
    },
    micromatch: {
      name: "micromatch",
      severity: "high",
      via: ["braces"],
      effects: ["fast-glob", "tailwindcss"],
      fixAvailable: { name: "tailwindcss", version: "4.3.3", isSemVerMajor: true },
    },
    "fast-glob": {
      name: "fast-glob",
      severity: "high",
      via: ["micromatch"],
      effects: ["tailwindcss"],
      fixAvailable: { name: "tailwindcss", version: "4.3.3", isSemVerMajor: true },
    },
    tailwindcss: {
      name: "tailwindcss",
      severity: "high",
      via: ["chokidar", "fast-glob", "micromatch"],
      effects: [],
      fixAvailable: { name: "tailwindcss", version: "4.3.3", isSemVerMajor: true },
    },
  };

  return {
    auditReportVersion: 2,
    vulnerabilities: { ...vulnerabilities, ...(overrides.vulnerabilities || {}) },
    metadata: { vulnerabilities: { high: 5, critical: 0 } },
    ...overrides,
  };
}

test("passes when npm reports no high or critical production vulnerabilities", () => {
  const result = evaluateProductionAudit({
    auditReportVersion: 2,
    vulnerabilities: {
      example: { name: "example", severity: "moderate", via: [] },
    },
  }, beforeExpiry);

  assert.equal(result.ok, true);
  assert.equal(result.waived, false);
});

test("temporarily accepts only the known braces advisory dependency chain", () => {
  const result = evaluateProductionAudit(knownBracesReport(), beforeExpiry);

  assert.equal(result.ok, true);
  assert.equal(result.waived, true);
  assert.deepEqual(result.packages, ["braces", "chokidar", "fast-glob", "micromatch", "tailwindcss"]);
});

test("rejects any additional high-severity package", () => {
  const report = knownBracesReport();
  report.vulnerabilities.other = {
    name: "other",
    severity: "high",
    via: [{
      name: "other",
      severity: "high",
      url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
    }],
    fixAvailable: false,
  };

  const result = evaluateProductionAudit(report, beforeExpiry);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join("\n"), /unexpected high-severity package: other/);
});

test("rejects a second advisory hidden inside an allowed package", () => {
  const report = knownBracesReport();
  report.vulnerabilities.braces.via.push({
    name: "braces",
    severity: "high",
    url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
  });

  const result = evaluateProductionAudit(report, beforeExpiry);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join("\n"), /unexpected advisory GHSA-AAAA-BBBB-CCCC/);
});

test("requires remediation when npm exposes a non-breaking fix", () => {
  const report = knownBracesReport();
  report.vulnerabilities.braces.fixAvailable = {
    name: "braces",
    version: "3.0.4",
    isSemVerMajor: false,
  };

  const result = evaluateProductionAudit(report, beforeExpiry);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join("\n"), /non-breaking fix is available for braces/);
});

test("the exception expires automatically", () => {
  const result = evaluateProductionAudit(
    knownBracesReport(),
    new Date(TEMPORARY_AUDIT_EXCEPTION.expiresAt),
  );

  assert.equal(result.ok, false);
  assert.match(result.reasons.join("\n"), /temporary exception expired/);
});
