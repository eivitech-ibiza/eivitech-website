import { pool } from "./db.js";

const SEED_KEY = "2026-08-19-test-segment-two-contacts-v3";
const TEST_SEGMENT_NAMES = ["TEST – Luciano", "TEST - Luciano", "TEST — Luciano"];

const INTERNAL_TEST_CONTACTS = [
  {
    email: "info@lucianonovello.com",
    firstName: "Luciano",
    lastName: "Novello",
  },
  {
    email: "info@eivitech.com",
    firstName: "Eivitech",
    lastName: "Team",
  },
] as const;

/**
 * One-time repair for the internal marketing test segment.
 *
 * The seed key makes this deliberately non-recurring: it restores the two
 * explicitly requested internal test addresses once, but a later unsubscribe
 * remains respected and is not silently undone on every API restart.
 */
export async function ensureInternalTestSegment() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_internal_seed_events (
        seed_key text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const alreadyApplied = await client.query<{ seed_key: string }>(
      `SELECT seed_key FROM crm_internal_seed_events WHERE seed_key = $1`,
      [SEED_KEY],
    );

    if (alreadyApplied.rows.length > 0) {
      await client.query("COMMIT");
      console.log(`[seed] ${SEED_KEY} already applied`);
      return { applied: false, reason: "already-applied" as const };
    }

    const segment = await client.query<{ id: string; name: string }>(
      `SELECT id, name
       FROM crm_marketing_segments
       WHERE name = ANY($1::text[])
       ORDER BY CASE WHEN name = 'TEST – Luciano' THEN 0 ELSE 1 END, created_at ASC
       LIMIT 1`,
      [TEST_SEGMENT_NAMES],
    );

    if (segment.rows.length === 0) {
      await client.query("ROLLBACK");
      console.warn("[seed] TEST – Luciano segment not found; seed not marked as applied");
      return { applied: false, reason: "segment-not-found" as const };
    }

    for (const contact of INTERNAL_TEST_CONTACTS) {
      const saved = await client.query<{ id: string }>(
        `INSERT INTO crm_marketing_contacts (
           email, first_name, last_name, contact_type, source,
           status, marketing_consent, consent_source, consent_at,
           unsubscribed_at, suppressed_at, suppression_reason
         ) VALUES ($1, $2, $3, 'internal_test', 'internal-test-segment',
                   'subscribed', true, 'internal-test-segment', now(),
                   NULL, NULL, NULL)
         ON CONFLICT (email) DO UPDATE SET
           first_name = COALESCE(EXCLUDED.first_name, crm_marketing_contacts.first_name),
           last_name = COALESCE(EXCLUDED.last_name, crm_marketing_contacts.last_name),
           contact_type = COALESCE(crm_marketing_contacts.contact_type, EXCLUDED.contact_type),
           source = COALESCE(crm_marketing_contacts.source, EXCLUDED.source),
           status = 'subscribed',
           marketing_consent = true,
           consent_source = 'internal-test-segment',
           consent_at = now(),
           unsubscribed_at = NULL,
           suppressed_at = NULL,
           suppression_reason = NULL,
           updated_at = now()
         RETURNING id`,
        [contact.email, contact.firstName, contact.lastName],
      );

      const contactId = saved.rows[0].id;

      await client.query(
        `INSERT INTO crm_marketing_segment_members (segment_id, contact_id)
         VALUES ($1, $2)
         ON CONFLICT (segment_id, contact_id) DO NOTHING`,
        [segment.rows[0].id, contactId],
      );

      await client.query(
        `INSERT INTO crm_marketing_consent_events (
           contact_id, event_type, source, metadata
         ) VALUES ($1, 'restored', 'internal-test-segment', $2::jsonb)`,
        [
          contactId,
          JSON.stringify({
            reason: "Explicitly restored for the internal TEST – Luciano segment",
            seedKey: SEED_KEY,
          }),
        ],
      );
    }

    await client.query(
      `INSERT INTO crm_internal_seed_events (seed_key) VALUES ($1)`,
      [SEED_KEY],
    );

    await client.query("COMMIT");
    console.log(`[seed] added 2 subscribed contacts to ${segment.rows[0].name}`);
    return { applied: true, segment: segment.rows[0].name };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
