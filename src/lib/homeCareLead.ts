import type { LeadFormData } from "@/components/LeadQualificationForm";
import type { HomeCarePlanKey } from "@/data/homeCare365";

export const HOME_CARE_MESSAGE_TAG = "[HOME_CARE_365]";

export type HomeCareFormData = {
  nombre: string;
  email: string;
  telefono: string;
  tipoCliente: "propietario" | "agencia" | "empresa" | "otro";
  tipoPropiedad: "villa" | "apartamento" | "casa" | "otro";
  zona?: string;
  superficie: "lt100" | "100-200" | "200-400" | "gt400";
  banos: "1" | "2" | "3" | "4" | "5+";
  climatizadores: "0" | "1-2" | "3-5" | "6+";
  usoAnual: "lt1" | "1-3" | "4-6" | "gt6";
  plan: HomeCarePlanKey | "sin-decidir";
  instalaciones: string[];
  mensaje?: string;
  consentimiento: true;
  marketingConsent?: boolean;
};

// Team-facing labels stay in Spanish, like the rest of the CRM.
const SIZE_LABELS: Record<HomeCareFormData["superficie"], string> = {
  lt100: "<100 m²",
  "100-200": "100–200 m²",
  "200-400": "200–400 m²",
  gt400: ">400 m²",
};
const USAGE_LABELS: Record<HomeCareFormData["usoAnual"], string> = {
  lt1: "<1 mes/año",
  "1-3": "1–3 meses/año",
  "4-6": "4–6 meses/año",
  gt6: ">6 meses/año",
};
const PLAN_LABELS: Record<HomeCareFormData["plan"], string> = {
  essential: "Essential",
  care: "Care",
  premium: "Premium",
  "sin-decidir": "Sin decidir",
};
const SYSTEM_LABELS: Record<string, string> = {
  osmosis: "Ósmosis/filtros de agua",
  bombas: "Bombas/grupo de presión",
  ventilacion: "Ventilación mecánica",
  aerotermia: "Aerotermia/solar térmica",
};

export const MAX_LEAD_MESSAGE_LENGTH = 1500;

/**
 * Maps the Home Care form onto the existing public lead contract so the
 * current API, CRM and notifications keep working without a database change.
 * The business line is identified by `source: "home-care-365"`; the property
 * profile travels as a structured first line in `mensaje`.
 */
export function homeCareLeadFields(data: HomeCareFormData): LeadFormData {
  const systems = data.instalaciones
    .map((key) => SYSTEM_LABELS[key])
    .filter(Boolean)
    .join(", ");

  const summary = [
    HOME_CARE_MESSAGE_TAG,
    `Plan: ${PLAN_LABELS[data.plan]}`,
    `Superficie: ${SIZE_LABELS[data.superficie]}`,
    `Baños: ${data.banos}`,
    `Climatizadores: ${data.climatizadores}`,
    `Uso: ${USAGE_LABELS[data.usoAnual]}`,
    `Instalaciones: ${systems || "ninguna indicada"}`,
  ].join(" · ");

  const note = data.mensaje?.trim();
  const mensaje = (note ? `${summary}\n\n${note}` : summary).slice(0, MAX_LEAD_MESSAGE_LENGTH);

  return {
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    tipoCliente: data.tipoCliente,
    tipoPropiedad: data.tipoPropiedad,
    zona: data.zona || "",
    intervencion: "otro",
    tieneFotos: "no",
    tieneProyecto: "no",
    plazo: "sin-fecha",
    presupuesto: "",
    mensaje,
    consentimiento: true,
    marketingConsent: Boolean(data.marketingConsent),
  };
}
