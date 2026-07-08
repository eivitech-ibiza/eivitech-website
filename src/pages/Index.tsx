import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { ProjectCard } from "@/components/ProjectCard";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SERVICES } from "@/data/services";
import { PROJECTS } from "@/data/projects";
import { GENERAL_FAQS } from "@/data/faqs";
import { orgJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE } from "@/data/site";
import { ArrowRight, Home, Building2, Store, Wrench, Lightbulb, TreePine } from "lucide-react";
import { tr } from "@/lib/i18n";

const heroImg = `${import.meta.env.BASE_URL}media/projects/casa-vadella/cover.jpg`;
const materiales = `${import.meta.env.BASE_URL}media/projects/casa-vinya/cover.jpg`;

const homeServices = [
  { slug: "reformas-integrales", icon: Home },
  { slug: "electricidad-iluminacion", icon: Lightbulb },
  { slug: "albanileria-acabados", icon: Wrench },
  { slug: "fontaneria", icon: Wrench },
  { slug: "carpinteria", icon: Building2 },
  { slug: "terrazas-exteriores", icon: TreePine },
];

const audienceItems = [
  { icon: Home, label: tr("Propietarios de viviendas", "Proprietari di abitazioni", "Homeowners") },
  { icon: Building2, label: tr("Villas y apartamentos", "Ville e appartamenti", "Villas and apartments") },
  { icon: Store, label: tr("Locales comerciales", "Locali commerciali", "Commercial spaces") },
  { icon: Building2, label: tr("Inversores inmobiliarios", "Investitori immobiliari", "Real estate investors") },
];

const Index = () => {
  return (
    <>
      <SEO
        title={tr("Eivitech Ibiza | Reformas e instalaciones en Ibiza", "Eivitech Ibiza | Ristrutturazioni e impianti a Ibiza", "Eivitech Ibiza | Renovations and installations in Ibiza")}
        description={tr("Reformas, instalaciones y acabados en Ibiza para viviendas, apartamentos, villas y locales comerciales.", "Ristrutturazioni, impianti e finiture a Ibiza per case, appartamenti, ville e locali commerciali.", "Renovations, installations and finishes in Ibiza for homes, apartments, villas and commercial spaces.")}
        path="/"
        jsonLd={[orgJsonLd(), faqJsonLd(GENERAL_FAQS)]}
      />

      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt={tr("Interior reformado en Ibiza", "Interno ristrutturato a Ibiza", "Renovated interior in Ibiza")} width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        </div>
        <div className="container-x pt-24 md:pt-32 pb-20 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl">
            <div className="eyebrow text-cream/75">{SITE.tagline}</div>
            <h1 className="mt-5 max-w-5xl font-display text-[clamp(2.6rem,5.7vw,5.15rem)] font-medium leading-[1.03] tracking-tight text-cream drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
              {tr("Reformas e instalaciones en Ibiza para propiedades que necesitan", "Ristrutturazioni e impianti a Ibiza per proprietà che hanno bisogno di", "Renovations and installations in Ibiza for properties that need")} <span className="italic text-[#f2c7a6]">{tr("gestión, calidad y detalle", "gestione, qualità e dettaglio", "management, quality and detail")}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/90 drop-shadow-[0_1px_14px_rgba(0,0,0,0.55)] sm:text-lg md:text-xl">
              {tr("Coordinamos reformas, instalaciones y acabados para viviendas, apartamentos, villas y locales comerciales, acompañando al cliente desde la idea inicial hasta el último detalle.", "Coordiniamo ristrutturazioni, impianti e finiture per case, appartamenti, ville e locali commerciali, accompagnando il cliente dall'idea iniziale all'ultimo dettaglio.", "We coordinate renovations, installations and finishes for homes, apartments, villas and commercial spaces, supporting the client from the initial idea to the final detail.")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/contacto" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground shadow-elevated transition hover:bg-primary/90">{tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment")} <ArrowRight size={16} /></Link>
              <Link to="/proyectos" className="inline-flex items-center rounded-sm border border-cream/35 bg-cream/90 px-6 py-4 text-sm font-medium text-ink shadow-soft backdrop-blur hover:bg-cream">{tr("Ver proyectos", "Vedi progetti", "View projects")}</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section bg-accent/40">
        <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
          <div><div className="eyebrow">{tr("El contexto", "Il contesto", "The context")}</div><h2 className="display-lg mt-4">{tr("Reformar en Ibiza no debería ser una preocupación constante", "Ristrutturare a Ibiza non dovrebbe essere una preoccupazione costante", "Renovating in Ibiza should not be a constant worry")}</h2></div>
          <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
            <p>{tr("Cada reforma implica decisiones sobre materiales, profesionales, plazos y detalles. Cuando no hay un referente que coordine, el proyecto se vuelve agotador.", "Ogni ristrutturazione richiede decisioni su materiali, professionisti, tempi e dettagli. Quando manca un referente che coordina, il progetto diventa faticoso.", "Every renovation involves decisions about materials, professionals, timelines and details. Without a coordinating point of contact, the project becomes exhausting.")}</p>
            <p>{tr("En Ibiza también cuentan la logística, la disponibilidad de proveedores y las particularidades del entorno. Por eso tiene sentido contar con alguien que gestione el proceso.", "A Ibiza contano anche logistica, disponibilità dei fornitori e particolarità dell'ambiente. Per questo ha senso contare su qualcuno che gestisca il processo.", "In Ibiza, logistics, supplier availability and the specific environment also matter. That is why it makes sense to have someone manage the process.")}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-14 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="aspect-[4/5] overflow-hidden rounded-sm"><img src={materiales} alt={tr("Materiales naturales", "Materiali naturali", "Natural materials")} loading="lazy" className="h-full w-full object-cover" /></div>
          <div>
            <div className="eyebrow">{tr("La propuesta", "La proposta", "The proposal")}</div>
            <h2 className="display-lg mt-4">{tr("Un referente para coordinar la reforma de principio a fin", "Un referente per coordinare la ristrutturazione dall'inizio alla fine", "A point of contact to coordinate the renovation from start to finish")}</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>{tr("Escuchamos lo que necesitas, definimos juntos la intervención y nos hacemos cargo del proyecto.", "Ascoltiamo ciò di cui hai bisogno, definiamo insieme l'intervento e ci facciamo carico del progetto.", "We listen to what you need, define the work together and take charge of the project.")}</p>
              <p>{tr("Coordinamos profesionales, materiales, instalaciones y acabados para que el resultado sea coherente y cuidado.", "Coordiniamo professionisti, materiali, impianti e finiture perché il risultato sia coerente e curato.", "We coordinate professionals, materials, installations and finishes so the result is coherent and carefully managed.")}</p>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[tr("Un único interlocutor", "Un unico interlocutore", "One point of contact"), tr("Coordinación de oficios", "Coordinamento degli artigiani", "Trade coordination"), tr("Materiales seleccionados", "Materiali selezionati", "Selected materials"), tr("Seguimiento hasta el último detalle", "Monitoraggio fino all'ultimo dettaglio", "Follow-up to the final detail")].map((it) => <li key={it} className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{it}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-accent/40"><div className="container-x"><div className="flex flex-wrap items-end justify-between gap-6 mb-12"><div><div className="eyebrow">{tr("Servicios", "Servizi", "Services")}</div><h2 className="display-lg mt-4 max-w-2xl">{tr("Lo que coordinamos para tu propiedad", "Cosa coordiniamo per la tua proprietà", "What we coordinate for your property")}</h2></div><Link to="/servicios" className="text-sm text-primary hover:underline">{tr("Ver todos los servicios", "Vedi tutti i servizi", "View all services")} →</Link></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{homeServices.map(({ slug }) => <ServiceCard key={slug} service={SERVICES.find((x) => x.slug === slug)!} />)}</div></div></section>

      <section className="section"><div className="container-x"><div className="flex flex-wrap items-end justify-between gap-6 mb-12"><div><div className="eyebrow">{tr("Proyectos destacados", "Progetti in evidenza", "Featured projects")}</div><h2 className="display-lg mt-4 max-w-2xl">{tr("Casos reales en Ibiza", "Casi reali a Ibiza", "Real cases in Ibiza")}</h2></div><Link to="/proyectos" className="text-sm text-primary hover:underline">{tr("Ver todos", "Vedi tutti", "View all")} →</Link></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">{PROJECTS.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i === 0} />)}</div></div></section>

      <section className="section bg-ink text-cream"><div className="container-x"><div className="grid gap-10 md:grid-cols-2 md:items-end mb-12"><div><div className="eyebrow text-cream/70">{tr("Cómo trabajamos", "Come lavoriamo", "How we work")}</div><h2 className="display-lg mt-4">{tr("Un proceso pensado para mantener el control", "Un processo pensato per mantenere il controllo", "A process designed to keep control")}</h2></div><p className="text-cream/80 text-lg leading-relaxed">{tr("Desde la primera valoración hasta los detalles finales, mantenemos la comunicación abierta y un referente claro para cada decisión.", "Dalla prima valutazione ai dettagli finali, manteniamo comunicazione aperta e un referente chiaro per ogni decisione.", "From the first assessment to the final details, we keep communication open and a clear point of contact for every decision.")}</p></div><div className="[&_li]:!bg-ink [&_li]:!text-cream [&_ol]:!bg-cream/10 [&_li_div.text-primary]:!text-primary [&_li_p]:!text-cream/70"><ProcessSteps steps={[{ title: tr("Primera valoración", "Prima valutazione", "First assessment"), description: tr("Entendemos qué necesitas y la propiedad.", "Capiamo cosa ti serve e la proprietà.", "We understand what you need and the property.") }, { title: tr("Visita o revisión", "Visita o revisione", "Visit or review"), description: tr("Vemos el estado actual y el potencial.", "Vediamo lo stato attuale e il potenziale.", "We review the current state and potential.") }, { title: tr("Presupuesto", "Preventivo", "Proposal"), description: tr("Definimos alcance y propuesta.", "Definiamo portata e proposta.", "We define scope and proposal.") }, { title: tr("Planificación", "Pianificazione", "Planning"), description: tr("Organizamos oficios, materiales y tiempos.", "Organizziamo artigiani, materiali e tempi.", "We organize trades, materials and timing.") }, { title: tr("Ejecución", "Esecuzione", "Execution"), description: tr("Coordinamos el trabajo y el seguimiento.", "Coordiniamo il lavoro e il monitoraggio.", "We coordinate the work and follow-up.") }, { title: tr("Entrega", "Consegna", "Handover"), description: tr("Cuidamos cada detalle final.", "Curiamo ogni dettaglio finale.", "We care for every final detail.") }]} /></div></div></section>

      <section className="section"><div className="container-x"><div className="eyebrow">{tr("Trabajamos con", "Lavoriamo con", "We work with")}</div><h2 className="display-lg mt-4 mb-12 max-w-3xl">{tr("Propietarios, inversores y clientes que buscan un referente local", "Proprietari, investitori e clienti che cercano un referente locale", "Owners, investors and clients looking for a local point of contact")}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{audienceItems.map(({ icon: Icon, label }) => <div key={label} className="rounded-sm border border-border bg-card p-6"><Icon size={22} className="text-primary" /><div className="mt-4 font-medium">{label}</div></div>)}</div></div></section>

      <section className="section bg-accent/40"><div className="container-x"><div className="grid gap-10 md:grid-cols-[1fr_2fr]"><div><div className="eyebrow">{tr("Preguntas frecuentes", "Domande frequenti", "Frequently asked questions")}</div><h2 className="display-lg mt-4">{tr("Lo que más nos preguntan", "Le domande più comuni", "What we are asked most")}</h2></div><FAQAccordion items={GENERAL_FAQS} /></div></div></section>
    </>
  );
};

export default Index;
