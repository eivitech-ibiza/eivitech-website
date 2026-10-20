import { useRef, useState } from "react";
import { CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendCrmDirectEmail, type CrmDirectEmailResponse } from "@/lib/crm";
import { tr } from "@/lib/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  name: string;
  email: string;
  getToken: () => Promise<string | null>;
  onSent: () => void;
};

type Step = "compose" | "review" | "result";

export function CrmDirectEmailDialog({
  open, onOpenChange, leadId, name, email, getToken, onSent,
}: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [related, setRelated] = useState(false);
  const [step, setStep] = useState<Step>("compose");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrmDirectEmailResponse | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const sendingLock = useRef(false);

  function reset() {
    setSubject("");
    setMessage("");
    setRelated(false);
    setStep("compose");
    setResult(null);
    setError(null);
    setRequestId(crypto.randomUUID());
  }

  function changeOpen(nextOpen: boolean) {
    if (sendingLock.current) return;
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  function review() {
    if (subject.trim().length < 2 || subject.trim().length > 200 || !message.trim()
      || message.trim().length > 10000 || !related) {
      setError(tr(
        "Completa asunto, mensaje y confirmación de la relación con el cliente.",
        "Compila oggetto, messaggio e conferma la pertinenza della comunicazione.",
        "Enter subject, message and confirm the message concerns this customer relationship.",
        "Vul onderwerp en bericht in en bevestig de klantrelatie.",
      ));
      return;
    }
    setError(null);
    setStep("review");
  }

  async function send() {
    // Real user click after the review step. A stable UUID is reused on
    // transport retries, so the backend never sends the same message twice.
    if (sendingLock.current || step !== "review") return;
    sendingLock.current = true;
    setSending(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error(tr(
        "Sesión caducada: inicia sesión de nuevo.",
        "Sessione scaduta: accedi nuovamente.",
        "Session expired: please sign in again.",
        "Sessie verlopen: meld je opnieuw aan.",
      ));
      const reply = await sendCrmDirectEmail(token, leadId, {
        request_id: requestId,
        expected_email: email,
        subject: subject.trim(),
        body: message.trim(),
        relationship_confirmed: true,
      });
      setResult(reply);
      setStep("result");
      onSent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : tr(
        "No se pudo verificar el envío. No crees un segundo envío.",
        "Impossibile verificare l'invio. Non creare un secondo invio.",
        "Could not verify the send. Do not create another message.",
        "Verzenden kon niet worden gecontroleerd. Maak geen tweede bericht.",
      ));
    } finally {
      sendingLock.current = false;
      setSending(false);
    }
  }

  const accepted = result && ["accepted", "delivered"].includes(result.status);
  const uncertain = result && ["unknown", "sending"].includes(result.status);

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="flex max-h-[92vh] w-[min(95vw,650px)] max-w-none flex-col overflow-y-auto p-5 sm:p-7">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Mail size={21} className="text-primary" />
            {tr("Correo individual", "Email individuale", "Individual email", "Individuele e-mail")}
          </DialogTitle>
          <DialogDescription>
            {tr(
              "Mensaje personal desde Eivitech mediante Resend, sin abrir la aplicación de correo.",
              "Comunicazione individuale Eivitech tramite Resend, senza aprire l'app Mail.",
              "Individual Eivitech message via Resend without opening a mail application.",
              "Individueel Eivitech-bericht via Resend, zonder mailprogramma.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-sm border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Destinatario", "Destinatario", "Recipient", "Ontvanger")}</p>
          <p className="mt-1 font-semibold text-sm text-foreground">{name}</p>
          <p className="break-all text-sm text-muted-foreground">{email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {tr("La dirección está bloqueada a este contacto del CRM.", "L'indirizzo è vincolato a questo contatto CRM.", "The recipient is fixed to this CRM contact.", "De ontvanger is gekoppeld aan dit CRM-contact.")}
          </p>
        </div>

        {step === "compose" && (
          <div className="space-y-4">
            <div>
              <label htmlFor={`crm-direct-subject-${leadId}`} className="block text-sm font-medium">
                {tr("Asunto", "Oggetto", "Subject", "Onderwerp")} *
              </label>
              <input
                id={`crm-direct-subject-${leadId}`}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={200}
                placeholder={tr("Asunto del mensaje", "Oggetto del messaggio", "Message subject", "Onderwerp van het bericht")}
                className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor={`crm-direct-body-${leadId}`} className="block text-sm font-medium">
                {tr("Mensaje", "Messaggio", "Message", "Bericht")} *
              </label>
              <textarea
                id={`crm-direct-body-${leadId}`}
                rows={8}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={10000}
                placeholder={tr("Escribe tu mensaje personal…", "Scrivi il tuo messaggio personale…", "Write your message…", "Schrijf je bericht…")}
                className="mt-2 w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/10000</p>
            </div>
            <label className="flex items-start gap-3 rounded-sm border border-border bg-accent/25 p-3 text-sm leading-relaxed">
              <input type="checkbox" checked={related} onChange={(event) => setRelated(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
              {tr(
                "Confirmo que es una comunicación individual relativa a una solicitud o relación profesional existente, no un envío publicitario masivo.",
                "Confermo che è una comunicazione individuale pertinente a una richiesta o relazione professionale esistente, non una campagna pubblicitaria.",
                "I confirm this is relevant individual correspondence concerning an existing request or business relationship, not a marketing campaign.",
                "Ik bevestig dat dit individuele correspondentie is over een bestaande aanvraag of zakelijke relatie, geen reclamecampagne.",
              )}
            </label>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck size={18} />
              {tr("Confirmación antes del envío", "Controllo prima dell'invio", "Review before sending", "Controle voor verzenden")}
            </div>
            <div className="rounded-sm border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Asunto", "Oggetto", "Subject", "Onderwerp")}</p>
              <p className="mt-1 break-words text-sm font-semibold">{subject.trim()}</p>
              <div className="my-3 border-b border-border" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Mensaje", "Messaggio", "Message", "Bericht")}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{message.trim()}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {tr(
                "El clic en Enviar solicita un único envío; la aceptación de Resend no significa entrega confirmada.",
                "Cliccando Invia richiedi un solo invio; l'accettazione di Resend non equivale alla consegna.",
                "Send requests one individual message; Resend acceptance does not confirm delivery.",
                "Verzenden vraagt om één bericht; acceptatie door Resend is geen afleverbevestiging.",
              )}
            </p>
          </div>
        )}

        {step === "result" && result && (
          <div role="status" className={`rounded-sm border p-4 ${accepted ? "border-secondary/30 bg-secondary/10" : "border-primary/30 bg-primary/5"}`}>
            {accepted ? (
              <div className="flex gap-2">
                <CheckCircle2 size={20} className="shrink-0 text-secondary" />
                <div>
                  <p className="font-semibold">{tr("Resend aceptó el mensaje", "Messaggio accettato da Resend", "Resend accepted the message", "Bericht geaccepteerd door Resend")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tr("Se ha registrado en el historial; el estado de entrega se actualizará si llega el webhook.", "Registrato nello storico. La consegna sarà aggiornata quando arriverà il webhook.", "Recorded in CRM; delivery status will update after the webhook.", "Opgeslagen in CRM; afleverstatus volgt via webhook.")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold">{uncertain
                  ? tr("Resultado del envío por verificar", "Esito dell'invio da verificare", "Send outcome needs checking", "Verzending moet worden gecontroleerd")
                  : tr("No se ha aceptado el mensaje", "Messaggio non accettato dal provider", "Message not accepted by provider", "Bericht niet geaccepteerd")}
                </p>
                <p className="mt-2 text-sm">
                  {tr(
                    "Comprueba el estado en la ficha antes de enviar otro mensaje. No se reenvía automáticamente.",
                    "Controlla lo stato nella scheda prima di creare un nuovo invio. Nessun reinvio automatico.",
                    "Check the record before making another send. No automatic retries.",
                    "Controleer het dossier vóór opnieuw verzenden. Geen automatisch opnieuw verzenden.",
                  )}
                </p>
              </>
            )}
            <p className="mt-3 break-all text-xs text-muted-foreground">ID: {result.id} · {result.status}</p>
          </div>
        )}

        {error && <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {step === "compose" && (
            <>
              <button type="button" onClick={() => changeOpen(false)} className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent">
                {tr("Cancelar", "Annulla", "Cancel", "Annuleren")}
              </button>
              <button type="button" onClick={review} disabled={!related || subject.trim().length < 2 || !message.trim()} className="rounded-sm bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {tr("Revisar mensaje", "Controlla messaggio", "Review message", "Bericht controleren")}
              </button>
            </>
          )}
          {step === "review" && (
            <>
              <button type="button" disabled={sending} onClick={() => setStep("compose")} className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
                {tr("Modificar", "Modifica", "Edit", "Bewerken")}
              </button>
              <button type="button" disabled={sending} onClick={() => void send()} className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Send size={16} />
                {sending ? tr("Enviando…", "Invio in corso…", "Sending…", "Verzenden…")
                  : tr("Confirmar y enviar", "Conferma e invia", "Confirm and send", "Bevestigen en verzenden")}
              </button>
            </>
          )}
          {step === "result" && (
            <button type="button" onClick={() => changeOpen(false)} className="rounded-sm bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              {tr("Cerrar", "Chiudi", "Close", "Sluiten")}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
