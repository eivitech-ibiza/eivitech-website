import { CalendarClock, Send, X } from "lucide-react";
import { tr } from "@/lib/i18n";
import type { MarketingCampaign, MarketingCampaignPreparation } from "@/lib/marketing";

function formatMadridDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(date);
}

export function CampaignConfirmationDialog({
  preparation,
  confirmationPhrase,
  reviewConfirmed,
  saving,
  onClose,
  onPhraseChange,
  onReviewChange,
  onConfirm,
}: {
  preparation: { campaign: MarketingCampaign; data: MarketingCampaignPreparation };
  confirmationPhrase: string;
  reviewConfirmed: boolean;
  saving: boolean;
  onClose: () => void;
  onPhraseChange: (value: string) => void;
  onReviewChange: (value: boolean) => void;
  onConfirm: () => Promise<void>;
}) {
  const scheduled = preparation.data.delivery_mode === "scheduled";
  const segmentName = preparation.campaign.segment_name || "—";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">{tr("Confirmación final", "Conferma finale", "Final confirmation", "Definitieve bevestiging")}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {scheduled
                ? tr(
                    "Confirma una sola vez la programación. No se requerirá ninguna acción en el momento del envío.",
                    "Conferma una sola volta la programmazione. Al momento dell’invio non sarà richiesta alcuna azione.",
                    "Confirm the schedule once. No action will be required when the send time arrives.",
                    "Bevestig de planning één keer. Op het verzendmoment is geen actie nodig.",
                  )
                : tr(
                    "La confirmación iniciará el envío inmediato.",
                    "La conferma avvierà l’invio immediato.",
                    "The confirmation will start the immediate send.",
                    "De bevestiging start de directe verzending.",
                  )}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Chiudi"><X /></button>
        </div>

        <div className="mt-5 grid gap-3 rounded-sm border border-border bg-background p-4 text-sm sm:grid-cols-2">
          <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Campaña", "Campagna", "Campaign", "Campagne")}</div><div className="mt-1 font-medium">{preparation.campaign.name}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Segmento", "Segmento", "Segment", "Segment")}</div><div className="mt-1 font-medium">{segmentName}</div></div>
          <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Destinatarios admitidos", "Destinatari ammessi", "Eligible recipients", "Geschikte ontvangers")}</div><div className="mt-1 text-3xl font-medium">{preparation.data.recipient_count}</div></div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Ejecución", "Esecuzione", "Execution", "Uitvoering")}</div>
            <div className="mt-1 flex items-start gap-2 font-medium">
              {scheduled ? <CalendarClock size={17} className="mt-0.5 shrink-0" /> : <Send size={17} className="mt-0.5 shrink-0" />}
              <span>{scheduled ? formatMadridDate(preparation.data.scheduled_at) : tr("Inmediata", "Immediata", "Immediate", "Direct")}</span>
            </div>
            {scheduled && <div className="mt-1 text-xs text-muted-foreground">Europe/Madrid</div>}
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1" checked={reviewConfirmed} onChange={(event) => onReviewChange(event.target.checked)} />
          <span>{tr("He revisado asunto, contenido, segmento, destinatarios y modalidad de envío.", "Ho controllato oggetto, contenuto, segmento, destinatari e modalità di invio.", "I reviewed the subject, content, segment, recipients and delivery mode.", "Ik heb onderwerp, inhoud, segment, ontvangers en verzendmethode gecontroleerd.")}</span>
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Escribe", "Scrivi", "Type", "Typ")}: {preparation.data.confirmation_phrase}</span>
          <input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" value={confirmationPhrase} onChange={(event) => onPhraseChange(event.target.value)} />
        </label>

        {!preparation.data.bulk_send_enabled && (
          <div className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {tr("El envío masivo permanece desactivado en Railway.", "L’invio massivo è ancora disattivato su Railway.", "Bulk sending is still disabled in Railway.", "Bulkverzending is nog uitgeschakeld in Railway.")}
          </div>
        )}

        <button
          type="button"
          onClick={() => void onConfirm()}
          disabled={saving || !reviewConfirmed || confirmationPhrase !== preparation.data.confirmation_phrase || !preparation.data.bulk_send_enabled}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-40"
        >
          {scheduled ? <CalendarClock size={16} /> : <Send size={16} />}
          {scheduled
            ? tr("Programar envío", "Programma invio", "Schedule send", "Verzending plannen")
            : tr("Enviar campaña", "Invia campagna", "Send campaign", "Campagne verzenden")}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {tr("Token de un solo uso, válido durante 10 minutos.", "Token monouso, valido per 10 minuti.", "Single-use token, valid for 10 minutes.", "Eenmalige token, 10 minuten geldig.")}
        </p>
      </div>
    </div>
  );
}
