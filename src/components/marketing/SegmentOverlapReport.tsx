import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import {
  fetchMarketingSegmentOverlaps,
  type MarketingSegment,
  type MarketingSegmentOverlap,
} from "@/lib/marketing";
import { tr } from "@/lib/i18n";

export function SegmentOverlapReport({ segments }: { segments: MarketingSegment[] }) {
  const { getToken } = useAuth();
  const [pairs, setPairs] = useState<MarketingSegmentOverlap[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const byId = new Map(segments.map((segment) => [segment.id, segment]));
  const activePairs = pairs.filter((pair) => pair.common_count > 0 && byId.has(pair.left_id) && byId.has(pair.right_id));

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const result = await fetchMarketingSegmentOverlaps(token);
      setPairs(result.overlaps);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("Error al cargar.", "Errore caricamento.", "Loading failed.", "Laden mislukt."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-medium"><ArrowLeftRight size={17} className="text-primary" />
            {tr("Solapamientos de segmentos", "Sovrapposizioni tra segmenti", "Segment overlaps", "Segmentoverlap")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {tr("Detecta contactos presentes en más de un segmento. No se fusionan ni eliminan registros.",
              "Individua i contatti presenti in più segmenti. Nessun merge o cancellazione automatica.",
              "Find contacts belonging to multiple segments. No automatic merging or deletion.",
              "Vind contacten in meerdere segmenten. Geen automatisch samenvoegen of verwijderen.")}
          </p>
        </div>
        <button type="button" disabled={busy} onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm disabled:opacity-50">
          <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
          {loaded ? tr("Actualizar", "Aggiorna", "Refresh", "Vernieuwen") : tr("Analizar", "Analizza", "Analyze", "Analyseren")}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {loaded && activePairs.length === 0 && <p className="mt-4 text-sm text-muted-foreground">
        {tr("No hay solapamientos entre los segmentos activos.", "Nessuna sovrapposizione tra segmenti attivi.", "No overlaps among active segments.", "Geen overlap tussen actieve segmenten.")}
      </p>}
      {loaded && activePairs.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead><tr className="border-b border-border text-xs uppercase text-muted-foreground">
              <th className="py-2 pr-3">{tr("Segmento 1", "Segmento 1", "Segment 1", "Segment 1")}</th>
              <th className="py-2 pr-3">{tr("Segmento 2", "Segmento 2", "Segment 2", "Segment 2")}</th>
              <th className="py-2 pr-3">{tr("En común", "In comune", "Shared", "Gedeeld")}</th>
              <th className="py-2">{tr("Aptos en común", "Idonei in comune", "Shared eligible", "Gedeeld toegestaan")}</th>
            </tr></thead>
            <tbody>
              {activePairs.map((pair) => (
                <tr key={pair.left_id + ":" + pair.right_id} className="border-b border-border/70">
                  <td className="py-3 pr-3">{byId.get(pair.left_id)?.name}</td>
                  <td className="py-3 pr-3">{byId.get(pair.right_id)?.name}</td>
                  <td className="py-3 pr-3 font-medium">{pair.common_count}</td>
                  <td className="py-3">{pair.eligible_common_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
