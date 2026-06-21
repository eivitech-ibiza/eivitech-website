import type { LeadFormData } from "@/components/LeadQualificationForm";

const CRM_ENDPOINT = "https://ibiza-project-accelerator-production.up.railway.app";

export type CrmLeadPayload = LeadFormData & {
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

  return response.json();
}
