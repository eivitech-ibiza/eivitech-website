import { useEffect, useMemo, useState } from "react";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Hammer,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { ALLOWED_ADMIN_EMAILS, CLERK_ENABLED, hasClientAdminAccess } from "@/lib/config";
import { addCrmLeadActivity, fetchCrmLeads, updateCrmLead, type CrmLeadUpdatePayload } from "@/lib/crm";
import { tr } from "@/lib/i18n";

type LeadStatus = "new" | "first_contact" | "visit_review" | "proposal" | "follow_up" | "won" | "lost" | "review_portfolio";
type LeadPriority = "alta" | "media" | "baja";
type DashboardTab = "clientes" | "partners" | "control";

type ApiLead = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo_cliente?: string;
  tipo_propiedad?: string;
  zona?: string | null;
  intervencion?: string;
  tiene_fotos?: string;
  tiene_proyecto?: string;
  plazo?: string;
  presupuesto?: string | null;
  mensaje?: string | null;
  source?: string | null;
  utm_source?: string | null;
  next_action?: string | null;
  next_follow_up_at?: string | null;
};

type DashboardLead = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  nombre: string;
  email?: string;
  telefono?: string;
  tipoCliente?: string;
  tipoPropiedad?: string;
  zona?: string;
  intervencion?: string;
  tieneFotos?: string;
  tieneProyecto?: string;
  plazo?: string;
  presupuesto?: string;
  mensaje?: string;
  source?: string;
  utmSource?: string;
  nextAction?: string;
  nextFollowUpAt?: string;
};

type PipelineAction = {
  label: string;
  helper: string;
  payload: CrmLeadUpdatePayload;
  title: string;
  tone?: "primary" | "success" | "danger" | "neutral";
};

const LOGOUT_REDIRECT_URL = "/ibiza-project-accelerator/";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: tr("Solicitud recibida", "Richiesta ricevuta", "Request received"),
  first_contact: tr("Cualificado / primer contacto", "Qualificato / primo contatto", "Qualified / first contact"),
  visit_review: tr("Visita / revisión", "Visita / revisione", "Visit / review"),
  proposal: tr("Presupuesto / evaluación", "Preventivo / valutazione", "Proposal / evaluation"),
  follow_up: "Follow-up",
  won: tr("Concluido / aprobado", "Concluso / approvato", "Closed / approved"),
  lost: tr("Fallido / descartado", "Fallito / scartato", "Lost / rejected"),
  review_portfolio: tr("Reseña / backup", "Recensione / backup", "Review / backup"),
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  alta: tr("Alta", "Alta", "High"),
  media: tr("Media", "Media", "Medium"),
  baja: tr("Baja", "Bassa", "Low"),
};

const SERVICE_LABELS: Record<string, string> = {
  "reforma-integral": tr("Reforma integral", "Ristrutturazione completa", "Full renovation"),
  bano: tr("Baño", "Bagno", "Bathroom"),
  cocina: tr("Cocina", "Cucina", "Kitchen"),
  instalaciones: tr("Instalaciones", "Impianti", "Installations"),
  exterior: tr("Exterior", "Esterno", "Exterior"),
  "local-comercial": tr("Local comercial", "Locale commerciale", "Commercial premises"),
  otro: tr("Otro", "Altro", "Other"),
};

const CLIENT_ACTIONS: PipelineAction[] = [
  {
    label: tr("Qualifica", "Qualifica", "Qualify"),
    helper: tr("Da richiesta a lead qualificato", "Da richiesta a lead qualificato", "Move request to qualified"),
    payload: { status: "first_contact", priority: "media", next_action: tr("Completare qualifica e fissare il prossimo passaggio.", "Completare qualifica e fissare il prossimo passaggio.", "Complete qualification and define next step.") },
    title: tr("Lead qualificato", "Lead qualificato", "Lead qualified"),
    tone: "primary",
  },
  {
    label: tr("Alta priorità", "Alta priorità", "High priority"),
    helper: tr("Segnalalo come opportunità calda", "Segnalalo come opportunità calda", "Mark as hot opportunity"),
    payload: { priority: "alta", next_action: tr("Contattare velocemente e preparare valutazione prioritaria.", "Contattare velocemente e preparare valutazione prioritaria.", "Contact quickly and prepare priority assessment.") },
    title: tr("Priorità aggiornata", "Priorità aggiornata", "Priority updated"),
    tone: "danger",
  },
  {
    label: tr("Visita", "Visita", "Visit"),
    helper: tr("Pronto per sopralluogo", "Pronto per sopralluogo", "Ready for site visit"),
    payload: { status: "visit_review", next_action: tr("Organizzare sopralluogo o revisione tecnica.", "Organizzare sopralluogo o revisione tecnica.", "Schedule site visit or technical review.") },
    title: tr("Spostato a visita", "Spostato a visita", "Moved to visit"),
  },
  {
    label: tr("Preventivo", "Preventivo", "Proposal"),
    helper: tr("Preventivo in preparazione/inviato", "Preventivo in preparazione/inviato", "Proposal prepared/sent"),
    payload: { status: "proposal", next_action: tr("Preparare o inviare preventivo e definire follow-up.", "Preparare o inviare preventivo e definire follow-up.", "Prepare or send proposal and define follow-up.") },
    title: tr("Spostato a preventivo", "Spostato a preventivo", "Moved to proposal"),
  },
  {
    label: "Follow-up",
    helper: tr("Offerta aperta da seguire", "Offerta aperta da seguire", "Open offer to follow up"),
    payload: { status: "follow_up", next_action: tr("Fare follow-up e registrare risposta cliente.", "Fare follow-up e registrare risposta cliente.", "Follow up and record client response.") },
    title: "Follow-up",
  },
  {
    label: tr("Conclusa", "Conclusa", "Won"),
    helper: tr("Trattativa chiusa positivamente", "Trattativa chiusa positivamente", "Deal closed positively"),
    payload: { status: "won", priority: "media", next_action: tr("Preparare consegna, recensione e materiale portfolio.", "Preparare consegna, recensione e materiale portfolio.", "Prepare delivery, review and portfolio material.") },
    title: tr("Trattativa conclusa", "Trattativa conclusa", "Deal won"),
    tone: "success",
  },
  {
    label: tr("Fallita", "Fallita", "Lost"),
    helper: tr("Registra motivo e nota", "Registra motivo e nota", "Record reason and note"),
    payload: { status: "lost", priority: "baja", next_action: tr("Registrare motivo perdita e possibile recupero futuro.", "Registrare motivo perdita e possibile recupero futuro.", "Record lost reason and possible future recovery.") },
    title: tr("Trattativa fallita", "Trattativa fallita", "Deal lost"),
    tone: "neutral",
  },
];

const PARTNER_ACTIONS: PipelineAction[] = [
  {
    label: tr("Contattato", "Contattato", "Contacted"),
    helper: tr("Primo contatto fatto", "Primo contatto fatto", "First contact done"),
    payload: { status: "first_contact", next_action: tr("Richiedere portfolio, prezzi indicativi e disponibilità.", "Richiedere portfolio, prezzi indicativi e disponibilità.", "Request portfolio, indicative prices and availability.") },
    title: tr("Partner contattato", "Partner contattato", "Partner contacted"),
  },
  {
    label: tr("Valutazione", "Valutazione", "Evaluation"),
    helper: tr("Da confrontare con altri fornitori", "Da confrontare con altri fornitori", "Compare with other suppliers"),
    payload: { status: "proposal", priority: "media", next_action: tr("Valutare con scorecard: qualità, prezzo, tempi, garanzie.", "Valutare con scorecard: qualità, prezzo, tempi, garanzie.", "Evaluate with scorecard: quality, price, timing, guarantees.") },
    title: tr("Partner in valutazione", "Partner in valutazione", "Partner in evaluation"),
  },
  {
    label: tr("Approvato", "Approvato", "Approved"),
    helper: tr("Collaboratore utilizzabile", "Collaboratore utilizzabile", "Usable collaborator"),
    payload: { status: "won", priority: "alta", next_action: tr("Inserire tra i collaboratori approvati e definire regole operative.", "Inserire tra i collaboratori approvati e definire regole operative.", "Add to approved collaborators and define operating rules.") },
    title: tr("Partner approvato", "Partner approvato", "Partner approved"),
    tone: "success",
  },
  {
    label: "Backup",
    helper: tr("Opzione secondaria", "Opzione secondaria", "Secondary option"),
    payload: { status: "review_portfolio", priority: "media", next_action: tr("Tenere come backup e rivalutare su progetti compatibili.", "Tenere come backup e rivalutare su progetti compatibili.", "Keep as backup and reassess for compatible projects.") },
    title: tr("Partner in backup", "Partner in backup", "Partner as backup"),
  },
  {
    label: tr("Scartato", "Scartato", "Rejected"),
    helper: tr("Non adatto ora", "Non adatto ora", "Not suitable now"),
    payload: { status: "lost", priority: "baja", next_action: tr("Registrare motivo esclusione.", "Registrare motivo esclusione.", "Record rejection reason.") },
    title: tr("Partner scartato", "Partner scartato", "Partner rejected"),
    tone: "neutral",
  },
];

function mapLead(lead: ApiLead): DashboardLead {
  return {
    id: lead.id || `${lead.email || "lead"}-${lead.created_at || Date.now()}`,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
    status: lead.status || "new",
    priority: lead.priority || "media",
    score: typeof lead.score === "number" ? lead.score : 0,
    nombre: lead.nombre || tr("Senza nome", "Senza nome", "Without name"),
    email: lead.email,
    telefono: lead.telefono,
    tipoCliente: lead.tipo_cliente,
    tipoPropiedad: lead.tipo_propiedad,
    zona: lead.zona ?? undefined,
    intervencion: lead.intervencion,
    tieneFotos: lead.tiene_fotos,
    tieneProyecto: lead.tiene_proyecto,
    plazo: lead.plazo,
    presupuesto: lead.presupuesto ?? undefined,
    mensaje: lead.mensaje ?? undefined,
    source: lead.source ?? undefined,
    utmSource: lead.utm_source ?? undefined,
    nextAction: lead.next_action ?? undefined,
    nextFollowUpAt: lead.next_follow_up_at ?? undefined,
  };
}

function isPartnerLead(lead: DashboardLead) {
  return Boolean(lead.source?.includes("partner") || lead.mensaje?.includes("[PARTNER_COLLABORATOR_APPLICATION]"));
}

function getPartnerInfo(lead: DashboardLead, key: string) {
  const row = lead.mensaje?.split("\n").find((line) => line.toLowerCase().startsWith(`${key.toLowerCase()}:`));
  return row?.split(":").slice(1).join(":").trim() || "—";
}

function normalise(value?: string, labels?: Record<string, string>) {
  if (!value) return "—";
  return labels?.[value] ?? value.replaceAll("-", " ");
}

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusTone(status: LeadStatus) {
  if (status === "won" || status === "review_portfolio") return "border-secondary/30 bg-secondary/10 text-secondary";
  if (status === "proposal" || status === "follow_up") return "border-primary/30 bg-primary/10 text-primary";
  if (status === "lost") return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-border bg-card text-muted-foreground";
}

function getPriorityTone(priority: LeadPriority) {
  if (priority === "alta") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (priority === "media") return "border-primary/30 bg-primary/10 text-primary";
  return "border-border bg-muted text-muted-foreground";
}

function getWhatsAppHref(lead: DashboardLead, partner = false) {
  const rawPhone = (lead.telefono || "").replace(/[^+\d]/g, "");
  const phone = rawPhone.startsWith("+") ? rawPhone.slice(1) : rawPhone;
  const message = encodeURIComponent(
    partner
      ? tr(`Hola ${lead.nombre}, gracias por presentarte como colaborador profesional de Eivitech. ¿Puedes enviarnos portfolio, zona de trabajo, disponibilidad y condiciones orientativas?`, `Ciao ${lead.nombre}, grazie per esserti proposto come collaboratore professionale Eivitech. Puoi inviarci portfolio, zona di lavoro, disponibilità e condizioni orientative?`, `Hi ${lead.nombre}, thanks for applying as an Eivitech professional partner. Could you send us your portfolio, work area, availability and indicative terms?`)
      : tr(`Hola ${lead.nombre}, gracias por contactar con Eivitech. ¿Puedes enviarnos fotos, vídeos o planos para valorar el siguiente paso?`, `Ciao ${lead.nombre}, grazie per aver contattato Eivitech. Puoi inviarci foto, video o planimetrie per valutare il prossimo passo?`, `Hi ${lead.nombre}, thanks for contacting Eivitech. Could you send us photos, videos or plans so we can assess the next step?`)
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/34674735188?text=${message}`;
}

function DashboardShell() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const hasAccess = hasClientAdminAccess(email);
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("clientes");
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function loadLeads() {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const data = await fetchCrmLeads(token);
      setLeads(data.leads.map((lead) => mapLead(lead as ApiLead)));
    } catch (err) {
      console.error("[dashboard] failed to load PostgreSQL leads", err);
      setError(tr(
        "No se han podido cargar los datos desde PostgreSQL. Revisa que el email usado en Clerk esté en BOOTSTRAP_ADMIN_EMAILS de Railway.",
        "Non è stato possibile caricare i dati da PostgreSQL. Controlla che l’email usata in Clerk sia presente in BOOTSTRAP_ADMIN_EMAILS su Railway.",
        "Could not load data from PostgreSQL. Check that the email used in Clerk is included in BOOTSTRAP_ADMIN_EMAILS on Railway."
      ));
    } finally {
      setLoading(false);
    }
  }

  async function applyAction(lead: DashboardLead, action: PipelineAction) {
    setSavingId(lead.id);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const note = notes[lead.id]?.trim();
      const result = await updateCrmLead(token, lead.id, action.payload);

      if (note) {
        await addCrmLeadActivity(token, lead.id, {
          type: "note",
          title: action.title,
          notes: note,
        });
      }

      const updated = mapLead(result.lead as ApiLead);
      setLeads((current) => current.map((item) => (item.id === lead.id ? updated : item)));
      setNotes((current) => ({ ...current, [lead.id]: "" }));
    } catch (err) {
      console.error("[dashboard] failed to update lead", err);
      setError(tr("No se ha podido actualizar el estado.", "Non è stato possibile aggiornare lo stato.", "Could not update status."));
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    if (hasAccess) void loadLeads();
  }, [hasAccess]);

  const clientLeads = useMemo(() => leads.filter((lead) => !isPartnerLead(lead)), [leads]);
  const partnerLeads = useMemo(() => leads.filter(isPartnerLead), [leads]);
  const sortedClients = useMemo(() => [...clientLeads].sort((a, b) => b.score - a.score), [clientLeads]);
  const sortedPartners = useMemo(() => [...partnerLeads].sort((a, b) => Number(b.priority === "alta") - Number(a.priority === "alta") || b.score - a.score), [partnerLeads]);

  const stats = useMemo(() => ({
    clients: clientLeads.length,
    qualified: clientLeads.filter((lead) => lead.status !== "new" && lead.status !== "lost").length,
    high: clientLeads.filter((lead) => lead.priority === "alta").length,
    won: clientLeads.filter((lead) => lead.status === "won").length,
    lost: clientLeads.filter((lead) => lead.status === "lost").length,
    partners: partnerLeads.length,
    approvedPartners: partnerLeads.filter((lead) => lead.status === "won").length,
  }), [clientLeads, partnerLeads]);

  if (!hasAccess) {
    return (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">{tr("Acceso no autorizado", "Accesso non autorizzato", "Unauthorized access")}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {tr("Has iniciado sesión, pero este usuario no está incluido en la lista de acceso operativo del CRM.", "Hai effettuato l’accesso, ma questo utente non è incluso nella lista di accesso operativo del CRM.", "You are signed in, but this user is not included in the CRM operational access list.")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <UserButton />
            <span className="text-sm text-muted-foreground">{email}</span>
            <SignOutButton redirectUrl={LOGOUT_REDIRECT_URL}>
              <button className="rounded-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                {tr("Cerrar sesión", "Esci", "Sign out")}
              </button>
            </SignOutButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-x py-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="eyebrow">Eivitech Ops Partner</div>
          <h1 className="display-lg mt-4">{tr("CRM clientes y partners", "CRM clienti e partner", "Clients and partners CRM")}</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            {tr(
              "Controla solicitudes, colaboradores profesionales, estados de avance, prioridad y notas operativas desde una sola dashboard.",
              "Controlla richieste, collaboratori professionali, stati di avanzamento, priorità e note operative da una sola dashboard.",
              "Control requests, professional partners, progress statuses, priority and operational notes from one dashboard."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 shadow-soft">
          <UserButton />
          <div className="text-sm">
            <div className="font-medium">{tr("Usuario autorizado", "Utente autorizzato", "Authorized user")}</div>
            <div className="text-muted-foreground">{email}</div>
          </div>
          <SignOutButton redirectUrl={LOGOUT_REDIRECT_URL}>
            <button className="rounded-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
              {tr("Cerrar sesión", "Esci", "Sign out")}
            </button>
          </SignOutButton>
        </div>
      </div>

      {error && <div className="mb-6 rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:grid-cols-7">
        <Metric icon={Users} label={tr("Clienti", "Clienti", "Clients")} value={stats.clients} helper={tr("Richieste commerciali", "Richieste commerciali", "Commercial requests")} />
        <Metric icon={ShieldCheck} label={tr("Qualificati", "Qualificati", "Qualified")} value={stats.qualified} helper={tr("Non più nuovi", "Non più nuovi", "No longer new")} />
        <Metric icon={AlertTriangle} label={tr("Alta priorità", "Alta priorità", "High priority")} value={stats.high} helper={tr("Da seguire subito", "Da seguire subito", "Follow immediately")} />
        <Metric icon={CheckCircle2} label={tr("Conclusi", "Conclusi", "Won")} value={stats.won} helper={tr("Trattative chiuse", "Trattative chiuse", "Closed deals")} />
        <Metric icon={Clock} label={tr("Falliti", "Falliti", "Lost")} value={stats.lost} helper={tr("Con motivo da registrare", "Con motivo da registrare", "Reason to record")} />
        <Metric icon={Hammer} label="Partner" value={stats.partners} helper={tr("Candidature", "Candidature", "Applications")} />
        <Metric icon={Wrench} label={tr("Approvati", "Approvati", "Approved")} value={stats.approvedPartners} helper={tr("Collaboratori validati", "Collaboratori validati", "Validated partners")} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 rounded-sm border border-border bg-card p-2 shadow-soft">
        <TabButton active={activeTab === "clientes"} icon={Users} label={tr("Clienti", "Clienti", "Clients")} onClick={() => setActiveTab("clientes")} />
        <TabButton active={activeTab === "partners"} icon={Hammer} label={tr("Partner professionali", "Partner professionali", "Professional partners")} onClick={() => setActiveTab("partners")} />
        <TabButton active={activeTab === "control"} icon={ClipboardCheck} label={tr("Controllo operativo", "Controllo operativo", "Operational control")} onClick={() => setActiveTab("control")} />
        <button onClick={() => void loadLeads()} disabled={loading} className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60">
          <RefreshCw size={15} /> {loading ? tr("Caricamento…", "Caricamento…", "Loading…") : tr("Aggiorna", "Aggiorna", "Refresh")}
        </button>
      </div>

      {activeTab === "clientes" && (
        <LeadsBoard
          type="client"
          leads={sortedClients}
          actions={CLIENT_ACTIONS}
          loading={loading}
          savingId={savingId}
          notes={notes}
          setNotes={setNotes}
          onAction={applyAction}
        />
      )}

      {activeTab === "partners" && (
        <LeadsBoard
          type="partner"
          leads={sortedPartners}
          actions={PARTNER_ACTIONS}
          loading={loading}
          savingId={savingId}
          notes={notes}
          setNotes={setNotes}
          onAction={applyAction}
        />
      )}

      {activeTab === "control" && <ControlPanel />}

      <div className="mt-8 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">
        <div className="font-medium text-foreground">{tr("Utenti frontend autorizzati", "Utenti frontend autorizzati", "Authorized frontend users")}</div>
        <div className="mt-2">{ALLOWED_ADMIN_EMAILS.length > 0 ? ALLOWED_ADMIN_EMAILS.join(", ") : tr("Nessuna allowlist frontend configurata.", "Nessuna allowlist frontend configurata.", "No frontend allowlist configured.")}</div>
      </div>
    </section>
  );
}

function LeadsBoard({ type, leads, actions, loading, savingId, notes, setNotes, onAction }: {
  type: "client" | "partner";
  leads: DashboardLead[];
  actions: PipelineAction[];
  loading: boolean;
  savingId: string | null;
  notes: Record<string, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAction: (lead: DashboardLead, action: PipelineAction) => Promise<void>;
}) {
  const emptyText = type === "partner"
    ? tr("Non ci sono ancora candidature partner.", "Non ci sono ancora candidature partner.", "There are no partner applications yet.")
    : tr("Non ci sono ancora richieste cliente.", "Non ci sono ancora richieste cliente.", "There are no client requests yet.");

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.38fr]">
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-sm border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">{tr("Caricamento dati da PostgreSQL…", "Caricamento dati da PostgreSQL…", "Loading data from PostgreSQL…")}</div>
        ) : leads.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              type={type}
              lead={lead}
              actions={actions}
              saving={savingId === lead.id}
              note={notes[lead.id] || ""}
              onNoteChange={(value) => setNotes((current) => ({ ...current, [lead.id]: value }))}
              onAction={(action) => onAction(lead, action)}
            />
          ))
        )}
      </div>

      <aside className="space-y-4">
        <PipelineSummary leads={leads} />
        <div className="rounded-sm border border-primary/25 bg-primary/10 p-5 text-sm shadow-soft">
          <div className="font-medium text-foreground">{type === "partner" ? tr("Metodo partner", "Metodo partner", "Partner method") : tr("Metodo cliente", "Metodo cliente", "Client method")}</div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {type === "partner"
              ? tr("Non approvare un collaboratore solo perché è disponibile: prima servono portfolio, prezzi, tempi, garanzie e una prova o referenza.", "Non approvare un collaboratore solo perché è disponibile: prima servono portfolio, prezzi, tempi, garanzie e una prova o referenza.", "Do not approve a partner just because they are available: first collect portfolio, prices, timing, guarantees and a test or reference.")
              : tr("Ogni lead deve avere prossimo step chiaro: qualifica, visita, preventivo, follow-up, concluso o fallito con motivo.", "Ogni lead deve avere prossimo step chiaro: qualifica, visita, preventivo, follow-up, concluso o fallito con motivo.", "Every lead needs a clear next step: qualification, visit, proposal, follow-up, won or lost with reason.")}
          </p>
        </div>
      </aside>
    </div>
  );
}

function LeadCard({ type, lead, actions, saving, note, onNoteChange, onAction }: {
  type: "client" | "partner";
  lead: DashboardLead;
  actions: PipelineAction[];
  saving: boolean;
  note: string;
  onNoteChange: (value: string) => void;
  onAction: (action: PipelineAction) => void;
}) {
  const partner = type === "partner";

  return (
    <article className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl">{lead.nombre}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusTone(lead.status)}`}>{STATUS_LABELS[lead.status]}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getPriorityTone(lead.priority)}`}>{tr("Priorità", "Priorità", "Priority")} {PRIORITY_LABELS[lead.priority]}</span>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">Score {lead.score}/100</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{lead.email || "—"}</span>
            <span>{lead.telefono || "—"}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={13} /> {lead.zona || "Ibiza"}</span>
            <span>{formatDate(lead.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getWhatsAppHref(lead, partner)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-3 py-2 text-xs font-medium text-white">
            <MessageCircle size={14} /> WhatsApp
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}?subject=Eivitech Ibiza`} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-medium hover:bg-accent">
              <Mail size={14} /> Email
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
        {partner ? (
          <>
            <Info label={tr("Categoria", "Categoria", "Category")} value={getPartnerInfo(lead, "Categoría")} />
            <Info label={tr("Azienda", "Azienda", "Company")} value={getPartnerInfo(lead, "Empresa/marca")} />
            <Info label={tr("Esperienza", "Esperienza", "Experience")} value={getPartnerInfo(lead, "Experiencia")} />
            <Info label={tr("Disponibilità", "Disponibilità", "Availability")} value={getPartnerInfo(lead, "Disponibilidad")} />
          </>
        ) : (
          <>
            <Info label="Authority" value={normalise(lead.tipoCliente)} />
            <Info label={tr("Proprietà", "Proprietà", "Property")} value={normalise(lead.tipoPropiedad)} />
            <Info label="Need" value={normalise(lead.intervencion, SERVICE_LABELS)} />
            <Info label="Timing" value={normalise(lead.plazo)} />
          </>
        )}
      </div>

      {lead.nextAction && (
        <div className="mt-4 rounded-sm bg-accent/50 p-4 text-sm">
          <div className="font-medium">{tr("Prossima azione", "Prossima azione", "Next action")}</div>
          <p className="mt-1 text-muted-foreground">{lead.nextAction}</p>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.65fr]">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">{tr("Nota interna / motivo", "Nota interna / motivo", "Internal note / reason")}</label>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={partner ? tr("Esempio: buon portfolio, prezzi da confrontare, disponibile solo su lavori programmati…", "Esempio: buon portfolio, prezzi da confrontare, disponibile solo su lavori programmati…", "Example: good portfolio, prices to compare, only available for scheduled work…") : tr("Esempio: budget non chiaro, cliente da richiamare venerdì, trattativa persa per prezzo…", "Esempio: budget non chiaro, cliente da richiamare venerdì, trattativa persa per prezzo…", "Example: budget unclear, call client Friday, deal lost due to price…")}
            className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
          {actions.map((action) => (
            <ActionButton key={`${lead.id}-${action.label}`} action={action} disabled={saving} onClick={() => onAction(action)} />
          ))}
        </div>
      </div>
    </article>
  );
}

function PipelineSummary({ leads }: { leads: DashboardLead[] }) {
  const rows = (Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => ({ status, total: leads.filter((lead) => lead.status === status).length }));

  return (
    <div className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium"><Target size={17} className="text-primary" /> Pipeline</div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.status} className="flex items-center justify-between gap-3 border-b border-border/70 pb-2 last:border-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{STATUS_LABELS[row.status]}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(row.status)}`}>{row.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ action, disabled, onClick }: { action: PipelineAction; disabled: boolean; onClick: () => void }) {
  const tone = action.tone || "primary";
  const toneClass = tone === "success"
    ? "border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/15"
    : tone === "danger"
      ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
      : tone === "neutral"
        ? "border-border bg-background text-muted-foreground hover:bg-accent"
        : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15";

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`rounded-sm border px-3 py-2 text-left text-xs transition disabled:opacity-50 ${toneClass}`}>
      <span className="block font-medium">{disabled ? tr("Salvataggio…", "Salvataggio…", "Saving…") : action.label}</span>
      <span className="mt-0.5 block text-[11px] opacity-80">{action.helper}</span>
    </button>
  );
}

function ControlPanel() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="rounded-sm border border-border bg-card p-6 shadow-card lg:col-span-2">
        <h2 className="font-display text-2xl">{tr("Logica operativa", "Logica operativa", "Operational logic")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tr(
            "Il CRM ora separa due flussi: clienti e partner professionali. I partner entrano dallo stesso database come lead marcati partner, così non servono modifiche rischiose al backend prima di validare il processo.",
            "Il CRM ora separa due flussi: clienti e partner professionali. I partner entrano dallo stesso database come lead marcati partner, così non servono modifiche rischiose al backend prima di validare il processo.",
            "The CRM now separates two flows: clients and professional partners. Partners enter the same database as partner-marked leads, avoiding risky backend changes before validating the process."
          )}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <RoadmapCard title="1. Intake" items={[tr("Cliente o partner sceglie il form corretto", "Cliente o partner sceglie il form corretto", "Client or partner chooses the right form"), tr("Dati minimi obbligatori", "Dati minimi obbligatori", "Required minimum data"), tr("Salvataggio in PostgreSQL", "Salvataggio in PostgreSQL", "Saved in PostgreSQL")]} />
          <RoadmapCard title="2. Qualifica" items={[tr("Status manuale", "Status manuale", "Manual status"), tr("Priorità alta/media/bassa", "Priorità alta/media/bassa", "High/medium/low priority"), tr("Nota interna obbligatoria per lost/rejected", "Nota interna obbligatoria per lost/rejected", "Internal note for lost/rejected")]} />
          <RoadmapCard title="3. Esecuzione" items={[tr("Follow-up", "Follow-up", "Follow-up"), tr("Preventivo o valutazione", "Preventivo o valutazione", "Proposal or evaluation"), tr("Concluso/Approvato o Fallito/Scartato", "Concluso/Approvato o Fallito/Scartato", "Won/approved or lost/rejected")]} />
        </div>
      </div>
      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium"><FileText size={17} className="text-primary" /> {tr("Regole minime", "Regole minime", "Minimum rules")}</div>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <ChecklistItem ok label={tr("Ogni cambio importante deve avere una nota", "Ogni cambio importante deve avere una nota", "Every important change should have a note")} />
          <ChecklistItem ok label={tr("Alta priorità solo se c'è urgenza o valore reale", "Alta priorità solo se c'è urgenza o valore reale", "High priority only with urgency or real value")} />
          <ChecklistItem ok label={tr("Partner approvato solo con evidenze", "Partner approvato solo con evidenze", "Partner approved only with evidence")} />
          <ChecklistItem ok label={tr("Trattativa fallita sempre con motivo", "Trattativa fallita sempre con motivo", "Lost deal always with reason")} />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: number; helper: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <Icon size={20} className="text-primary" />
      <div className="mt-4 text-3xl font-medium tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
      <Icon size={15} /> {label}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2">
      <Icon size={14} className={ok ? "text-secondary" : "text-primary"} />
      <span>{label}</span>
    </div>
  );
}

function RoadmapCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <div className="font-medium">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

const Dashboard = () => (
  <>
    <SEO title="CRM Dashboard | Eivitech Ibiza" description={tr("Dashboard privada para gestión de clientes y partners profesionales Eivitech Ibiza.", "Dashboard privata per gestione clienti e partner professionali Eivitech Ibiza.", "Private dashboard to manage Eivitech Ibiza clients and professional partners.")} path="/dashboard" />
    {!CLERK_ENABLED ? (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">{tr("Clerk todavía no está configurado", "Clerk non è ancora configurato", "Clerk is not configured yet")}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {tr("Añade la variable VITE_CLERK_PUBLISHABLE_KEY en GitHub Actions. No añadas nunca claves secretas al frontend.", "Aggiungi la variabile VITE_CLERK_PUBLISHABLE_KEY in GitHub Actions. Non aggiungere mai chiavi segrete nel frontend.", "Add the VITE_CLERK_PUBLISHABLE_KEY variable in GitHub Actions. Never add secret keys to the frontend.")}
          </p>
        </div>
      </section>
    ) : (
      <>
        <SignedOut>
          <section className="container-x py-20">
            <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock size={22} />
              </div>
              <h1 className="display-md mt-5">{tr("Acceso privado al CRM", "Accesso privato al CRM", "Private CRM access")}</h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {tr("Inicia sesión con una cuenta autorizada para acceder a la dashboard operativa de Eivitech.", "Accedi con un account autorizzato per entrare nella dashboard operativa di Eivitech.", "Sign in with an authorized account to access the Eivitech operational dashboard.")}
              </p>
              <SignInButton mode="modal">
                <button className="mt-6 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {tr("Iniciar sesión", "Accedi", "Sign in")}
                </button>
              </SignInButton>
            </div>
          </section>
        </SignedOut>
        <SignedIn>
          <DashboardShell />
        </SignedIn>
      </>
    )}
  </>
);

export default Dashboard;
