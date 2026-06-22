import { useEffect, useMemo, useState } from "react";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
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
  "reforma-integral": "Reforma integral",
  bano: "Baño",
  cocina: "Cocina",
  instalaciones: "Instalaciones",
  exterior: "Exterior",
  "local-comercial": "Local comercial",
  otro: "Otro",
};

const PROPERTY_LABELS: Record<string, string> = {
  villa: "Villa",
  apartamento: "Apartamento",
  casa: "Casa",
  "local-comercial": "Local comercial",
  otro: "Otro",
};

const CLIENT_LABELS: Record<string, string> = {
  propietario: "Propietario",
  comprador: "Comprador",
  inversor: "Inversor",
  agencia: "Agencia",
  empresa: "Empresa",
  otro: "Otro",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Solicitud recibida",
  first_contact: "Primera valoración",
  visit_review: "Visita / revisión",
  proposal: "Presupuesto",
  follow_up: "Follow-up",
  won: "Trabajo cerrado",
  lost: "Perdido",
  review_portfolio: "Reseña / portfolio",
};

const COLLABORATOR_CATEGORIES: CollaboratorCategory[] = [
  {
    id: "carpinteria",
    category: "Carpintería / falegnamería a medida",
    scope: "Puertas, armarios, panelados, cocinas a medida, muebles especiales.",
    risk: "alto",
    status: "critico",
    why: "Categoría señalada como una de las que más puede erosionar margen, por precios variables y trabajos a medida.",
    nextAction: "Crear comparativa con mínimo 3 opciones y pedir presupuesto sobre el mismo caso ficticio.",
    dataToCollect: ["rango precios", "plazos reales", "fotos trabajos", "condiciones anticipo", "garantía / correcciones"],
  },
  {
    id: "aluminio",
    category: "Aluminio, ventanas e infissi",
    scope: "Ventanas, cerramientos, carpintería de aluminio, sustituciones puntuales.",
    risk: "alto",
    status: "critico",
    why: "Riesgo operativo alto si se paga anticipo y la instalación se retrasa, porque Eivitech queda expuesta ante el cliente final.",
    nextAction: "Buscar alternativas y registrar por escrito fecha estimada, anticipo, penalización interna y responsable.",
    dataToCollect: ["fecha instalación", "anticipo", "tiempo fabricación", "persona responsable", "historial retrasos"],
  },
  {
    id: "cristaleria",
    category: "Cristalería y espejos",
    scope: "Vidrios, mamparas, espejos, detalles de baño y cerramientos ligeros.",
    risk: "medio",
    status: "scouting",
    why: "Suele depender de medición precisa, fabricación externa y montaje limpio en fase final.",
    nextAction: "Preparar ficha de proveedor con tiempos, disponibilidad y trabajos anteriores.",
    dataToCollect: ["zonas cubiertas", "tiempo medición", "tiempo entrega", "precio montaje", "seguro / roturas"],
  },
  {
    id: "marmolistas",
    category: "Mármol, piedra y encimeras",
    scope: "Encimeras, travertino, piedra natural, piezas especiales y acabados premium.",
    risk: "medio",
    status: "backup",
    why: "Impacta mucho en percepción premium del proyecto y puede bloquear cocina/baño si llega tarde.",
    nextAction: "Tener proveedor principal y backup por tipo de material.",
    dataToCollect: ["materiales", "muestras", "plazo corte", "plazo instalación", "condiciones reposición"],
  },
  {
    id: "herreria",
    category: "Herrería / fabbro / metal",
    scope: "Barandillas, pasamanos, puertas metálicas, botolas y piezas especiales.",
    risk: "medio",
    status: "scouting",
    why: "Trabajos puntuales pero críticos cuando afectan seguridad, acabado o entrega.",
    nextAction: "Crear lista de 2-3 herreros con fotos, rango de precios y disponibilidad.",
    dataToCollect: ["especialidad", "soldadura", "acabados", "plazos", "trabajos similares"],
  },
  {
    id: "arquitectura",
    category: "Arquitectura / diseño / dirección técnica",
    scope: "Apoyo técnico cuando el cliente no tiene arquitecto o necesita definición de proyecto.",
    risk: "medio",
    status: "estable",
    why: "Clave para clientes premium, inversores y proyectos con decisiones complejas.",
    nextAction: "Definir cuándo se activa este partner y qué documentación debe entregar.",
    dataToCollect: ["tipo proyecto", "honorarios", "tiempos", "entregables", "licencias / permisos"],
  },
];

const CLIENT_SEGMENTS = [
  {
    title: "Propietario vivienda / villa",
    focus: "Quiere reformar sin coordinar oficios, materiales y decisiones cada día.",
    filter: "Fotos, zona, alcance, timing, presupuesto orientativo y disponibilidad para visita.",
  },
  {
    title: "Inversor o comprador",
    focus: "Quiere valorar potencial, coste orientativo y mejora del inmueble antes o después de comprar.",
    filter: "Objetivo económico, prioridad de trabajos, urgencia y nivel de decisión.",
  },
  {
    title: "Local comercial / restaurante / bar",
    focus: "Necesita imagen, funcionalidad y entrega ordenada sin perder semanas operativas.",
    filter: "Fecha objetivo, permisos, instalaciones, imagen deseada y restricciones de apertura.",
  },
  {
    title: "Agencia / property manager",
    focus: "Busca referente local fiable para resolver trabajos y reformas de clientes.",
    filter: "Tipo de relación, volumen potencial, tiempos de respuesta y expectativas de reporting.",
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
  if (score >= 75) return "Alta";
  if (score >= 55) return "Media";
  return "Baja";
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
  if (lead.status === "proposal" || lead.status === "follow_up") return "Presupuesto / follow-up";
  if (lead.status === "visit_review") return "Lista para visita";
  if (lead.tieneFotos !== "si" || !lead.presupuesto) return "Faltan datos";
  if (lead.score >= 55) return "Cualificada";
  return "Por revisar";
}

function getWhatsAppHref(lead: DashboardLead) {
  const rawPhone = (lead.telefono || "").replace(/[^+\d]/g, "");
  const phone = rawPhone.startsWith("+") ? rawPhone.slice(1) : rawPhone;
  const message = encodeURIComponent(
    `Hola ${lead.nombre || ""}, gracias por contactar con Eivitech. Hemos recibido la información sobre tu proyecto en Ibiza. ¿Puedes enviarnos fotos, vídeos o planos del estado actual para valorar el siguiente paso?`
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
      setError("No se han podido cargar los leads desde PostgreSQL. Revisa que el email usado en Clerk esté en BOOTSTRAP_ADMIN_EMAILS de Railway.");
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

  const leadBuckets = useMemo(() => {
    const buckets = ["Cualificada", "Lista para visita", "Presupuesto / follow-up", "Faltan datos", "Por revisar"];
    return buckets.map((bucket) => ({ bucket, leads: sortedLeads.filter((lead) => getLeadBucket(lead) === bucket) }));
  }, [sortedLeads]);

  if (!hasAccess) {
    return (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">Acceso no autorizado</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Has iniciado sesión, pero este usuario no está incluido en la lista de acceso operativo del CRM.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <UserButton />
            <span className="text-sm text-muted-foreground">{email}</span>
            <SignOutButton redirectUrl={LOGOUT_REDIRECT_URL}>
              <button className="rounded-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                Cerrar sesión
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
          <h1 className="display-lg mt-4">Dashboard clienti e collaboratori</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            Pannello operativo per controllare richieste clienti, priorità commerciali, follow-up e categorie di collaboratori professionali da selezionare o monitorare.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">Lead: PostgreSQL Railway</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">Accesso: Clerk</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">Collaboratori: registro operativo da validare</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 shadow-soft">
          <UserButton />
          <div className="text-sm">
            <div className="font-medium">Usuario autorizado</div>
            <div className="text-muted-foreground">{email}</div>
          </div>
          <SignOutButton redirectUrl={LOGOUT_REDIRECT_URL}>
            <button className="rounded-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
              Cerrar sesión
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
        <Metric icon={ClipboardList} label="Solicitudes" value={stats.total} helper="Total en PostgreSQL" />
        <Metric icon={ShieldCheck} label="Cualificados" value={stats.qualified} helper="Score operativo ≥ 55" />
        <Metric icon={AlertTriangle} label="Alta prioridad" value={stats.high} helper="Score ≥ 75" />
        <Metric icon={FileText} label="Presupuesto / follow-up" value={stats.proposals} helper="No perder oportunidades" />
        <Metric icon={Hammer} label="Colaboradores críticos" value={stats.collaboratorsCritical} helper="Categorías a controlar" />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 rounded-sm border border-border bg-card p-2 shadow-soft">
        <TabButton active={activeTab === "clientes"} icon={Users} label="Clientes" onClick={() => setActiveTab("clientes")} />
        <TabButton active={activeTab === "colaboradores"} icon={Hammer} label="Colaboradores profesionales" onClick={() => setActiveTab("colaboradores")} />
        <TabButton active={activeTab === "control"} icon={ClipboardCheck} label="Control operativo" onClick={() => setActiveTab("control")} />
        <button
          onClick={() => void loadLeads()}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60"
        >
          <RefreshCw size={15} /> {loading ? "Cargando…" : "Actualizar"}
        </button>
      </div>

      {activeTab === "clientes" && (
        <ClientsPanel loading={loading} sortedLeads={sortedLeads} pipeline={pipeline} leadBuckets={leadBuckets} />
      )}

      {activeTab === "colaboradores" && <CollaboratorsPanel />}

      {activeTab === "control" && <ControlPanel />}

      <div className="mt-8 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">
        <div className="font-medium text-foreground">Utenti frontend autorizzati</div>
        {ALLOWED_ADMIN_EMAILS.length > 0 ? (
          <div className="mt-2">{ALLOWED_ADMIN_EMAILS.join(", ")}</div>
        ) : (
          <div className="mt-2">Nessuna allowlist frontend configurata.</div>
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
              <h2 className="font-display text-2xl">Clienti e opportunità</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lettura operativa dei lead: qualità, stato, dati mancanti e prossima azione.
              </p>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              BANT + completezza materiali
            </span>
          </div>

          {loading ? (
            <div className="rounded-sm border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
              Cargando solicitudes desde PostgreSQL…
            </div>
          ) : sortedLeads.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
              Aún no hay solicitudes visibles para este usuario.
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
              <Target size={17} className="text-primary" /> Pipeline clienti
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
              <Sparkles size={17} className="text-primary" /> Segmenti da spingere
            </div>
            <div className="mt-4 space-y-4">
              {CLIENT_SEGMENTS.map((segment) => (
                <div key={segment.title} className="rounded-sm bg-background p-4">
                  <div className="font-medium">{segment.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{segment.focus}</p>
                  <p className="mt-2 text-xs leading-relaxed"><span className="font-medium">Filtro:</span> {segment.filter}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Bucket operativi</h2>
            <p className="mt-1 text-sm text-muted-foreground">Vista rapida per decidere cosa fare oggi.</p>
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
                  <div key={lead.id} className="truncate">{lead.nombre || "Lead sin nombre"}</div>
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
            <h3 className="font-display text-xl">{lead.nombre || "Lead sin nombre"}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityTone(lead.score)}`}>
              Prioridad {getPriorityLabel(lead.score)} · {lead.score}/100
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusTone(lead.status)}`}>
              {normalise(lead.status, STATUS_LABELS)}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              Completo {completeness}%
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{lead.email || "Sin email"}</span>
            <span>{lead.telefono || "Sin teléfono"}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={13} /> {lead.zona || "Ibiza"}</span>
            <span>{formatDate(lead.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getWhatsAppHref(lead)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-3 py-2 text-xs font-medium text-white">
            <MessageCircle size={14} /> WhatsApp
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}?subject=Eivitech Ibiza | Hemos recibido tu solicitud`} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-medium hover:bg-accent">
              <Mail size={14} /> Email
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
        <Info label="Authority" value={normalise(lead.tipoCliente, CLIENT_LABELS)} />
        <Info label="Propiedad" value={normalise(lead.tipoPropiedad, PROPERTY_LABELS)} />
        <Info label="Need" value={normalise(lead.intervencion, SERVICE_LABELS)} />
        <Info label="Timing" value={normalise(lead.plazo)} />
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <ChecklistItem ok={Boolean(lead.presupuesto)} label={`Budget: ${lead.presupuesto || "da validar"}`} />
        <ChecklistItem ok={lead.tieneFotos === "si"} label={`Fotos/vídeo: ${normalise(lead.tieneFotos)}`} />
        <ChecklistItem ok={lead.tieneProyecto === "si" || lead.tieneProyecto === "en-proceso"} label={`Proyecto: ${normalise(lead.tieneProyecto)}`} />
      </div>

      <div className="mt-4 rounded-sm bg-accent/50 p-4 text-sm">
        <div className="font-medium">Próxima acción recomendada</div>
        <p className="mt-1 text-muted-foreground">{lead.nextAction || "Preparar primera valoración y proponer siguiente paso."}</p>
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
            <h2 className="font-display text-2xl">Registro collaboratori professionali</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Categorie operative da selezionare, confrontare e monitorare per ridurre rischio, ritardi e perdita di margine.
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
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getRiskTone(item.risk)}`}>Rischio {item.risk}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.scope}</p>
              <div className="mt-4 rounded-sm bg-accent/50 p-3 text-sm">
                <div className="font-medium">Perché monitorarlo</div>
                <p className="mt-1 text-muted-foreground">{item.why}</p>
              </div>
              <div className="mt-4 text-sm">
                <div className="font-medium">Prossima azione</div>
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
            <Search size={17} className="text-primary" /> SOP scouting collaboratore
          </div>
          <ol className="mt-5 space-y-4 text-sm">
            {[
              "Identificare categoria e lavoro tipo da usare come test.",
              "Trovare minimo 3 professionisti alternativi per categoria critica.",
              "Chiedere preventivo sullo stesso caso, con foto o misure identiche.",
              "Registrare prezzo, anticipo, tempi, garanzia, comunicazione e lavori simili.",
              "Assegnare stato: da testare, approvato, backup, da evitare.",
              "Validare con Daniele prima di inserirlo in un progetto reale.",
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
            <ClipboardCheck size={17} className="text-primary" /> Scorecard collaboratore
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {[
              "Qualità lavori precedenti",
              "Prezzo comparabile",
              "Rispetto tempi",
              "Comunicazione",
              "Condizioni anticipo",
              "Disponibilità correzioni",
              "Documentazione / fattura",
            ].map((item) => (
              <ChecklistItem key={item} ok={false} label={item} neutral />
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-primary/25 bg-primary/10 p-6 text-sm shadow-soft">
          <div className="font-medium text-foreground">Guardrail operativo</div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Non dare per “affidabile” un collaboratore solo perché è disponibile. Prima servono evidenze: preventivo comparabile, lavori simili, tempi, condizioni, responsabilità e validazione finale di Daniele.
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
        <h2 className="font-display text-2xl">Roadmap operativa 30 / 60 / 90</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sequenza pratica: prima ordine interno, poi canali, poi campagne misurabili.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <RoadmapCard
            period="30 giorni"
            title="Ordine operativo"
            items={["CRM clienti leggibile", "campi mancanti evidenti", "collaboratori critici mappati", "3 case study pronti"]}
          />
          <RoadmapCard
            period="60 giorni"
            title="Processi e contenuti"
            items={["follow-up standard", "scorecard collaboratori", "Google Business", "Instagram portfolio reale"]}
          />
          <RoadmapCard
            period="90 giorni"
            title="Misurazione"
            items={["qualità lead per fonte", "preventivi inviati/accettati", "motivi persi", "report collaboratori"]}
          />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock size={17} className="text-primary" /> Routine settimanale
        </div>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <ChecklistItem ok label="Controllare nuovi lead" />
          <ChecklistItem ok label="Chiedere foto/video mancanti" />
          <ChecklistItem ok label="Aggiornare stato preventivo" />
          <ChecklistItem ok label="Follow-up offerte aperte" />
          <ChecklistItem ok label="Aggiornare problemi collaboratori" />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft lg:col-span-3">
        <h2 className="font-display text-2xl">Rischi da tenere sotto controllo</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <RiskCard icon={AlertTriangle} title="Lead non qualificati" text="Se mancano foto, timing, budget o tipo immobile, la richiesta entra in caos operativo." />
          <RiskCard icon={Wrench} title="Collaboratore non affidabile" text="Ritardo o lavoro fatto male ricade su Eivitech, anche quando il lavoro è subappaltato." />
          <RiskCard icon={ShieldCheck} title="Privacy e immagini" text="Foto, video, dati cliente e portfolio vanno usati solo con autorizzazione e verifica privacy/GDPR." />
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
    <SEO title="CRM Dashboard | Eivitech Ibiza" description="Dashboard privata per gestione richieste commerciali, clienti e collaboratori Eivitech Ibiza." path="/dashboard" />
    {!CLERK_ENABLED ? (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">Clerk todavía no está configurado</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Añade la variable VITE_CLERK_PUBLISHABLE_KEY en GitHub Actions. No añadas nunca claves secretas al frontend.
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
              <h1 className="display-md mt-5">Acceso privado al CRM</h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Inicia sesión con una cuenta autorizada para acceder a la dashboard operativa de Eivitech.
              </p>
              <SignInButton mode="modal">
                <button className="mt-6 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Iniciar sesión
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
