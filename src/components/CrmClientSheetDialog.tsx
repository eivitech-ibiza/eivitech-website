import { useEffect, useState } from "react";
import { FileDown, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchCrmLeadDetails, type CrmLeadDetailsResponse } from "@/lib/crm";
import { tr } from "@/lib/i18n";

type Props = {
  leadId: string | null;
  onClose: () => void;
  getToken: () => Promise<string | null>;
};

const STATUS: Record<string, string> = {
  new: "Richiesta", first_contact: "Primo contatto", visit_review: "Sopralluogo",
  proposal: "Preventivo", follow_up: "Follow-up", won: "Concluso",
  lost: "Fallito", review_portfolio: "Portfolio / riserva",
};
const SERVICE: Record<string, string> = {
  "reforma-integral": "Ristrutturazione completa", bano: "Bagno",
  cocina: "Cucina", instalaciones: "Impianti", exterior: "Esterni",
  "local-comercial": "Locale commerciale", otro: "Altro",
};
const ACTION: Record<string, string> = {
  "first-contact": "Primo contatto", qualify: "Qualifica cliente",
  "high-priority": "Alta priorità", visit: "Sopralluogo", proposal: "Preventivo",
  "follow-up": "Follow-up", won: "Concluso", lost: "Fallito",
  "partner-contact": "Primo contatto partner", "partner-evaluate": "Valutazione partner",
  "partner-approved": "Partner approvato", "partner-reserve": "Partner riserva",
  "partner-rejected": "Partner scartato",
};

function display(value?: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  return String(value).replaceAll("-", " ");
}
function dateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0 border-b border-[#e8e1d9] pb-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#916442]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-[#2b2926]">{display(value)}</dd>
    </div>
  );
}

export function CrmClientSheetDialog({ leadId, onClose, getToken }: Props) {
  const [data, setData] = useState<CrmLeadDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(leadId);

  useEffect(() => {
    if (!open || !leadId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setData(null);
    setError(null);

    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Missing Clerk token");
        const details = await fetchCrmLeadDetails(token, leadId);
        if (!cancelled) setData(details);
      } catch {
        if (!cancelled) setError(tr(
          "No se puede crear la ficha del cliente. Inténtalo de nuevo.",
          "Non è stato possibile creare la scheda cliente. Riprova.",
          "Could not create the client record. Please retry.",
          "Het klantdossier kon niet worden opgesteld. Probeer het opnieuw.",
        ));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [leadId, open, getToken]);

  const lead = data?.lead;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent data-client-sheet-dialog className="max-h-[92vh] w-[min(95vw,970px)] max-w-none overflow-y-auto bg-white p-4 sm:p-7">
        <DialogHeader className="eivitech-print-hide pr-6">
          <DialogTitle className="font-display text-2xl text-[#2b2926]">
            {tr("Ficha operativa del cliente", "Scheda operativa cliente", "Client record", "Operationeel klantdossier")}
          </DialogTitle>
          <DialogDescription>
            {tr(
              "Comprueba el contenido y utiliza Imprimir / Guardar PDF para conservar una copia.",
              "Controlla i dati e usa Stampa / Salva PDF per archiviare il documento.",
              "Review the data and use Print / Save as PDF to archive this record.",
              "Controleer de gegevens en gebruik Afdrukken / Opslaan als PDF.",
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="py-16 text-center text-sm text-muted-foreground">
          {tr("Preparando la ficha…", "Preparazione scheda…", "Preparing record…", "Dossier voorbereiden…")}
        </div>}
        {error && <p role="alert" className="rounded-sm border border-destructive/40 p-4 text-sm text-destructive">{error}</p>}

        {lead && data && (
          <>
            <div className="eivitech-print-hide flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-sm bg-[#ad583a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                <Printer size={16} />
                {tr("Imprimir / Guardar PDF", "Stampa / Salva PDF", "Print / Save PDF", "Afdrukken / PDF opslaan")}
              </button>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <FileDown size={14} /> {tr("A4", "Formato A4", "A4 format", "A4-formaat")}
              </span>
            </div>

            <article id="eivitech-print-sheet" className="mx-auto w-full max-w-[820px] bg-white p-5 text-[#2b2926] sm:p-8">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#b7874e] pb-5">
                <div>
                  <img src="/media/brand/eivitech-logo.svg" alt="Eivitech" className="h-auto w-[210px] max-w-full" />
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#916442]">
                    Eivitech Plus SL · Ibiza
                  </p>
                </div>
                <div className="text-right text-xs text-[#77716c]">
                  <p className="font-semibold uppercase tracking-widest text-[#916442]">
                    {tr("Documento interno", "Documento interno", "Internal document", "Intern document")}
                  </p>
                  <p className="mt-2">{dateTime(new Date().toISOString())}</p>
                  <p className="mt-1">CRM ID: {lead.id.slice(0, 8)}</p>
                </div>
              </header>

              <section className="eivitech-print-section mt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#916442]">
                      {tr("Ficha de cliente", "Scheda cliente", "Client profile", "Klantprofiel")}
                    </p>
                    <h2 className="mt-1 font-display text-3xl">{lead.nombre}</h2>
                  </div>
                  <div className="rounded-sm border border-[#e8d8c5] bg-[#f8f5f0] px-4 py-2 text-sm font-medium">
                    {STATUS[lead.status] || display(lead.status)} · {display(lead.priority)} · {lead.score}/100
                  </div>
                </div>

                <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <Field label="Email" value={lead.email} />
                  <Field label={tr("Teléfono", "Telefono", "Phone", "Telefoon")} value={lead.telefono} />
                  <Field label={tr("Zona", "Zona", "Area", "Regio")} value={lead.zona} />
                  <Field label={tr("Fecha de solicitud", "Data richiesta", "Request date", "Aanvraagdatum")} value={dateTime(lead.created_at)} />
                  <Field label="Authority" value={lead.tipo_cliente} />
                  <Field label={tr("Propiedad", "Proprietà", "Property", "Pand")} value={lead.tipo_propiedad} />
                  <Field label={tr("Intervención", "Intervento", "Work requested", "Gevraagde werkzaamheden")} value={SERVICE[lead.intervencion] || lead.intervencion} />
                  <Field label="Timing" value={lead.plazo} />
                  <Field label="Budget" value={lead.presupuesto} />
                  <Field label={tr("Fotos", "Foto", "Photos", "Foto's")} value={lead.tiene_fotos} />
                  <Field label={tr("Proyecto", "Progetto", "Project", "Project")} value={lead.tiene_proyecto} />
                  <Field label={tr("Fuente", "Provenienza", "Source", "Bron")} value={lead.source} />
                </dl>
                {lead.mensaje && (
                  <div className="mt-5">
                    <h3 className="text-sm font-bold text-[#916442]">{tr("Solicitud / notas iniciales", "Richiesta / note iniziali", "Request / initial notes", "Aanvraag / eerste notities")}</h3>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{lead.mensaje}</p>
                  </div>
                )}
              </section>

              <section className="eivitech-print-section mt-7 border-t border-[#e8e1d9] pt-5">
                <h3 className="font-display text-xl">
                  {tr("Estado del funnel y próximos pasos", "Stato del funnel e prossime azioni", "Pipeline and next steps", "Funnel en vervolgstappen")}
                </h3>
                <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <Field label={tr("Estado", "Stato", "Status", "Status")} value={STATUS[lead.status] || lead.status} />
                  <Field label={tr("Cualificación", "Qualifica", "Qualification", "Kwalificatie")} value={lead.qualification_outcome} />
                  <Field label={tr("Fecha de cualificación", "Data qualifica", "Qualified on", "Gekwalificeerd op")} value={lead.qualified_at ? dateTime(lead.qualified_at) : null} />
                  <Field label={tr("Visita", "Sopralluogo", "Visit", "Bezoek")} value={lead.visit_confirmed_at ? dateTime(lead.visit_confirmed_at) : null} />
                  <Field label={tr("Presupuesto enviado", "Preventivo inviato", "Proposal sent", "Offerte verzonden")} value={lead.proposal_sent_at ? dateTime(lead.proposal_sent_at) : null} />
                  <Field label={tr("Cierre", "Chiusura", "Closed", "Afgesloten")} value={lead.deal_closed_at ? dateTime(lead.deal_closed_at) : null} />
                  <Field label={tr("Siguiente seguimiento", "Prossimo follow-up", "Next follow-up", "Volgende opvolging")} value={lead.next_follow_up_at ? dateTime(lead.next_follow_up_at) : null} />
                </dl>
                {lead.next_action && (
                  <p className="mt-4 rounded-sm bg-[#f8f5f0] p-3 text-sm">
                    <strong>{tr("Próxima acción", "Prossima azione", "Next action", "Volgende actie")}:</strong> {lead.next_action}
                  </p>
                )}
              </section>

              <section className="mt-7 border-t border-[#e8e1d9] pt-5">
                <h3 className="font-display text-xl">
                  {tr("Acciones registradas", "Azioni registrate", "Recorded workflow actions", "Geregistreerde acties")}
                </h3>
                {data.outcomes.length === 0 ? (
                  <p className="mt-3 text-sm text-[#77716c]">{tr("Ninguna acción registrada.", "Nessuna azione registrata.", "No recorded actions.", "Geen geregistreerde acties.")}</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {data.outcomes.map((outcome) => (
                      <div className="eivitech-print-section rounded-sm border-l-2 border-[#b7874e] pl-3" key={outcome.id}>
                        <div className="flex flex-wrap justify-between gap-2 text-sm">
                          <strong>{ACTION[outcome.action_key] || display(outcome.action_key)}</strong>
                          <time className="text-xs text-[#77716c]">{dateTime(outcome.occurred_at)}</time>
                        </div>
                        {outcome.outcome && <p className="mt-1 text-xs">{tr("Resultado", "Esito", "Outcome", "Resultaat")}: {outcome.outcome}</p>}
                        {(outcome.metadata?.budget || outcome.metadata?.amount) && (
                          <p className="mt-1 text-xs text-[#77716c]">
                            {display(outcome.metadata.budget || outcome.metadata.amount)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-7 border-t border-[#e8e1d9] pt-5">
                <h3 className="font-display text-xl">
                  {tr("Registro completo de actividades", "Registro completo attività", "Full activity log", "Volledig activiteitenlogboek")}
                </h3>
                {data.activities.length === 0 ? (
                  <p className="mt-3 text-sm text-[#77716c]">{tr("Ninguna actividad registrada.", "Nessuna attività registrata.", "No recorded activities.", "Geen activiteiten geregistreerd.")}</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {data.activities.map((activity) => (
                      <div className="eivitech-print-section border-b border-[#eee7df] pb-3" key={activity.id}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <strong className="text-sm">{activity.title}</strong>
                          <time className="text-xs text-[#77716c]">{dateTime(activity.created_at)}</time>
                        </div>
                        {activity.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{activity.notes}</p>}
                        {activity.due_at && <p className="mt-1 text-xs text-[#916442]">
                          {tr("Vencimiento", "Scadenza", "Due", "Vervaldatum")}: {dateTime(activity.due_at)}
                        </p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <footer className="mt-9 border-t-2 border-[#b7874e] pt-4 text-xs leading-relaxed text-[#77716c]">
                {tr(
                  "Documento operativo confidencial de Eivitech. Los datos reflejan el estado del CRM en la fecha de generación.",
                  "Documento operativo riservato Eivitech. I dati riflettono lo stato del CRM al momento della generazione.",
                  "Confidential Eivitech working document. Data reflects CRM records at the time of generation.",
                  "Vertrouwelijk Eivitech-werkdocument. De gegevens weerspiegelen het CRM op het moment van genereren.",
                )}
              </footer>
            </article>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
