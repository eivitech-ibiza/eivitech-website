import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HIGH_SEVERITIES = new Set(["high", "critical"]);

export function evaluateProductionAudit(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return { ok: false, waived: false, reasons: ["npm audit did not return a JSON object"] };
  }
  if (report.error) {
    return {
      ok: false,
      waived: false,
      reasons: ["npm audit error: " + (report.error.summary || report.error.code || "unknown error")],
    };
  }
  if (!report.vulnerabilities || typeof report.vulnerabilities !== "object") {
    return { ok: false, waived: false, reasons: ["npm audit did not report vulnerabilities"] };
  }

  const blocking = Object.entries(report.vulnerabilities).filter(([, vulnerability]) =>
    HIGH_SEVERITIES.has(String(vulnerability?.severity || "").toLowerCase()),
  );
  if (!blocking.length) return { ok: true, waived: false, reasons: [] };

  return {
    ok: false,
    waived: false,
    reasons: blocking.map(([name, vulnerability]) =>
      name + ": " + vulnerability.severity + "-severity production dependency vulnerability"
    ),
  };
}

export function runProductionAudit() {
  const cmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const audit = spawnSync(cmd, ["audit", "--omit=dev", "--audit-level=high", "--json"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    env: process.env,
  });
  if (audit.error) {
    console.error("Unable to execute npm audit:", audit.error.message);
    return 1;
  }

  let report;
  try {
    report = JSON.parse(audit.stdout || "");
  } catch (err) {
    console.error("npm audit returned invalid JSON.", err instanceof Error ? err.message : err);
    if (audit.stderr) console.error(audit.stderr);
    return 1;
  }
  const result = evaluateProductionAudit(report);
  if (!result.ok) {
    console.error("Production dependency audit failed:");
    result.reasons.forEach((reason) => console.error("- " + reason));
    if (audit.stderr) console.error(audit.stderr);
    return 1;
  }
  console.log("Production dependency audit passed: no high or critical vulnerabilities.");
  return 0;
}

const isDirectExecution = process.argv[1]
  && fileURLToPath(import.meta.url) === fileURLToPath(new URL("file://" + process.argv[1]));
if (isDirectExecution) process.exitCode = runProductionAudit();
