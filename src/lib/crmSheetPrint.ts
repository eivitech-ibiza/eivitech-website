import type { CrmLeadDetails } from "./crm";

function text(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sì" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function escapeCrmHtml(value: unknown): string {
  return text(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] || character);
}

export function formatCrmDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text(value);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid",
  }).format(date);
}

const formFields: Array<[string, string]> = [
  ["nombre", "Nominativo"],
  ["email", "Email"],
  ["telefono", "Telefono"],
  ["tipo_cliente", "Tipologia di cliente"],
  ["tipo_propiedad", "Tipologia di proprietà"],
  ["zona", "Zona"],
  ["intervencion", "Intervento richiesto"],
  ["plazo", "Tempistiche"],
  ["presupuesto", "Budget iniziale"],
  ["tiene_fotos", "Foto disponibili"],
  ["tiene_proyecto", "Progetto disponibile"],
  ["mensaje", "Messaggio / dettagli iniziali"],
  ["source", "Origine del contatto"],
  ["created_at", "Data richiesta"],
];

const operationalFields: Array<[string, string]> = [
  ["status", "Fase attuale"],
  ["priority", "Priorità"],
  ["score", "Punteggio"],
  ["qualification_outcome", "Esito qualifica"],
  ["qualified_at", "Data qualifica"],
  ["visit_confirmed_at", "Data conferma sopralluogo"],
  ["proposal_sent_at", "Data invio preventivo"],
  ["deal_closed_at", "Data chiusura"],
  ["next_action", "Prossima azione"],
  ["next_follow_up_at", "Prossimo follow-up"],
];

function fieldRows(lead: Record<string, unknown>, fields: Array<[string, string]>) {
  return fields.map(([key, label]) => {
    const value = key.endsWith("_at") && lead[key] ? formatCrmDate(lead[key]) : lead[key];
    return `<div class="item"><dt>${escapeCrmHtml(label)}</dt><dd>${escapeCrmHtml(value)}</dd></div>`;
  }).join("");
}

function outcomeDetails(metadata: Record<string, unknown> | null) {
  if (!metadata) return "";
  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `<span class="metadata"><b>${escapeCrmHtml(key)}:</b> ${escapeCrmHtml(value)}</span>`)
    .join(" ");
}

export function buildCrmClientSheetHtml(details: CrmLeadDetails, logoUrl: string): string {
  const lead = details.lead || {};
  const name = escapeCrmHtml(lead.nombre);
  const title = `Scheda cliente - ${name}`;
  const generated = formatCrmDate(new Date().toISOString());

  const activities = details.activities.length
    ? details.activities.map((activity) => `
        <article class="history-entry">
          <div class="history-heading"><strong>${escapeCrmHtml(activity.title)}</strong><span>${escapeCrmHtml(formatCrmDate(activity.created_at))}</span></div>
          <p class="hint">${escapeCrmHtml(activity.type)}</p>
          ${activity.notes ? `<p class="notes">${escapeCrmHtml(activity.notes)}</p>` : ""}
          ${activity.due_at ? `<p class="hint">Scadenza: ${escapeCrmHtml(formatCrmDate(activity.due_at))}</p>` : ""}
        </article>`).join("")
    : '<p class="empty">Nessuna attività registrata.</p>';

  const outcomes = details.outcomes.length
    ? details.outcomes.map((outcome) => `
        <article class="history-entry">
          <div class="history-heading"><strong>${escapeCrmHtml(outcome.action_key)}</strong><span>${escapeCrmHtml(formatCrmDate(outcome.occurred_at))}</span></div>
          ${outcome.outcome ? `<p>Esito: ${escapeCrmHtml(outcome.outcome)}</p>` : ""}
          ${outcome.milestone_key ? `<p class="hint">Traguardo: ${escapeCrmHtml(outcome.milestone_key)}</p>` : ""}
          <div class="meta">${outcomeDetails(outcome.metadata)}</div>
        </article>`).join("")
    : '<p class="empty">Nessun esito strutturato registrato.</p>';

  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>
@page { size: A4; margin: 14mm 15mm; }
* { box-sizing: border-box; }
body { margin: 0; background: #f8f6f2; color: #302720; font: 12px/1.55 Arial, Helvetica, sans-serif; }
main { background: white; max-width: 900px; margin: 26px auto; padding: 35px; box-shadow: 0 2px 18px #0001; }
header { display: flex; justify-content: space-between; align-items: center; gap: 16px; border-bottom: 2px solid #b45b37; padding-bottom: 20px; }
header img { width: 190px; max-height: 72px; object-fit: contain; object-position: left; }
header .internal { color: #8c796e; font-size: 10px; letter-spacing: 1.8px; text-align: right; }
h1 { margin: 24px 0 0; font: 28px/1.3 Georgia, serif; }
h2 { margin: 27px 0 12px; color: #a94e2f; font: 19px/1.3 Georgia, serif; border-bottom: 1px solid #ddd5ce; padding-bottom: 6px; }
.subtitle { margin: 4px 0 20px; color: #73665d; }
dl.grid { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px 16px; }
.item { border: 1px solid #e8e0d8; border-radius: 4px; padding: 9px 11px; break-inside: avoid; min-width: 0; }
dt { color: #79685c; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px; }
dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; white-space: pre-wrap; }
.history-entry { break-inside: avoid; border-bottom: 1px solid #e9e2dc; padding: 10px 0; }
.history-heading { display: flex; justify-content: space-between; gap: 15px; }
.history-heading span, .hint, .empty { color: #74655d; font-size: 11px; }
.history-entry p { margin: 4px 0; }
.notes { white-space: pre-wrap; overflow-wrap: anywhere; }
.metadata { display: inline-block; padding-right: 10px; font-size: 11px; }
footer { border-top: 1px solid #ddd5ce; margin-top: 26px; padding-top: 9px; font-size: 10px; color: #80736b; display: flex; justify-content: space-between; gap: 10px; }
.toolbar { position: sticky; top: 0; margin: 0; padding: 13px; text-align: center; background: #31251f; color: white; }
.toolbar button { background: #b45b37; border: 0; color: white; padding: 10px 18px; cursor: pointer; font: inherit; }
@media print { body { background: white; } main { margin: 0; padding: 0; max-width: none; box-shadow: none; } .toolbar { display: none; } }
@media (max-width: 650px) { main { padding: 17px; margin: 0; } dl.grid { grid-template-columns: 1fr; } header img { width: 150px; } }
</style></head>
<body><div class="toolbar"><button type="button" onclick="window.print()">Stampa / Salva come PDF</button></div>
<main>
<header><img src="${escapeCrmHtml(logoUrl)}" alt="Eivitech instalaciones y reformas"><div class="internal">USO INTERNO<br>GENERATO: ${escapeCrmHtml(generated)}</div></header>
<h1>Scheda cliente</h1><p class="subtitle">${name} — ID CRM: ${escapeCrmHtml(lead.id)}</p>
<section><h2>Informazioni del cliente e della richiesta</h2><dl class="grid">${fieldRows(lead, formFields)}</dl></section>
<section><h2>Stato e gestione commerciale</h2><dl class="grid">${fieldRows(lead, operationalFields)}</dl></section>
<section><h2>Storico delle attività</h2>${activities}</section>
<section><h2>Esiti registrati nel funnel</h2>${outcomes}</section>
<footer><span>Eivitech — Documento operativo riservato</span><span>${escapeCrmHtml(generated)}</span></footer>
</main></body></html>`;
}

export function openCrmClientSheetPrint(details: CrmLeadDetails): boolean {
  // Called directly by a click once the authenticated details have loaded.
  const preview = window.open("", "_blank");
  if (!preview) return false;
  preview.opener = null;
  const logoUrl = new URL(`${import.meta.env.BASE_URL}media/brand/eivitech-logo.svg`, window.location.origin).href;
  preview.document.open();
  preview.document.write(buildCrmClientSheetHtml(details, logoUrl));
  preview.document.close();
  preview.focus();
  return true;
}
