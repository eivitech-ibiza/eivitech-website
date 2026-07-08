import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { ProjectCard } from "@/components/ProjectCard";
import { ProcessSteps } from "@/components/ProcessSteps";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl } from "@/data/site";
import { track } from "@/lib/tracking";
import { MessageCircle } from "lucide-react";
import { tr } from "@/lib/i18n";

const materiales = `${import.meta.env.BASE_URL}media/projects/casa-vinya/cover.jpg`;
const apartamento = `${import.meta.env.BASE_URL}media/projects/casa-boas/cover.jpg`;

const LandingMeta = () => (
  <>
    <SEO
      title={tr("Proyectos de reformas en Ibiza | Eivitech", "Progetti di ristrutturazione a Ibiza | Eivitech", "Renovation projects in Ibiza | Eivitech")}
      description={tr("Mira casos reales de reformas en Ibiza: villas, apartamentos y locales. Materiales, acabados y estilo.", "Guarda casi reali di ristrutturazioni a Ibiza: ville, appartamenti e locali. Materiali, finiture e stile.", "View real renovation cases in Ibiza: villas, apartments and commercial spaces. Materials, finishes and style.")}
      path="/proyectos-reformas-ibiza"
      trackAs="meta_landing_view"
      ogImage={apartamento}
    />

    <section className="container-x pt-14 md:pt-20 pb-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <div className="eyebrow">{tr("Reformas en Ibiza · Proyectos", "Ristrutturazioni a Ibiza · Progetti", "Renovations in Ibiza · Projects")}</div>
          <h1 className="display-xl mt-4">{tr("Materiales naturales. Acabados cuidados. Ibiza.", "Materiali naturali. Finiture curate. Ibiza.", "Natural materials. Careful finishes. Ibiza.")}</h1>
          <p className="body-lg mt-5 max-w-xl">{tr("Echa un vistazo a algunos de nuestros proyectos: villas, apartamentos y locales reformados con atención al detalle.", "Dai un'occhiata ad alcuni dei nostri progetti: ville, appartamenti e locali ristrutturati con attenzione al dettaglio.", "Take a look at some of our projects: villas, apartments and commercial spaces renovated with attention to detail.")}</p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-sm"><img src={materiales} alt={tr("Materiales naturales", "Materiali naturali", "Natural materials")} className="h-full w-full object-cover" /></div>
      </div>
    </section>

    <section className="section-tight"><div className="container-x grid gap-6 md:grid-cols-2">{PROJECTS.map((p) => <ProjectCard key={p.slug} project={p} />)}</div></section>

    <section className="section bg-accent/40">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
        <div>
          <div className="eyebrow">{tr("Estilo y materiales", "Stile e materiali", "Style and materials")}</div>
          <h2 className="display-md mt-3">{tr("Microcemento, madera, piedra ibicenca", "Microcemento, legno, pietra ibizenca", "Microcement, wood, Ibizan stone")}</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">{tr("Trabajamos con materiales que envejecen bien y se integran con el carácter de la isla.", "Lavoriamo con materiali che invecchiano bene e si integrano con il carattere dell'isola.", "We work with materials that age well and blend with the character of the island.")}</p>
        </div>
        <ProcessSteps steps={[{ title: tr("Valoración", "Valutazione", "Assessment") }, { title: tr("Visita", "Visita", "Visit") }, { title: tr("Presupuesto", "Preventivo", "Proposal") }, { title: tr("Planificación", "Pianificazione", "Planning") }, { title: tr("Ejecución", "Esecuzione", "Execution") }, { title: tr("Entrega", "Consegna", "Handover") }]} />
      </div>
    </section>

    <section className="section">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="eyebrow">{tr("Empezar", "Iniziare", "Start")}</div>
          <h2 className="display-lg mt-3">{tr("¿Te imaginas algo parecido en tu propiedad?", "Ti immagini qualcosa di simile nella tua proprietà?", "Can you imagine something similar in your property?")}</h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">{tr("Cuéntanos tu proyecto y prepararemos una primera valoración. Sin compromiso.", "Raccontaci il tuo progetto e prepareremo una prima valutazione. Senza impegno.", "Tell us about your project and we will prepare an initial assessment. No obligation.")}</p>
          <a href={whatsappUrl(tr("Hola, vengo de Instagram. Me gustaría hablar de una posible reforma en Ibiza.", "Ciao, arrivo da Instagram. Vorrei parlare di una possibile ristrutturazione a Ibiza.", "Hi, I come from Instagram. I would like to talk about a possible renovation in Ibiza."))} onClick={() => track("whatsapp_click", { source: "landing_meta" })} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-3.5 text-sm font-medium text-white"><MessageCircle size={16} /> {tr("Hablar por WhatsApp", "Parla su WhatsApp", "Chat on WhatsApp")}</a>
        </div>
        <div className="rounded-sm border border-border bg-card p-6 md:p-8"><LeadQualificationForm source="landing_meta" /></div>
      </div>
    </section>
  </>
);

export default LandingMeta;
