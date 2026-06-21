import { useEffect, useMemo, useState } from "react";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { SEO } from "@/components/SEO";
import { ALLOWED_ADMIN_EMAILS, CLERK_ENABLED, hasClientAdminAccess } from "@/lib/config";
import { fetchCrmLeads } from "@/lib/crm";
import { AlertTriangle, CalendarCheck, ClipboardList, Lock, Mail, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";

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

function normalise(value?: string, labels?: Record<string, string>) {
  if (!value) return "—";
  return labels?.[value] ?? value.replaceAll("-", " ");
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
    high: leads.filter((lead) => lead.score >= 75).length,
    urgent: leads.filter((lead) => lead.plazo === "urgente").length,
    missingAssets: leads.filter((lead) => lead.tieneFotos !== "si").length,
    visitReady: leads.filter((lead) => lead.status === "visit_review").length,
  }), [leads]);

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
          <div className="eyebrow">CRM Eivitech</div>
          <h1 className="display-lg mt-4">Dashboard operativa</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            Panel privado conectado a PostgreSQL mediante API Railway y acceso Clerk.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Fuente de datos: PostgreSQL Railway
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
        <Metric icon={ShieldCheck} label="Alta prioridad" value={stats.high} helper="Score ≥ 75" />
        <Metric icon={AlertTriangle} label="Urgentes" value={stats.urgent} helper="Plazo urgente" />
        <Metric icon={MessageCircle} label="Pedir material" value={stats.missingAssets} helper="Faltan fotos/vídeo" />
        <Metric icon={CalendarCheck} label="Listas visita" value={stats.visitReady} helper="Estado visita" />
      </div>

      <div className="mt-8 rounded-sm border border-border bg-card p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Oportunidades priorizadas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Leads reales letti da PostgreSQL e ordinati per score operativo.
            </p>
          </div>
          <button
            onClick={() => void loadLeads()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60"
          >
            <RefreshCw size={15} /> {loading ? "Cargando…" : "Actualizar"}
          </button>
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
            {sortedLeads.map((lead) => (
              <article key={lead.id} className="rounded-sm border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl">{lead.nombre || "Lead sin nombre"}</h3>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityTone(lead.score)}`}>
                        Prioridad {getPriorityLabel(lead.score)} · {lead.score}/100
                      </span>
                      <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                        {normalise(lead.status, STATUS_LABELS)}
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
                  <p className="mt-1 text-muted-foreground">{lead.nextAction || "Preparar primera valoración y proponer siguiente paso."}</p>
                </div>

                {lead.mensaje && (
                  <p className="mt-4 border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">{lead.mensaje}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

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

function Metric({ icon: Icon, label, value, helper }: { icon: typeof ClipboardList; label: string; value: number; helper: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <Icon size={20} className="text-primary" />
      <div className="mt-4 text-3xl font-medium tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
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

const Dashboard = () => (
  <>
    <SEO title="CRM Dashboard | Eivitech Ibiza" description="Dashboard privata per gestione richieste commerciali Eivitech Ibiza." path="/dashboard" />
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
