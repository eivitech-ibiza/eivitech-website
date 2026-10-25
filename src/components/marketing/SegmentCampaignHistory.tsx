import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { RefreshCw } from "lucide-react";
import {
  fetchMarketingSegmentCampaigns,
  type MarketingSegmentCampaign,
} from "@/lib/marketing";
import { tr } from "@/lib/i18n";

function statusText(status: MarketingSegmentCampaign["status"]) {
  switch (status) {
    case "sent": return tr("Enviada", "Inviata", "Sent", "Verzonden");
    case "draft": return tr("Borrador", "Bozza", "Draft", "Concept");
    case "scheduled": return tr("Programada", "Programmata", "Scheduled", "Gepland");
    case "sending": return tr("En curso", "In corso", "Sending", "Bezig");
    case "paused": return tr("Pausada", "In pausa", "Paused", "Gepauzeerd");
    case "failed": return tr("Fallida", "Fallita", "Failed", "Mislukt");
    case "cancelled": return tr("Cancelada", "Annullata", "Cancelled", "Geannuleerd");
    default: return status || "—";
  }
}

function dateText(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(date);
}

export function SegmentCampaignHistory({ segmentId }: { segmentId: string }) {
  const { getToken } = useAuth();
  const activeId = useRef(segmentId);
  const [campaigns, setCampaigns] = useState<MarketingSegmentCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  activeId.current = segmentId;

  const refresh = useCallback(async () => {
    const requestedId = segmentId;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const response = await fetchMarketingSegmentCampaigns(token, requestedId);
      if (activeId.current !== requestedId) return;
      setCampaigns(response.campaigns);
      setTotal(response.total);
    } catch (err) {
      if (activeId.current !== requestedId) return;
      setError(err instanceof Error ? err.message : tr(
        "No se pudieron cargar las campañas.",
        "Impossibile caricare le campagne.",
        "Could not load campaigns.",
        "Kan campagnes niet laden.",
      ));
    } finally {
      if (activeId.current === requestedId) setLoading(false);
    }
  }, [getToken, segmentId]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function loadMore() {
    if (loadingMore || loading || campaigns.length >= total) return;
    const requestedId = segmentId;
    setLoadingMore(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const response = await fetchMarketingSegmentCampaigns(token, requestedId, campaigns.length);
      if (activeId.current !== requestedId) return;
      setCampaigns((current) => [...current, ...response.campaigns.filter((item) => !current.some((old) => old.id === item.id))]);
      setTotal(response.total);
    } catch (err) {
      if (activeId.current !== requestedId) return;
      setError(err instanceof Error ? err.message : tr("Error de carga.", "Errore di caricamento.", "Loading failed.", "Laden mislukt."));
    } finally {
      if (activeId.current === requestedId) setLoadingMore(false);
    }
  }

  return (
    <section className="space-y-3 rounded-sm border border-border p-4" aria-label={tr(
      "Historial de campañas", "Storico campagne", "Campaign history", "Campagnegeschiedenis",
    )}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-medium">{tr("Campañas vinculadas", "Campagne collegate", "Linked campaigns", "Gekoppelde campagnes")}</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {tr("Envíos anteriores, borradores y métricas registradas.",
              "Invii precedenti, bozze e metriche registrate.",
              "Previous sends, drafts and recorded metrics.",
              "Vorige verzendingen, concepten en geregistreerde statistieken.")}
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading || loadingMore}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {tr("Actualizar", "Aggiorna", "Refresh", "Vernieuwen")}
        </button>
      </div>

      {loading && <p role="status" className="text-sm text-muted-foreground">{tr("Cargando...", "Caricamento...", "Loading...", "Laden...")}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!loading && !error && campaigns.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {tr("Todavía no hay campañas vinculadas.", "Nessuna campagna collegata.", "No linked campaigns yet.", "Nog geen gekoppelde campagnes.")}
        </p>
      )}
      {!loading && campaigns.length > 0 && (
        <>
          <div className="text-xs text-muted-foreground">{tr("Campañas", "Campagne", "Campaigns", "Campagnes")}: {total}</div>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-sm border border-border/70 bg-background p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-medium">{campaign.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {campaign.sent_at
                        ? tr("Enviada", "Inviata", "Sent", "Verzonden") + ": " + dateText(campaign.sent_at)
                        : tr("Creada", "Creata", "Created", "Gemaakt") + ": " + dateText(campaign.created_at)}
                    </div>
                  </div>
                  <span className="rounded-sm border border-border px-2 py-1 text-xs">{statusText(campaign.status)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-sm bg-muted/40 p-2 text-center">
                    <div className="text-base font-medium tabular-nums">{campaign.recipient_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">{tr("Destinatarios", "Destinatari", "Recipients", "Ontvangers")}</div>
                  </div>
                  <div className="rounded-sm bg-muted/40 p-2 text-center">
                    <div className="text-base font-medium tabular-nums">{campaign.opened_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">{tr("Aperturas", "Aperture", "Opens", "Opens")}</div>
                  </div>
                  <div className="rounded-sm bg-muted/40 p-2 text-center">
                    <div className="text-base font-medium tabular-nums">{campaign.clicked_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">{tr("Clics", "Clic", "Clicks", "Klikken")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {campaigns.length < total && (
            <button type="button" onClick={() => void loadMore()} disabled={loadingMore}
              className="w-full rounded-sm border border-border px-3 py-2 text-sm text-primary disabled:opacity-50">
              {loadingMore ? tr("Cargando...", "Caricamento...", "Loading...", "Laden...") : tr(
                "Ver más campañas", "Mostra altre campagne", "Load more campaigns", "Meer campagnes laden",
              )}
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            {tr("Las aperturas pueden variar por la protección de privacidad del correo.",
              "Le aperture sono indicative: i client email possono bloccare o precaricare il tracciamento.",
              "Opens are indicative; mail clients can block or prefetch tracking.",
              "Openingen zijn indicatief en worden beïnvloed door e-mailprivacy.")}
          </p>
        </>
      )}
    </section>
  );
}
