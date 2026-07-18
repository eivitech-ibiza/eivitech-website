import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const frontendConfig = readFileSync("src/lib/config.ts", "utf8");
const backendAuth = readFileSync("api/src/auth.ts", "utf8");

const approvedEmails = ["lncoachmrc@gmail.com", "info@eivitech.com"];
const removedEmails = ["info@lucianonovello.com", "cividalecashback@gmail.com"];

test("CRM access is limited to the two approved email accounts", () => {
  for (const email of approvedEmails) {
    assert.match(frontendConfig, new RegExp(email.replaceAll(".", "\\.")));
    assert.match(backendAuth, new RegExp(email.replaceAll(".", "\\.")));
  }

  for (const email of removedEmails) {
    assert.doesNotMatch(frontendConfig, new RegExp(email.replaceAll(".", "\\.")));
    assert.doesNotMatch(backendAuth, new RegExp(email.replaceAll(".", "\\.")));
  }
});

test("backend rejects non-allowlisted users before querying CRM records", () => {
  const allowlistGuard = backendAuth.indexOf("if (!authorizedCrmEmails.has(email))");
  const userLookup = backendAuth.indexOf("SELECT id, clerk_user_id, email, name, role, active FROM crm_users");

  assert.notEqual(allowlistGuard, -1);
  assert.notEqual(userLookup, -1);
  assert.ok(allowlistGuard < userLookup);
});
