import { useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, Pencil, Plus, Search, UserMinus, UserPlus, XCircle } from "lucide-react";
import {
  createMarketingContact,
  fetchMarketingContacts,
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const memberIds = useMemo(() => new Set(members.map((member) => member.id)), [members]);
  const eligibleCount = useMemo(() => members.filter(isEligible).length, [members]);
  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allContacts;
    return allContacts.filter((contact) =>
      `${contact.first_name || ""} ${contact.last_name || ""} ${contact.email}`.toLowerCase().includes(query),
    );
  }, [allContacts, search]);

  async function tokenOrThrow() {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    return token;
  }

  async function loadSegment(segment: MarketingSegment) {
    setBusy(true);
    setError(null);
    setNotice(null);
    setSelectedId(segment.id);
    setName(segment.name);
    setDescription(segment.description || "");
    try {
      const token = await tokenOrThrow();
      const [memberData, contactData] = await Promise.all([
        fetchMarketingContacts(token, { segmentId: segment.id }),
        fetchMarketingContacts(token),
      ]);
      setMembers(memberData.contacts);
      setAllContacts(contactData.contacts);
    } catch (err) {
      console.error("[segment-manager] load failed", err);
      setError(tr("No se ha podido cargar el segmento.", "Non è stato possibile caricare il segmento.", "Could not load the segment.", "Het segment kon niet worden geladen."));
    } finally {
      setBusy(false);
    }
  }

  async function refreshSelected(segmentId = selectedId) {
    if (!segmentId) return;
    const token = await tokenOrThrow();
    const [memberData, contactData] = await Promise.all([
      fetchMarketingContacts(token, { segmentId }),
      fetchMarketingContacts(token),
    ]);
    setMembers(memberData.contacts);
    setAllContacts(contactData.contacts);
    await onChanged();
  }

  async function saveMetadata() {
    if (!selectedId || !name.trim()) return;
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
    if (!selectedId) return;
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
    if (!selectedId) return;
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

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            onClick={() => void loadSegment(segment)}
            className={`rounded-sm border bg-card p-5 text-left shadow-soft transition hover:border-primary/50 hover:shadow-md ${selectedId === segment.id ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium">{segment.name}</div>
              <Pencil size={16} className="shrink-0 text-primary" />
            </div>
            <div className="mt-2 min-h-10 text-sm text-muted-foreground">{segment.description || tr("Sin descripción", "Senza descrizione", "No description", "Geen beschrijving")}</div>
            <div className="mt-5 text-3xl font-medium">{segment.member_count || 0}</div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Contactos · haz clic para editar", "Contatti · clicca per modificare", "Contacts · click to edit", "Contacten · klik om te bewerken")}</div>
          </button>
        ))}
        {segments.length === 0 && (
          <div className="rounded-sm border border-dashed border-border p-8 text-sm text-muted-foreground">
            {tr("Crea el primer segmento.", "Crea il primo segmento.", "Create the first segment.", "Maak het eerste segment.")}
          </div>
        )}
      </div>

      {selected && (
        <div className="rounded-sm border border-primary/30 bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="eyebrow">{tr("Editar segmento", "Modifica segmento", "Edit segment", "Segment bewerken")}</div>
              <h3 className="mt-2 text-xl font-medium">{selected.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-sm border border-border px-4 py-3">
                <div className="text-2xl font-medium">{members.length}</div>
                <div className="text-xs uppercase text-muted-foreground">{tr("Miembros", "Membri", "Members", "Leden")}</div>
              </div>
              <div className="rounded-sm border border-secondary/30 bg-secondary/10 px-4 py-3">
                <div className="text-2xl font-medium">{eligibleCount}</div>
                <div className="text-xs uppercase text-muted-foreground">{tr("Aptos", "Idonei", "Eligible", "Geschikt")}</div>
              </div>
            </div>
          </div>

          {error && <div className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {notice && <div className="mt-4 rounded-sm border border-secondary/30 bg-secondary/10 p-3 text-sm">{notice}</div>}

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-sm border border-border p-4">
                <div className="font-medium">{tr("Datos del segmento", "Dati segmento", "Segment details", "Segmentgegevens")}</div>
                <label className="mt-3 block text-sm">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Nombre", "Nome", "Name", "Naam")}</span>
                  <input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Descripción", "Descrizione", "Description", "Beschrijving")}</span>
                  <textarea className="mt-1 min-h-24 w-full rounded-sm border border-border bg-background px-3 py-2.5" value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <button type="button" disabled={busy || !name.trim()} onClick={() => void saveMetadata()} className="mt-3 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                  {tr("Guardar cambios", "Salva modifiche", "Save changes", "Wijzigingen opslaan")}
                </button>
              </div>

              <div className="rounded-sm border border-border p-4">
                <div className="flex items-center gap-2 font-medium"><Plus size={16} className="text-primary" /> {tr("Añadir por email", "Aggiungi per email", "Add by email", "Toevoegen via e-mail")}</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input type="email" placeholder="email@dominio.com" className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2" value={quickEmail} onChange={(event) => setQuickEmail(event.target.value)} />
                  <input placeholder={tr("Nombre", "Nome", "First name", "Voornaam")} className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm" value={quickFirstName} onChange={(event) => setQuickFirstName(event.target.value)} />
                  <input placeholder={tr("Apellido", "Cognome", "Last name", "Achternaam")} className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm" value={quickLastName} onChange={(event) => setQuickLastName(event.target.value)} />
                </div>
                <label className="mt-3 flex items-start gap-3 rounded-sm border border-border p-3 text-sm">
                  <input type="checkbox" className="mt-1" checked={quickConsent} onChange={(event) => setQuickConsent(event.target.checked)} />
                  <span>{tr("Existe consentimiento marketing explícito y documentado", "Esiste consenso marketing esplicito e documentato", "Explicit documented marketing consent exists", "Er is expliciete gedocumenteerde marketingtoestemming")}</span>
                </label>
                <button type="button" disabled={busy || !quickEmail.trim()} onClick={() => void addByEmail()} className="mt-3 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                  <UserPlus size={16} /> {tr("Añadir al segmento", "Aggiungi al segmento", "Add to segment", "Aan segment toevoegen")}
                </button>
              </div>
            </div>

            <div className="rounded-sm border border-border p-4">
              <div className="font-medium">{tr("Gestionar contactos", "Gestisci contatti", "Manage contacts", "Contacten beheren")}</div>
              <div className="relative mt-3">
                <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
                <input className="w-full rounded-sm border border-border bg-background py-2.5 pl-9 pr-3 text-sm" placeholder={tr("Buscar nombre o email", "Cerca nome o email", "Search name or email", "Zoek naam of e-mail")} value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {filteredContacts.map((contact) => {
                  const member = memberIds.has(contact.id);
                  const eligible = isEligible(contact);
                  return (
                    <div key={contact.id} className="flex items-center justify-between gap-3 rounded-sm border border-border p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{contactName(contact)}</div>
                        <div className="truncate text-xs text-muted-foreground">{contact.email}</div>
                        <div className={`mt-1 inline-flex items-center gap-1 text-xs ${eligible ? "text-secondary-foreground" : "text-destructive"}`}>
                          {eligible ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {eligible
                            ? tr("Apto para envíos", "Idoneo all’invio", "Eligible for sending", "Verzendklaar")
                            : `${contact.status || "pending"} · ${contact.marketing_consent ? "consenso sì" : "consenso no"}`}
                        </div>
                      </div>
                      <button type="button" disabled={busy} onClick={() => void setMembership(contact, !member)} className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-3 py-2 text-xs ${member ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-primary/30 text-primary hover:bg-primary/10"}`}>
                        {member ? <UserMinus size={14} /> : <UserPlus size={14} />}
                        {member ? tr("Quitar", "Rimuovi", "Remove", "Verwijderen") : tr("Añadir", "Aggiungi", "Add", "Toevoegen")}
                      </button>
                    </div>
                  );
                })}
                {!busy && filteredContacts.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">{tr("No hay contactos.", "Nessun contatto.", "No contacts.", "Geen contacten.")}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
