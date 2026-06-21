export type LeadInput = {
  plazo?: string;
  intervencion?: string;
  tipo_propiedad?: string;
  tiene_fotos?: string;
  tiene_proyecto?: string;
  presupuesto?: string | null;
  source?: string | null;
  utm_source?: string | null;
};

export function scoreLead(lead: LeadInput) {
  let score = 30;

  if (lead.plazo === "urgente") score += 25;
  if (lead.intervencion === "reforma-integral") score += 15;
  if (lead.tipo_propiedad === "villa" || lead.tipo_propiedad === "local-comercial") score += 10;
  if (lead.tiene_fotos === "si") score += 10;
  if (lead.tiene_proyecto === "si" || lead.tiene_proyecto === "en-proceso") score += 10;
  if (lead.presupuesto) score += 10;
  if (lead.utm_source || lead.source?.includes("landing")) score += 5;

  return Math.min(score, 100);
}

export function priorityFromScore(score: number) {
  if (score >= 75) return "alta";
  if (score >= 55) return "media";
  return "baja";
}

export function nextActionForLead(lead: LeadInput) {
  if (lead.plazo === "urgente") return "Contactar por WhatsApp hoy y confirmar necesidad real.";
  if (lead.tiene_fotos !== "si") return "Pedir fotos, vídeo o planos antes de preparar valoración.";
  if (lead.tiene_proyecto === "no") return "Aclarar si necesita visita previa o apoyo técnico.";
  if (!lead.presupuesto) return "Preguntar si tiene una referencia de presupuesto orientativo.";
  return "Preparar primera valoración y proponer siguiente paso.";
}

export function initialStatusForLead(lead: LeadInput) {
  if (lead.tiene_fotos !== "si") return "first_contact";
  if (lead.tiene_proyecto === "si" || lead.tiene_proyecto === "en-proceso") return "visit_review";
  return "new";
}
