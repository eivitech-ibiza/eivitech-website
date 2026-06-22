import { useEffect, useMemo, useState } from "react";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  Hammer,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { ALLOWED_ADMIN_EMAILS, CLERK_ENABLED, hasClientAdminAccess } from "@/lib/config";
import { fetchCrmLeads } from "@/lib/crm";
import { tr } from "@/lib/i18n";

type ApiLead = {
  id?: string;
  created_at?: string;
  status?: string;
  priority?: string;
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
  utm_campaign?: string | null;
  next_action?: string | null;
};

type DashboardLead = {
  id: string;
  createdAt?: string;
  status?: string;
  score: number;
  nombre?: string;
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
  utmCampaign?: string;
  nextAction?: string;
};

type CollaboratorCategory = {
  id: string;
  category: string;
  scope: string;
  risk: "alto" | "medio" | "bajo";
  status: "critico" | "scouting" | "estable" | "backup";
  why: string;
  nextAction: string;
  dataToCollect: string[];
};

type DashboardTab = "clientes" | "colaboradores" | "control";

const LOGOUT_REDIRECT_URL = "/ibiza-project-accelerator/";

const SERVICE_LABELS: Record<string, string> = {
  "reforma-integral": tr("Reforma integral", "Ristrutturazione completa", "Full renovation"),
  bano: tr("Baño", "Bagno", "Bathroom"),
  cocina: tr("Cocina", "Cucina", "Kitchen"),
  instalaciones: tr("Instalaciones", "Impianti", "Installations"),
  exterior: tr("Exterior", "Esterno", "Exterior"),
  "local-comercial": tr("Local comercial", "Locale commerciale", "Commercial premises"),
  otro: tr("Otro", "Altro", "Other"),
};

const PROPERTY_LABELS: Record<string, string> = {
  villa: "Villa",
  apartamento: tr("Apartamento", "Appartamento", "Apartment"),
  casa: "Casa",
  "local-comercial": tr("Local comercial", "Locale commerciale", "Commercial premises"),
  otro: tr("Otro", "Altro", "Other"),
};

const CLIENT_LABELS: Record<string, string> = {
  propietario: tr("Propietario", "Proprietario", "Owner"),
  comprador: tr("Comprador", "Acquirente", "Buyer"),
  inversor: tr("Inversor", "Investitore", "Investor"),
  agencia: tr("Agencia", "Agenzia", "Agency"),
  empresa: tr("Empresa", "Impresa", "Company"),
  otro: tr("Otro", "Altro", "Other"),
};

const STATUS_LABELS: Record<string, string> = {
  new: tr("Solicitud recibida", "Richiesta ricevuta", "Request received"),
  first_contact: tr("Primera valoración", "Prima valutazione", "First assessment"),
  visit_review: tr("Visita / revisión", "Visita / revisione", "Visit / review"),
  proposal: tr("Presupuesto", "Preventivo", "Proposal"),
  follow_up: "Follow-up",
  won: tr("Trabajo cerrado", "Lavoro chiuso", "Closed job"),
  lost: tr("Perdido", "Perso", "Lost"),
  review_portfolio: tr("Reseña / portfolio", "Recensione / portfolio", "Review / portfolio"),
};

const PRIORITY_LABELS = {
  high: tr("Alta", "Alta", "High"),
  medium: tr("Media", "Media", "Medium"),
  low: tr("Baja", "Bassa", "Low"),
};

const BUCKET_LABELS = {
  qualified: tr("Cualificada", "Qualificata", "Qualified"),
  visitReady: tr("Lista para visita", "Pronta per visita", "Ready for visit"),
  proposalFollowUp: tr("Presupuesto / follow-up", "Preventivo / follow-up", "Proposal / follow-up"),
  missingData: tr("Faltan datos", "Dati mancanti", "Missing data"),
  review: tr("Por revisar", "Da verificare", "To review"),
};

const COLLABORATOR_CATEGORIES: CollaboratorCategory[] = [
  {
    id: "carpinteria",
    category: tr("Carpintería a medida", "Falegnameria su misura", "Custom carpentry"),
    scope: tr(
      "Puertas, armarios, panelados, cocinas a medida y muebles especiales.",
      "Porte, armadi, pannellature, cucine su misura e mobili speciali.",
      "Doors, wardrobes, panels, custom kitchens and special furniture."
    ),
    risk: "alto",
    status: "critico",
    why: tr(
      "Categoría señalada como una de las que más puede erosionar margen, por precios variables y trabajos a medida.",
      "Categoria indicata come una di quelle che può erodere maggiormente il margine, per prezzi variabili e lavorazioni su misura.",
      "Category identified as one of the most likely to erode margin, due to variable pricing and custom work."
    ),
    nextAction: tr(
      "Crear comparativa con mínimo 3 opciones y pedir presupuesto sobre el mismo caso ficticio.",
      "Creare una comparativa con almeno 3 opzioni e chiedere un preventivo sullo stesso caso fittizio.",
      "Create a comparison with at least 3 options and request a quote for the same test case."
    ),
    dataToCollect: [
      tr("rango precios", "fascia prezzi", "price range"),
      tr("plazos reales", "tempi reali", "real timelines"),
      tr("fotos trabajos", "foto lavori", "work photos"),
      tr("condiciones anticipo", "condizioni anticipo", "deposit terms"),
      tr("garantía / correcciones", "garanzia / correzioni", "warranty / corrections"),
    ],
  },
  {
    id: "aluminio",
    category: tr("Aluminio, ventanas y cerramientos", "Alluminio, finestre e infissi", "Aluminium, windows and frames"),
    scope: tr(
      "Ventanas, cerramientos, carpintería de aluminio y sustituciones puntuales.",
      "Finestre, serramenti, carpenteria in alluminio e sostituzioni puntuali.",
      "Windows, frames, aluminium carpentry and specific replacements."
    ),
    risk: "alto",
    status: "critico",
    why: tr(
      "Riesgo operativo alto si se paga anticipo y la instalación se retrasa, porque Eivitech queda expuesta ante el cliente final.",
      "Rischio operativo alto se viene pagato l’anticipo e l’installazione ritarda, perché Eivitech resta esposta verso il cliente finale.",
      "High operational risk if a deposit is paid and installation is delayed, because Eivitech remains exposed to the final client."
    ),
    nextAction: tr(
      "Buscar alternativas y registrar por escrito fecha estimada, anticipo, penalización interna y responsable.",
      "Cercare alternative e registrare per iscritto data stimata, anticipo, penalizzazione interna e responsabile.",
      "Find alternatives and record estimated date, deposit, internal penalty and owner in writing."
    ),
    dataToCollect: [
      tr("fecha instalación", "data installazione", "installation date"),
      tr("anticipo", "anticipo", "deposit"),
      tr("tiempo fabricación", "tempo produzione", "fabrication time"),
      tr("persona responsable", "persona responsabile", "responsible person"),
      tr("historial retrasos", "storico ritardi", "delay history"),
    ],
  },
  {
    id: "cristaleria",
    category: tr("Cristalería y espejos", "Vetreria e specchi", "Glasswork and mirrors"),
    scope: tr(
      "Vidrios, mamparas, espejos, detalles de baño y cerramientos ligeros.",
      "Vetri, pareti doccia, specchi, dettagli bagno e chiusure leggere.",
      "Glass, shower screens, mirrors, bathroom details and light enclosures."
    ),
    risk: "medio",
    status: "scouting",
    why: tr(
      "Suele depender de medición precisa, fabricación externa y montaje limpio en fase final.",
      "Dipende spesso da misurazioni precise, produzione esterna e montaggio pulito nella fase finale.",
      "Often depends on precise measurement, external fabrication and clean installation in the final phase."
    ),
    nextAction: tr(
      "Preparar ficha de proveedor con tiempos, disponibilidad y trabajos anteriores.",
      "Preparare una scheda fornitore con tempi, disponibilità e lavori precedenti.",
      "Prepare a supplier sheet with timelines, availability and previous work."
    ),
    dataToCollect: [
      tr("zonas cubiertas", "zone coperte", "covered areas"),
      tr("tiempo medición", "tempo misurazione", "measurement time"),
      tr("tiempo entrega", "tempo consegna", "delivery time"),
      tr("precio montaje", "prezzo montaggio", "installation price"),
      tr("seguro / roturas", "assicurazione / rotture", "insurance / breakages"),
    ],
  },
  {
    id: "marmolistas",
    category: tr("Mármol, piedra y encimeras", "Marmo, pietra e piani cucina", "Marble, stone and countertops"),
    scope: tr(
      "Encimeras, travertino, piedra natural, piezas especiales y acabados premium.",
      "Piani cucina, travertino, pietra naturale, pezzi speciali e finiture premium.",
      "Countertops, travertine, natural stone, special pieces and premium finishes."
    ),
    risk: "medio",
    status: "backup",
    why: tr(
      "Impacta mucho en percepción premium del proyecto y puede bloquear cocina/baño si llega tarde.",
      "Incide molto sulla percezione premium del progetto e può bloccare cucina o bagno se arriva in ritardo.",
      "Strongly affects the premium perception of the project and can block kitchen or bathroom delivery if delayed."
    ),
    nextAction: tr(
      "Tener proveedor principal y backup por tipo de material.",
      "Avere fornitore principale e backup per tipo di materiale.",
      "Have a primary supplier and a backup by material type."
    ),
    dataToCollect: [
      tr("materiales", "materiali", "materials"),
      tr("muestras", "campioni", "samples"),
      tr("plazo corte", "tempo taglio", "cutting time"),
      tr("plazo instalación", "tempo installazione", "installation time"),
      tr("condiciones reposición", "condizioni sostituzione", "replacement terms"),
    ],
  },
  {
    id: "herreria",
    category: tr("Herrería / metal", "Fabbro / metallo", "Metalwork"),
    scope: tr(
      "Barandillas, pasamanos, puertas metálicas, botolas y piezas especiales.",
      "Ringhiere, corrimano, porte metalliche, botole e pezzi speciali.",
      "Railings, handrails, metal doors, hatches and special pieces."
    ),
    risk: "medio",
    status: "scouting",
    why: tr(
      "Trabajos puntuales pero críticos cuando afectan seguridad, acabado o entrega.",
      "Lavori puntuali ma critici quando incidono su sicurezza, finitura o consegna.",
      "Occasional but critical work when it affects safety, finishes or delivery."
    ),
    nextAction: tr(
      "Crear lista de 2-3 herreros con fotos, rango de precios y disponibilidad.",
      "Creare una lista di 2-3 fabbri con foto, fascia prezzi e disponibilità.",
      "Create a list of 2-3 metalworkers with photos, price range and availability."
    ),
    dataToCollect: [
      tr("especialidad", "specializzazione", "specialty"),
      tr("soldadura", "saldatura", "welding"),
      tr("acabados", "finiture", "finishes"),
      tr("plazos", "tempi", "timelines"),
      tr("trabajos similares", "lavori simili", "similar work"),
    ],
  },
  {
    id: "arquitectura",
    category: tr("Arquitectura / diseño / dirección técnica", "Architettura / design / direzione tecnica", "Architecture / design / technical management"),
    scope: tr(
      "Apoyo técnico cuando el cliente no tiene arquitecto o necesita definición de proyecto.",
      "Supporto tecnico quando il cliente non ha un architetto o ha bisogno di definire il progetto.",
      "Technical support when the client has no architect or needs project definition."
    ),
    risk: "medio",
    status: "estable",
    why: tr(
      "Clave para clientes premium, inversores y proyectos con decisiones complejas.",
      "Chiave per clienti premium, investitori e progetti con decisioni complesse.",
      "Key for premium clients, investors and projects with complex decisions."
    ),
    nextAction: tr(
      "Definir cuándo se activa este partner y qué documentación debe entregar.",
      "Definire quando attivare questo partner e quale documentazione deve consegnare.",
      "Define when this partner is activated and what documentation must be delivered."
    ),
    dataToCollect: [
      tr("tipo proyecto", "tipo progetto", "project type"),
      tr("honorarios", "onorari", "fees"),
      tr("tiempos", "tempi", "timelines"),
      tr("entregables", "consegne", "deliverables"),
      tr("licencias / permisos", "licenze / permessi", "licenses / permits"),
    ],
  },
];

const CLIENT_SEGMENTS = [
  {
    title: tr("Propietario vivienda / villa", "Proprietario casa / villa", "House / villa owner"),
    focus: tr(
      "Quiere reformar sin coordinar oficios, materiales y decisiones cada día.",
      "Vuole ristrutturare senza coordinare ogni giorno artigiani, materiali e decisioni.",
      "Wants to renovate without coordinating trades, materials and decisions every day."
    ),
    filter: tr(
      "Fotos, zona, alcance, timing, presupuesto orientativo y disponibilidad para visita.",
      "Foto, zona, portata lavori, timing, budget orientativo e disponibilità per visita.",
      "Photos, area, scope, timing, indicative budget and availability for visit."
    ),
  },
  {
    title: tr("Inversor o comprador", "Investitore o acquirente", "Investor or buyer"),
    focus: tr(
      "Quiere valorar potencial, coste orientativo y mejora del inmueble antes o después de comprar.",
      "Vuole valutare potenziale, costo orientativo e miglioramento dell’immobile prima o dopo l’acquisto.",
      "Wants to assess potential, indicative cost and property improvement before or after buying."
    ),
    filter: tr(
      "Objetivo económico, prioridad de trabajos, urgencia y nivel de decisión.",
      "Obiettivo economico, priorità lavori, urgenza e livello decisionale.",
      "Economic objective, work priority, urgency and decision level."
    ),
  },
  {
    title: tr("Local comercial / restaurante / bar", "Locale commerciale / ristorante / bar", "Commercial premises / restaurant / bar"),
    focus: tr(
      "Necesita imagen, funcionalidad y entrega ordenada sin perder semanas operativas.",
      "Ha bisogno di immagine, funzionalità e consegna ordinata senza perdere settimane operative.",
      "Needs image, functionality and orderly delivery without losing operational weeks."
    ),
    filter: tr(
      "Fecha objetivo, permisos, instalaciones, imagen deseada y restricciones de apertura.",
      "Data obiettivo, permessi, impianti, immagine desiderata e vincoli di apertura.",
      "Target date, permits, installations, desired image and opening constraints."
    ),
  },
  {
    title: tr("Agencia / property manager", "Agenzia / property manager", "Agency / property manager"),
    focus: tr(
      "Busca referente local fiable para resolver trabajos y reformas de clientes.",
      "Cerca un referente locale affidabile per gestire lavori e ristrutturazioni dei clienti.",
      "Looks for a reliable local point of contact for client works and renovations."
    ),
    filter: tr(
      "Tipo de relación, volumen potencial, tiempos de respuesta y expectativas de reporting.",
      "Tipo di relazione, volume potenziale, tempi di risposta e aspettative di reportistica.",
      "Relationship type, potential volume, response times and reporting expectations."
    ),
  },
];

function normalise(value?: string, labels?: Record<string, string>) {
  if (!value) return "—";
  return labels?.[value] ?? value.replaceAll("-", " ");
}

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function mapLead(lead: ApiLead): DashboardLead {
  return {
    id: lead.id || `${lead.email || "lead"}-${lead.created_at || Date.now()}`,
    createdAt: lead.created_at,
    status: lead.status,
    score: typeof lead.score === "number" ? lead.score : 0,
    nombre: lead.nombre,
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
    utmCampaign: lead.utm_campaign ?? undefined,
    nextAction: lead.next_action ?? undefined,
  };
}

function getPriorityTone(score: number) {
  if (score >= 75) return "border-destructive/30 bg-destructive/10 text-destructive";
  if (score >= 55) return "border-primary/30 bg-primary/10 text-primary";
  return "border-border bg-muted text-muted-foreground";
}

function getPriorityLabel(score: number) {
  if (score >= 75) return PRIORITY_LABELS.high;
  if (score >= 55) return PRIORITY_LABELS.medium;
  return PRIORITY_LABELS.low;
}

function getRiskLabel(risk: CollaboratorCategory["risk"]) {
  if (risk === "alto") return tr("alto", "alto", "high");
  if (risk === "medio") return tr("medio", "medio", "medium");
  return tr("bajo", "basso", "low");
}

function getRiskTone(risk: CollaboratorCategory["risk"]) {
  if (risk === "alto") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (risk === "medio") return "border-primary/30 bg-primary/10 text-primary";
  return "border-secondary/30 bg-secondary/10 text-secondary";
}

function getStatusTone(status?: string) {
  if (status === "won" || status === "review_portfolio") return "border-secondary/30 bg-secondary/10 text-secondary";
  if (status === "proposal" || status === "follow_up") return "border-primary/30 bg-primary/10 text-primary";
  if (status === "lost") return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-border bg-card text-muted-foreground";
}

function getLeadCompleteness(lead: DashboardLead) {
  const checks = [lead.email, lead.telefono, lead.tipoCliente, lead.tipoPropiedad, lead.intervencion, lead.plazo, lead.tieneFotos === "si", lead.tieneProyecto && lead.tieneProyecto !== "no"];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getLeadBucket(lead: DashboardLead) {
  if (lead.status === "proposal" || lead.status === "follow_up") return BUCKET_LABELS.proposalFollowUp;
  if (lead.status === "visit_review") return BUCKET_LABELS.visitReady;
  if (lead.tieneFotos !== "si" || !lead.presupuesto) return BUCKET_LABELS.missingData;
  if (lead.score >= 55) return BUCKET_LABELS.qualified;
  return BUCKET_LABELS.review;
}

function getWhatsAppHref(lead: DashboardLead) {
  const rawPhone = (lead.telefono || "").replace(/[^+\d]/g, "");
  const phone = rawPhone.startsWith("+") ? rawPhone.slice(1) : rawPhone;
  const message = encodeURIComponent(
    tr(
      `Hola ${lead.nombre || ""}, gracias por contactar con Eivitech. Hemos recibido la información sobre tu proyecto en Ibiza. ¿Puedes enviarnos fotos, vídeos o planos del estado actual para valorar el siguiente paso?`,
      `Ciao ${lead.nombre || ""}, grazie per aver contattato Eivitech. Abbiamo ricevuto le informazioni sul tuo progetto a Ibiza. Puoi inviarci foto, video o planimetrie dello stato attuale per valutare il prossimo passo?`,
      `Hi ${lead.nombre || ""}, thanks for contacting Eivitech. We have received the information about your project in Ibiza. Could you send us photos, videos or plans of the current state so we can assess the next step?`
    )
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("clientes");

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
        "No se han podido cargar los leads desde PostgreSQL. Revisa que el email usado en Clerk esté en BOOTSTRAP_ADMIN_EMAILS de Railway.",
        "Non è stato possibile caricare i lead da PostgreSQL. Controlla che l’email usata in Clerk sia presente in BOOTSTRAP_ADMIN_EMAILS su Railway.",
        "Could not load leads from PostgreSQL. Check that the email used in Clerk is included in BOOTSTRAP_ADMIN_EMAILS on Railway."
      ));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasAccess) void loadLeads();
  }, [hasAccess]);

  const sortedLeads = useMemo(() => [...leads].sort((a, b) => b.score - a.score), [leads]);
  const stats = useMemo(() => ({
    total: leads.length,
    qualified: leads.filter((lead) => lead.score >= 55).length,
    high: leads.filter((lead) => lead.score >= 75).length,
    missingAssets: leads.filter((lead) => lead.tieneFotos !== "si").length,
    proposals: leads.filter((lead) => lead.status === "proposal" || lead.status === "follow_up").length,
    collaboratorsCritical: COLLABORATOR_CATEGORIES.filter((item) => item.risk === "alto" || item.status === "critico").length,
  }), [leads]);

  const pipeline = useMemo(() => Object.entries(STATUS_LABELS).map(([status, label]) => ({
    status,
    label,
    total: leads.filter((lead) => lead.status === status).length,
  })), [leads]);

  const leadBuckets = useMemo(() => Object.values(BUCKET_LABELS).map((bucket) => ({
    bucket,
    leads: sortedLeads.filter((lead) => getLeadBucket(lead) === bucket),
  })), [sortedLeads]);

  if (!hasAccess) {
    return (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">{tr("Acceso no autorizado", "Accesso non autorizzato", "Unauthorized access")}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {tr(
              "Has iniciado sesión, pero este usuario no está incluido en la lista de acceso operativo del CRM.",
              "Hai effettuato l’accesso, ma questo utente non è incluso nella lista di accesso operativo del CRM.",
              "You are signed in, but this user is not included in the CRM operational access list."
            )}
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
          <h1 className="display-lg mt-4">{tr("Dashboard clientes y colaboradores", "Dashboard clienti e collaboratori", "Clients and collaborators dashboard")}</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            {tr(
              "Panel operativo para controlar solicitudes de clientes, prioridades comerciales, follow-up y categorías de colaboradores profesionales a seleccionar o monitorizar.",
              "Pannello operativo per controllare richieste clienti, priorità commerciali, follow-up e categorie di collaboratori professionali da selezionare o monitorare.",
              "Operational panel to control client requests, commercial priorities, follow-ups and professional collaborator categories to select or monitor."
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">{tr("Leads: PostgreSQL Railway", "Lead: PostgreSQL Railway", "Leads: PostgreSQL Railway")}</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">{tr("Acceso: Clerk", "Accesso: Clerk", "Access: Clerk")}</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">{tr("Colaboradores: registro operativo por validar", "Collaboratori: registro operativo da validare", "Collaborators: operational register to validate")}</span>
          </div>
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

      {error && (
        <div className="mb-6 rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={ClipboardList} label={tr("Solicitudes", "Richieste", "Requests")} value={stats.total} helper={tr("Total en PostgreSQL", "Totale in PostgreSQL", "Total in PostgreSQL")} />
        <Metric icon={ShieldCheck} label={tr("Cualificados", "Qualificati", "Qualified")} value={stats.qualified} helper={tr("Score operativo ≥ 55", "Score operativo ≥ 55", "Operational score ≥ 55")} />
        <Metric icon={AlertTriangle} label={tr("Alta prioridad", "Alta priorità", "High priority")} value={stats.high} helper={tr("Score ≥ 75", "Score ≥ 75", "Score ≥ 75")} />
        <Metric icon={FileText} label={tr("Presupuesto / follow-up", "Preventivo / follow-up", "Proposal / follow-up")} value={stats.proposals} helper={tr("No perder oportunidades", "Non perdere opportunità", "Avoid losing opportunities")} />
        <Metric icon={Hammer} label={tr("Colaboradores críticos", "Collaboratori critici", "Critical collaborators")} value={stats.collaboratorsCritical} helper={tr("Categorías a controlar", "Categorie da controllare", "Categories to control")} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 rounded-sm border border-border bg-card p-2 shadow-soft">
        <TabButton active={activeTab === "clientes"} icon={Users} label={tr("Clientes", "Clienti", "Clients")} onClick={() => setActiveTab("clientes")} />
        <TabButton active={activeTab === "colaboradores"} icon={Hammer} label={tr("Colaboradores profesionales", "Collaboratori professionali", "Professional collaborators")} onClick={() => setActiveTab("colaboradores")} />
        <TabButton active={activeTab === "control"} icon={ClipboardCheck} label={tr("Control operativo", "Controllo operativo", "Operational control")} onClick={() => setActiveTab("control")} />
        <button
          onClick={() => void loadLeads()}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60"
        >
          <RefreshCw size={15} /> {loading ? tr("Cargando…", "Caricamento…", "Loading…") : tr("Actualizar", "Aggiorna", "Refresh")}
        </button>
      </div>

      {activeTab === "clientes" && (
        <ClientsPanel loading={loading} sortedLeads={sortedLeads} pipeline={pipeline} leadBuckets={leadBuckets} />
      )}

      {activeTab === "colaboradores" && <CollaboratorsPanel />}

      {activeTab === "control" && <ControlPanel />}

      <div className="mt-8 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">
        <div className="font-medium text-foreground">{tr("Usuarios frontend autorizados", "Utenti frontend autorizzati", "Authorized frontend users")}</div>
        {ALLOWED_ADMIN_EMAILS.length > 0 ? (
          <div className="mt-2">{ALLOWED_ADMIN_EMAILS.join(", ")}</div>
        ) : (
          <div className="mt-2">{tr("No hay allowlist frontend configurada.", "Nessuna allowlist frontend configurata.", "No frontend allowlist configured.")}</div>
        )}
      </div>
    </section>
  );
}

function ClientsPanel({
  loading,
  sortedLeads,
  pipeline,
  leadBuckets,
}: {
  loading: boolean;
  sortedLeads: DashboardLead[];
  pipeline: { status: string; label: string; total: number }[];
  leadBuckets: { bucket: string; leads: DashboardLead[] }[];
}) {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-sm border border-border bg-card p-6 shadow-card">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">{tr("Clientes y oportunidades", "Clienti e opportunità", "Clients and opportunities")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr(
                  "Lectura operativa de leads: calidad, estado, datos faltantes y próxima acción.",
                  "Lettura operativa dei lead: qualità, stato, dati mancanti e prossima azione.",
                  "Operational reading of leads: quality, status, missing data and next action."
                )}
              </p>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              BANT + {tr("completitud materiales", "completezza materiali", "asset completeness")}
            </span>
          </div>

          {loading ? (
            <div className="rounded-sm border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
              {tr("Cargando solicitudes desde PostgreSQL…", "Caricamento richieste da PostgreSQL…", "Loading requests from PostgreSQL…")}
            </div>
          ) : sortedLeads.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
              {tr("Aún no hay solicitudes visibles para este usuario.", "Non ci sono ancora richieste visibili per questo utente.", "There are no visible requests for this user yet.")}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target size={17} className="text-primary" /> {tr("Pipeline clientes", "Pipeline clienti", "Client pipeline")}
            </div>
            <div className="mt-5 space-y-3">
              {pipeline.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-3 border-b border-border/70 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(item.status)}`}>{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size={17} className="text-primary" /> {tr("Segmentos a impulsar", "Segmenti da spingere", "Segments to prioritize")}
            </div>
            <div className="mt-4 space-y-4">
              {CLIENT_SEGMENTS.map((segment) => (
                <div key={segment.title} className="rounded-sm bg-background p-4">
                  <div className="font-medium">{segment.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{segment.focus}</p>
                  <p className="mt-2 text-xs leading-relaxed"><span className="font-medium">{tr("Filtro", "Filtro", "Filter")}:</span> {segment.filter}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">{tr("Buckets operativos", "Bucket operativi", "Operational buckets")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tr("Vista rápida para decidir qué hacer hoy.", "Vista rapida per decidere cosa fare oggi.", "Quick view to decide what to do today.")}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {leadBuckets.map((bucket) => (
            <div key={bucket.bucket} className="rounded-sm border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{bucket.bucket}</div>
                <span className="rounded-full bg-card px-2 py-1 text-xs text-muted-foreground">{bucket.leads.length}</span>
              </div>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                {bucket.leads.slice(0, 4).map((lead) => (
                  <div key={lead.id} className="truncate">{lead.nombre || tr("Lead sin nombre", "Lead senza nome", "Lead without name")}</div>
                ))}
                {bucket.leads.length === 0 && <div>—</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: DashboardLead }) {
  const completeness = getLeadCompleteness(lead);

  return (
    <article className="rounded-sm border border-border bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl">{lead.nombre || tr("Lead sin nombre", "Lead senza nome", "Lead without name")}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityTone(lead.score)}`}>
              {tr("Prioridad", "Priorità", "Priority")} {getPriorityLabel(lead.score)} · {lead.score}/100
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusTone(lead.status)}`}>
              {normalise(lead.status, STATUS_LABELS)}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              {tr("Completo", "Completo", "Complete")} {completeness}%
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{lead.email || tr("Sin email", "Senza email", "No email")}</span>
            <span>{lead.telefono || tr("Sin teléfono", "Senza telefono", "No phone")}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={13} /> {lead.zona || "Ibiza"}</span>
            <span>{formatDate(lead.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getWhatsAppHref(lead)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-3 py-2 text-xs font-medium text-white">
            <MessageCircle size={14} /> WhatsApp
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}?subject=Eivitech Ibiza | ${tr("Hemos recibido tu solicitud", "Abbiamo ricevuto la tua richiesta", "We received your request")}`} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-medium hover:bg-accent">
              <Mail size={14} /> Email
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
        <Info label="Authority" value={normalise(lead.tipoCliente, CLIENT_LABELS)} />
        <Info label={tr("Propiedad", "Proprietà", "Property")} value={normalise(lead.tipoPropiedad, PROPERTY_LABELS)} />
        <Info label="Need" value={normalise(lead.intervencion, SERVICE_LABELS)} />
        <Info label="Timing" value={normalise(lead.plazo)} />
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <ChecklistItem ok={Boolean(lead.presupuesto)} label={`${tr("Budget", "Budget", "Budget")}: ${lead.presupuesto || tr("por validar", "da validare", "to validate")}`} />
        <ChecklistItem ok={lead.tieneFotos === "si"} label={`${tr("Fotos/vídeo", "Foto/video", "Photos/video")}: ${normalise(lead.tieneFotos)}`} />
        <ChecklistItem ok={lead.tieneProyecto === "si" || lead.tieneProyecto === "en-proceso"} label={`${tr("Proyecto", "Progetto", "Project")}: ${normalise(lead.tieneProyecto)}`} />
      </div>

      <div className="mt-4 rounded-sm bg-accent/50 p-4 text-sm">
        <div className="font-medium">{tr("Próxima acción recomendada", "Prossima azione consigliata", "Recommended next action")}</div>
        <p className="mt-1 text-muted-foreground">{lead.nextAction || tr("Preparar primera valoración y proponer siguiente paso.", "Preparare la prima valutazione e proporre il prossimo passo.", "Prepare the first assessment and propose the next step.")}</p>
      </div>

      {lead.mensaje && (
        <p className="mt-4 border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">{lead.mensaje}</p>
      )}
    </article>
  );
}

function CollaboratorsPanel() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">{tr("Registro colaboradores profesionales", "Registro collaboratori professionali", "Professional collaborators register")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr(
                "Categorías operativas para seleccionar, comparar y monitorizar, reduciendo riesgo, retrasos y pérdida de margen.",
                "Categorie operative da selezionare, confrontare e monitorare per ridurre rischio, ritardi e perdita di margine.",
                "Operational categories to select, compare and monitor, reducing risk, delays and margin loss."
              )}
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            Scouting + scorecard
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {COLLABORATOR_CATEGORIES.map((item) => (
            <article key={item.id} className="rounded-sm border border-border bg-background p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl">{item.category}</h3>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getRiskTone(item.risk)}`}>{tr("Riesgo", "Rischio", "Risk")} {getRiskLabel(item.risk)}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.scope}</p>
              <div className="mt-4 rounded-sm bg-accent/50 p-3 text-sm">
                <div className="font-medium">{tr("Por qué monitorizarlo", "Perché monitorarlo", "Why monitor it")}</div>
                <p className="mt-1 text-muted-foreground">{item.why}</p>
              </div>
              <div className="mt-4 text-sm">
                <div className="font-medium">{tr("Próxima acción", "Prossima azione", "Next action")}</div>
                <p className="mt-1 text-muted-foreground">{item.nextAction}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.dataToCollect.map((data) => (
                  <span key={data} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">{data}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search size={17} className="text-primary" /> {tr("SOP scouting colaborador", "SOP scouting collaboratore", "Collaborator scouting SOP")}
          </div>
          <ol className="mt-5 space-y-4 text-sm">
            {[
              tr("Identificar categoría y trabajo tipo para usar como test.", "Identificare categoria e lavoro tipo da usare come test.", "Identify category and test work type."),
              tr("Encontrar mínimo 3 profesionales alternativos por categoría crítica.", "Trovare minimo 3 professionisti alternativi per categoria critica.", "Find at least 3 alternative professionals for each critical category."),
              tr("Pedir presupuesto sobre el mismo caso, con fotos o medidas idénticas.", "Chiedere preventivo sullo stesso caso, con foto o misure identiche.", "Request a quote for the same case, with identical photos or measurements."),
              tr("Registrar precio, anticipo, tiempos, garantía, comunicación y trabajos similares.", "Registrare prezzo, anticipo, tempi, garanzia, comunicazione e lavori simili.", "Record price, deposit, timelines, warranty, communication and similar work."),
              tr("Asignar estado: por testar, aprobado, backup, evitar.", "Assegnare stato: da testare, approvato, backup, da evitare.", "Assign status: to test, approved, backup, avoid."),
              tr("Validar con Daniele antes de insertarlo en un proyecto real.", "Validare con Daniele prima di inserirlo in un progetto reale.", "Validate with Daniele before using in a real project."),
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{index + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ClipboardCheck size={17} className="text-primary" /> {tr("Scorecard colaborador", "Scorecard collaboratore", "Collaborator scorecard")}
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {[
              tr("Calidad trabajos anteriores", "Qualità lavori precedenti", "Quality of previous work"),
              tr("Precio comparable", "Prezzo comparabile", "Comparable price"),
              tr("Respeto de tiempos", "Rispetto tempi", "Respect of timelines"),
              tr("Comunicación", "Comunicazione", "Communication"),
              tr("Condiciones de anticipo", "Condizioni anticipo", "Deposit terms"),
              tr("Disponibilidad para correcciones", "Disponibilità correzioni", "Availability for corrections"),
              tr("Documentación / factura", "Documentazione / fattura", "Documentation / invoice"),
            ].map((item) => (
              <ChecklistItem key={item} ok={false} label={item} neutral />
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-primary/25 bg-primary/10 p-6 text-sm shadow-soft">
          <div className="font-medium text-foreground">{tr("Guardrail operativo", "Guardrail operativo", "Operational guardrail")}</div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {tr(
              "No considerar fiable a un colaborador solo porque está disponible. Primero hacen falta evidencias: presupuesto comparable, trabajos similares, tiempos, condiciones, responsabilidad y validación final de Daniele.",
              "Non dare per affidabile un collaboratore solo perché è disponibile. Prima servono evidenze: preventivo comparabile, lavori simili, tempi, condizioni, responsabilità e validazione finale di Daniele.",
              "Do not consider a collaborator reliable only because they are available. Evidence comes first: comparable quote, similar work, timelines, terms, responsibility and final validation by Daniele."
            )}
          </p>
        </div>
      </aside>
    </div>
  );
}

function ControlPanel() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="rounded-sm border border-border bg-card p-6 shadow-card lg:col-span-2">
        <h2 className="font-display text-2xl">{tr("Roadmap operativa 30 / 60 / 90", "Roadmap operativa 30 / 60 / 90", "30 / 60 / 90 operational roadmap")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{tr("Secuencia práctica: primero orden interno, luego canales, luego campañas medibles.", "Sequenza pratica: prima ordine interno, poi canali, poi campagne misurabili.", "Practical sequence: internal order first, then channels, then measurable campaigns.")}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <RoadmapCard
            period={tr("30 días", "30 giorni", "30 days")}
            title={tr("Orden operativo", "Ordine operativo", "Operational order")}
            items={[
              tr("CRM clientes legible", "CRM clienti leggibile", "Readable client CRM"),
              tr("Datos faltantes evidentes", "Campi mancanti evidenti", "Visible missing fields"),
              tr("Colaboradores críticos mapeados", "Collaboratori critici mappati", "Critical collaborators mapped"),
              tr("3 case study listos", "3 case study pronti", "3 case studies ready"),
            ]}
          />
          <RoadmapCard
            period={tr("60 días", "60 giorni", "60 days")}
            title={tr("Procesos y contenidos", "Processi e contenuti", "Processes and content")}
            items={[
              tr("Follow-up estándar", "Follow-up standard", "Standard follow-up"),
              tr("Scorecard colaboradores", "Scorecard collaboratori", "Collaborator scorecard"),
              "Google Business",
              tr("Instagram portfolio real", "Instagram portfolio reale", "Real Instagram portfolio"),
            ]}
          />
          <RoadmapCard
            period={tr("90 días", "90 giorni", "90 days")}
            title={tr("Medición", "Misurazione", "Measurement")}
            items={[
              tr("Calidad lead por fuente", "Qualità lead per fonte", "Lead quality by source"),
              tr("Presupuestos enviados/aceptados", "Preventivi inviati/accettati", "Proposals sent/accepted"),
              tr("Motivos perdidos", "Motivi persi", "Reasons lost"),
              tr("Report colaboradores", "Report collaboratori", "Collaborator report"),
            ]}
          />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock size={17} className="text-primary" /> {tr("Rutina semanal", "Routine settimanale", "Weekly routine")}
        </div>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <ChecklistItem ok label={tr("Controlar nuevos leads", "Controllare nuovi lead", "Check new leads")} />
          <ChecklistItem ok label={tr("Pedir fotos/vídeos faltantes", "Chiedere foto/video mancanti", "Request missing photos/videos")} />
          <ChecklistItem ok label={tr("Actualizar estado presupuesto", "Aggiornare stato preventivo", "Update proposal status")} />
          <ChecklistItem ok label={tr("Follow-up ofertas abiertas", "Follow-up offerte aperte", "Follow up open offers")} />
          <ChecklistItem ok label={tr("Actualizar problemas colaboradores", "Aggiornare problemi collaboratori", "Update collaborator issues")} />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft lg:col-span-3">
        <h2 className="font-display text-2xl">{tr("Riesgos a controlar", "Rischi da tenere sotto controllo", "Risks to control")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <RiskCard icon={AlertTriangle} title={tr("Leads no cualificados", "Lead non qualificati", "Unqualified leads")} text={tr("Si faltan fotos, timing, presupuesto o tipo de inmueble, la solicitud entra en caos operativo.", "Se mancano foto, timing, budget o tipo immobile, la richiesta entra in caos operativo.", "If photos, timing, budget or property type are missing, the request creates operational chaos.")} />
          <RiskCard icon={Wrench} title={tr("Colaborador no fiable", "Collaboratore non affidabile", "Unreliable collaborator")} text={tr("Retraso o trabajo mal hecho recae sobre Eivitech, incluso cuando el trabajo está subcontratado.", "Ritardo o lavoro fatto male ricade su Eivitech, anche quando il lavoro è subappaltato.", "Delay or poor work falls back on Eivitech, even when the work is subcontracted.")} />
          <RiskCard icon={ShieldCheck} title={tr("Privacidad e imágenes", "Privacy e immagini", "Privacy and images")} text={tr("Fotos, vídeos, datos cliente y portfolio deben usarse solo con autorización y verificación privacy/GDPR.", "Foto, video, dati cliente e portfolio vanno usati solo con autorizzazione e verifica privacy/GDPR.", "Photos, videos, client data and portfolio should only be used with authorization and privacy/GDPR verification.")} />
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
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
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

function ChecklistItem({ ok, label, neutral = false }: { ok: boolean; label: string; neutral?: boolean }) {
  const Icon = ok ? CheckCircle2 : neutral ? ClipboardList : AlertTriangle;
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2">
      <Icon size={14} className={ok ? "text-secondary" : neutral ? "text-muted-foreground" : "text-primary"} />
      <span>{label}</span>
    </div>
  );
}

function RoadmapCard({ period, title, items }: { period: string; title: string; items: string[] }) {
  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-primary">{period}</div>
      <div className="mt-2 font-medium">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

function RiskCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <Icon size={18} className="text-primary" />
      <div className="mt-3 font-medium">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

const Dashboard = () => (
  <>
    <SEO title={tr("CRM Dashboard | Eivitech Ibiza", "CRM Dashboard | Eivitech Ibiza", "CRM Dashboard | Eivitech Ibiza")} description={tr("Dashboard privada para gestión de solicitudes comerciales, clientes y colaboradores Eivitech Ibiza.", "Dashboard privata per gestione richieste commerciali, clienti e collaboratori Eivitech Ibiza.", "Private dashboard for managing commercial requests, clients and collaborators for Eivitech Ibiza.")} path="/dashboard" />
    {!CLERK_ENABLED ? (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">{tr("Clerk todavía no está configurado", "Clerk non è ancora configurato", "Clerk is not configured yet")}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {tr(
              "Añade la variable VITE_CLERK_PUBLISHABLE_KEY en GitHub Actions. No añadas nunca claves secretas al frontend.",
              "Aggiungi la variabile VITE_CLERK_PUBLISHABLE_KEY in GitHub Actions. Non aggiungere mai chiavi segrete nel frontend.",
              "Add the VITE_CLERK_PUBLISHABLE_KEY variable in GitHub Actions. Never add secret keys to the frontend."
            )}
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
                {tr(
                  "Inicia sesión con una cuenta autorizada para acceder a la dashboard operativa de Eivitech.",
                  "Accedi con un account autorizzato per entrare nella dashboard operativa di Eivitech.",
                  "Sign in with an authorized account to access the Eivitech operational dashboard."
                )}
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
