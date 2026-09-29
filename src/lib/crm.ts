import type { LeadFormData, PartnerFormData } from "@/components/LeadQualificationForm";

export const CRM_ENDPOINT = "https://ibiza-project-accelerator-production.up.railway.app";

export type MetaSubmissionContext = {
  submission_id?: string;
  lead_kind?: "customer" | "partner";
  meta_consent?: boolean;
  meta_consent_source?: "cookie_banner" | "none";
  meta_consent_at?: string;
  meta_consent_version?: number;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
};

export type CrmLeadResponse = {
  ok: boolean;
  duplicate?: boolean;
  leadId: string;
  submissionId?: string | null;
  eventId?: string | null;
  score: number;
  priority: string;
  nextAction?: string | null;
  metaConsentRevocationToken?: string | null;
};

export type CrmLeadPayload = LeadFormData & MetaSubmissionContext & {
  source: string;
  landing_page?: string;
  referrer?: string;
  timestamp?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ts?: string;
};

export type CrmPartnerPayload = PartnerFormData & MetaSubmissionContext & {
  source: string;
  landing_page?: string;
  referrer?: string;
  timestamp?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ts?: string;
};

export type CrmLeadUpdatePayload = {
  status?: "new" | "first_contact" | "visit_review" | "proposal" | "follow_up" | "won" | "lost" | "review_portfolio";
  priority?: "alta" | "media" | "baja";
  next_action?: string | null;
  next_follow_up_at?: string | null;
};

export type CrmActivityPayload = {
  type?: "note" | "call" | "whatsapp" | "email" | "visit" | "proposal" | "follow_up" | "status_change" | "automation";
  title: string;
  notes?: string;
  due_at?: string | null;
  completed_at?: string | null;
};

export type CrmWorkflowPayload = {
  action_key:
    | "first-contact"
    | "qualify"
    | "high-priority"
    | "visit"
    | "proposal"
    | "follow-up"
    | "won"
    | "lost"
    | "partner-contact"
    | "partner-evaluate"
    | "partner-approved"
    | "partner-reserve"
    | "partner-rejected";
  outcome?: string;
  next_action?: string | null;
  next_follow_up_at?: string | null;
  visit_date?: string | null;
  budget?: string;
  amount?: string;
  activity: {
    type: Exclude<NonNullable<CrmActivityPayload["type"]>, "automation">;
    title: string;
    notes?: string;
    due_at?: string | null;
  };
};

export type CrmWorkflowResponse = {
  status: "saved";
  lead: unknown;
  activity: unknown;
  milestone: string | null;
  milestoneInserted: boolean;
  metaQueued: boolean;
  metaEventId: string | null;
};

const STORAGE_KEY = "eivitech_leads";

export function saveLeadPreview(payload: CrmLeadPayload) {
  const lead = { ...payload, ts: new Date().toISOString() };

  try {
    const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    const leads = Array.isArray(existing) ? existing : [];
    leads.push(lead);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // Preview storage is non-critical. Production CRM must use a secure backend.
  }

  return lead;
}

export async function submitLeadToCrm(payload: CrmLeadPayload) {
  const response = await fetch(`${CRM_ENDPOINT}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "CRM submit failed");
    throw new Error(message || "CRM submit failed");
  }

  return response.json() as Promise<CrmLeadResponse>;
}

export function toPartnerLeadPayload(payload: CrmPartnerPayload): CrmLeadPayload {
  const partnerSummary = [
    "[PARTNER_COLLABORATOR_APPLICATION]",
    `Categoría: ${payload.categoria}`,
    `Empresa/marca: ${payload.empresa || "No indicado"}`,
    `Zona cubierta: ${payload.zona || "Ibiza"}`,
    `Experiencia: ${payload.experiencia}`,
    `Disponibilidad: ${payload.disponibilidad}`,
    `Web/portfolio: ${payload.website || "No indicado"}`,
    "",
    payload.mensaje || "Sin mensaje adicional.",
  ].join("\n");

  return {
    nombre: payload.nombre,
    email: payload.email,
    telefono: payload.telefono,
    tipoCliente: "empresa",
    tipoPropiedad: "otro",
    zona: payload.zona || "Ibiza",
    intervencion: "otro",
    tieneFotos: payload.website ? "si" : "no",
    tieneProyecto: "no",
    plazo: payload.disponibilidad === "inmediata" ? "urgente" : "sin-fecha",
    presupuesto: payload.empresa || payload.categoria,
    mensaje: partnerSummary,
    consentimiento: payload.consentimiento,
    marketingConsent: payload.marketingConsent ?? false,
    source: payload.source,
    landing_page: payload.landing_page,
    referrer: payload.referrer,
    timestamp: payload.timestamp,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
    utm_term: payload.utm_term,
    ts: payload.ts,
    submission_id: payload.submission_id,
    lead_kind: "partner",
    meta_consent: payload.meta_consent,
    meta_consent_source: payload.meta_consent_source,
    meta_consent_at: payload.meta_consent_at,
    meta_consent_version: payload.meta_consent_version,
    fbp: payload.fbp,
    fbc: payload.fbc,
    fbclid: payload.fbclid,
  };
}

export async function submitPartnerToCrm(payload: CrmPartnerPayload) {
  return submitLeadToCrm(toPartnerLeadPayload(payload));
}

export async function fetchCrmLeads(token: string) {
  const response = await fetch(`${CRM_ENDPOINT}/api/leads`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "CRM fetch failed");
    throw new Error(message || "CRM fetch failed");
  }

  return response.json() as Promise<{ leads: unknown[] }>;
}

export async function updateCrmLead(token: string, leadId: string, payload: CrmLeadUpdatePayload) {
  const response = await fetch(`${CRM_ENDPOINT}/api/leads/${leadId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "CRM update failed");
    throw new Error(message || "CRM update failed");
  }

  return response.json() as Promise<{ lead: unknown }>;
}

export async function addCrmLeadActivity(token: string, leadId: string, payload: CrmActivityPayload) {
  const response = await fetch(`${CRM_ENDPOINT}/api/leads/${leadId}/activities`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "CRM activity failed");
    throw new Error(message || "CRM activity failed");
  }

  return response.json() as Promise<{ activity: unknown }>;
}

export async function submitCrmWorkflow(token: string, leadId: string, payload: CrmWorkflowPayload) {
  const response = await fetch(`${CRM_ENDPOINT}/api/leads/${leadId}/workflow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "CRM workflow failed");
    throw new Error(message || "CRM workflow failed");
  }

  return response.json() as Promise<CrmWorkflowResponse>;
}
