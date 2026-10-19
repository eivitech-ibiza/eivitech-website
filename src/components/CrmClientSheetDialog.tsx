import { useState } from "react";
import { FileText, Printer } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { CrmLeadDetails } from "@/lib/crm";
import { formatCrmDate, openCrmClientSheetPrint } from "@/lib/crmSheetPrint";
import { tr } from "@/lib/i18n";

type Props = {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  details: CrmLeadDetails | null;
  loading: boolean;
  error: string | null;
};

function field(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sì" : "No";
  return String(value);
}

const initialFields: Array<[string, string]> = [
  ["email", "Email"],
  ["telefono", "Telefono"],
  ["tipo_cliente", "Tipologia cliente"],
  ["tipo_propiedad", "Proprietà"],
  ["zona", "Zona"],
  ["intervencion", "Intervento"],
  ["plazo", "Tempistiche"],
  ["presupuesto", "Budget"],
  ["tiene_fotos", "Foto disponibili"],
  ["tiene_proyecto", "Progetto disponibile"],
  ["mensaje", "Dettagli richiesta"],
];

const processFields: Array<[string, string]> = [
  ["status", "Fase"],
  ["priority", "Priorità"],
  ["score", "Score"],
  ["qualification_outcome", "Esito qualifica"],
  ["next_action", "Prossima azione"],
  ["next_follow_up_at", "Prossimo follow-up"],
];

function DetailGrid({ lead, fields }: { lead: Record<string, unknown>; fields: Array<[string, string]> }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <div key={key} className="min-w-0 rounded-sm border border-border bg-background px-3 py-2.5">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-foreground">
            {key.endsWith("_at") && lead[key] ? formatCrmDate(lead[key]) : field(lead[key])}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CrmClientSheetDialog({ open, onOpenChange, details, loading, error }: Props) {
  const [printError, setPrintError] = useState(false);
  const lead = details?.lead ?? {};

  function handlePrint() {
    if (!details) return;
    setPrintError(false);
    if (!openCrmClientSheetPrint(details)) setPrintError(true);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { setPrintError(false); onOpenChange(nextOpen); }}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-24px)] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 border-b border-border bg-card px-5 py-4 pr-12 sm:px-7">
          <div className="flex flex-wrap items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}media/brand/eivitech-logo.svg`} alt="Eivitech" className="h-11 w-auto max-w-[160px] object-contain" />
            <span className="ml-auto text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {tr("Uso interno", "Uso interno", "Internal use", "Intern gebruik")}
            </span>
          </div>
          <DialogTitle className="mt-3 font-display text-2xl">
            {tr("Ficha de cliente", "Scheda cliente", "Client record", "Klantdossier")}
            {lead.nombre ? ` · ${field(lead.nombre)}` : ""}
          </DialogTitle>
          <DialogDescription>
            {tr(
              "Datos y actividad registrados en el CRM Eivitech.",
              "Dati e attività effettivamente registrati nel CRM Eivitech.",
              "Data and activities stored in Eivitech CRM.",
              "Gegevens en activiteiten in Eivitech CRM.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          {loading && <p role="status" className="text-sm text-muted-foreground">{tr("Cargando ficha…", "Caricamento scheda…", "Loading client record…", "Klantdossier laden…")}</p>}
          {error && <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {details && (
            <>
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-xl"><FileText size={18} className="text-primary" />
                  {tr("Datos de contacto y solicitud", "Contatto e richiesta", "Contact and request", "Contact en aanvraag")}
                </h3>
                <DetailGrid lead={lead} fields={initialFields} />
              </section>
              <section>
                <h3 className="mb-3 font-display text-xl">{tr("Gestión comercial", "Gestione commerciale", "Commercial management", "Commerciële opvolging")}</h3>
                <DetailGrid lead={lead} fields={processFields} />
              </section>
              <section>
                <h3 className="mb-3 font-display text-xl">{tr("Historial de actividades", "Storico attività", "Activity history", "Activiteitengeschiedenis")} ({details.activities.length})</h3>
                {details.activities.length === 0
                  ? <p className="text-sm text-muted-foreground">{tr("Sin actividades registradas.", "Nessuna attività registrata.", "No recorded activities.", "Geen activiteiten geregistreerd.")}</p>
                  : <div className="space-y-2">
                      {details.activities.map((activity) => (
                        <article key={activity.id} className="rounded-sm border border-border bg-background p-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <strong className="text-sm">{activity.title}</strong>
                            <time className="text-xs text-muted-foreground">{formatCrmDate(activity.created_at)}</time>
                          </div>
                          {activity.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{activity.notes}</p>}
                          {activity.due_at && <p className="mt-2 text-xs text-primary">Follow-up: {formatCrmDate(activity.due_at)}</p>}
                        </article>
                      ))}
                    </div>}
              </section>
              <section>
                <h3 className="mb-3 font-display text-xl">{tr("Resultados registrados", "Esiti registrati", "Recorded outcomes", "Vastgelegde uitkomsten")} ({details.outcomes.length})</h3>
                {details.outcomes.length === 0
                  ? <p className="text-sm text-muted-foreground">{tr("Sin resultados guardados.", "Nessun esito registrato.", "No recorded outcomes.", "Geen uitkomsten opgeslagen.")}</p>
                  : <div className="space-y-2">
                      {details.outcomes.map((outcome) => (
                        <article key={outcome.id} className="rounded-sm border border-border bg-background p-3">
                          <div className="flex flex-wrap justify-between gap-2 text-sm">
                            <strong>{outcome.action_key}</strong>
                            <span className="text-xs text-muted-foreground">{formatCrmDate(outcome.occurred_at)}</span>
                          </div>
                          {outcome.outcome && <p className="mt-1 text-sm">{outcome.outcome}</p>}
                          {Object.entries(outcome.metadata ?? {}).filter(([, value]) => value !== null && value !== "").map(([key, value]) => (
                            <p key={key} className="mt-1 break-words text-xs text-muted-foreground">{key}: {field(value)}</p>
                          ))}
                        </article>
                      ))}
                    </div>}
              </section>
            </>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-wrap justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:px-7">
          {printError && <p role="alert" className="w-full text-xs text-destructive">{tr("Permite las ventanas emergentes para imprimir.", "Consenti l'apertura di nuove schede per stampare.", "Allow pop-ups to print.", "Sta pop-ups toe om af te drukken.")}</p>}
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent">
            {tr("Cerrar", "Chiudi", "Close", "Sluiten")}
          </button>
          <button type="button" onClick={handlePrint} disabled={!details || loading} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Printer size={16} />
            {tr("Imprimir / Guardar PDF", "Stampa / Salva PDF", "Print / Save PDF", "Afdrukken / PDF opslaan")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
