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
type ActivityType = "note" | "call" | "whatsapp" | "email" | "visit" | "proposal" | "follow_up" | "status_change";

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

type WorkflowField = {
  name: "channel" | "outcome" | "budget" | "nextFollowUp" | "amount" | "visitDate";
  label: string;
  type: "text" | "date" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

type WorkflowAction = {
  key: string;
  label: string;
  objective: string;
  when: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  nextAction: string;
  activityTitle: string;
  activityType: ActivityType;
  requireNote?: boolean;
  tone?: "primary" | "success" | "danger" | "neutral";
  checklist?: string[];
  fields?: WorkflowField[];
};

type WorkflowForm = {
  channel: string;
  outcome: string;
  budget: string;
  nextFollowUp: string;
  amount: string;
  visitDate: string;
  note: string;
  checked: Record<string, boolean>;
};

const LOGOUT_REDIRECT_URL = "/ibiza-project-accelerator/";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: tr("Solicitud recibida", "Richiesta ricevuta", "Request received"),
  first_contact: tr("Primo contatto / qualifica", "Primo contatto / qualifica", "First contact / qualification"),
  visit_review: tr("Visita / sopralluogo", "Visita / sopralluogo", "Visit / review"),
  proposal: tr("Preventivo", "Preventivo", "Proposal"),
  follow_up: "Follow-up",
  won: tr("Concluso", "Concluso", "Won"),
  lost: tr("Fallito", "Fallito", "Lost"),
  review_portfolio: tr("Recensione / portfolio", "Recensione / portfolio", "Review / portfolio"),
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

const CLIENT_FUNNEL: { status: LeadStatus; label: string; job: string }[] = [
  { status: "new", label: tr("Richiesta", "Richiesta", "Request"), job: tr("Capire se vale la pena contattarlo.", "Capire se vale la pena contattarlo.", "Decide whether it is worth contacting." ) },
  { status: "first_contact", label: tr("Primo contatto / qualifica", "Primo contatto / qualifica", "First contact / qualification"), job: tr("Registrare esito contatto e dati mancanti.", "Registrare esito contatto e dati mancanti.", "Record contact outcome and missing data." ) },
  { status: "visit_review", label: tr("Sopralluogo", "Sopralluogo", "Visit"), job: tr("Verificare tecnicamente lavoro e fattibilità.", "Verificare tecnicamente lavoro e fattibilità.", "Technically verify scope and feasibility." ) },
  { status: "proposal", label: tr("Preventivo", "Preventivo", "Proposal"), job: tr("Preparare o inviare la proposta.", "Preparare o inviare la proposta.", "Prepare or send proposal." ) },
  { status: "follow_up", label: "Follow-up", job: tr("Non lasciare aperta la trattativa senza esito.", "Non lasciare aperta la trattativa senza esito.", "Do not leave the deal open without outcome." ) },
  { status: "won", label: tr("Concluso", "Concluso", "Won"), job: tr("Passare a delivery, recensione e portfolio.", "Passare a delivery, recensione e portfolio.", "Move to delivery, review and portfolio." ) },
  { status: "lost", label: tr("Fallito", "Fallito", "Lost"), job: tr("Registrare motivo perdita per migliorare il funnel.", "Registrare motivo perdita per migliorare il funnel.", "Record lost reason to improve the funnel." ) },
];

const PARTNER_FUNNEL: { status: LeadStatus; label: string; job: string }[] = [
  { status: "new", label: tr("Candidatura", "Candidatura", "Application"), job: tr("Capire categoria, zona e disponibilità.", "Capire categoria, zona e disponibilità.", "Understand category, area and availability." ) },
  { status: "first_contact", label: tr("Primo contatto", "Primo contatto", "First contact"), job: tr("Richiedere portfolio e condizioni.", "Richiedere portfolio e condizioni.", "Request portfolio and terms." ) },
  { status: "proposal", label: tr("In valutazione", "In valutazione", "Under evaluation"), job: tr("Confrontare qualità, prezzi, tempi e garanzie.", "Confrontare qualità, prezzi, tempi e garanzie.", "Compare quality, prices, timing and guarantees." ) },
  { status: "review_portfolio", label: tr("Idoneo come riserva", "Idoneo come riserva", "Suitable as backup"), job: tr("Collaboratore secondario se il principale non è disponibile.", "Collaboratore secondario se il principale non è disponibile.", "Secondary collaborator if the main one is not available." ) },
  { status: "won", label: tr("Approvato", "Approvato", "Approved"), job: tr("Può entrare nella rete collaboratori.", "Può entrare nella rete collaboratori.", "Can join the collaborator network." ) },
  { status: "lost", label: tr("Scartato", "Scartato", "Rejected"), job: tr("Non adatto: registrare il motivo.", "Non adatto: registrare il motivo.", "Not suitable: record the reason." ) },
];

const CONTACT_CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefono", label: tr("Telefono", "Telefono", "Phone") },
  { value: "email", label: "Email" },
  { value: "altro", label: tr("Altro", "Altro", "Other") },
];

const CLIENT_ACTIONS: WorkflowAction[] = [
  {
    key: "first-contact",
    label: tr("Registra primo contatto", "Registra primo contatto", "Record first contact"),
    objective: tr("Creare il record operativo del primo contatto e capire se bisogna qualificarlo.", "Creare il record operativo del primo contatto e capire se bisogna qualificarlo.", "Create the first-contact record and decide whether to qualify it."),
    when: tr("Usalo appena hai scritto, chiamato o ricevuto risposta dal cliente.", "Usalo appena hai scritto, chiamato o ricevuto risposta dal cliente.", "Use it as soon as you write, call or receive an answer from the client."),
    status: "first_contact",
    nextAction: tr("Qualificare il cliente: autorità, budget, timing, foto/progetto e compatibilità con Eivitech.", "Qualificare il cliente: autorità, budget, timing, foto/progetto e compatibilità con Eivitech.", "Qualify the client: authority, budget, timing, photos/project and fit with Eivitech."),
    activityTitle: tr("Primo contatto registrato", "Primo contatto registrato", "First contact recorded"),
    activityType: "call",
    fields: [
      { name: "channel", label: tr("Canale usato", "Canale usato", "Channel used"), type: "select", required: true, options: CONTACT_CHANNELS },
      { name: "outcome", label: tr("Esito contatto", "Esito contatto", "Contact outcome"), type: "select", required: true, options: [
        { value: "risposto", label: tr("Ha risposto", "Ha risposto", "Answered") },
        { value: "non-risponde", label: tr("Non risponde", "Non risponde", "No answer") },
        { value: "richiamare", label: tr("Da richiamare", "Da richiamare", "Call back") },
        { value: "dati-mancanti", label: tr("Servono dati mancanti", "Servono dati mancanti", "Missing data needed") },
      ] },
      { name: "nextFollowUp", label: tr("Data prossimo follow-up", "Data prossimo follow-up", "Next follow-up date"), type: "date" },
    ],
  },
  {
    key: "qualify",
    label: tr("Qualifica cliente", "Qualifica cliente", "Qualify client"),
    objective: tr("Capire se è un cliente buono, se è urgente e qual è il prossimo step reale.", "Capire se è un cliente buono, se è urgente e qual è il prossimo step reale.", "Understand whether it is a good client, urgent, and the real next step."),
    when: tr("Usalo dopo il primo contatto o dopo aver ricevuto foto, budget e dettagli.", "Usalo dopo il primo contatto o dopo aver ricevuto foto, budget e dettagli.", "Use it after first contact or after receiving photos, budget and details."),
    status: "first_contact",
    priority: "media",
    nextAction: tr("Se qualificato, proporre sopralluogo o revisione tecnica.", "Se qualificato, proporre sopralluogo o revisione tecnica.", "If qualified, propose a site visit or technical review."),
    activityTitle: tr("Qualifica cliente registrata", "Qualifica cliente registrata", "Client qualification recorded"),
    activityType: "status_change",
    checklist: [
      tr("Ha autorità decisionale o accesso al proprietario", "Ha autorità decisionale o accesso al proprietario", "Has decision authority or access to the owner"),
      tr("Tipo immobile e zona chiari", "Tipo immobile e zona chiari", "Property type and area are clear"),
      tr("Lavoro richiesto abbastanza definito", "Lavoro richiesto abbastanza definito", "Requested work is sufficiently defined"),
      tr("Foto/video/progetto disponibili o richiedibili", "Foto/video/progetto disponibili o richiedibili", "Photos/videos/project available or requestable"),
      tr("Budget o range economico indicativo", "Budget o range economico indicativo", "Indicative budget or economic range"),
      tr("Timing compatibile con Eivitech", "Timing compatibile con Eivitech", "Timing compatible with Eivitech"),
    ],
    fields: [
      { name: "outcome", label: tr("Esito qualifica", "Esito qualifica", "Qualification outcome"), type: "select", required: true, options: [
        { value: "qualificato", label: tr("Qualificato", "Qualificato", "Qualified") },
        { value: "da-completare", label: tr("Da completare", "Da completare", "To complete") },
        { value: "non-qualificato", label: tr("Non qualificato", "Non qualificato", "Not qualified") },
      ] },
      { name: "budget", label: tr("Budget/range emerso", "Budget/range emerso", "Budget/range discovered"), type: "text", placeholder: "es. 20-40k, da definire" },
    ],
  },
  {
    key: "high-priority",
    label: tr("Alta priorità", "Alta priorità", "High priority"),
    objective: tr("Evidenziare opportunità urgente, ad alto valore o molto concreta senza cambiare lo step del funnel.", "Evidenziare opportunità urgente, ad alto valore o molto concreta senza cambiare lo step del funnel.", "Mark an urgent, high-value or very concrete opportunity without changing the funnel step."),
    when: tr("Usalo solo se il cliente merita attenzione immediata.", "Usalo solo se il cliente merita attenzione immediata.", "Use only if the client deserves immediate attention."),
    priority: "alta",
    nextAction: tr("Contattare velocemente e preparare valutazione prioritaria.", "Contattare velocemente e preparare valutazione prioritaria.", "Contact quickly and prepare a priority assessment."),
    activityTitle: tr("Cliente segnato ad alta priorità", "Cliente segnato ad alta priorità", "Client marked high priority"),
    activityType: "note",
    tone: "danger",
    fields: [
      { name: "outcome", label: tr("Perché è alta priorità", "Perché è alta priorità", "Why high priority"), type: "select", required: true, options: [
        { value: "urgente", label: tr("Urgenza reale", "Urgenza reale", "Real urgency") },
        { value: "alto-valore", label: tr("Alto valore potenziale", "Alto valore potenziale", "High potential value") },
        { value: "cliente-pronto", label: tr("Cliente pronto a decidere", "Cliente pronto a decidere", "Client ready to decide") },
        { value: "partner-strategico", label: tr("Cliente/partner strategico", "Cliente/partner strategico", "Strategic client/partner") },
      ] },
    ],
  },
  {
    key: "visit",
    label: tr("Pianifica visita / sopralluogo", "Pianifica visita / sopralluogo", "Plan visit"),
    objective: tr("Passare dalla qualifica alla verifica tecnica reale.", "Passare dalla qualifica alla verifica tecnica reale.", "Move from qualification to real technical verification."),
    when: tr("Usalo quando il cliente è abbastanza chiaro per una visita o revisione tecnica.", "Usalo quando il cliente è abbastanza chiaro per una visita o revisione tecnica.", "Use it when the client is clear enough for a visit or technical review."),
    status: "visit_review",
    nextAction: tr("Eseguire sopralluogo e raccogliere dati per preventivo.", "Eseguire sopralluogo e raccogliere dati per preventivo.", "Carry out visit and collect data for proposal."),
    activityTitle: tr("Sopralluogo / revisione pianificata", "Sopralluogo / revisione pianificata", "Visit / review planned"),
    activityType: "visit",
    fields: [
      { name: "visitDate", label: tr("Data visita", "Data visita", "Visit date"), type: "date" },
      { name: "outcome", label: tr("Tipo verifica", "Tipo verifica", "Review type"), type: "select", options: [
        { value: "sopralluogo", label: tr("Sopralluogo fisico", "Sopralluogo fisico", "Physical visit") },
        { value: "revisione-foto", label: tr("Revisione foto/video", "Revisione foto/video", "Photo/video review") },
        { value: "tecnica", label: tr("Revisione tecnica", "Revisione tecnica", "Technical review") },
      ] },
    ],
  },
  {
    key: "proposal",
    label: tr("Preventivo da preparare / inviato", "Preventivo da preparare / inviato", "Proposal to prepare / sent"),
    objective: tr("Registrare se il preventivo è da preparare o già inviato e quando seguirlo.", "Registrare se il preventivo è da preparare o già inviato e quando seguirlo.", "Record whether proposal is to prepare or already sent, and when to follow it up."),
    when: tr("Usalo dopo sopralluogo o quando hai informazioni sufficienti.", "Usalo dopo sopralluogo o quando hai informazioni sufficienti.", "Use after visit or when enough information is available."),
    status: "proposal",
    nextAction: tr("Preparare/inviare preventivo e fissare follow-up.", "Preparare/inviare preventivo e fissare follow-up.", "Prepare/send proposal and schedule follow-up."),
    activityTitle: tr("Stato preventivo registrato", "Stato preventivo registrato", "Proposal status recorded"),
    activityType: "proposal",
    fields: [
      { name: "outcome", label: tr("Stato preventivo", "Stato preventivo", "Proposal status"), type: "select", required: true, options: [
        { value: "da-preparare", label: tr("Da preparare", "Da preparare", "To prepare") },
        { value: "inviato", label: tr("Inviato", "Inviato", "Sent") },
        { value: "da-modificare", label: tr("Da modificare", "Da modificare", "To modify") },
      ] },
      { name: "amount", label: tr("Importo / range", "Importo / range", "Amount / range"), type: "text", placeholder: "es. 18.500€" },
      { name: "nextFollowUp", label: tr("Data follow-up", "Data follow-up", "Follow-up date"), type: "date" },
    ],
  },
  {
    key: "follow-up",
    label: tr("Registra follow-up", "Registra follow-up", "Record follow-up"),
    objective: tr("Registrare risposta cliente dopo preventivo e decidere il prossimo passaggio.", "Registrare risposta cliente dopo preventivo e decidere il prossimo passaggio.", "Record client response after proposal and decide next step."),
    when: tr("Usalo dopo ogni contatto successivo al preventivo.", "Usalo dopo ogni contatto successivo al preventivo.", "Use after every contact after proposal."),
    status: "follow_up",
    nextAction: tr("Attendere risposta o programmare prossimo contatto.", "Attendere risposta o programmare prossimo contatto.", "Wait for response or schedule next contact."),
    activityTitle: "Follow-up",
    activityType: "follow_up",
    fields: [
      { name: "outcome", label: tr("Esito follow-up", "Esito follow-up", "Follow-up outcome"), type: "select", required: true, options: [
        { value: "interessato", label: tr("Interessato", "Interessato", "Interested") },
        { value: "vuole-modifiche", label: tr("Vuole modifiche", "Vuole modifiche", "Wants changes") },
        { value: "ci-pensa", label: tr("Deve pensarci", "Deve pensarci", "Needs to think") },
        { value: "non-risponde", label: tr("Non risponde", "Non risponde", "No answer") },
        { value: "accettato", label: tr("Accettato", "Accettato", "Accepted") },
        { value: "perso", label: tr("Perso", "Perso", "Lost") },
      ] },
      { name: "nextFollowUp", label: tr("Prossimo follow-up", "Prossimo follow-up", "Next follow-up"), type: "date" },
    ],
  },
  {
    key: "won",
    label: tr("Chiudi concluso", "Chiudi concluso", "Close won"),
    objective: tr("Chiudere positivamente la trattativa e passare a delivery/portfolio.", "Chiudere positivamente la trattativa e passare a delivery/portfolio.", "Close the deal positively and move to delivery/portfolio."),
    when: tr("Usalo solo quando il cliente ha accettato chiaramente.", "Usalo solo quando il cliente ha accettato chiaramente.", "Use only when the client clearly accepted."),
    status: "won",
    priority: "media",
    nextAction: tr("Preparare consegna, recensione e materiale portfolio.", "Preparare consegna, recensione e materiale portfolio.", "Prepare delivery, review and portfolio material."),
    activityTitle: tr("Trattativa conclusa", "Trattativa conclusa", "Deal won"),
    activityType: "status_change",
    requireNote: true,
    tone: "success",
    fields: [
      { name: "outcome", label: tr("Motivo chiusura positiva", "Motivo chiusura positiva", "Positive closing reason"), type: "select", required: true, options: [
        { value: "preventivo-accettato", label: tr("Preventivo accettato", "Preventivo accettato", "Proposal accepted") },
        { value: "lavoro-confermato", label: tr("Lavoro confermato", "Lavoro confermato", "Work confirmed") },
        { value: "cliente-strategico", label: tr("Cliente strategico", "Cliente strategico", "Strategic client") },
      ] },
    ],
  },
  {
    key: "lost",
    label: tr("Chiudi fallito", "Chiudi fallito", "Close lost"),
    objective: tr("Chiudere la trattativa persa registrando il motivo reale.", "Chiudere la trattativa persa registrando il motivo reale.", "Close the lost deal and record the real reason."),
    when: tr("Usalo quando non c'è più una trattativa attiva.", "Usalo quando non c'è più una trattativa attiva.", "Use when there is no active deal anymore."),
    status: "lost",
    priority: "baja",
    nextAction: tr("Registrare motivo perdita e possibile recupero futuro.", "Registrare motivo perdita e possibile recupero futuro.", "Record lost reason and possible future recovery."),
    activityTitle: tr("Trattativa fallita", "Trattativa fallita", "Deal lost"),
    activityType: "status_change",
    requireNote: true,
    tone: "neutral",
    fields: [
      { name: "outcome", label: tr("Motivo perdita", "Motivo perdita", "Lost reason"), type: "select", required: true, options: [
        { value: "prezzo", label: tr("Prezzo", "Prezzo", "Price") },
        { value: "tempi", label: tr("Tempi non compatibili", "Tempi non compatibili", "Timing not compatible") },
        { value: "non-qualificato", label: tr("Cliente non qualificato", "Cliente non qualificato", "Unqualified client") },
        { value: "non-risponde", label: tr("Non risponde", "Non risponde", "No answer") },
        { value: "scelto-altro", label: tr("Ha scelto altro", "Ha scelto altro", "Chose someone else") },
        { value: "altro", label: tr("Altro", "Altro", "Other") },
      ] },
    ],
  },
];

const PARTNER_ACTIONS: WorkflowAction[] = [
  {
    key: "partner-contact",
    label: tr("Registra primo contatto", "Registra primo contatto", "Record first contact"),
    objective: tr("Capire categoria, disponibilità e condizioni base del collaboratore.", "Capire categoria, disponibilità e condizioni base del collaboratore.", "Understand category, availability and basic terms."),
    when: tr("Usalo quando hai contattato il professionista.", "Usalo quando hai contattato il professionista.", "Use when you contacted the professional."),
    status: "first_contact",
    nextAction: tr("Richiedere portfolio, prezzi indicativi, tempi e garanzie.", "Richiedere portfolio, prezzi indicativi, tempi e garanzie.", "Request portfolio, indicative prices, timings and guarantees."),
    activityTitle: tr("Primo contatto partner registrato", "Primo contatto partner registrato", "Partner first contact recorded"),
    activityType: "call",
    fields: [
      { name: "channel", label: tr("Canale usato", "Canale usato", "Channel used"), type: "select", required: true, options: CONTACT_CHANNELS },
      { name: "outcome", label: tr("Esito", "Esito", "Outcome"), type: "select", required: true, options: [
        { value: "risposto", label: tr("Ha risposto", "Ha risposto", "Answered") },
        { value: "richiedere-portfolio", label: tr("Richiedere portfolio", "Richiedere portfolio", "Request portfolio") },
        { value: "da-richiamare", label: tr("Da richiamare", "Da richiamare", "Call back") },
      ] },
    ],
  },
  {
    key: "partner-evaluate",
    label: tr("Metti in valutazione", "Metti in valutazione", "Set under evaluation"),
    objective: tr("Confrontare questo partner con alternative prima di usarlo su un progetto reale.", "Confrontare questo partner con alternative prima di usarlo su un progetto reale.", "Compare this partner with alternatives before using on a real project."),
    when: tr("Usalo dopo aver ricevuto portfolio o condizioni.", "Usalo dopo aver ricevuto portfolio o condizioni.", "Use after receiving portfolio or terms."),
    status: "proposal",
    priority: "media",
    nextAction: tr("Valutare con scorecard: qualità, prezzo, tempi, garanzie.", "Valutare con scorecard: qualità, prezzo, tempi, garanzie.", "Evaluate with scorecard: quality, price, timing, guarantees."),
    activityTitle: tr("Partner in valutazione", "Partner in valutazione", "Partner under evaluation"),
    activityType: "status_change",
    checklist: [
      tr("Portfolio o lavori precedenti ricevuti", "Portfolio o lavori precedenti ricevuti", "Portfolio or previous work received"),
      tr("Prezzi o range comparabili", "Prezzi o range comparabili", "Comparable prices or ranges"),
      tr("Tempi e disponibilità chiari", "Tempi e disponibilità chiari", "Timing and availability clear"),
      tr("Garanzie/correzioni definite", "Garanzie/correzioni definite", "Warranty/corrections defined"),
    ],
  },
  {
    key: "partner-approved",
    label: tr("Approva partner", "Approva partner", "Approve partner"),
    objective: tr("Validare il collaboratore come utilizzabile su progetti Eivitech.", "Validare il collaboratore come utilizzabile su progetti Eivitech.", "Validate the collaborator as usable on Eivitech projects."),
    when: tr("Usalo solo con evidenze sufficienti.", "Usalo solo con evidenze sufficienti.", "Use only with enough evidence."),
    status: "won",
    priority: "alta",
    nextAction: tr("Inserire tra i collaboratori approvati e definire regole operative.", "Inserire tra i collaboratori approvati e definire regole operative.", "Add to approved collaborators and define operating rules."),
    activityTitle: tr("Partner approvato", "Partner approvato", "Partner approved"),
    activityType: "status_change",
    requireNote: true,
    tone: "success",
  },
  {
    key: "partner-reserve",
    label: tr("Idoneo come riserva", "Idoneo come riserva", "Suitable as backup"),
    objective: tr("Segnarlo come collaboratore secondario se il principale non è disponibile.", "Segnarlo come collaboratore secondario se il principale non è disponibile.", "Mark as secondary collaborator if the main one is not available."),
    when: tr("Usalo quando non è prima scelta ma può servire.", "Usalo quando non è prima scelta ma può servire.", "Use when not first choice but useful."),
    status: "review_portfolio",
    priority: "media",
    nextAction: tr("Tenere come riserva e rivalutare su progetti compatibili.", "Tenere come riserva e rivalutare su progetti compatibili.", "Keep as reserve and reassess on compatible projects."),
    activityTitle: tr("Partner idoneo come riserva", "Partner idoneo come riserva", "Partner suitable as backup"),
    activityType: "status_change",
  },
  {
    key: "partner-rejected",
    label: tr("Scarta partner", "Scarta partner", "Reject partner"),
    objective: tr("Escludere il collaboratore registrando il motivo.", "Escludere il collaboratore registrando il motivo.", "Exclude the collaborator and record reason."),
    when: tr("Usalo se non è adatto a Eivitech.", "Usalo se non è adatto a Eivitech.", "Use if not suitable for Eivitech."),
    status: "lost",
    priority: "baja",
    nextAction: tr("Registrare motivo esclusione.", "Registrare motivo esclusione.", "Record rejection reason."),
    activityTitle: tr("Partner scartato", "Partner scartato", "Partner rejected"),
    activityType: "status_change",
    requireNote: true,
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
    nombre: lead.nombre || tr("Sin nombre", "Senza nome", "Without name"),
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

function toIsoDate(value?: string) {
  if (!value) return null;
  return `${value}T09:00:00.000Z`;
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

function getRecommendedActionKey(lead: DashboardLead, partner = false) {
  if (partner) {
    if (lead.status === "new") return "partner-contact";
    if (lead.status === "first_contact") return "partner-evaluate";
    if (lead.status === "proposal") return "partner-approved";
    return "partner-contact";
  }

  if (lead.status === "new") return "first-contact";
  if (lead.status === "first_contact") return "qualify";
  if (lead.status === "visit_review") return "proposal";
  if (lead.status === "proposal") return "follow-up";
  if (lead.status === "follow_up") return "won";
  return "first-contact";
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

function buildActivityNotes(action: WorkflowAction, form: WorkflowForm) {
  const checklist = action.checklist?.map((item) => `${form.checked[item] ? "[x]" : "[ ]"} ${item}`).join("\n");
  return [
    `Azione: ${action.label}`,
    form.channel ? `Canale: ${form.channel}` : null,
    form.outcome ? `Esito: ${form.outcome}` : null,
    form.budget ? `Budget/range: ${form.budget}` : null,
    form.amount ? `Importo/range: ${form.amount}` : null,
    form.visitDate ? `Data visita: ${form.visitDate}` : null,
    form.nextFollowUp ? `Prossimo follow-up: ${form.nextFollowUp}` : null,
    checklist ? `Checklist:\n${checklist}` : null,
    form.note ? `Nota: ${form.note}` : null,
  ].filter(Boolean).join("\n");
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

  async function submitWorkflow(lead: DashboardLead, action: WorkflowAction, form: WorkflowForm) {
    const note = form.note.trim();
    const missingRequiredField = action.fields?.find((field) => field.required && !String(form[field.name] || "").trim());

    if (missingRequiredField) {
      setError(`${tr("Campo obbligatorio", "Campo obbligatorio", "Required field")}: ${missingRequiredField.label}`);
      return false;
    }

    if (action.requireNote && !note) {
      setError(tr("Per questa azione devi aggiungere una nota interna o un motivo.", "Per questa azione devi aggiungere una nota interna o un motivo.", "This action requires an internal note or reason."));
      return false;
    }

    setSavingId(lead.id);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");

      const payload: CrmLeadUpdatePayload = {
        status: action.status,
        priority: action.priority,
        next_action: action.nextAction,
        next_follow_up_at: toIsoDate(form.nextFollowUp),
      };

      const result = await updateCrmLead(token, lead.id, payload);
      await addCrmLeadActivity(token, lead.id, {
        type: action.activityType,
        title: action.activityTitle,
        notes: buildActivityNotes(action, form),
        due_at: toIsoDate(form.nextFollowUp),
      });

      const updated = mapLead(result.lead as ApiLead);
      setLeads((current) => current.map((item) => (item.id === lead.id ? updated : item)));
      return true;
    } catch (err) {
      console.error("[dashboard] failed to submit workflow", err);
      setError(tr("Non è stato possibile salvare l'azione. Controlla Railway/Network e riprova.", "Non è stato possibile salvare l'azione. Controlla Railway/Network e riprova.", "Could not save the action. Check Railway/Network and try again."));
      return false;
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    if (hasAccess) void loadLeads();
  }, [hasAccess]);

  const clientLeads = useMemo(() => leads.filter((lead) => !isPartnerLead(lead)), [leads]);
  const partnerLeads = useMemo(() => leads.filter(isPartnerLead), [leads]);
  const sortedClients = useMemo(() => [...clientLeads].sort((a, b) => Number(b.priority === "alta") - Number(a.priority === "alta") || b.score - a.score), [clientLeads]);
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
          <h1 className="display-lg mt-4">{tr("CRM operativo clienti e partner", "CRM operativo clienti e partner", "Operational clients and partners CRM")}</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            {tr(
              "Il CRM ora guida il lavoro: ogni fase dice cosa fare, quali dati registrare e qual è il prossimo step.",
              "Il CRM ora guida il lavoro: ogni fase dice cosa fare, quali dati registrare e qual è il prossimo step.",
              "The CRM now guides the work: each stage explains what to do, what to record and the next step."
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
        <Metric icon={Users} label={tr("Clientes", "Clienti", "Clients")} value={stats.clients} helper={tr("Solicitudes comerciales", "Richieste commerciali", "Commercial requests")} />
        <Metric icon={ShieldCheck} label={tr("Cualificados", "Qualificati", "Qualified")} value={stats.qualified} helper={tr("En proceso", "In processo", "In process")} />
        <Metric icon={AlertTriangle} label={tr("Alta prioridad", "Alta priorità", "High priority")} value={stats.high} helper={tr("Seguir de inmediato", "Da seguire subito", "Follow immediately")} />
        <Metric icon={CheckCircle2} label={tr("Concluidos", "Conclusi", "Won")} value={stats.won} helper={tr("Tratos cerrados", "Trattative chiuse", "Closed deals")} />
        <Metric icon={Clock} label={tr("Fallidos", "Falliti", "Lost")} value={stats.lost} helper={tr("Con motivo registrado", "Con motivo registrato", "With recorded reason")} />
        <Metric icon={Hammer} label="Partner" value={stats.partners} helper={tr("Candidaturas", "Candidature", "Applications")} />
        <Metric icon={Wrench} label={tr("Aprobados", "Approvati", "Approved")} value={stats.approvedPartners} helper={tr("Colaboradores validados", "Collaboratori validati", "Validated partners")} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 rounded-sm border border-border bg-card p-2 shadow-soft">
        <TabButton active={activeTab === "clientes"} icon={Users} label={tr("Clientes", "Clienti", "Clients")} onClick={() => setActiveTab("clientes")} />
        <TabButton active={activeTab === "partners"} icon={Hammer} label={tr("Partners profesionales", "Partner professionali", "Professional partners")} onClick={() => setActiveTab("partners")} />
        <TabButton active={activeTab === "control"} icon={ClipboardCheck} label={tr("Control operativo", "Controllo operativo", "Operational control")} onClick={() => setActiveTab("control")} />
        <button onClick={() => void loadLeads()} disabled={loading} className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60">
          <RefreshCw size={15} /> {loading ? tr("Cargando…", "Caricamento…", "Loading…") : tr("Actualizar", "Aggiorna", "Refresh")}
        </button>
      </div>

      {activeTab === "clientes" && (
        <LeadsBoard
          type="client"
          leads={sortedClients}
          actions={CLIENT_ACTIONS}
          funnel={CLIENT_FUNNEL}
          loading={loading}
          savingId={savingId}
          onSubmit={submitWorkflow}
        />
      )}

      {activeTab === "partners" && (
        <LeadsBoard
          type="partner"
          leads={sortedPartners}
          actions={PARTNER_ACTIONS}
          funnel={PARTNER_FUNNEL}
          loading={loading}
          savingId={savingId}
          onSubmit={submitWorkflow}
        />
      )}

      {activeTab === "control" && <ControlPanel />}

      <div className="mt-8 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">
        <div className="font-medium text-foreground">{tr("Usuarios frontend autorizados", "Utenti frontend autorizzati", "Authorized frontend users")}</div>
        <div className="mt-2">{ALLOWED_ADMIN_EMAILS.length > 0 ? ALLOWED_ADMIN_EMAILS.join(", ") : tr("No hay allowlist frontend configurada.", "Nessuna allowlist frontend configurata.", "No frontend allowlist configured.")}</div>
      </div>
    </section>
  );
}

function LeadsBoard({ type, leads, actions, funnel, loading, savingId, onSubmit }: {
  type: "client" | "partner";
  leads: DashboardLead[];
  actions: WorkflowAction[];
  funnel: { status: LeadStatus; label: string; job: string }[];
  loading: boolean;
  savingId: string | null;
  onSubmit: (lead: DashboardLead, action: WorkflowAction, form: WorkflowForm) => Promise<boolean>;
}) {
  const emptyText = type === "partner"
    ? tr("No hay candidaturas partner todavía.", "Non ci sono ancora candidature partner.", "There are no partner applications yet.")
    : tr("No hay solicitudes cliente todavía.", "Non ci sono ancora richieste cliente.", "There are no client requests yet.");

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.35fr]">
      <div className="space-y-5">
        {type === "client" && (
          <div className="rounded-sm border-2 border-primary bg-primary/10 p-5 text-sm shadow-soft">
            <div className="font-display text-xl text-foreground">{tr("Funnel cliente guidato", "Funnel cliente guidato", "Guided client funnel")}</div>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {tr(
                "Ogni scheda cliente ora mostra: fase attuale, cosa fare ora, azione consigliata, dati da registrare, pulsanti e salvataggio nel CRM.",
                "Ogni scheda cliente ora mostra: fase attuale, cosa fare ora, azione consigliata, dati da registrare, pulsanti e salvataggio nel CRM.",
                "Each client card now shows: current stage, what to do now, recommended action, data to record, buttons and CRM save."
              )}
            </p>
          </div>
        )}

        {loading ? (
          <div className="rounded-sm border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">{tr("Cargando datos desde PostgreSQL…", "Caricamento dati da PostgreSQL…", "Loading data from PostgreSQL…")}</div>
        ) : leads.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              type={type}
              lead={lead}
              actions={actions}
              funnel={funnel}
              saving={savingId === lead.id}
              onSubmit={onSubmit}
            />
          ))
        )}
      </div>

      <aside className="space-y-4">
        <PipelineSummary leads={leads} funnel={funnel} />
        <div className="rounded-sm border border-border bg-card p-5 text-sm shadow-soft">
          <div className="font-medium text-foreground">{type === "partner" ? tr("Metodo partner", "Metodo partner", "Partner method") : tr("Metodo cliente", "Metodo cliente", "Client method")}</div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {type === "partner"
              ? tr("Idoneo come riserva significa: collaboratore secondario, non prima scelta, da usare se il principale non è disponibile.", "Idoneo come riserva significa: collaboratore secondario, non prima scelta, da usare se il principale non è disponibile.", "Suitable as backup means: secondary collaborator, not first choice, used when the main one is not available.")
              : tr("Alta priorità è una flag, non una fase: il cliente resta nello step corretto ma viene evidenziato come urgente/importante.", "Alta priorità è una flag, non una fase: il cliente resta nello step corretto ma viene evidenziato come urgente/importante.", "High priority is a flag, not a stage: the client stays in the correct step but is highlighted as urgent/important.")}
          </p>
        </div>
      </aside>
    </div>
  );
}

function LeadCard({ type, lead, actions, funnel, saving, onSubmit }: {
  type: "client" | "partner";
  lead: DashboardLead;
  actions: WorkflowAction[];
  funnel: { status: LeadStatus; label: string; job: string }[];
  saving: boolean;
  onSubmit: (lead: DashboardLead, action: WorkflowAction, form: WorkflowForm) => Promise<boolean>;
}) {
  const partner = type === "partner";
  const recommendedKey = getRecommendedActionKey(lead, partner);
  const [selectedKey, setSelectedKey] = useState(recommendedKey);
  const [form, setForm] = useState<WorkflowForm>({ channel: "whatsapp", outcome: "", budget: "", nextFollowUp: "", amount: "", visitDate: "", note: "", checked: {} });
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedAction = actions.find((action) => action.key === selectedKey) || actions[0];

  useEffect(() => {
    const nextKey = getRecommendedActionKey(lead, partner);
    setSelectedKey(nextKey);
    setForm({ channel: "whatsapp", outcome: "", budget: "", nextFollowUp: "", amount: "", visitDate: "", note: "", checked: {} });
    setLocalError(null);
    setSuccess(null);
  }, [lead.id, lead.status, lead.priority, partner]);

  async function handleSubmit() {
    if (!selectedAction) return;
    const missingRequiredField = selectedAction.fields?.find((field) => field.required && !String(form[field.name] || "").trim());

    if (missingRequiredField) {
      setLocalError(`${tr("Campo obbligatorio", "Campo obbligatorio", "Required field")}: ${missingRequiredField.label}`);
      setSuccess(null);
      return;
    }

    if (selectedAction.requireNote && !form.note.trim()) {
      setLocalError(tr("Aggiungi una nota prima di usare questa azione.", "Aggiungi una nota prima di usare questa azione.", "Add a note before using this action."));
      setSuccess(null);
      return;
    }

    setLocalError(null);
    setSuccess(null);
    const ok = await onSubmit(lead, selectedAction, form);
    if (ok) {
      setSuccess(tr("Azione registrata e funnel aggiornato.", "Azione registrata e funnel aggiornato.", "Action recorded and funnel updated."));
      setForm({ channel: "whatsapp", outcome: "", budget: "", nextFollowUp: "", amount: "", visitDate: "", note: "", checked: {} });
    }
  }

  return (
    <article className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl">{lead.nombre}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusTone(lead.status)}`}>{STATUS_LABELS[lead.status]}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getPriorityTone(lead.priority)}`}>{tr("Prioridad", "Priorità", "Priority")} {PRIORITY_LABELS[lead.priority]}</span>
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
            <Info label={tr("Categoría", "Categoria", "Category")} value={getPartnerInfo(lead, "Categoría")} />
            <Info label={tr("Empresa", "Azienda", "Company")} value={getPartnerInfo(lead, "Empresa/marca")} />
            <Info label={tr("Experiencia", "Esperienza", "Experience")} value={getPartnerInfo(lead, "Experiencia")} />
            <Info label={tr("Disponibilidad", "Disponibilità", "Availability")} value={getPartnerInfo(lead, "Disponibilidad")} />
          </>
        ) : (
          <>
            <Info label="Authority" value={normalise(lead.tipoCliente)} />
            <Info label={tr("Propiedad", "Proprietà", "Property")} value={normalise(lead.tipoPropiedad)} />
            <Info label="Need" value={normalise(lead.intervencion, SERVICE_LABELS)} />
            <Info label="Timing" value={normalise(lead.plazo)} />
          </>
        )}
      </div>

      <div className="mt-5 rounded-sm border-2 border-primary bg-primary/5 p-5 shadow-soft">
        <FunnelStepper current={lead.status} funnel={funnel} />

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.75fr_1fr]">
          <div className="rounded-sm border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-primary">{tr("Cosa fare adesso", "Cosa fare adesso", "What to do now")}</div>
            <h4 className="mt-2 font-display text-2xl text-foreground">{selectedAction.label}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedAction.objective}</p>
            <p className="mt-3 rounded-sm bg-accent/60 p-3 text-xs leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">Quando usarlo:</span> {selectedAction.when}</p>
          </div>

          <div className="rounded-sm border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-primary">{partner ? tr("Azioni partner", "Azioni partner", "Partner actions") : tr("Azioni cliente", "Azioni cliente", "Client actions")}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {actions.map((action) => (
                <button
                  key={`${lead.id}-${action.key}`}
                  type="button"
                  disabled={saving}
                  onClick={() => { setSelectedKey(action.key); setLocalError(null); setSuccess(null); }}
                  className={`min-h-[72px] rounded-sm border-2 px-3 py-2 text-left text-xs transition disabled:opacity-50 ${selectedKey === action.key ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:bg-accent"}`}
                >
                  <span className="block text-sm font-semibold">{action.label}</span>
                  <span className="mt-1 block opacity-75">{action.when}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary">{tr("Registra attività", "Registra attività", "Record activity")}</div>
              <div className="mt-1 font-medium text-foreground">{selectedAction.activityTitle}</div>
            </div>
            {saving && <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">{tr("Salvataggio…", "Salvataggio…", "Saving…")}</span>}
          </div>

          {selectedAction.checklist && (
            <div className="mt-4 rounded-sm bg-background p-4">
              <div className="text-sm font-medium">{tr("Checklist di qualifica / valutazione", "Checklist di qualifica / valutazione", "Qualification / evaluation checklist")}</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {selectedAction.checklist.map((item) => (
                  <label key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-primary"
                      checked={Boolean(form.checked[item])}
                      onChange={(event) => setForm((current) => ({ ...current, checked: { ...current.checked, [item]: event.target.checked } }))}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {selectedAction.fields?.map((field) => <WorkflowFieldInput key={field.name} field={field} form={form} setForm={setForm} />)}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {selectedAction.requireNote ? tr("Nota interna / motivo obbligatorio", "Nota interna / motivo obbligatorio", "Required internal note / reason") : tr("Nota interna", "Nota interna", "Internal note")}
            </label>
            <textarea
              rows={4}
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder={partner ? tr("Esempio: portfolio buono, prezzi da confrontare, disponibile solo su lavori programmati…", "Esempio: portfolio buono, prezzi da confrontare, disponibile solo su lavori programmati…", "Example: good portfolio, prices to compare, only available for scheduled work…") : tr("Esempio: primo contatto via WhatsApp, cliente interessato, mancano foto e budget…", "Esempio: primo contatto via WhatsApp, cliente interessato, mancano foto e budget…", "Example: first contact via WhatsApp, client interested, photos and budget missing…")}
              className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSubmit()}
            className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {saving ? tr("Salvataggio in corso…", "Salvataggio in corso…", "Saving…") : tr("Salva attività e aggiorna funnel", "Salva attività e aggiorna funnel", "Save activity and update funnel")}
          </button>

          {localError && <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{localError}</p>}
          {success && <p className="mt-4 rounded-sm border border-secondary/30 bg-secondary/10 p-3 text-sm text-secondary">{success}</p>}
        </div>
      </div>
    </article>
  );
}

function WorkflowFieldInput({ field, form, setForm }: { field: WorkflowField; form: WorkflowForm; setForm: (updater: (current: WorkflowForm) => WorkflowForm) => void }) {
  const value = form[field.name] || "";

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {field.label}{field.required ? " *" : ""}
      </label>
      {field.type === "select" ? (
        <select value={value} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm">
          <option value="">{tr("Seleziona", "Seleziona", "Select")}</option>
          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
          className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

function FunnelStepper({ current, funnel }: { current: LeadStatus; funnel: { status: LeadStatus; label: string; job: string }[] }) {
  const currentIndex = Math.max(0, funnel.findIndex((step) => step.status === current));

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-primary">{tr("Funnel operativo", "Funnel operativo", "Operational funnel")}</div>
      <div className="mt-3 grid gap-2 md:grid-cols-4 xl:grid-cols-7">
        {funnel.map((step, index) => {
          const active = step.status === current;
          const done = index < currentIndex;
          return (
            <div key={`${step.status}-${step.label}`} className={`rounded-sm border p-3 ${active ? "border-primary bg-primary/10" : done ? "border-secondary/30 bg-secondary/10" : "border-border bg-background"}`}>
              <div className="text-xs font-semibold">{index + 1}. {step.label}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.job}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PipelineSummary({ leads, funnel }: { leads: DashboardLead[]; funnel: { status: LeadStatus; label: string }[] }) {
  const rows = funnel.map((step) => ({ status: step.status, label: step.label, total: leads.filter((lead) => lead.status === step.status).length }));

  return (
    <div className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium"><Target size={17} className="text-primary" /> Pipeline</div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={`${row.status}-${row.label}`} className="flex items-center justify-between gap-3 border-b border-border/70 pb-2 last:border-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(row.status)}`}>{row.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlPanel() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="rounded-sm border border-border bg-card p-6 shadow-card lg:col-span-2">
        <h2 className="font-display text-2xl">{tr("Logica operativa", "Logica operativa", "Operational logic")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tr(
            "Il funnel non è più una lista di pulsanti scollegati: ogni azione registra un'attività, aggiorna stato/priorità/prossima azione e guida l'admin al passaggio successivo.",
            "Il funnel non è più una lista di pulsanti scollegati: ogni azione registra un'attività, aggiorna stato/priorità/prossima azione e guida l'admin al passaggio successivo.",
            "The funnel is no longer a disconnected button list: every action records an activity, updates status/priority/next action and guides the admin to the next step."
          )}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <RoadmapCard title="1. Primo contatto" items={[tr("Registra canale ed esito", "Registra canale ed esito", "Record channel and outcome"), tr("Definisci dati mancanti", "Definisci dati mancanti", "Define missing data"), tr("Crea prossimo follow-up", "Crea prossimo follow-up", "Create next follow-up")]} />
          <RoadmapCard title="2. Qualifica" items={[tr("Checklist cliente", "Checklist cliente", "Client checklist"), tr("Budget/timing/foto", "Budget/timing/foto", "Budget/timing/photos"), tr("Priorità come flag", "Priorità come flag", "Priority as flag")]} />
          <RoadmapCard title="3. Chiusura" items={[tr("Preventivo", "Preventivo", "Proposal"), "Follow-up", tr("Concluso o fallito con motivo", "Concluso o fallito con motivo", "Won or lost with reason")]} />
        </div>
      </div>
      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium"><FileText size={17} className="text-primary" /> {tr("Regole minime", "Regole minime", "Minimum rules")}</div>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <ChecklistItem ok label={tr("Ogni azione crea un'attività", "Ogni azione crea un'attività", "Every action creates an activity")} />
          <ChecklistItem ok label={tr("Alta priorità non cambia fase", "Alta priorità non cambia fase", "High priority does not change stage")} />
          <ChecklistItem ok label={tr("Concluso richiede nota", "Concluso richiede nota", "Won requires note")} />
          <ChecklistItem ok label={tr("Fallito richiede motivo", "Fallito richiede motivo", "Lost requires reason")} />
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
