import { query } from "./db.js";

type LeadEmailInput = {
  leadId: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoCliente: string;
  tipoPropiedad: string;
  zona?: string | null;
  intervencion: string;
  tieneFotos: string;
  tieneProyecto: string;
  plazo: string;
  presupuesto?: string | null;
  mensaje?: string | null;
  source?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  timestamp?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  score?: number;
  priority?: string;
};

type ResendChannelKey = "owner" | "luciano";

type ResendChannel = {
  key: ResendChannelKey;
  apiKey?: string;
  from: string;
  to: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function resendChannels(): ResendChannel[] {
  const fallbackFrom = process.env.LEAD_NOTIFICATION_FROM || "Eivitech Website <website@notifications.eivitech.com>";

  return [
    {
      key: "owner",
      apiKey: process.env.RESEND_OWNER_API_KEY || process.env.RESEND_API_KEY,
      from: process.env.RESEND_OWNER_FROM || fallbackFrom,
      to: process.env.RESEND_OWNER_TO || "info@eivitech.com",
    },
    {
      key: "luciano",
      apiKey: process.env.RESEND_LUCIANO_API_KEY,
      from: process.env.RESEND_LUCIANO_FROM || fallbackFrom,
      to: process.env.RESEND_LUCIANO_TO || "lncoachmrc@gmail.com",
    },
  ];
}

function safe(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

function labelTipoRichiesta(lead: LeadEmailInput) {
  const message = lead.mensaje || "";
  if (message.includes("[PARTNER_COLLABORATOR_APPLICATION]")) return "Collaboratore professionale";
  if ((lead.source || "").includes("partner")) return "Collaboratore professionale";
  return "Potenziale cliente";
}

function formatLeadEmailText(lead: LeadEmailInput) {
  return `Nuova richiesta ricevuta dal sito Eivitech.

Tipo richiesta: ${labelTipoRichiesta(lead)}
Lead ID: ${lead.leadId}

Nome: ${safe(lead.nombre)}
Email: ${safe(lead.email)}
Telefono / WhatsApp: ${safe(lead.telefono)}
Zona: ${safe(lead.zona)}
Tipo cliente: ${safe(lead.tipoCliente)}
Tipo proprietà: ${safe(lead.tipoPropiedad)}
Intervento: ${safe(lead.intervencion)}
Foto/video: ${safe(lead.tieneFotos)}
Progetto tecnico: ${safe(lead.tieneProyecto)}
Tempistica: ${safe(lead.plazo)}
Budget: ${safe(lead.presupuesto)}

Messaggio:
${safe(lead.mensaje)}

Score CRM: ${safe(lead.score)}
Priorità CRM: ${safe(lead.priority)}

Sorgente: ${safe(lead.source)}
Landing page: ${safe(lead.landing_page)}
Referrer: ${safe(lead.referrer)}
UTM source: ${safe(lead.utm_source)}
UTM medium: ${safe(lead.utm_medium)}
UTM campaign: ${safe(lead.utm_campaign)}
Data invio: ${safe(lead.timestamp || new Date().toISOString())}`;
}

async function recordEmailAutomationEvent(
  leadId: string,
  eventType: string,
  payload: Record<string, unknown>,
  status: "sent" | "failed" | "skipped",
  errorMessage: string | null = null
) {
  try {
    await query(
      `INSERT INTO crm_automation_events (lead_id, event_type, provider, payload, status, error_message)
       VALUES ($1, $2, 'resend', $3, $4, $5)`,
      [leadId, eventType, JSON.stringify(payload), status, errorMessage]
    );
  } catch (error) {
    console.error("[email] failed to record email automation event", error);
  }
}

async function upsertNotification(
  leadId: string,
  channel: ResendChannel,
  status: "pending" | "sent" | "failed" | "skipped",
  details: {
    resendEmailId?: string | null;
    errorMessage?: string | null;
    payload?: Record<string, unknown>;
  } = {}
) {
  const eventAt = new Date().toISOString();

  try {
    await query(
      `INSERT INTO crm_email_notifications (
         lead_id, account_key, recipient, from_address, resend_email_id, status,
         sent_at, last_event_at, error_message, payload
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         CASE WHEN $6 = 'sent' THEN $7::timestamptz ELSE NULL END,
         $7::timestamptz, $8, $9::jsonb
       )
       ON CONFLICT (lead_id, account_key)
       DO UPDATE SET
         recipient = EXCLUDED.recipient,
         from_address = EXCLUDED.from_address,
         resend_email_id = COALESCE(EXCLUDED.resend_email_id, crm_email_notifications.resend_email_id),
         status = EXCLUDED.status,
         sent_at = CASE
           WHEN EXCLUDED.status = 'sent' THEN COALESCE(crm_email_notifications.sent_at, EXCLUDED.last_event_at)
           ELSE crm_email_notifications.sent_at
         END,
         last_event_at = EXCLUDED.last_event_at,
         error_message = EXCLUDED.error_message,
         payload = crm_email_notifications.payload || EXCLUDED.payload,
         updated_at = now()`,
      [
        leadId,
        channel.key,
        channel.to,
        channel.from,
        details.resendEmailId || null,
        status,
        eventAt,
        details.errorMessage || null,
        JSON.stringify(details.payload || {}),
      ]
    );
  } catch (error) {
    console.error(`[email] failed to persist ${channel.key} notification state`, error);
  }
}

async function sendLeadNotification(channel: ResendChannel, lead: LeadEmailInput) {
  const requestType = labelTipoRichiesta(lead);
  const subject = `Nuova richiesta Eivitech — ${requestType} — ${lead.nombre || "senza nome"}`;
  const text = formatLeadEmailText(lead);
  const payloadSummary = {
    accountKey: channel.key,
    to: channel.to,
    from: channel.from,
    subject,
    leadId: lead.leadId,
  };

  if (!channel.apiKey) {
    const variableName = channel.key === "owner" ? "RESEND_OWNER_API_KEY" : "RESEND_LUCIANO_API_KEY";
    const message = `${variableName} missing`;
    console.warn(`[email] ${message}: notification skipped`);

    await upsertNotification(lead.leadId, channel, "skipped", {
      errorMessage: message,
      payload: payloadSummary,
    });

    await recordEmailAutomationEvent(
      lead.leadId,
      `lead.email_notification.${channel.key}`,
      payloadSummary,
      "skipped",
      message
    );
    return;
  }

  await upsertNotification(lead.leadId, channel, "pending", { payload: payloadSummary });

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${channel.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `eivitech-lead-${lead.leadId}-${channel.key}`,
      },
      body: JSON.stringify({
        from: channel.from,
        to: [channel.to],
        subject,
        text,
        reply_to: lead.email,
        tags: [
          { name: "lead_id", value: lead.leadId },
          { name: "account", value: channel.key },
          { name: "request_type", value: requestType === "Collaboratore professionale" ? "partner" : "client" },
        ],
      }),
    });

    const responseText = await response.text().catch(() => "");
    let responseBody: { id?: string } = {};

    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseBody = {};
    }

    if (!response.ok) {
      throw new Error(`Resend HTTP ${response.status}: ${responseText}`);
    }

    if (!responseBody.id) {
      throw new Error(`Resend response missing email id: ${responseText}`);
    }

    await upsertNotification(lead.leadId, channel, "sent", {
      resendEmailId: responseBody.id,
      payload: { ...payloadSummary, resendEmailId: responseBody.id },
    });

    await recordEmailAutomationEvent(
      lead.leadId,
      `lead.email_notification.${channel.key}`,
      { ...payloadSummary, resendEmailId: responseBody.id },
      "sent"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email notification error";
    console.error(`[email] failed to send ${channel.key} lead notification`, message);

    await upsertNotification(lead.leadId, channel, "failed", {
      errorMessage: message,
      payload: payloadSummary,
    });

    await recordEmailAutomationEvent(
      lead.leadId,
      `lead.email_notification.${channel.key}`,
      payloadSummary,
      "failed",
      message
    );
  }
}

export async function notifyLeadByEmail(lead: LeadEmailInput) {
  await Promise.all(resendChannels().map((channel) => sendLeadNotification(channel, lead)));
}
