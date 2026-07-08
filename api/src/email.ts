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

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const notificationTo = () => splitEmails(process.env.LEAD_NOTIFICATION_TO || "info@eivitech.com");
const notificationCc = () => splitEmails(process.env.LEAD_NOTIFICATION_CC || "info@lucianonovello.com");
const notificationFrom = () => process.env.LEAD_NOTIFICATION_FROM || "Eivitech <noreply@eivitech.com>";

function splitEmails(value: string) {
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
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
  payload: Record<string, unknown>,
  status: "sent" | "failed" | "skipped",
  errorMessage: string | null = null
) {
  try {
    await query(
      `INSERT INTO crm_automation_events (lead_id, event_type, provider, payload, status, error_message)
       VALUES ($1, 'lead.email_notification', 'resend', $2, $3, $4)`,
      [leadId, JSON.stringify(payload), status, errorMessage]
    );
  } catch (error) {
    console.error("[email] failed to record email automation event", error);
  }
}

export async function notifyLeadByEmail(lead: LeadEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = notificationTo();
  const cc = notificationCc();
  const from = notificationFrom();
  const subject = `Nuova richiesta Eivitech — ${lead.nombre || "senza nome"}`;
  const text = formatLeadEmailText(lead);
  const payload = { to, cc, from, subject, leadId: lead.leadId };

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY missing: lead notification skipped");
    await recordEmailAutomationEvent(lead.leadId, payload, "skipped", "RESEND_API_KEY missing");
    return;
  }

  if (to.length === 0) {
    console.warn("[email] LEAD_NOTIFICATION_TO is empty: lead notification skipped");
    await recordEmailAutomationEvent(lead.leadId, payload, "skipped", "LEAD_NOTIFICATION_TO empty");
    return;
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        cc,
        subject,
        text,
        reply_to: lead.email,
      }),
    });

    const responseText = await response.text().catch(() => "");

    if (!response.ok) {
      throw new Error(`Resend HTTP ${response.status}: ${responseText}`);
    }

    await recordEmailAutomationEvent(lead.leadId, { ...payload, response: responseText }, "sent");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email notification error";
    console.error("[email] failed to send lead notification", message);
    await recordEmailAutomationEvent(lead.leadId, payload, "failed", message);
  }
}
