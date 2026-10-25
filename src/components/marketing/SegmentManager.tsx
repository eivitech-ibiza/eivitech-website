import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Archive, ArchiveRestore, CheckCircle2, Pencil, Plus, Search, UserMinus, UserPlus, XCircle } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SegmentCampaignHistory } from "./SegmentCampaignHistory";
import {
  createMarketingContact,
  fetchAllMarketingContacts,
  setMarketingSegmentArchived,
  updateMarketingContact,
  updateMarketingSegment,
  updateMarketingSegmentMembers,
  type MarketingContact,
  type MarketingSegment,
} from "@/lib/marketing";
import { tr } from "@/lib/i18n";

type Props = {
  segments: MarketingSegment[];
  onChanged: () => Promise<void> | void;
};

function isEligible(contact: MarketingContact) {
  return contact.status === "subscribed"
    && contact.marketing_consent === true
    && !contact.unsubscribed_at
    && !contact.suppressed_at;
}

function contactName(contact: MarketingContact) {
  return [contact.first_name, contact.last_name].filter(Boolean).join(" ") || contact.email;
}

export function SegmentManager({ segments, onChanged }: Props) {
  const { getToken } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<"overview" | "edit" | "contacts">("overview");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [onlyMembers, setOnlyMembers] = useState(true);
  const [members, setMembers] = useState<MarketingContact[]>([]);
  const [allContacts, setAllContacts] = useState<MarketingContact[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickFirstName, setQuickFirstName] = useState("");
  const [quickLastName, setQuickLastName] = useState("");
  const [quickConsent, setQuickConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = segments.find((segment) => segment.id === selectedId) || null;
  const visibleSegments = segments.filter((segment) => Boolean(segment.archived_at) === showArchived);
  const archivedCount = segments.filter((segment) => Boolean(segment.archived_at)).length;
  const memberIds = useMemo(() => new Set(members.map((member) => member.id)), [members]);
  const hasUnsavedChanges = Boolean(selected && view === "edit" && !selected.archived_at
    && (name.trim() !== selected.name || description.trim() !== (selected.description || "").trim()));
  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allContacts.filter((contact) => {
      if (onlyMembers && !memberIds.has(contact.id)) return false;
      if (!query) return true;
      return `${contact.first_name || ""} ${contact.last_name || ""} ${contact.email}`
        .toLowerCase().includes(query);
    });
  }, [allContacts, memberIds, onlyMembers, search]);

  async function tokenOrThrow() {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    return token;
  }

  // Opening a card never waits for network requests, so the panel is always visible immediately.
  function openSegment(segment: MarketingSegment, nextView: "overview" | "edit") {
    setSelectedId(segment.id);
    setView(nextView);
    setName(segment.name);
    setDescription(segment.description || "");
    setMembers([]);
    setAllContacts([]);
    setSearch("");
    setOnlyMembers(true);
    setError(null);
    setNotice(null);
    setQuickEmail("");
    setQuickFirstName("");
    setQuickLastName("");
    setQuickConsent(false);
  }

  function closePanel() {
    if (busy) return;
    if (hasUnsavedChanges && !window.confirm(tr(
      "¿Cerrar sin guardar los cambios?", "Chiudere senza salvare le modifiche?",
      "Close without saving changes?", "Sluiten zonder wijzigingen op te slaan?",
    ))) return;
    setSelectedId(null);
    setView("overview");
    setError(null);
    setNotice(null);
  }

  function changeView(nextView: "overview" | "edit" | "contacts") {
    if (view === nextView) return;
    if (hasUnsavedChanges) {
      if (!window.confirm(tr(
        "¿Descartar los cambios sin guardar?", "Scartare le modifiche non salvate?",
        "Discard unsaved changes?", "Niet-opgeslagen wijzigingen negeren?",
      ))) return;
      setName(selected?.name || "");
      setDescription(selected?.description || "");
    }
    setView(nextView);
    setError(null);
    setNotice(null);
  }

  useEffect(() => {
    if (!selectedId || view !== "contacts") return;
    let cancelled = false;
    setContactsLoading(true);
    setError(null);
    void (async () => {
      try {
        const token = await getTokenRef.current();
        if (!token) throw new Error("Missing Clerk token");
        const [memberData, contactData] = await Promise.all([
          fetchAllMarketingContacts(token, { segmentId: selectedId }),
          fetchAllMarketingContacts(token),
        ]);
        if (cancelled) return;
        setMembers(memberData);
        setAllContacts(contactData);
      } catch (err) {
        if (cancelled) return;
        console.error("[segment-manager] contacts load failed", err);
        setError(tr(
          "No se pudieron cargar los contactos.", "Impossibile caricare i contatti.",
          "Could not load contacts.", "Contacten konden niet worden geladen.",
        ));
      } finally {
        if (!cancelled) setContactsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, view]);

  useEffect(() => {
    if (selectedId && view === "edit" && !selected?.archived_at) nameInputRef.current?.focus();
  }, [selectedId, view, selected?.archived_at]);

  async function refreshSelected(segmentId = selectedId) {
    if (!segmentId) return;
    const token = await tokenOrThrow();
    const [memberData, contactData] = await Promise.all([
      fetchAllMarketingContacts(token, { segmentId }),
      fetchAllMarketingContacts(token),
    ]);
    setMembers(memberData);
    setAllContacts(contactData);
    await onChanged();
  }

  async function saveMetadata() {
    if (!selectedId || !name.trim() || selected?.archived_at || !hasUnsavedChanges) return;
    setBusy(true);
    setError(null);
    try {
      const token = await tokenOrThrow();
      await updateMarketingSegment(token, selectedId, { name: name.trim(), description: description.trim() });
      setNotice(tr("Segmento actualizado.", "Segmento aggiornato.", "Segment updated.", "Segment bijgewerkt."));
      await onChanged();
    } catch (err) {
      console.error("[segment-manager] update failed", err);
      setError(tr("No se ha podido actualizar el segmento.", "Non è stato possibile aggiornare il segmento.", "Could not update the segment.", "Het segment kon niet worden bijgewerkt."));
    } finally {
      setBusy(false);
    }
  }

  async function setMembership(contact: MarketingContact, shouldBeMember: boolean) {
    if (!selectedId || selected?.archived_at) return;
    setBusy(true);
    setError(null);
    try {
      const token = await tokenOrThrow();
      await updateMarketingSegmentMembers(token, selectedId, shouldBeMember ? { add: [contact.id] } : { remove: [contact.id] });
      setNotice(shouldBeMember
        ? tr("Contacto añadido al segmento.", "Contatto aggiunto al segmento.", "Contact added to segment.", "Contact aan segment toegevoegd.")
        : tr("Contacto eliminado del segmento.", "Contatto rimosso dal segmento.", "Contact removed from segment.", "Contact uit segment verwijderd."));
      await refreshSelected(selectedId);
    } catch (err) {
      console.error("[segment-manager] membership update failed", err);
      setError(tr("No se ha podido actualizar el segmento.", "Non è stato possibile aggiornare il segmento.", "Could not update the segment.", "Het segment kon niet worden bijgewerkt."));
    } finally {
      setBusy(false);
    }
  }

  async function addByEmail() {
    if (!selectedId || selected?.archived_at) return;
    const normalizedEmail = quickEmail.trim().toLowerCase();
    if (!normalizedEmail) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const token = await tokenOrThrow();
      let contact = allContacts.find((item) => item.email.toLowerCase() === normalizedEmail) || null;

      if (contact) {
        const terminal = contact.status === "unsubscribed" || contact.status === "suppressed";
        if (quickConsent && terminal) {
          const confirmed = window.confirm(tr(
            "Este contacto se había dado de baja o estaba suprimido. Confirma que existe un nuevo consentimiento explícito y documentado.",
            "Questo contatto era disiscritto o soppresso. Conferma che esiste un nuovo consenso esplicito e documentato.",
            "This contact was unsubscribed or suppressed. Confirm that new explicit and documented consent exists.",
            "Dit contact was uitgeschreven of geblokkeerd. Bevestig dat er nieuwe expliciete en gedocumenteerde toestemming is.",
          ));
          if (!confirmed) return;
        }

        if (quickConsent && !isEligible(contact)) {
          const updated = await updateMarketingContact(token, contact.id, {
            status: "subscribed",
            marketing_consent: true,
            consent_source: "segment-editor",
            consent_at: new Date().toISOString(),
            allow_resubscribe: terminal,
          });
          contact = updated.contact;
        }
      } else {
        const created = await createMarketingContact(token, {
          email: normalizedEmail,
          first_name: quickFirstName.trim() || null,
          last_name: quickLastName.trim() || null,
          contact_type: "segment",
          source: "segment-editor",
          status: quickConsent ? "subscribed" : "pending",
          marketing_consent: quickConsent,
          consent_source: quickConsent ? "segment-editor" : null,
          consent_at: quickConsent ? new Date().toISOString() : null,
        });
        contact = created.contact;
      }

      await updateMarketingSegmentMembers(token, selectedId, { add: [contact.id] });
      setQuickEmail("");
      setQuickFirstName("");
      setQuickLastName("");
      setQuickConsent(false);
      setNotice(isEligible(contact)
        ? tr("Contacto añadido y listo para envíos.", "Contatto aggiunto e idoneo all’invio.", "Contact added and eligible for sending.", "Contact toegevoegd en verzendklaar.")
        : tr("Contacto añadido, pero aún no es apto para envíos.", "Contatto aggiunto, ma non ancora idoneo all’invio.", "Contact added, but not yet eligible for sending.", "Contact toegevoegd, maar nog niet verzendklaar."));
      await refreshSelected(selectedId);
    } catch (err) {
      console.error("[segment-manager] quick add failed", err);
      setError(err instanceof Error ? err.message : tr("No se ha podido añadir el contacto.", "Non è stato possibile aggiungere il contatto.", "Could not add the contact.", "Contact kon niet worden toegevoegd."));
    } finally {
      setBusy(false);
    }
  }

  async function toggleArchive() {
    if (!selected) return;
    const archived = Boolean(selected.archived_at);
    const confirmed = window.confirm(archived
      ? tr("¿Restaurar este segmento?", "Ripristinare questo segmento?", "Restore this segment?", "Dit segment herstellen?")
      : tr("¿Archivar el segmento? Sus contactos y campañas anteriores se conservarán. Los borradores y campañas activas bloquean el archivo.",
        "Archiviare il segmento? Contatti e campagne storiche saranno conservati. Bozze e campagne attive bloccano l'archiviazione.",
        "Archive segment? Contacts and historic campaigns remain. Drafts and active campaigns block archiving.",
        "Segment archiveren? Contacten en historische campagnes blijven. Concepten en actieve campagnes blokkeren archivering."));
    if (!confirmed) return;
    setBusy(true);
    setError(null);
    try {
      await setMarketingSegmentArchived(await tokenOrThrow(), selected.id, !archived);
      setSelectedId(null);
      setNotice(null);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("Error.", "Errore.", "Error.", "Fout."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card p-3">
        <span className="text-sm text-muted-foreground">
          {tr("Los segmentos archivados se conservan en el historial.",
            "I segmenti archiviati rimangono nello storico.",
            "Archived segments remain in the history.",
            "Gearchiveerde segmenten blijven in de geschiedenis.")}
        </span>
        <button type="button" onClick={() => { setShowArchived((current) => !current); setSelectedId(null); }}
          className="rounded-sm border border-border px-3 py-2 text-xs text-primary hover:bg-accent">
          {showArchived
            ? tr("Ver activos", "Mostra attivi", "Show active", "Toon actief")
            : tr("Ver archivados", "Mostra archiviati", "Show archived", "Toon archief")} ({archivedCount})
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleSegments.map((segment) => (
          <div key={segment.id}
            className={`relative min-w-0 rounded-sm border bg-card shadow-soft transition hover:border-primary/50 hover:shadow-md ${selectedId === segment.id ? "border-primary ring-1 ring-primary/20" : "border-border"}`}>
            <button type="button" onClick={() => openSegment(segment, "overview")}
              aria-label={tr("Ver detalles", "Visualizza dettagli", "View details", "Bekijk details") + ": " + segment.name}
              className="block h-full w-full rounded-sm p-5 pr-14 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <div className="break-words font-medium">{segment.name}</div>
              <div className="mt-3 line-clamp-5 text-sm text-muted-foreground">
                {segment.description || tr("Sin descripción", "Senza descrizione", "No description", "Geen beschrijving")}
              </div>
              <div className="mt-5 text-3xl font-medium tabular-nums">{segment.member_count || 0}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {tr("Contactos", "Contatti", "Contacts", "Contacten")} · {tr("Aptos", "Idonei", "Eligible", "Geschikt")}: {segment.eligible_count ?? 0}
              </div>
            </button>
            <button type="button" onClick={() => openSegment(segment, "edit")}
              aria-label={tr("Editar segmento", "Modifica segmento", "Edit segment", "Segment bewerken") + ": " + segment.name}
              title={tr("Editar segmento", "Modifica segmento", "Edit segment", "Segment bewerken")}
              className="absolute right-3 top-3 rounded-sm border border-border bg-background p-2 text-primary hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <Pencil size={17} aria-hidden="true" />
            </button>
          </div>
        ))}
        {visibleSegments.length === 0 && (
          <div className="rounded-sm border border-dashed border-border p-8 text-sm text-muted-foreground">
            {showArchived
              ? tr("No hay segmentos archivados.", "Nessun segmento archiviato.", "No archived segments.", "Geen gearchiveerde segmenten.")
              : tr("Crea el primer segmento.", "Crea il primo segmento.", "Create the first segment.", "Maak het eerste segment.")}
          </div>
        )}
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => { if (!open) closePanel(); }}>
        {selected && (
          <SheetContent side="right" className="flex h-full w-full max-w-none flex-col overflow-hidden p-0 sm:max-w-2xl">
            <SheetHeader className="shrink-0 border-b border-border px-5 py-5 pr-14 text-left">
              <div className="text-xs uppercase tracking-wide text-primary">
                {tr("Gestión de segmento", "Gestione segmento", "Segment management", "Segmentbeheer")}
              </div>
              <SheetTitle className="break-words text-xl">{selected.name}</SheetTitle>
              <SheetDescription>
                {selected.archived_at
                  ? tr("Segmento archivado. Los datos históricos se conservan.", "Segmento archiviato. I dati storici sono conservati.",
                    "Archived segment. Historic data is preserved.", "Gearchiveerd segment. Historische gegevens blijven behouden.")
                  : tr("Consulta, modifica y gestiona desde este panel.", "Consulta, modifica e gestisci da questo pannello.",
                    "View, edit and manage this segment from here.", "Bekijk, bewerk en beheer dit segment hier.")}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-sm border border-border p-3">
                  <div className="text-xl font-medium tabular-nums">{selected.member_count || 0}</div>
                  <div className="text-xs text-muted-foreground">{tr("Contactos", "Contatti", "Contacts", "Contacten")}</div>
                </div>
                <div className="rounded-sm border border-border p-3">
                  <div className="text-xl font-medium tabular-nums">{selected.eligible_count ?? 0}</div>
                  <div className="text-xs text-muted-foreground">{tr("Aptos", "Idonei", "Eligible", "Geschikt")}</div>
                </div>
                <div className="rounded-sm border border-border p-3">
                  <div className="text-xl font-medium tabular-nums">{Math.max(0, (selected.member_count || 0) - (selected.eligible_count ?? 0))}</div>
                  <div className="text-xs text-muted-foreground">{tr("No aptos", "Non idonei", "Not eligible", "Niet geschikt")}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2" aria-label={tr("Opciones", "Sezioni", "Sections", "Onderdelen")}>
                {([
                  ["overview", tr("Detalles", "Dettagli", "Details", "Details")],
                  ["edit", tr("Editar", "Modifica", "Edit", "Bewerken")],
                  ["contacts", tr("Contactos", "Contatti", "Contacts", "Contacten")],
                ] as const).map(([mode, label]) => (
                  <button key={mode} type="button" onClick={() => changeView(mode)}
                    aria-pressed={view === mode}
                    className={`rounded-sm border px-2 py-2.5 text-sm ${view === mode ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {error && <div role="alert" className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              {notice && <div role="status" className="rounded-sm border border-secondary/30 bg-secondary/10 p-3 text-sm">{notice}</div>}

              {view === "overview" && (
                <div className="space-y-5">
                  <section className="rounded-sm border border-border p-4">
                    <h4 className="font-medium">{tr("Descripción", "Descrizione", "Description", "Beschrijving")}</h4>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {selected.description || tr("Sin descripción", "Senza descrizione", "No description", "Geen beschrijving")}
                    </p>
                    <button type="button" onClick={() => changeView("edit")}
                      className="mt-4 inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm text-primary hover:bg-accent">
                      <Pencil size={15} aria-hidden="true" /> {tr("Editar datos", "Modifica dati", "Edit details", "Gegevens bewerken")}
                    </button>
                  </section>
                  <SegmentCampaignHistory key={selected.id} segmentId={selected.id} />
                  <button type="button" onClick={() => changeView("contacts")}
                    className="w-full rounded-sm border border-border px-4 py-3 text-left text-sm text-primary hover:bg-accent">
                    {tr("Gestionar los contactos del segmento", "Gestisci i contatti del segmento",
                      "Manage segment contacts", "Segmentcontacten beheren")}
                  </button>
                </div>
              )}

              {view === "edit" && (
                <section className="rounded-sm border border-border p-4">
                  <h4 className="font-medium">{tr("Datos del segmento", "Dati segmento", "Segment details", "Segmentgegevens")}</h4>
                  {selected.archived_at && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tr("Restaura el segmento para editarlo.", "Ripristina il segmento per modificarlo.",
                        "Restore the segment to edit it.", "Herstel het segment om het te bewerken.")}
                    </p>
                  )}
                  <label className="mt-4 block text-sm">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Nombre", "Nome", "Name", "Naam")}</span>
                    <input ref={nameInputRef} type="text" maxLength={120} disabled={Boolean(selected.archived_at) || busy}
                      className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5 disabled:opacity-50"
                      value={name} onChange={(event) => setName(event.target.value)} />
                  </label>
                  <label className="mt-4 block text-sm">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Descripción", "Descrizione", "Description", "Beschrijving")}</span>
                    <textarea maxLength={500} disabled={Boolean(selected.archived_at) || busy}
                      className="mt-1 min-h-36 w-full rounded-sm border border-border bg-background px-3 py-2.5 disabled:opacity-50"
                      value={description} onChange={(event) => setDescription(event.target.value)} />
                  </label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={busy || Boolean(selected.archived_at) || name.trim().length < 2 || !hasUnsavedChanges}
                      onClick={() => void saveMetadata()}
                      className="rounded-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-50">
                      {tr("Guardar cambios", "Salva modifiche", "Save changes", "Wijzigingen opslaan")}
                    </button>
                    <button type="button" disabled={busy} onClick={() => changeView("overview")}
                      className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-accent">
                      {tr("Cancelar", "Annulla", "Cancel", "Annuleren")}
                    </button>
                  </div>
                </section>
              )}

              {view === "contacts" && (
                <div className="space-y-4">
                  <section className="rounded-sm border border-border p-4">
                    <h4 className="flex items-center gap-2 font-medium">
                      <Plus size={16} className="text-primary" aria-hidden="true" />
                      {tr("Añadir por email", "Aggiungi tramite email", "Add by email", "Toevoegen via e-mail")}
                    </h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input type="email" aria-label="Email" placeholder="email@dominio.com"
                        disabled={Boolean(selected.archived_at) || busy}
                        className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2"
                        value={quickEmail} onChange={(event) => setQuickEmail(event.target.value)} />
                      <input aria-label={tr("Nombre", "Nome", "First name", "Voornaam")}
                        placeholder={tr("Nombre", "Nome", "First name", "Voornaam")}
                        disabled={Boolean(selected.archived_at) || busy}
                        className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
                        value={quickFirstName} onChange={(event) => setQuickFirstName(event.target.value)} />
                      <input aria-label={tr("Apellido", "Cognome", "Last name", "Achternaam")}
                        placeholder={tr("Apellido", "Cognome", "Last name", "Achternaam")}
                        disabled={Boolean(selected.archived_at) || busy}
                        className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
                        value={quickLastName} onChange={(event) => setQuickLastName(event.target.value)} />
                    </div>
                    <label className="mt-3 flex items-start gap-3 rounded-sm border border-border p-3 text-sm">
                      <input type="checkbox" className="mt-1" disabled={Boolean(selected.archived_at) || busy}
                        checked={quickConsent} onChange={(event) => setQuickConsent(event.target.checked)} />
                      <span>{tr("Existe consentimiento marketing explícito y documentado",
                        "Esiste un consenso marketing esplicito e documentato",
                        "Explicit, documented marketing consent exists",
                        "Er is expliciete gedocumenteerde marketingtoestemming")}</span>
                    </label>
                    <button type="button" disabled={busy || contactsLoading || Boolean(selected.archived_at) || !quickEmail.trim()}
                      onClick={() => void addByEmail()}
                      className="mt-3 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-50">
                      <UserPlus size={16} aria-hidden="true" />
                      {tr("Añadir al segmento", "Aggiungi al segmento", "Add to segment", "Toevoegen aan segment")}
                    </button>
                  </section>
                  <section className="rounded-sm border border-border p-4">
                    <h4 className="font-medium">{tr("Gestionar contactos", "Gestisci contatti", "Manage contacts", "Contacten beheren")}</h4>
                    <label className="mt-3 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={onlyMembers} onChange={(event) => setOnlyMembers(event.target.checked)} />
                      {tr("Solo miembros del segmento", "Solo membri del segmento", "Segment members only", "Alleen segmentleden")}
                    </label>
                    <div className="relative mt-3">
                      <Search size={15} aria-hidden="true" className="absolute left-3 top-3 text-muted-foreground" />
                      <input className="w-full rounded-sm border border-border bg-background py-2.5 pl-9 pr-3 text-sm"
                        aria-label={tr("Buscar nombre o email", "Cerca nome o email", "Search name or email", "Zoek naam of e-mail")}
                        placeholder={tr("Buscar nombre o email", "Cerca nome o email", "Search name or email", "Zoek naam of e-mail")}
                        value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    {contactsLoading
                      ? <p role="status" className="mt-4 text-sm text-muted-foreground">{tr("Cargando contactos...", "Caricamento contatti...", "Loading contacts...", "Contacten laden...")}</p>
                      : <div className="mt-3 max-h-[460px] space-y-2 overflow-y-auto pr-1">
                        {filteredContacts.map((contact) => {
                          const member = memberIds.has(contact.id);
                          const eligible = isEligible(contact);
                          return (
                            <div key={contact.id} className="flex items-center justify-between gap-3 rounded-sm border border-border p-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{contactName(contact)}</div>
                                <div className="truncate text-xs text-muted-foreground">{contact.email}</div>
                                <div className={`mt-1 flex items-center gap-1 text-xs ${eligible ? "text-secondary-foreground" : "text-destructive"}`}>
                                  {eligible ? <CheckCircle2 size={13} aria-hidden="true" /> : <XCircle size={13} aria-hidden="true" />}
                                  {eligible
                                    ? tr("Apto para envíos", "Idoneo all'invio", "Eligible for sending", "Verzendklaar")
                                    : `${contact.status || "pending"} · ${contact.marketing_consent ? "consenso sì" : "consenso no"}`}
                                </div>
                              </div>
                              <button type="button" disabled={busy || Boolean(selected.archived_at)}
                                onClick={() => void setMembership(contact, !member)}
                                className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-3 py-2 text-xs disabled:opacity-50 ${member ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-primary/30 text-primary hover:bg-accent"}`}>
                                {member ? <UserMinus size={14} aria-hidden="true" /> : <UserPlus size={14} aria-hidden="true" />}
                                {member ? tr("Quitar", "Rimuovi", "Remove", "Verwijderen") : tr("Añadir", "Aggiungi", "Add", "Toevoegen")}
                              </button>
                            </div>
                          );
                        })}
                        {filteredContacts.length === 0 && (
                          <p className="py-6 text-sm text-muted-foreground">{tr("No hay contactos.", "Nessun contatto.", "No contacts.", "Geen contacten.")}</p>
                        )}
                      </div>}
                  </section>
                </div>
              )}

              <section className="rounded-sm border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{tr("Archivo", "Archivio", "Archive", "Archief")}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tr("No se borran contactos ni campañas anteriores.", "Non vengono cancellati contatti o campagne precedenti.",
                        "Contacts and historic campaigns are never deleted.", "Contacten en oude campagnes worden nooit verwijderd.")}
                    </p>
                  </div>
                  <button type="button" disabled={busy} onClick={() => void toggleArchive()}
                    className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs hover:bg-accent disabled:opacity-50">
                    {selected.archived_at ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
                    {selected.archived_at
                      ? tr("Restaurar", "Ripristina", "Restore", "Herstellen")
                      : tr("Archivar", "Archivia", "Archive", "Archiveren")}
                  </button>
                </div>
              </section>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
