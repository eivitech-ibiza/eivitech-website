import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const TEMPORARY_AUDIT_EXCEPTION = Object.freeze({
  advisoryId: "GHSA-vfj7-8cjw-p6xm",
  cve: "CVE-2026-93687",
  packageName: "braces",
  expiresAt: "2026-12-01T00:00:00.000Z",
  allowedPackages: Object.freeze([
    "braces",
    "chokidar",
    "fast-glob",
    "micromatch",
    "tailwindcss",
  ]),
});

const HIGH_SEVERITIES = new Set(["high", "critical"]);

function normalizeSeverity(value) {
  return String(value || "").trim().toLowerCase();
}

function advisoryIdFromVia(via) {
  if (!via || typeof via !== "object") return null;
  const searchable = [via.url, via.source, via.name, via.title]
    .filter(Boolean)
    .join(" ");
  return searchable.match(/GHSA-[a-z0-9-]+/i)?.[0]?.toUpperCase() || null;
}

function collectRootAdvisories(packageName, vulnerabilities, visited = new Set()) {
  if (visited.has(packageName)) {
    return { advisoryIds: new Set(), unresolved: [`dependency cycle at ${packageName}`] };
  }

  const vulnerability = vulnerabilities[packageName];
  if (!vulnerability) {
    return { advisoryIds: new Set(), unresolved: [`missing vulnerability node ${packageName}`] };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(packageName);
  const advisoryIds = new Set();
  const unresolved = [];

  for (const via of Array.isArray(vulnerability.via) ? vulnerability.via : []) {
    if (typeof via === "string") {
      const nested = collectRootAdvisories(via, vulnerabilities, nextVisited);
      nested.advisoryIds.forEach((id) => advisoryIds.add(id));
      unresolved.push(...nested.unresolved);
      continue;
    }

    if (!HIGH_SEVERITIES.has(normalizeSeverity(via?.severity))) continue;
    const advisoryId = advisoryIdFromVia(via);
    if (advisoryId) advisoryIds.add(advisoryId);
    else unresolved.push(`missing GHSA identifier in ${packageName}`);
  }

  if (advisoryIds.size === 0 && unresolved.length === 0) {
    unresolved.push(`no high-severity root advisory resolved for ${packageName}`);
  }

  return { advisoryIds, unresolved };
}

function hasNonBreakingFix(vulnerability) {
  const fix = vulnerability?.fixAvailable;
  if (fix === true) return true;
  if (!fix || typeof fix !== "object") return false;
  return fix.isSemVerMajor !== true;
}

export function evaluateProductionAudit(
  report,
  now = new Date(),
  exception = TEMPORARY_AUDIT_EXCEPTION,
) {
  if (!report || typeof report !== "object") {
    return { ok: false, waived: false, reasons: ["npm audit did not return a JSON object"] };
  }
  if (report.error) {
    return {
      ok: false,
      waived: false,
      reasons: [`npm audit error: ${report.error.summary || report.error.code || "unknown error"}`],
    };
  }

  const vulnerabilities = report.vulnerabilities || {};
  const blockingEntries = Object.entries(vulnerabilities).filter(([, vulnerability]) =>
    HIGH_SEVERITIES.has(normalizeSeverity(vulnerability?.severity)),
  );

  if (blockingEntries.length === 0) {
    return { ok: true, waived: false, reasons: [] };
  }

  const reasons = [];
  const expiresAt = new Date(exception.expiresAt);
  if (Number.isNaN(expiresAt.getTime()) || now.getTime() >= expiresAt.getTime()) {
    reasons.push(`temporary exception expired at ${exception.expiresAt}`);
  }

  const allowedPackages = new Set(exception.allowedPackages);
  const expectedAdvisory = exception.advisoryId.toUpperCase();

  for (const [packageName, vulnerability] of blockingEntries) {
    if (!allowedPackages.has(packageName)) {
      reasons.push(`unexpected high-severity package: ${packageName}`);
      continue;
    }

    if (hasNonBreakingFix(vulnerability)) {
      reasons.push(`a non-breaking fix is available for ${packageName}`);
    }

    const roots = collectRootAdvisories(packageName, vulnerabilities);
    reasons.push(...roots.unresolved.map((reason) => `${packageName}: ${reason}`));

    const unexpectedAdvisories = [...roots.advisoryIds].filter((id) => id !== expectedAdvisory);
    if (unexpectedAdvisories.length > 0) {
      reasons.push(`${packageName}: unexpected advisory ${unexpectedAdvisories.join(", ")}`);
    }
    if (!roots.advisoryIds.has(expectedAdvisory)) {
      reasons.push(`${packageName}: expected advisory ${expectedAdvisory} was not resolved`);
    }
  }

  if (!Object.prototype.hasOwnProperty.call(vulnerabilities, exception.packageName)) {
    reasons.push(`expected root package ${exception.packageName} is missing`);
  }

  return {
    ok: reasons.length === 0,
    waived: reasons.length === 0,
    reasons: [...new Set(reasons)],
    packages: blockingEntries.map(([packageName]) => packageName).sort(),
  };
}

export function runProductionAudit() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const audit = spawnSync(
    npmCommand,
    ["audit", "--omit=dev", "--audit-level=high", "--json"],
    {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      env: process.env,
    },
  );

  if (audit.error) {
    console.error("Unable to execute npm audit:", audit.error.message);
    return 1;
  }

  let report;
  try {
    report = JSON.parse(audit.stdout || "{}");
  } catch (error) {
    console.error("npm audit returned invalid JSON.");
    if (audit.stdout) console.error(audit.stdout);
    if (audit.stderr) console.error(audit.stderr);
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }

  const result = evaluateProductionAudit(report);
  if (!result.ok) {
    console.error("Production dependency audit failed:");
    result.reasons.forEach((reason) => console.error(`- ${reason}`));
    if (audit.stderr) console.error(audit.stderr);
    return 1;
  }

  if (result.waived) {
    console.warn(
      `Temporary audit exception accepted only for ${TEMPORARY_AUDIT_EXCEPTION.advisoryId} `
      + `(${TEMPORARY_AUDIT_EXCEPTION.cve}) through ${TEMPORARY_AUDIT_EXCEPTION.expiresAt}.`,
    );
    console.warn(`Affected dependency chain: ${result.packages.join(", ")}`);
    return 0;
  }

  console.log("Production dependency audit passed with no high or critical vulnerabilities.");
  return audit.status === 0 ? 0 : 1;
}

const isDirectExecution = process.argv[1]
  && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`));

if (isDirectExecution) {
  process.exitCode = runProductionAudit();
}
