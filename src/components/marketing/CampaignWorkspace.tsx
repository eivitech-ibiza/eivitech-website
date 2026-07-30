import { useEffect, useState, type FormEvent } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Eye, MailCheck, Pencil, Send, ShieldCheck, Trash2, X } from "lucide-react";
import {
  createMarketingCampaign,
  deleteMarketingCampaign,
  fetchMarketingCapabilities,
  prepareMarketingCampaign,
  sendMarketingCampaign,
  sendMarketingCampaignTest,
  updateMarketingCampaign,
  type MarketingCampaign,
  type MarketingCampaignInput,
  type MarketingCampaignPreparation,
  type MarketingCapabilities,
  type MarketingLanguage,
  type MarketingSegment,
} from "@/lib/marketing";
import { tr } from "@/lib/i18n";

const EMPTY_CAMPAIGN: MarketingCampaignInput = {
  name: "",
  subject: "",
  preview_text: "",
  from_name: "Eivitech",
  from_email: "newsletter@notifications.eivitech.com",
  reply_to: "info@eivitech.com",
  language: "it",
  status: "draft",
  segment_id: null,
  topic: "",
  html: "<p>Ciao {{first_name}},</p><p>scrivi qui il contenuto della campagna Eivitech.</p>",
};

const LANGUAGE_OPTIONS: { value: MarketingLanguage; label: string }[] = [
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "nl", label: "Nederlands" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-sm"><span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span><input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="block text-sm"><span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span><select className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 font-medium">{value}</div></div>;
}

export function CampaignWorkspace({ campaigns, segments, onChanged }: { campaigns: MarketingCampaign[]; segments: MarketingSegment[]; onChanged: () => Promise<void> }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [form, setForm] = useState<MarketingCampaignInput>(EMPTY_CAMPAIGN);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<MarketingCampaign | null>(null);
  const [testCampaign, setTestCampaign] = useState<MarketingCampaign | null>(null);
  const [testEmail, setTestEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [capabilities, setCapabilities] = useState<MarketingCapabilities | null>(null);
  const [preparation, setPreparation] = useState<{ campaign: MarketingCampaign; data: MarketingCampaignPreparation } | null>(null);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  async function tokenOrThrow() {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    return token;
  }

  useEffect(() => {
    void (async () => {
      try { setCapabilities(await fetchMarketingCapabilities(await tokenOrThrow())); }
      catch (err) { console.error("[campaign-workspace] capabilities failed", err); }
    })();
  }, []);

  function resetEditor() {
    setEditingId(null);
    setForm(EMPTY_CAMPAIGN);
  }

  function startEdit(campaign: MarketingCampaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      subject: campaign.subject,
      preview_text: campaign.preview_text || "",
      from_name: campaign.from_name || "Eivitech",
      from_email: campaign.from_email || "newsletter@notifications.eivitech.com",
      reply_to: campaign.reply_to || "info@eivitech.com",
      language: campaign.language || "it",
      status: "draft",
      segment_id: campaign.segment_id || null,
      topic: campaign.topic || "",
      html: campaign.html || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(null); setNotice(null);
    try {
      const token = await tokenOrThrow();
      if (editingId) {
        await updateMarketingCampaign(token, editingId, form);
        setNotice(tr("Borrador actualizado.", "Bozza aggiornata.", "Draft updated.", "Concept bijgewerkt."));
      } else {
        await createMarketingCampaign(token, form);
        setNotice(tr("Borrador guardado.", "Bozza salvata.", "Draft saved.", "Concept opgeslagen."));
      }
      resetEditor();
      await onChanged();
    } catch (err) {
      console.error("[campaign-workspace] save failed", err);
      setError(err instanceof Error ? err.message : "Campaign save failed");
    } finally { setSaving(false); }
  }

  async function remove(campaign: MarketingCampaign) {
    if (!window.confirm(tr("¿Eliminar definitivamente este borrador?", "Eliminare definitivamente questa bozza?", "Permanently delete this draft?", "Dit concept definitief verwijderen?"))) return;
    setSaving(true); setError(null);
    try {
      await deleteMarketingCampaign(await tokenOrThrow(), campaign.id);
      if (editingId === campaign.id) resetEditor();
      setNotice(tr("Borrador eliminado.", "Bozza eliminata.", "Draft deleted.", "Concept verwijderd."));
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); }
    finally { setSaving(false); }
  }

  async function sendTest(event: FormEvent) {
    event.preventDefault();
    if (!testCampaign) return;
    setSaving(true); setError(null);
    try {
      await sendMarketingCampaignTest(await tokenOrThrow(), testCampaign.id, { email: testEmail });
      setNotice(`${tr("Email de prueba enviada a", "Email di prova inviata a", "Test email sent to", "Testmail verzonden naar")} ${testEmail}.`);
      setTestCampaign(null);
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Test send failed"); }
    finally { setSaving(false); }
  }

  async function prepare(campaign: MarketingCampaign) {
    if (!window.confirm(tr("¿Sincronizar el segmento y preparar el envío sin enviarlo todavía?", "Sincronizzare il segmento e preparare l’invio senza spedire ancora nulla?", "Sync the segment and prepare the send without sending anything yet?", "Het segment synchroniseren en de verzending voorbereiden zonder nog iets te verzenden?"))) return;
    setSaving(true); setError(null); setNotice(null);
    try {
      const data = await prepareMarketingCampaign(await tokenOrThrow(), campaign.id);
      setPreparation({ campaign, data });
      setConfirmationPhrase("");
      setReviewConfirmed(false);
      setNotice(tr("Campaña preparada. Todavía no se ha enviado nada.", "Campagna preparata. Non è stata ancora inviata alcuna email.", "Campaign prepared. Nothing has been sent yet.", "Campagne voorbereid. Er is nog niets verzonden."));
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Preparation failed"); }
    finally { setSaving(false); }
  }

  async function confirmSend() {
    if (!preparation) return;
    setSaving(true); setError(null);
    try {
      await sendMarketingCampaign(await tokenOrThrow(), preparation.campaign.id, {
        confirmation_token: preparation.data.confirmation_token,
        confirmation_phrase: confirmationPhrase,
      });
      setPreparation(null);
      setNotice(tr("Envío iniciado.", "Invio avviato.", "Send started.", "Verzending gestart."));
      await onChanged();
    } catch (err) { setError(err instanceof Error ? err.message : "Send failed"); }
    finally { setSaving(false); }
  }

  return <div className="mt-6 grid gap-6 xl:grid-cols-[480px_1fr]">
    <form onSubmit={save} className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3"><div className="font-medium">{editingId ? tr("Editar campaña", "Modifica campagna", "Edit campaign", "Campagne bewerken") : tr("Nueva campaña", "Nuova campagna", "New campaign", "Nieuwe campagne")}</div>{editingId && <button type="button" onClick={resetEditor} className="text-xs text-primary hover:underline">{tr("Cancelar", "Annulla", "Cancel", "Annuleren")}</button>}</div>
      {error && <div className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
      {notice && <div className="mt-4 rounded-sm border border-secondary/30 bg-secondary/10 p-3 text-xs">{notice}</div>}
      <div className="mt-4 space-y-3">
        <Input label={tr("Nombre interno", "Nome interno", "Internal name", "Interne naam")} required value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
        <Input label={tr("Asunto", "Oggetto", "Subject", "Onderwerp")} required value={form.subject} onChange={(value) => setForm((current) => ({ ...current, subject: value }))} />
        <Input label="Preview text" value={form.preview_text || ""} onChange={(value) => setForm((current) => ({ ...current, preview_text: value }))} />
        <div className="grid grid-cols-2 gap-3"><Select label={tr("Idioma", "Lingua", "Language", "Taal")} value={form.language || "it"} options={LANGUAGE_OPTIONS} onChange={(value) => setForm((current) => ({ ...current, language: value as MarketingLanguage }))} /><Select label={tr("Segmento", "Segmento", "Segment", "Segment")} value={form.segment_id || ""} options={[{ value: "", label: tr("Sin segmento", "Nessun segmento", "No segment", "Geen segment") }, ...segments.map((segment) => ({ value: segment.id, label: segment.name }))]} onChange={(value) => setForm((current) => ({ ...current, segment_id: value || null }))} /></div>
        <Input label="Topic" value={form.topic || ""} onChange={(value) => setForm((current) => ({ ...current, topic: value }))} />
        <label className="block text-sm"><span className="text-xs uppercase tracking-wide text-muted-foreground">HTML</span><textarea className="mt-1 min-h-72 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs" value={form.html || ""} onChange={(event) => setForm((current) => ({ ...current, html: event.target.value }))} /></label>
        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setPreview({ ...(form as MarketingCampaign), id: editingId || "preview", recipient_count: 0, delivered_count: 0, opened_count: 0, clicked_count: 0, bounced_count: 0, complained_count: 0, unsubscribed_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })} className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-sm"><Eye size={16} />{tr("Vista previa", "Anteprima", "Preview", "Voorbeeld")}</button><button disabled={saving} className="rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{editingId ? tr("Actualizar", "Aggiorna", "Update", "Bijwerken") : tr("Guardar borrador", "Salva bozza", "Save draft", "Concept opslaan")}</button></div>
      </div>
    </form>

    <div className="space-y-4">
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 text-sm"><div className="font-medium">{tr("Protecciones de envío", "Protezioni invio", "Send protections", "Verzendbeveiliging")}</div><div className="mt-1 text-muted-foreground">Test: {capabilities?.testSendConfigured ? "OK" : "non configurato"} · Resend sync: {capabilities?.resendSyncConfigured ? "OK" : "non configurato"} · Bulk: {capabilities?.bulkSendEnabled ? "ABILITATO" : "DISABILITATO"} · limite {capabilities?.maxRecipients || "—"}</div></div>
      {campaigns.map((campaign) => <div key={campaign.id} className="rounded-sm border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-medium">{campaign.name}</div><div className="mt-1 text-sm text-muted-foreground">{campaign.subject}</div></div><span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide">{campaign.status}</span></div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4"><Info label={tr("Idioma", "Lingua", "Language", "Taal")} value={(campaign.language || "it").toUpperCase()} /><Info label={tr("Segmento", "Segmento", "Segment", "Segment")} value={campaign.segment_name || "—"} /><Info label={tr("Destinatarios", "Destinatari", "Recipients", "Ontvangers")} value={String(campaign.recipient_count || 0)} /><Info label={tr("Creada", "Creata", "Created", "Aangemaakt")} value={formatDate(campaign.created_at)} /></div>
        <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => startEdit(campaign)} disabled={campaign.status !== "draft"} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-40"><Pencil size={14} />{tr("Editar", "Modifica", "Edit", "Bewerken")}</button><button onClick={() => setPreview(campaign)} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs"><Eye size={14} />{tr("Vista previa", "Anteprima", "Preview", "Voorbeeld")}</button><button onClick={() => setTestCampaign(campaign)} disabled={campaign.status !== "draft" || !capabilities?.testSendConfigured} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-40"><MailCheck size={14} />Test</button><button onClick={() => void prepare(campaign)} disabled={saving || campaign.status !== "draft" || !campaign.segment_id || !capabilities?.resendSyncConfigured} className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-xs text-primary-foreground disabled:opacity-40"><ShieldCheck size={14} />{tr("Preparar envío", "Prepara invio", "Prepare send", "Verzending voorbereiden")}</button><button onClick={() => void remove(campaign)} disabled={campaign.status !== "draft"} className="inline-flex items-center gap-2 rounded-sm border border-destructive/30 px-3 py-2 text-xs text-destructive disabled:opacity-40"><Trash2 size={14} />{tr("Eliminar", "Elimina", "Delete", "Verwijderen")}</button></div>
      </div>)}
      {campaigns.length === 0 && <div className="rounded-sm border border-dashed border-border p-8 text-sm text-muted-foreground">{tr("Aún no hay campañas.", "Non ci sono ancora campagne.", "No campaigns yet.", "Nog geen campagnes.")}</div>}
    </div>

    {preview && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-sm bg-card shadow-2xl"><div className="flex items-center justify-between border-b border-border p-4"><div><div className="font-medium">{preview.subject || tr("Sin asunto", "Senza oggetto", "No subject", "Geen onderwerp")}</div><div className="text-xs text-muted-foreground">{preview.preview_text}</div></div><button onClick={() => setPreview(null)}><X /></button></div><iframe title="Email preview" sandbox="" srcDoc={preview.html || ""} className="min-h-[70vh] w-full bg-white" /></div></div>}

    {testCampaign && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><form onSubmit={sendTest} className="w-full max-w-md rounded-sm bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><div className="font-medium">{tr("Enviar email de prueba", "Invia email di prova", "Send test email", "Testmail verzenden")}</div><button type="button" onClick={() => setTestCampaign(null)}><X /></button></div><div className="mt-5"><Input label="Email" type="email" required value={testEmail} onChange={setTestEmail} /></div><p className="mt-3 text-xs text-muted-foreground">{tr("Solo se enviará una prueba a esta dirección.", "Verrà inviata soltanto una prova a questo indirizzo.", "Only one test will be sent to this address.", "Er wordt slechts één test naar dit adres verzonden.")}</p><button disabled={saving} className="mt-5 w-full rounded-sm bg-primary px-4 py-3 text-sm text-primary-foreground">{tr("Enviar prueba", "Invia prova", "Send test", "Test verzenden")}</button></form></div>}

    {preparation && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-xl rounded-sm bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><div className="font-medium">{tr("Confirmación final", "Conferma finale", "Final confirmation", "Definitieve bevestiging")}</div><button onClick={() => setPreparation(null)}><X /></button></div><div className="mt-5 rounded-sm border border-primary/20 bg-primary/5 p-4"><div className="text-3xl font-medium">{preparation.data.recipient_count}</div><div className="text-sm text-muted-foreground">{tr("destinatarios elegibles", "destinatari idonei", "eligible recipients", "geschikte ontvangers")}</div></div><label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} /><span>{tr("He revisado asunto, contenido, segmento y destinatarios.", "Ho controllato oggetto, contenuto, segmento e destinatari.", "I reviewed the subject, content, segment and recipients.", "Ik heb onderwerp, inhoud, segment en ontvangers gecontroleerd.")}</span></label><div className="mt-4"><Input label={`${tr("Escribe", "Scrivi", "Type", "Typ")}: ${preparation.data.confirmation_phrase}`} value={confirmationPhrase} onChange={setConfirmationPhrase} /></div>{!preparation.data.bulk_send_enabled && <div className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{tr("El envío masivo permanece desactivado en Railway.", "L’invio massivo è ancora disattivato su Railway.", "Bulk sending is still disabled in Railway.", "Bulkverzending is nog uitgeschakeld in Railway.")}</div>}<button onClick={() => void confirmSend()} disabled={saving || !reviewConfirmed || confirmationPhrase !== preparation.data.confirmation_phrase || !preparation.data.bulk_send_enabled} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-40"><Send size={16} />{tr("Enviar campaña", "Invia campagna", "Send campaign", "Campagne verzenden")}</button><p className="mt-3 text-center text-xs text-muted-foreground">Token monouso, valido per 10 minuti.</p></div></div>}
  </div>;
}
