import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  MousePointerClick,
  UserMinus,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  fetchMarketingCampaignMetricDetails,
  type MarketingCampaignMetric,
  type MarketingCampaignMetricRecipient,
} from "@/lib/marketing";

const ICON_BY_METRIC: Record<MarketingCampaignMetric, LucideIcon> = {
  delivered: CheckCircle2,
  opened: Eye,
  clicked: MousePointerClick,
  bounced: AlertTriangle,
  unsubscribed: UserMinus,
};

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function recipientName(recipient: MarketingCampaignMetricRecipient) {
  const name = [recipient.first_name, recipient.last_name].filter(Boolean).join(" ").trim();
  return name || recipient.email;
}

function statusLabel(status?: string | null) {
  if (!status) return null;
  const labels: Record<string, string> = {
    subscribed: "Iscritto",
    unsubscribed: "Disiscritto",
    suppressed: "Soppresso",
    pending: "In attesa",
  };
  return labels[status] || status;
}

export function CampaignMetricCard({
  campaignId,
  metric,
  label,
  value,
}: {
  campaignId: string;
  metric: MarketingCampaignMetric;
  label: string;
  value: number;
}) {
  const { getToken } = useAuth();
  const Icon = ICON_BY_METRIC[metric];
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<MarketingCampaignMetricRecipient[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function openDetails() {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const response = await fetchMarketingCampaignMetricDetails(token, campaignId, metric);
      setRecipients(response.recipients);
    } catch (err) {
      console.error("[campaign-metric-card] detail loading failed", err);
      setRecipients([]);
      setError(err instanceof Error ? err.message : "Impossibile caricare i dettagli della metrica");
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button
      type="button"
      onClick={() => void openDetails()}
      className="group relative min-w-0 rounded-sm border border-border/80 bg-background p-3 text-left transition hover:border-primary/50 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={`Apri dettagli ${label}`}
    >
      <div className="flex min-w-0 items-center gap-2 pr-5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon size={14} className="shrink-0" />
        <span className="min-w-0 whitespace-nowrap">{label}</span>
      </div>
      <ChevronRight size={15} className="absolute right-3 top-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      <div className="mt-2 text-2xl font-medium">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground group-hover:text-primary">Vedi destinatari</div>
    </button>

    {open && <div className="fixed inset-0 z-[120] flex justify-end bg-black/50" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl" role="dialog" aria-modal="true" aria-label={`Dettagli ${label}`}>
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon size={16} />Dettaglio metrica</div>
            <h3 className="mt-1 text-xl font-medium">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{value} destinatari registrati per questa azione.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-sm border border-border p-2 hover:bg-muted" aria-label="Chiudi"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {metric === "opened" && <div className="mb-4 rounded-sm border border-secondary/30 bg-secondary/10 p-3 text-xs text-muted-foreground">Le aperture sono indicative: alcuni client di posta possono caricare automaticamente il pixel di tracciamento.</div>}

          {loading && <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-sm bg-muted" />)}</div>}

          {!loading && error && <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

          {!loading && !error && recipients.length === 0 && <div className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nessun destinatario disponibile per questa metrica.</div>}

          {!loading && !error && recipients.length > 0 && <div className="space-y-3">
            {recipients.map((recipient) => {
              const status = statusLabel(recipient.contact_status);
              return <div key={`${recipient.email}-${recipient.occurred_at}`} className="rounded-sm border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{recipientName(recipient)}</div>
                    <div className="mt-1 break-all text-sm text-muted-foreground">{recipient.email}</div>
                  </div>
                  {status && <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">{status}</span>}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">{formatEventDate(recipient.occurred_at)}</div>
                {recipient.detail && <div className="mt-2 break-words text-xs text-muted-foreground">{recipient.detail}</div>}
              </div>;
            })}
          </div>}
        </div>
      </aside>
    </div>}
  </>;
}
