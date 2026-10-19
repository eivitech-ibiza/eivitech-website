import { useEffect, useState } from "react";
import { CalendarClock, ChevronDown, ChevronUp, History } from "lucide-react";
import { fetchCrmLeadDetails, type CrmActivityRecord } from "@/lib/crm";
import { tr } from "@/lib/i18n";

type ActivityPreview = Pick<CrmActivityRecord, "title" | "created_at" | "notes" | "type">;

type Props = {
  leadId: string;
  latestActivity?: ActivityPreview | null;
  updatedAt?: string;
  getToken: () => Promise<string | null>;
};

function dateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

export function CrmActivityHistory({ leadId, latestActivity, updatedAt, getToken }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<CrmActivityRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Missing Clerk token");
        const details = await fetchCrmLeadDetails(token, leadId);
        if (!cancelled) setActivities(details.activities);
      } catch {
        if (!cancelled) setError(tr(
          "No se pudo cargar el historial del cliente.",
          "Non è stato possibile caricare lo storico cliente.",
          "Could not load customer history.",
          "De klantgeschiedenis kon niet worden geladen.",
        ));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [expanded, leadId, updatedAt, getToken]);

  return (
    <section className="mt-5 rounded-sm border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History size={17} className="text-primary" />
            {tr("Historial de actividades", "Storico attività", "Activity history", "Activiteitengeschiedenis")}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {tr(
              "Los registros guardados permanecen disponibles al volver a abrir la ficha.",
              "Tutte le attività salvate rimangono consultabili anche dopo aver riaperto la scheda.",
              "Saved activities remain available after reopening the customer record.",
              "Opgeslagen activiteiten blijven beschikbaar wanneer u het klantdossier opnieuw opent.",
            )}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
        >
          {expanded
            ? tr("Ocultar historial", "Nascondi storico", "Hide history", "Geschiedenis verbergen")
            : tr("Ver historial completo", "Apri storico completo", "View full history", "Volledige geschiedenis bekijken")}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {latestActivity && !expanded && (
        <div className="mt-3 flex items-start gap-2 rounded-sm bg-muted/60 px-3 py-3 text-sm">
          <CalendarClock size={15} className="mt-0.5 shrink-0 text-primary" />
          <div className="min-w-0">
            <span className="font-medium text-foreground">{latestActivity.title}</span>
            <span className="ml-2 text-xs text-muted-foreground">{dateTime(latestActivity.created_at)}</span>
            {latestActivity.notes && <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-xs text-muted-foreground">{latestActivity.notes}</p>}
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 max-h-[440px] space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {loading && <p className="text-sm text-muted-foreground">{tr("Cargando…", "Caricamento…", "Loading…", "Laden…")}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {!loading && !error && activities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {tr("Ninguna actividad registrada.", "Nessuna attività registrata.", "No recorded activities.", "Geen activiteiten geregistreerd.")}
            </p>
          )}
          {!loading && !error && activities.map((entry) => (
            <div key={entry.id} className="border-l-2 border-primary/50 pl-3">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm font-semibold">{entry.title}</p>
                <time className="text-xs text-muted-foreground">{dateTime(entry.created_at)}</time>
              </div>
              {entry.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{entry.notes}</p>}
              {entry.due_at && <p className="mt-1 text-xs text-primary">
                {tr("Vencimiento", "Scadenza", "Due", "Vervaldatum")}: {dateTime(entry.due_at)}
              </p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
