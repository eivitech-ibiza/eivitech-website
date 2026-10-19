import type { Pool } from "pg";
import { pool } from "./db.js";

type LeadToDelete = {
  id: string;
  nombre: string;
  email: string;
};

export type DeleteLeadResult =
  | { status: "deleted"; metaLeadsBlocked: number; marketingRetained: true }
  | { status: "not_found" | "email_mismatch" | "outbox_busy" };

/**
 * Delete one CRM lead and its cascading operational records in one transaction.
 * Marketing contacts remain independent. Meta IDs are kept only as scrubbed
 * tombstones so webhook and Graph fallback cannot recreate deleted leads.
 */
export async function deleteCrmLead(
  leadId: string,
  confirmationEmail: string,
  actorId: string,
  database: Pick<Pool, "connect"> = pool,
): Promise<DeleteLeadResult> {
  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const found = await client.query<LeadToDelete>(
      `SELECT id, nombre, email
       FROM crm_leads
       WHERE id = $1
       FOR UPDATE`,
      [leadId],
    );
    const lead = found.rows[0];
    if (!lead) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    if (lead.email.trim().toLowerCase() !== confirmationEmail.trim().toLowerCase()) {
      await client.query("ROLLBACK");
      return { status: "email_mismatch" };
    }

    // Lock outbox rows before the worker can claim them. Never delete while
    // an already-claimed event could be in flight to Meta.
    const outbox = await client.query<{ status: string }>(
      `SELECT status FROM crm_meta_outbox WHERE lead_id = $1 FOR UPDATE`,
      [leadId],
    );
    if (outbox.rows.some((item) => item.status === "processing")) {
      await client.query("ROLLBACK");
      return { status: "outbox_busy" };
    }

    const metaIds = await client.query<{ meta_lead_id: string }>(
      `SELECT meta_lead_id FROM crm_meta_lead_inbox WHERE promoted_lead_id = $1
       UNION
       SELECT meta_lead_id FROM crm_leads
       WHERE id = $1 AND meta_lead_id IS NOT NULL`,
      [leadId],
    );

    // Previously-sent events stay as minimal technical audit records.
    // Unsent events are cancelled and their snapshots are removed.
    await client.query(
      `UPDATE crm_meta_outbox
       SET source_snapshot = '{}'::jsonb,
           status = CASE WHEN status IN ('queued', 'retry', 'failed') THEN 'cancelled' ELSE status END,
           locked_at = NULL,
           lock_token = NULL,
           updated_at = now()
       WHERE lead_id = $1`,
      [leadId],
    );

    await client.query(
      `DELETE FROM crm_automation_events WHERE lead_id = $1`,
      [leadId],
    );

    for (const { meta_lead_id: metaLeadId } of metaIds.rows) {
      await client.query(
        `INSERT INTO crm_meta_lead_inbox (meta_lead_id, status)
         VALUES ($1, 'deleted')
         ON CONFLICT (meta_lead_id) DO UPDATE
         SET status = 'deleted',
             promoted_lead_id = NULL,
             field_data = '[]'::jsonb,
             mapped_data = '{}'::jsonb,
             missing_fields = '[]'::jsonb,
             page_id = NULL,
             form_id = NULL,
             ad_id = NULL,
             adset_id = NULL,
             campaign_id = NULL,
             last_error = NULL,
             updated_at = now()`,
        [metaLeadId],
      );
      await client.query(
        `UPDATE crm_meta_webhook_events
         SET status = 'ignored',
             last_error_code = 'LEAD_DELETED',
             last_error_message = NULL,
             locked_at = NULL,
             lock_token = NULL,
             processed_at = now()
         WHERE leadgen_id = $1 AND status IN ('received', 'retry', 'failed')`,
        [metaLeadId],
      );
    }

    await client.query(
      `INSERT INTO crm_lead_deletion_audit (lead_id, deleted_by, meta_leads_blocked)
       VALUES ($1, $2, $3)`,
      [leadId, actorId, metaIds.rows.length],
    );

    await client.query(
      `DELETE FROM crm_leads WHERE id = $1`,
      [leadId],
    );

    await client.query("COMMIT");
    return { status: "deleted", metaLeadsBlocked: metaIds.rows.length, marketingRetained: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
