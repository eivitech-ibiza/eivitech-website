import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { SEO } from "@/components/SEO";
import { ALLOWED_ADMIN_EMAILS, CLERK_ENABLED, hasClientAdminAccess } from "@/lib/config";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  Flag,
  Gauge,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

type PreviewLead = {
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
  landing_page?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  timestamp?: string;
  ts?: string;
};

type PipelineStage = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const PIPELINE: PipelineStage[] = [
  {
    id: "solicitud",
    title: "Solicitud recibida",
    description: "Revisar datos, origen y calidad del lead.",
    icon: ClipboardList,
  },
  {
    id: "valoracion",
    title: "Primera valoración",
    description: "Contactar y pedir fotos, vídeos o planos.",
    icon: MessageCircle,
  },
  {
    id: "visita",
    title: "Visita / revisión",
    description: "Preparar sopralluogo o revisión técnica.",
    icon: CalendarCheck,
  },
  {
    id: "presupuesto",
    title: "Presupuesto",
    description: "Definir alcance, materiales y propuesta.",
    icon: FileText,
  },
  {
    id: "followup",
    title: "Follow-up",
    description: "Dar seguimiento hasta decisión del cliente.",
    icon: Phone,
  },
  {
    id: "cerrado",
    title: "Trabajo cerrado",
    description: "Marcar oportunidad ganada o perdida.",
    icon: CheckCircle2,
  },
  {
    id: "resena",
    title: "Reseña / portfolio",
    description: "Solicitar reseña y valorar case study.",
    icon: Star,
  },
];

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

const normalise = (value?: string, map?: Record<string, string>) => {
  if (!value) return "—";
  return map?.[value] ?? value.replaceAll("-", " ");
};

const getLeadDate = (lead: PreviewLead) => lead.ts ?? lead.timestamp;

function readPreviewLeads(): PreviewLead[] {
  try {
    const raw = sessionStorage.getItem("eivitech_leads");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scoreLead(lead: PreviewLead) {
  let score = 30;
  if (lead.plazo === "urgente") score += 25;
  if (lead.intervencion === "reforma-integral") score += 15;
  if (lead.tipoPropiedad === "villa" || lead.tipoPropiedad === "local-comercial") score += 10;
  if (lead.tieneFotos === "si") score += 10;
  if (lead.tieneProyecto === "si" || lead.tieneProyecto === "en-proceso") score += 10;
  if (lead.presupuesto) score += 10;
  if (lead.utm_source || lead.source?.includes("landing")) score += 5;
  return Math.min(score, 100);
}

function getPriority(score: number) {
  if (score >= 75) return { label: "Alta", tone: "bg-destructive/10 text-destructive border-destructive/20" };
  if (score >= 55) return { label: "Media", tone: "bg-primary/10 text-primary border-primary/20" };
  return { label: "Baja", tone: "bg-muted text-muted-foreground border-border" };
}

function getNextAction(lead: PreviewLead) {
  if (lead.plazo === "urgente") return "Contactar por WhatsApp hoy y confirmar necesidad real.";
  if (lead.tieneFotos !== "si") return "Pedir fotos, vídeo o planos antes de preparar valoración.";
  if (lead.tieneProyecto === "no") return "Aclarar si necesita visita previa o apoyo técnico.";
  if (!lead.presupuesto) return "Preguntar si tiene una referencia de presupuesto orientativo.";
  return "Preparar primera valoración y proponer siguiente paso.";
}

function inferStage(lead: PreviewLead) {
  if (lead.tieneFotos !== "si") return "valoracion";
  if (lead.tieneProyecto === "si" || lead.tieneProyecto === "en-proceso") return "visita";
  return "solicitud";
}

function getOrigin(lead: PreviewLead) {
  return lead.utm_source || lead.source || lead.referrer || "web";
}

function getWhatsAppHref(lead: PreviewLead) {
  const rawPhone = (lead.telefono || "").replace(/[^+\d]/g, "");
  const phone = rawPhone.startsWith("+") ? rawPhone.slice(1) : rawPhone;
  const message = encodeURIComponent(
    `Hola ${lead.nombre || ""}, gracias por contactar con Eivitech. Hemos recibido la información sobre tu proyecto en Ibiza. ¿Puedes enviarnos fotos, vídeos o planos del estado actual para valorar el siguiente paso?`
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/34674735188?text=${message}`;
}

function DashboardShell() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const hasAccess = hasClientAdminAccess(email);
  const [leads, setLeads] = useState<PreviewLead[]>([]);

  useEffect(() => {
    setLeads(readPreviewLeads());
  }, []);

  const enrichedLeads = useMemo(() => (
    leads.map((lead, index) => ({
      ...lead,
      id: `${lead.email || "lead"}-${getLeadDate(lead) || index}`,
      score: scoreLead(lead),
      stage: inferStage(lead),
      nextAction: getNextAction(lead),
      origin: getOrigin(lead),
    })).sort((a, b) => b.score - a.score)
  ), [leads]);

  const stats = useMemo(() => {
    const highPriority = enrichedLeads.filter((lead) => lead.score >= 75).length;
    const urgent = enrichedLeads.filter((lead) => lead.plazo === "urgente").length;
    const missingAssets = enrichedLeads.filter((lead) => lead.tieneFotos !== "si").length;
    const visitReady = enrichedLeads.filter((lead) => lead.stage === "visita").length;
    return { total: enrichedLeads.length, highPriority, urgent, missingAssets, visitReady };
  }, [enrichedLeads]);

  const pipelineCounts = useMemo(() => {
    return PIPELINE.reduce<Record<string, number>>((acc, stage) => {
      acc[stage.id] = enrichedLeads.filter((lead) => lead.stage === stage.id).length;
      return acc;
    }, {});
  }, [enrichedLeads]);

  const originCounts = useMemo(() => {
    return enrichedLeads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.origin] = (acc[lead.origin] || 0) + 1;
      return acc;
    }, {});
  }, [enrichedLeads]);

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
            Pide a un administrador que valide tu email en Clerk o en la configuración segura del backend.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <UserButton />
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-x py-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="eyebrow">CRM Eivitech</div>
          <h1 className="display-lg mt-4">Dashboard operativa</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            Panel privado para convertir solicitudes cualificadas en oportunidades: primera valoración, visita,
            presupuesto, follow-up, trabajo cerrado, reseña y portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 shadow-soft">
          <UserButton />
          <div className="text-sm">
            <div className="font-medium">Usuario autorizado</div>
            <div className="text-muted-foreground">{email}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard icon={ClipboardList} label="Solicitudes" value={stats.total.toString()} helper="Total recibidas" />
        <MetricCard icon={Flag} label="Alta prioridad" value={stats.highPriority.toString()} helper="Score ≥ 75" />
        <MetricCard icon={AlertTriangle} label="Urgentes" value={stats.urgent.toString()} helper="Plazo urgente" />
        <MetricCard icon={MessageCircle} label="Pedir material" value={stats.missingAssets.toString()} helper="Faltan fotos/vídeo" />
        <MetricCard icon={CalendarCheck} label="Listas para visita" value={stats.visitReady.toString()} helper="Con info inicial" />
      </div>

      <div className="mt-8 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Pipeline comercial</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Flujo operativo basado en el funnel: web → CRM → visita → presupuesto → follow-up → trabajo cerrado → reseña.
            </p>
          </div>
          <Link to="/contacto" className="rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent">
            Crear solicitud de prueba
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {PIPELINE.map((stage) => (
            <PipelineCard key={stage.id} stage={stage} count={pipelineCounts[stage.id] || 0} />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-sm border border-border bg-card p-6 shadow-card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">Oportunidades priorizadas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ordenadas por score operativo: urgencia, tipo de proyecto, material disponible, proyecto técnico y presupuesto.
              </p>
            </div>
          </div>

          {enrichedLeads.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
              Aún no hay solicitudes de prueba en este navegador. Completa el formulario de contacto para verificar el flujo visual.
            </div>
          ) : (
            <div className="space-y-4">
              {enrichedLeads.map((lead) => {
                const priority = getPriority(lead.score);
                return (
                  <article key={lead.id} className="rounded-sm border border-border bg-background p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl">{lead.nombre || "Lead sin nombre"}</h3>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priority.tone}`}>
                            Prioridad {priority.label} · {lead.score}/100
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>{lead.email || "Sin email"}</span>
                          <span>{lead.telefono || "Sin teléfono"}</span>
                          <span>{lead.zona || "Ibiza"}</span>
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
                      <Info label="Cliente" value={normalise(lead.tipoCliente, CLIENT_LABELS)} />
                      <Info label="Propiedad" value={normalise(lead.tipoPropiedad, PROPERTY_LABELS)} />
                      <Info label="Intervención" value={normalise(lead.intervencion, SERVICE_LABELS)} />
                      <Info label="Plazo" value={normalise(lead.plazo)} />
                    </div>

                    <div className="mt-4 rounded-sm bg-accent/50 p-4 text-sm">
                      <div className="font-medium">Próxima acción recomendada</div>
                      <p className="mt-1 text-muted-foreground">{lead.nextAction}</p>
                    </div>

                    <div className="mt-4 grid gap-3 text-xs text-muted-foreground md:grid-cols-3">
                      <Info label="Fotos / vídeo" value={lead.tieneFotos === "si" ? "Sí" : "No"} />
                      <Info label="Proyecto técnico" value={normalise(lead.tieneProyecto)} />
                      <Info label="Origen" value={`${lead.origin}${lead.utm_campaign ? ` · ${lead.utm_campaign}` : ""}`} />
                    </div>

                    {lead.mensaje && (
                      <p className="mt-4 border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">
                        {lead.mensaje}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Panel icon={Gauge} title="KPI tree operativo">
            <ul className="space-y-2">
              <li><strong>Adquisición:</strong> origen, landing, UTM, campaña.</li>
              <li><strong>Activación:</strong> form_start, form_submit, quote_request.</li>
              <li><strong>Calidad lead:</strong> urgencia, fotos, proyecto técnico, presupuesto.</li>
              <li><strong>Ventas:</strong> visita, presupuesto, follow-up, cierre.</li>
              <li><strong>Post-trabajo:</strong> reseña, portfolio, referral.</li>
            </ul>
          </Panel>

          <Panel icon={BarChart3} title="Origen de solicitudes">
            {Object.keys(originCounts).length === 0 ? (
              <p>Aún no hay datos de origen.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(originCounts).map(([origin, count]) => (
                  <div key={origin} className="flex items-center justify-between rounded-sm bg-background px-3 py-2">
                    <span>{origin}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel icon={CheckCircle2} title="Checklist de seguimiento">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Revisar datos y fuente del lead.</li>
              <li>Contactar por WhatsApp o email.</li>
              <li>Pedir fotos, vídeos o planos si faltan.</li>
              <li>Confirmar zona, alcance y urgencia.</li>
              <li>Preparar visita o revisión del proyecto.</li>
              <li>Registrar presupuesto y siguiente follow-up.</li>
            </ol>
          </Panel>

          <Panel icon={ShieldCheck} title="Privacidad y seguridad">
            <p>
              La dashboard actual es una preview. Para datos reales: backend seguro, base de datos con control de acceso,
              política de conservación y validación legal/privacy antes de activar automatizaciones.
            </p>
          </Panel>

          <Panel icon={Users} title="Usuarios autorizados">
            <p>
              Acceso previsto para Daniele, Luciano y colaboradores aprobados. La seguridad definitiva debe reforzarse
              con roles Clerk, Organizations o RLS en backend.
            </p>
            {ALLOWED_ADMIN_EMAILS.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-xs text-muted-foreground">
                {ALLOWED_ADMIN_EMAILS.map((allowed) => <li key={allowed}>{allowed}</li>)}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <Icon size={20} className="text-primary" />
      <div className="mt-4 text-3xl font-medium tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
    </div>
  );
}

function PipelineCard({ stage, count }: { stage: PipelineStage; count: number }) {
  const Icon = stage.icon;
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <Icon size={17} className="text-primary" />
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium">{count}</span>
      </div>
      <div className="mt-4 text-sm font-medium">{stage.title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{stage.description}</p>
    </div>
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

function Panel({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-soft">
      <div className="mb-3 flex items-center gap-2 font-medium text-foreground">
        <Icon size={17} className="text-primary" /> {title}
      </div>
      {children}
    </div>
  );
}

const Dashboard = () => (
  <>
    <SEO
      title="CRM Dashboard | Eivitech Ibiza"
      description="Dashboard privada para gestión de solicitudes comerciales de Eivitech Ibiza."
      path="/dashboard"
    />

    {!CLERK_ENABLED ? (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={22} />
          </div>
          <h1 className="display-md mt-5">Clerk todavía no está configurado</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Añade la variable de entorno VITE_CLERK_PUBLISHABLE_KEY en GitHub Actions o en el entorno de deploy.
            No añadas nunca claves secretas al frontend ni al repositorio público.
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
