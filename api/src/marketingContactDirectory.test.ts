import assert from "node:assert/strict";
import test from "node:test";
import { buildContactDirectoryWhere, contactDirectoryQuerySchema } from "./marketingContactDirectory.js";

test("contact directory supports safe pagination defaults", () => {
  const parsed = contactDirectoryQuerySchema.parse({});
  assert.equal(parsed.limit, 100);
  assert.equal(parsed.offset, 0);
  const built = buildContactDirectoryWhere(parsed);
  assert.equal(built.where, "");
  assert.deepEqual(built.params, []);
});

test("contact directory combines consent, tag, priority, sector and membership filters", () => {
  const filters = contactDirectoryQuerySchema.parse({
    status: "pending",
    contact_type: "Agenzia",
    tag: "subpriorita:A1",
    consent: "false",
    membership: "unassigned",
    limit: "50",
    offset: "100",
  });
  const built = buildContactDirectoryWhere(filters);
  assert.match(built.where, /c\.status = \$1/);
  assert.match(built.where, /c\.contact_type ILIKE \$2/);
  assert.match(built.where, /c\.tags \? \$3/);
  assert.match(built.where, /c\.marketing_consent = \$4/);
  assert.match(built.where, /NOT EXISTS/);
  assert.deepEqual(built.params, ["pending", "%Agenzia%", "subpriorita:A1", false]);
  assert.equal(filters.limit, 50);
  assert.equal(filters.offset, 100);
});

test("contact directory does not interpolate user-controlled SQL", () => {
  const tag = "'; DROP TABLE crm_marketing_contacts; --";
  const built = buildContactDirectoryWhere(contactDirectoryQuerySchema.parse({ tag }));
  assert.equal(built.where.includes("DROP TABLE"), false);
  assert.equal(built.params[0], tag);
});

test("contact directory rejects invalid filters and oversized pages", () => {
  assert.equal(contactDirectoryQuerySchema.safeParse({ consent: "yes" }).success, false);
  assert.equal(contactDirectoryQuerySchema.safeParse({ limit: 99999 }).success, false);
  assert.equal(contactDirectoryQuerySchema.safeParse({ membership: "unknown" }).success, false);
});
