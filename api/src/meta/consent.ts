import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { pool } from "../db.js";

export async function createMetaConsentToken(client: PoolClient, leadId: string, enabled: boolean) {
  if (!enabled) return null;
  const token = randomBytes(32).toString("base64url");
  await client.query(
    `INSERT INTO crm_meta_consent_tokens (lead_id, token)
     VALUES ($1, $2)
     ON CONFLICT (lead_id) DO UPDATE
     SET token = EXCLUDED.token, revoked_at = NULL, created_at = now()`,
    [leadId, token]
  );
  return token;
}

export async function revokeMetaConsentByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return false;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tokenResult = await client.query<{ lead_id: string; revoked_at: string | null }>(
      `SELECT lead_id, revoked_at
       FROM crm_meta_consent_tokens
       WHERE token = $1
       FOR UPDATE`,
      [token]
    );
    const row = tokenResult.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return false;
    }

    if (!row.revoked_at) {
      await client.query(
        `UPDATE crm_leads
         SET meta_consent = false,
             meta_fbp = NULL,
             meta_fbc = NULL,
             meta_fbclid = NULL,
             updated_at = now()
         WHERE id = $1`,
        [row.lead_id]
      );
      await client.query(
        `UPDATE crm_meta_consent_tokens
         SET revoked_at = now()
         WHERE lead_id = $1`,
        [row.lead_id]
      );
      await client.query(
        `UPDATE crm_meta_outbox
         SET status = 'cancelled',
             locked_at = NULL,
             lock_token = NULL,
             last_error_code = 'CONSENT_REVOKED',
             last_error_message = 'Cancelled before send because Meta sharing consent was revoked',
             updated_at = now()
         WHERE lead_id = $1
           AND event_kind = 'web'
           AND status IN ('queued', 'retry', 'processing')`,
        [row.lead_id]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
