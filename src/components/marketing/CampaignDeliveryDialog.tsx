import { useMemo, useState, type FormEvent } from "react";
import { CalendarClock, Send, X } from "lucide-react";
import { tr } from "@/lib/i18n";
import type {
  MarketingCampaign,
  MarketingDeliveryOptions,
} from "@/lib/marketing";

const MADRID_TIME_ZONE = "Europe/Madrid" as const;

function madridInputParts(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MADRID_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function defaultSchedule() {
  const next = new Date(Date.now() + 60 * 60 * 1000);
  next.setUTCMinutes(Math.ceil(next.getUTCMinutes() / 15) * 15, 0, 0);
  return madridInputParts(next);
}

export function CampaignDeliveryDialog({
  campaign,
  segmentName,
  saving,
  onClose,
  onPrepare,
}: {
  campaign: MarketingCampaign;
  segmentName: string;
  saving: boolean;
  onClose: () => void;
  onPrepare: (options: MarketingDeliveryOptions) => Promise<void>;
}) {
  const defaults = useMemo(defaultSchedule, []);
  const [mode, setMode] = useState<MarketingDeliveryOptions["delivery_mode"]>("now");
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "scheduled") {
      await onPrepare({
        delivery_mode: "scheduled",
        scheduled_local: `${date}T${time}`,
        timezone: MADRID_TIME_ZONE,
      });
      return;
    }
    await onPrepare({ delivery_mode: "now", timezone: MADRID_TIME_ZONE });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">
              {tr("Modalidad de envío", "Modalità di invio", "Delivery mode", "Verzendmethode")}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr(
                "Elige si enviar ahora o programar una fecha y hora.",
                "Scegli se inviare subito oppure programmare data e ora.",
                "Choose whether to send now or schedule a date and time.",
                "Kies of je nu wilt verzenden of een datum en tijd wilt plannen.",
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Chiudi"><X /></button>
        </div>

        <div className="mt-5 grid gap-3 rounded-sm border border-border bg-background p-4 text-sm sm:grid-cols-2">
          <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Campaña", "Campagna", "Campaign", "Campagne")}</div><div className="mt-1 font-medium">{campaign.name}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Segmento", "Segmento", "Segment", "Segment")}</div><div className="mt-1 font-medium">{segmentName || "—"}</div></div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("now")}
            className={`rounded-sm border p-4 text-left transition ${mode === "now" ? "border-primary bg-primary/5" : "border-border bg-background"}`}
          >
            <div className="flex items-center gap-2 font-medium"><Send size={17} />{tr("Enviar ahora", "Invia subito", "Send now", "Nu verzenden")}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {tr(
                "La confirmación final iniciará el envío inmediatamente.",
                "La conferma finale avvierà subito l’invio.",
                "The final confirmation will start the send immediately.",
                "De definitieve bevestiging start de verzending direct.",
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("scheduled")}
            className={`rounded-sm border p-4 text-left transition ${mode === "scheduled" ? "border-primary bg-primary/5" : "border-border bg-background"}`}
          >
            <div className="flex items-center gap-2 font-medium"><CalendarClock size={17} />{tr("Programar envío", "Programma invio", "Schedule send", "Verzending plannen")}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {tr(
                "Resend ejecutará el envío de forma autónoma, incluso con el navegador cerrado.",
                "Resend eseguirà l’invio autonomamente, anche con il browser chiuso.",
                "Resend will execute the send autonomously, even when the browser is closed.",
                "Resend voert de verzending zelfstandig uit, ook wanneer de browser gesloten is.",
              )}
            </div>
          </button>
        </div>

        {mode === "scheduled" && (
          <div className="mt-5 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Fecha", "Data", "Date", "Datum")}</span>
                <input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Hora", "Ora", "Time", "Tijd")}</span>
                <input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" type="time" step="60" required value={time} onChange={(event) => setTime(event.target.value)} />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock size={14} />
              {tr("Zona horaria", "Fuso orario", "Time zone", "Tijdzone")}: <strong>{MADRID_TIME_ZONE}</strong>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {tr(
                "Las horas inexistentes o ambiguas durante el cambio horario serán rechazadas.",
                "Le ore inesistenti o ambigue durante il cambio dell’ora verranno rifiutate.",
                "Nonexistent or ambiguous times during daylight-saving changes will be rejected.",
                "Niet-bestaande of dubbelzinnige tijden tijdens de zomertijdwissel worden geweigerd.",
              )}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-border px-4 py-3 text-sm">
            {tr("Cancelar", "Annulla", "Cancel", "Annuleren")}
          </button>
          <button disabled={saving || (mode === "scheduled" && (!date || !time))} className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40">
            {mode === "scheduled" ? <CalendarClock size={16} /> : <Send size={16} />}
            {tr("Preparar y revisar", "Prepara e verifica", "Prepare and review", "Voorbereiden en controleren")}
          </button>
        </div>
      </form>
    </div>
  );
}
