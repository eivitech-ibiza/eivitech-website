import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { tr } from "@/lib/i18n";

const steps = [
  {
    title: tr("Descubrir", "Scoprire", "Discover"),
    text: tr("Escuchamos objetivos, estilo de vida, estado del inmueble, timing, presupuesto orientativo y prioridades reales.", "Ascoltiamo obiettivi, stile di vita, stato dell'immobile, timing, budget orientativo e priorità reali.", "We listen to goals, lifestyle, property condition, timing, indicative budget and real priorities."),
  },
  {
    title: tr("Diseñar", "Progettare", "Design"),
    text: tr("Definimos dirección estética, materiales, distribución, atmósfera y soluciones personalizadas.", "Definiamo direzione estetica, materiali, distribuzione, atmosfera e soluzioni personalizzate.", "We define aesthetic direction, materials, layout, atmosphere and tailored solutions."),
  },
  {
    title: tr("Planificar", "Pianificare", "Plan"),
    text: tr("Ordenamos decisiones, proveedores, fases, visitas, presupuesto y próximos pasos antes de entrar en obra.", "Ordiniamo decisioni, fornitori, fasi, visite, preventivo e prossimi passi prima di entrare in cantiere.", "We organise decisions, suppliers, phases, visits, proposal and next steps before construction starts."),
  },
  {
    title: tr("Construir", "Costruire", "Build"),
    text: tr("Coordinamos albañilería, instalaciones, climatización, carpintería, acabados y profesionales externos.", "Coordiniamo muratura, impianti, climatizzazione, falegnameria, finiture e professionisti esterni.", "We coordinate masonry, installations, HVAC, carpentry, finishes and external professionals."),
  },
  {
    title: tr("Refinar", "Rifinire", "Refine"),
    text: tr("Revisamos detalles, luz, encuentros, texturas, carpintería y acabados para que el resultado sea coherente.", "Revisioniamo dettagli, luce, giunti, texture, falegnameria e finiture perché il risultato sia coerente.", "We refine details, lighting, junctions, textures, carpentry and finishes so the result feels coherent."),
  },
  {
    title: tr("Entregar", "Consegnare", "Deliver"),
    text: tr("Cerramos el proyecto con control final, notas, documentación y acompañamiento post-entrega cuando corresponde.", "Chiudiamo il progetto con controllo finale, note, documentazione e accompagnamento post-consegna quando previsto.", "We close the project with final checks, notes, documentation and post-handover support where appropriate."),
  },
];

const TheEivitechWay = () => (
  <>
    <SEO
      title={tr("The Eivitech Way | Un referente para tu reforma en Ibiza", "The Eivitech Way | Un referente per la tua ristrutturazione a Ibiza", "The Eivitech Way | One partner for your renovation in Ibiza")}
      description={tr("El método Eivitech para reformas en Ibiza: descubrimiento, diseño, planificación, obra, detalles y entrega.", "Il metodo Eivitech per ristrutturazioni a Ibiza: scoperta, design, pianificazione, cantiere, dettagli e consegna.", "The Eivitech method for renovations in Ibiza: discovery, design, planning, construction, refinement and delivery.")}
      path="/the-eivitech-way"
    />

    <section className="container-x pt-16 pb-12 md:pt-24">
      <div className="eyebrow">The Eivitech Way</div>
      <h1 className="display-xl mt-4 max-w-4xl">{tr("Un referente. Cada detalle.", "Un partner. Ogni dettaglio.", "One partner. Every detail.")}</h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr(
          "Una reforma en Ibiza no debería obligarte a coordinar diez profesionales distintos. Eivitech acompaña cada fase con un método claro y un único referente.",
          "Una ristrutturazione a Ibiza non dovrebbe obbligarti a coordinare dieci professionisti diversi. Eivitech accompagna ogni fase con un metodo chiaro e un unico referente.",
          "A renovation in Ibiza should not force you to coordinate ten different professionals. Eivitech guides every phase with a clear method and one trusted partner."
        )}
      </p>
    </section>

    <section className="container-x pb-20">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-sm border border-border bg-card p-6">
            <div className="font-display text-primary">{String(index + 1).padStart(2, "0")}</div>
            <h2 className="mt-4 font-display text-3xl">{step.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section-tight bg-accent/40">
      <div className="container-x max-w-4xl">
        <div className="eyebrow">{tr("Responsabilidad", "Responsabilità", "Responsibility")}</div>
        <h2 className="display-md mt-3">
          {tr("Menos incertidumbre. Más control.", "Meno incertezza. Più controllo.", "Less uncertainty. More control.")}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {tr(
            "El objetivo del método no es complicar el proyecto, sino hacerlo más claro: saber qué se está decidiendo, qué falta, qué viene después y quién se encarga de cada parte.",
            "L'obiettivo del metodo non è complicare il progetto, ma renderlo più chiaro: sapere cosa si sta decidendo, cosa manca, cosa viene dopo e chi si occupa di ogni parte.",
            "The purpose of the method is not to complicate the project, but to make it clearer: what is being decided, what is missing, what comes next and who is responsible for each part."
          )}
        </p>
      </div>
    </section>

    <CTASection title={tr("Hablemos de tu propiedad.", "Parliamo della tua proprietà.", "Let's talk about your property.")} />
  </>
);

export default TheEivitechWay;
