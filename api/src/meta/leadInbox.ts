import type { PoolClient } from "pg";
import { pool } from "../db.js";
import { nextActionForLead, priorityFromScore, scoreLead } from "../leadScoring.js";

export type MetaLeadPromotionInput = {
  nombre: string;
  email: string;
  telefono: string;
  tipoCliente: "propietario" | "comprador" | "inversor" | "agencia" | "empresa" | "otro";
  tipoPropiedad: "villa" | "apartamento" | "casa" | "local-comercial" | "otro";
  zona?: string | null;
  intervencion: "reforma-integral" | "bano" | "cocina" | "instalaciones" | "exterior" | "local-comercial" | "otro";
  tieneFotos: "si" | "no";
  tieneProyecto: "si" | "no" | "en-proceso";
  plazo: "urgente" | "1-3-meses" | "3-6-meses" | "sin-fecha";
  presupuesto?: string | null;
  mensaje?: string | null;
  consentPrivacy: true;
  consentMarketing?: boolean;
};

type InboxRow = {
  id: string;
  meta_lead_id: string;
  page_id: string | null;
  form_id: string | null;
  ad_id: string | null;
  adset_id: string | null;
  campaign_id: string | null;
  promoted_lead_id: string | null;
};

function scoringInput(input: MetaLeadPromotionInput) {
  return {
    plazo: input.plazo,
    intervencion: input.intervencion,
    tipo_propiedad: input.tipoPropiedad,
    tiene_fotos: input.tieneFotos,
    tiene_proyecto: input.tieneProyecto,
    presupuesto: input.presupuesto || null,
    source: "meta_lead_ads",
    utm_source: "meta",
  };
}

async function findExistingNativeLead(client: PoolClient, metaLeadId: string) {
  const result = await client.query<{ id: string }>(
    `SELECT id FROM crm_leads WHERE meta_lead_id = $1 LIMIT 1`,
    [metaLeadId]
  );
  return result.rows[0]?.id || null;
}

export async function promoteMetaLeadInbox(
  inboxId: string,
  input: MetaLeadPromotionInput,
  userId: string | null
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inboxResult = await client.query<InboxRow>(
      `SELECT id, meta_lead_id, page_id, form_id, ad_id, adset_id, campaign_id, promoted_lead_id
       FROM crm_meta_lead_inbox
       WHERE id = $1
       FOR UPDATE`,
      [inboxId]
    );
    const inbox = inboxResult.rows[0];
    if (!inbox) {
      await client.query("ROLLBACK");
      return { status: "not_found" as const };
    }

    if (inbox.promoted_lead_id) {
      await client.query("COMMIT");
      return { status: "existing" as const, leadId: inbox.promoted_lead_id };
    }

    const existingLeadId = await findExistingNativeLead(client, inbox.meta_lead_id);
    if (existingLeadId) {
      await client.query(
        `UPDATE crm_meta_lead_inbox
         SET status = 'promoted', promoted_lead_id = $2, missing_fields = '[]'::jsonb, updated_at = now()
         WHERE id = $1`,
        [inbox.id, existingLeadId]
      );
      await client.query("COMMIT");
      return { status: "existing" as const, leadId: existingLeadId };
    }

    const score = scoreLead(scoringInput(input));
    const priority = priorityFromScore(score);
    const nextAction = nextActionForLead(scoringInput(input));

    const leadResult = await client.query<{ id: string }>(
      `INSERT INTO crm_leads (
         status, priority, score, nombre, email, telefono, tipo_cliente, tipo_propiedad,
         zona, intervencion, tiene_fotos, tiene_proyecto, plazo, presupuesto, mensaje,
         source, utm_source, consent_privacy, consent_marketing, next_action,
         lead_kind, meta_consent, meta_consent_source, meta_lead_id, meta_page_id,
         meta_form_id, meta_ad_id, meta_adset_id, meta_campaign_id
       ) VALUES (
         'new', $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13, $14,
         'meta_lead_ads', 'meta', true, $15, $16,
         'customer', false, 'none', $17, $18,
         $19, $20, $21, $22
       ) RETURNING id`,
      [
        priority,
        score,
        input.nombre.trim(),
        input.email.trim().toLowerCase(),
        input.telefono.trim(),
        input.tipoCliente,
        input.tipoPropiedad,
        input.zona?.trim() || null,
        input.intervencion,
        input.tieneFotos,
        input.tieneProyecto,
        input.plazo,
        input.presupuesto?.trim() || null,
        input.mensaje?.trim() || null,
        input.consentMarketing === true,
        nextAction,
        inbox.meta_lead_id,
        inbox.page_id,
        inbox.form_id,
        inbox.ad_id,
        inbox.adset_id,
        inbox.campaign_id,
      ]
    );
    const leadId = leadResult.rows[0].id;

    await client.query(
      `INSERT INTO crm_activities (lead_id, created_by, type, title, notes)
       VALUES ($1, $2, 'automation', 'Lead Meta importado al CRM', $3)`,
      [leadId, userId, `Meta lead_id: ${inbox.meta_lead_id}`]
    );
    await client.query(
      `UPDATE crm_meta_lead_inbox
       SET status = 'promoted', promoted_lead_id = $2,
           mapped_data = mapped_data || $3::jsonb,
           missing_fields = '[]'::jsonb, updated_at = now()
       WHERE id = $1`,
      [inbox.id, leadId, JSON.stringify({
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipoCliente: input.tipoCliente,
        tipoPropiedad: input.tipoPropiedad,
        intervencion: input.intervencion,
        tieneFotos: input.tieneFotos,
        tieneProyecto: input.tieneProyecto,
        plazo: input.plazo,
      })]
    );

    await client.query("COMMIT");
    return { status: "promoted" as const, leadId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listMetaLeadInbox(limit = 100) {
  const result = await pool.query(
    `SELECT id, meta_lead_id, page_id, form_id, ad_id, adset_id, campaign_id,
            meta_created_time, mapped_data, missing_fields, status, promoted_lead_id,
            last_error, created_at, updated_at
     FROM crm_meta_lead_inbox
     ORDER BY created_at DESC
     LIMIT $1`,
    [Math.max(1, Math.min(200, limit))]
  );
  return result.rows;
}
