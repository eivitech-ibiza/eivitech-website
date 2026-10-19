import assert from "node:assert/strict";
import test from "node:test";
import { canDeleteCrmLead } from "./leadDeletionAccess.js";

test("approved CRM owners retain deletion access despite an outdated stored role", () => {
  assert.equal(canDeleteCrmLead({ email: "lncoachmrc@gmail.com", role: "operator", active: true }), true);
  assert.equal(canDeleteCrmLead({ email: "INFO@EIVITECH.COM", role: "viewer", active: true }), true);
});

test("regular authorized admins retain deletion access", () => {
  assert.equal(canDeleteCrmLead({ email: "future-admin@example.com", role: "admin", active: true }), true);
});

test("non-owner, non-admin and disabled accounts do not gain deletion access", () => {
  assert.equal(canDeleteCrmLead({ email: "operator@example.com", role: "operator", active: true }), false);
  assert.equal(canDeleteCrmLead({ email: "lncoachmrc@gmail.com", role: "viewer", active: false }), false);
  assert.equal(canDeleteCrmLead(null), false);
});
