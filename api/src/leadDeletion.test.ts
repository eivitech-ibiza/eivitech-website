import assert from "node:assert/strict";
import test from "node:test";
import type { Pool } from "pg";
// The production module creates a Pool at import time. Tests inject a fake
// connection and must never connect to a live customer database.
process.env.DATABASE_URL ||= "postgresql://ci_test:ci_test@127.0.0.1:5432/ci_test";
const { deleteCrmLead } = await import("./leadDeletion.js");

const leadId = "8dbeb2a0-5607-4723-944a-9932af53a5a5";
const actorId = "f731c6bb-2c26-49c1-aad9-3fed6bbdbeea";
const email = "test@example.com";
type Call = { sql: string; params?: unknown[] };

function fakeDatabase(options: {
  exists?: boolean;
  outbox?: string[];
  metaIds?: string[];
  failOnSql?: string;
} = {}) {
  const calls: Call[] = [];
  let released = false;
  const client = {
    async query(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (options.failOnSql && sql.includes(options.failOnSql)) throw new Error("simulated database failure");
      if (sql.includes("FROM crm_leads") && sql.includes("FOR UPDATE")) {
        return { rows: options.exists === false ? [] : [{ id: leadId, nombre: "Test", email }] };
      }
      if (sql.includes("SELECT status FROM crm_meta_outbox")) {
        return { rows: (options.outbox || []).map((status) => ({ status })) };
      }
      if (sql.includes("SELECT meta_lead_id FROM crm_meta_lead_inbox")) {
        return { rows: (options.metaIds || []).map((meta_lead_id) => ({ meta_lead_id })) };
      }
      return { rows: [], rowCount: 1 };
    },
    release() {
      released = true;
    },
  };

  return {
    database: { connect: async () => client } as unknown as Pick<Pool, "connect">,
    calls,
    released: () => released,
  };
}

test("deletes only the selected confirmed CRM lead in a committed transaction", async () => {
  const fake = fakeDatabase({ outbox: ["sent", "queued"], metaIds: ["meta-lead-test"] });
  const result = await deleteCrmLead(leadId, "  TEST@example.com  ", actorId, fake.database);

  assert.deepEqual(result, { status: "deleted", metaLeadsBlocked: 1, marketingRetained: true });
  assert.equal(fake.calls[0].sql, "BEGIN");
  assert.equal(fake.calls.at(-1)?.sql, "COMMIT");
  assert.equal(fake.released(), true);

  const leadDeletion = fake.calls.find((call) => call.sql.includes("DELETE FROM crm_leads"));
  assert.deepEqual(leadDeletion?.params, [leadId]);
  const tombstone = fake.calls.find((call) => call.sql.includes("INSERT INTO crm_meta_lead_inbox"));
  assert.deepEqual(tombstone?.params, ["meta-lead-test"]);
  assert.match(tombstone!.sql, /status = 'deleted'/);
  const outbox = fake.calls.find((call) => call.sql.includes("UPDATE crm_meta_outbox"));
  assert.match(outbox!.sql, /'cancelled'/);
  assert.equal(fake.calls.some((call) => call.sql.includes("crm_marketing_contacts")), false);
  const audit = fake.calls.find((call) => call.sql.includes("crm_lead_deletion_audit"));
  assert.deepEqual(audit?.params, [leadId, actorId, 1]);
});

test("does not delete when the entered email differs from the database record", async () => {
  const fake = fakeDatabase();
  const result = await deleteCrmLead(leadId, "marta@example.com", actorId, fake.database);
  assert.deepEqual(result, { status: "email_mismatch" });
  assert.equal(fake.calls.at(-1)?.sql, "ROLLBACK");
  assert.equal(fake.calls.some((call) => call.sql.includes("DELETE FROM crm_leads")), false);
  assert.equal(fake.released(), true);
});

test("returns not_found without side effects when the lead was already removed", async () => {
  const fake = fakeDatabase({ exists: false });
  assert.deepEqual(await deleteCrmLead(leadId, email, actorId, fake.database), { status: "not_found" });
  assert.equal(fake.calls.at(-1)?.sql, "ROLLBACK");
  assert.equal(fake.calls.some((call) => call.sql.includes("DELETE")), false);
});

test("blocks deletion while a Meta event may be in flight", async () => {
  const fake = fakeDatabase({ outbox: ["sent", "processing"] });
  assert.deepEqual(await deleteCrmLead(leadId, email, actorId, fake.database), { status: "outbox_busy" });
  assert.equal(fake.calls.at(-1)?.sql, "ROLLBACK");
  assert.equal(fake.calls.some((call) => call.sql.includes("DELETE FROM crm_leads")), false);
});

test("rolls back all changes if a database operation fails", async () => {
  const fake = fakeDatabase({ metaIds: ["meta-lead-test"], failOnSql: "crm_lead_deletion_audit" });
  await assert.rejects(
    deleteCrmLead(leadId, email, actorId, fake.database),
    /simulated database failure/,
  );
  assert.equal(fake.calls.at(-1)?.sql, "ROLLBACK");
  assert.equal(fake.released(), true);
});
