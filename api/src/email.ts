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

type ResendChannelKey = "owner" | "luciano" | "requester";
type ResendMessageKind = "internal_notification" | "requester_confirmation";
type ConfirmationLanguage = "it" | "es" | "en" | "nl";

type ResendChannel = {
  key: ResendChannelKey;
  kind: ResendMessageKind;
  apiKey?: string;
  from: string;
  to: string;
  replyTo: string;
};

type ConfirmationCopy = {
  subjectClient: string;
  subjectPartner: string;
  greeting: (name: string) => string;
  introClient: string;
  introPartner: string;
  keepEmail: string;
  reference: string;
  submittedAt: string;
  summary: string;
  requestType: string;
  clientType: string;
  propertyType: string;
  area: string;
  intervention: string;
  timing: string;
  budget: string;
  message: string;
  contact: string;
  closing: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_SITE_URL = "https://www.eivitech.com";

function resendChannels(lead: LeadEmailInput): ResendChannel[] {
  const fallbackFrom = process.env.LEAD_NOTIFICATION_FROM || "Eivitech Website <website@notifications.eivitech.com>";
  const ownerApiKey = process.env.RESEND_OWNER_API_KEY || process.env.RESEND_API_KEY;
  const ownerFrom = process.env.RESEND_OWNER_FROM || fallbackFrom;
  const ownerTo = process.env.RESEND_OWNER_TO || "info@eivitech.com";

  return [
    {
      key: "owner",
      kind: "internal_notification",
      apiKey: ownerApiKey,
      from: ownerFrom,
      to: ownerTo,
      replyTo: lead.email,
    },
    {
      key: "luciano",
      kind: "internal_notification",
      apiKey: process.env.RESEND_LUCIANO_API_KEY,
      from: process.env.RESEND_LUCIANO_FROM || fallbackFrom,
      to: process.env.RESEND_LUCIANO_TO || "lncoachmrc@gmail.com",
      replyTo: lead.email,
    },
    {
      key: "requester",
      kind: "requester_confirmation",
      apiKey: ownerApiKey,
      from: process.env.RESEND_REQUESTER_FROM || ownerFrom,
      to: lead.email,
      replyTo: process.env.RESEND_REQUESTER_REPLY_TO || ownerTo,
    },
  ];
}

function safe(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

function humanize(value?: string | null) {
  if (!value) return "-";
  const normalized = value.replaceAll("-", " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}


const DUTCH_LEAD_VALUE_LABELS: Record<string, string> = {
  propietario: "Eigenaar",
  comprador: "Koper",
  inversor: "Investeerder",
  agencia: "Makelaar / bureau",
  empresa: "Bedrijf",
  otro: "Anders",
  villa: "Villa",
  apartamento: "Appartement",
  casa: "Woning",
  "local-comercial": "Bedrijfsruimte",
  "reforma-integral": "Volledige renovatie",
  bano: "Badkamer",
  cocina: "Keuken",
  instalaciones: "Installaties",
  exterior: "Buitenruimte",
  urgente: "Dringend",
  "1-3-meses": "1 tot 3 maanden",
  "3-6-meses": "3 tot 6 maanden",
  "sin-fecha": "Nog geen vaste datum",
};

function localizedLeadValue(value: string | null | undefined, language: ConfirmationLanguage) {
  if (!value) return "-";
  if (language === "nl") return DUTCH_LEAD_VALUE_LABELS[value] || humanize(value);
  return humanize(value);
}

function labelTipoRichiesta(lead: LeadEmailInput) {
  const message = lead.mensaje || "";
  if (message.includes("[PARTNER_COLLABORATOR_APPLICATION]")) return "Collaboratore professionale";
  if ((lead.source || "").includes("partner")) return "Collaboratore professionale";
  return "Potenziale cliente";
}

function isPartnerRequest(lead: LeadEmailInput) {
  return labelTipoRichiesta(lead) === "Collaboratore professionale";
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

function confirmationLanguage(lead: LeadEmailInput): ConfirmationLanguage {
  try {
    const url = new URL(lead.landing_page || DEFAULT_SITE_URL, DEFAULT_SITE_URL);
    const queryLanguage = url.searchParams.get("lang")?.toLowerCase();
    if (queryLanguage === "it" || queryLanguage === "es" || queryLanguage === "en" || queryLanguage === "nl") {
      return queryLanguage;
    }

    const firstSegment = url.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (firstSegment === "it" || firstSegment === "es" || firstSegment === "en" || firstSegment === "nl") {
      return firstSegment;
    }
  } catch {
    // Fall back to Italian when the landing page cannot be parsed.
  }

  return "it";
}

const confirmationCopy: Record<ConfirmationLanguage, ConfirmationCopy> = {
  it: {
    subjectClient: "Abbiamo ricevuto la tua richiesta — Eivitech",
    subjectPartner: "Abbiamo ricevuto la tua candidatura — Eivitech",
    greeting: (name) => `Ciao ${name},`,
    introClient: "abbiamo ricevuto correttamente la tua richiesta. Il team Eivitech esaminerà le informazioni e ti contatterà per valutare il prossimo passo.",
    introPartner: "abbiamo ricevuto correttamente la tua candidatura professionale. Il team Eivitech esaminerà le informazioni e ti contatterà se il profilo è coerente con le collaborazioni attive.",
    keepEmail: "Conserva questa email come conferma e riferimento della richiesta inviata.",
    reference: "Riferimento richiesta",
    submittedAt: "Data di invio",
    summary: "Riepilogo dei dati inviati",
    requestType: "Tipo di richiesta",
    clientType: "Profilo",
    propertyType: "Tipo di proprietà",
    area: "Zona",
    intervention: "Intervento",
    timing: "Tempistica",
    budget: "Budget",
    message: "Messaggio",
    contact: "Per integrare la richiesta con altre informazioni o documenti, puoi rispondere direttamente a questa email.",
    closing: "A presto,\nil team Eivitech",
  },
  es: {
    subjectClient: "Hemos recibido tu solicitud — Eivitech",
    subjectPartner: "Hemos recibido tu candidatura — Eivitech",
    greeting: (name) => `Hola ${name},`,
    introClient: "hemos recibido correctamente tu solicitud. El equipo de Eivitech revisará la información y se pondrá en contacto contigo para valorar el siguiente paso.",
    introPartner: "hemos recibido correctamente tu candidatura profesional. El equipo de Eivitech revisará la información y se pondrá en contacto contigo si el perfil encaja con las colaboraciones activas.",
    keepEmail: "Conserva este correo como confirmación y referencia de la solicitud enviada.",
    reference: "Referencia de la solicitud",
    submittedAt: "Fecha de envío",
    summary: "Resumen de los datos enviados",
    requestType: "Tipo de solicitud",
    clientType: "Perfil",
    propertyType: "Tipo de propiedad",
    area: "Zona",
    intervention: "Intervención",
    timing: "Plazo",
    budget: "Presupuesto",
    message: "Mensaje",
    contact: "Para añadir información o documentos, puedes responder directamente a este correo.",
    closing: "Hasta pronto,\nel equipo de Eivitech",
  },
  en: {
    subjectClient: "We received your request — Eivitech",
    subjectPartner: "We received your application — Eivitech",
    greeting: (name) => `Hello ${name},`,
    introClient: "we received your request successfully. The Eivitech team will review the information and contact you to assess the next step.",
    introPartner: "we received your professional application successfully. The Eivitech team will review the information and contact you if your profile matches our current collaboration needs.",
    keepEmail: "Keep this email as confirmation and a reference for your submitted request.",
    reference: "Request reference",
    submittedAt: "Submission date",
    summary: "Summary of the information submitted",
    requestType: "Request type",
    clientType: "Profile",
    propertyType: "Property type",
    area: "Area",
    intervention: "Requested work",
    timing: "Timing",
    budget: "Budget",
    message: "Message",
    contact: "To add information or documents, you can reply directly to this email.",
    closing: "Kind regards,\nthe Eivitech team",
  },
  nl: {
    subjectClient: "We hebben je aanvraag ontvangen — Eivitech",
    subjectPartner: "We hebben je aanmelding ontvangen — Eivitech",
    greeting: (name) => `Hallo ${name},`,
    introClient: "we hebben je aanvraag goed ontvangen. Het Eivitech-team bekijkt de informatie en neemt contact met je op om de volgende stap te bespreken.",
    introPartner: "we hebben je professionele aanmelding goed ontvangen. Het Eivitech-team bekijkt de informatie en neemt contact met je op als je profiel aansluit bij onze huidige samenwerkingen.",
    keepEmail: "Bewaar deze e-mail als bevestiging en referentie van je ingediende aanvraag.",
    reference: "Referentie van de aanvraag",
    submittedAt: "Datum van verzending",
    summary: "Overzicht van de verzonden gegevens",
    requestType: "Type aanvraag",
    clientType: "Profiel",
    propertyType: "Type vastgoed",
    area: "Regio",
    intervention: "Gewenste werkzaamheden",
    timing: "Planning",
    budget: "Budget",
    message: "Bericht",
    contact: "Je kunt rechtstreeks op deze e-mail antwoorden om informatie of documenten toe te voegen.",
    closing: "Met vriendelijke groet,\nhet Eivitech-team",
  },
};

function formatSubmissionDate(timestamp: string | null | undefined, language: ConfirmationLanguage) {
  const date = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(date.getTime())) return safe(timestamp);

  const locale = language === "es" ? "es-ES" : language === "en" ? "en-GB" : language === "nl" ? "nl-NL" : "it-IT";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(date);
}

function formatRequesterConfirmation(lead: LeadEmailInput) {
  const language = confirmationLanguage(lead);
  const copy = confirmationCopy[language];
  const partner = isPartnerRequest(lead);
  const subject = partner ? copy.subjectPartner : copy.subjectClient;
  const requestType = partner
    ? language === "es"
      ? "Colaborador profesional"
      : language === "en"
        ? "Professional collaborator"
        : language === "nl"
          ? "Professionele samenwerkingspartner"
          : "Collaboratore professionale"
    : language === "es"
      ? "Cliente potencial"
      : language === "en"
        ? "Potential client"
        : language === "nl"
          ? "Potentiële klant"
          : "Potenziale cliente";
  const siteUrl = process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  const text = `${copy.greeting(lead.nombre)}

${partner ? copy.introPartner : copy.introClient}

${copy.keepEmail}

${copy.reference}: ${lead.leadId}
${copy.submittedAt}: ${formatSubmissionDate(lead.timestamp, language)}

${copy.summary}

${copy.requestType}: ${requestType}
${copy.clientType}: ${localizedLeadValue(lead.tipoCliente, language)}
${copy.propertyType}: ${localizedLeadValue(lead.tipoPropiedad, language)}
${copy.area}: ${safe(lead.zona)}
${copy.intervention}: ${localizedLeadValue(lead.intervencion, language)}
${copy.timing}: ${localizedLeadValue(lead.plazo, language)}
${copy.budget}: ${safe(lead.presupuesto)}
${copy.message}: ${safe(lead.mensaje)}

${copy.contact}

${siteUrl}

${copy.closing}`;

  return { subject, text };
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

function apiKeyVariableName(channel: ResendChannel) {
  return channel.key === "luciano" ? "RESEND_LUCIANO_API_KEY" : "RESEND_OWNER_API_KEY";
}

async function sendLeadEmail(channel: ResendChannel, lead: LeadEmailInput) {
  const requestType = labelTipoRichiesta(lead);
  const confirmation = channel.kind === "requester_confirmation" ? formatRequesterConfirmation(lead) : null;
  const subject = confirmation?.subject || `Nuova richiesta Eivitech — ${requestType} — ${lead.nombre || "senza nome"}`;
  const text = confirmation?.text || formatLeadEmailText(lead);
  const eventType = channel.kind === "requester_confirmation"
    ? "lead.email_confirmation.requester"
    : `lead.email_notification.${channel.key}`;
  const payloadSummary = {
    accountKey: channel.key,
    kind: channel.kind,
    to: channel.to,
    from: channel.from,
    replyTo: channel.replyTo,
    subject,
    leadId: lead.leadId,
  };

  if (!channel.apiKey) {
    const variableName = apiKeyVariableName(channel);
    const message = `${variableName} missing`;
    console.warn(`[email] ${message}: ${channel.key} email skipped`);

    await upsertNotification(lead.leadId, channel, "skipped", {
      errorMessage: message,
      payload: payloadSummary,
    });

    await recordEmailAutomationEvent(lead.leadId, eventType, payloadSummary, "skipped", message);
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
        reply_to: channel.replyTo,
        tags: [
          { name: "lead_id", value: lead.leadId },
          { name: "account", value: channel.key },
          { name: "message_kind", value: channel.kind },
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
      eventType,
      { ...payloadSummary, resendEmailId: responseBody.id },
      "sent"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`[email] failed to send ${channel.key} email`, message);

    await upsertNotification(lead.leadId, channel, "failed", {
      errorMessage: message,
      payload: payloadSummary,
    });

    await recordEmailAutomationEvent(lead.leadId, eventType, payloadSummary, "failed", message);
  }
}

export async function notifyLeadByEmail(lead: LeadEmailInput) {
  await Promise.all(resendChannels(lead).map((channel) => sendLeadEmail(channel, lead)));
}
