import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { ProjectCard } from "@/components/ProjectCard";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PROJECTS } from "@/data/projects";
import { GENERAL_FAQS } from "@/data/faqs";
import { whatsappUrl, SITE } from "@/data/site";
import { track } from "@/lib/tracking";
import { Phone, MessageCircle, Check } from "lucide-react";
import { serviceJsonLd, faqJsonLd } from "@/lib/seo";
import { tr } from "@/lib/i18n";
const heroImg = `${import.meta.env.BASE_URL}media/projects/casa-vadella/casa-vadella-ibiza-investment-villa-makeover-cover.webp`;

const LandingGoogle = () => {
  const benefits = [
    tr("Coordinación de oficios", "Coordinamento dei professionisti", "Trade coordination"),
    tr("Materiales seleccionados", "Materiali selezionati", "Selected materials"),
    tr("Seguimiento de obra", "Monitoraggio del cantiere", "Worksite follow-up"),
    tr("Acabados cuidados", "Finiture curate", "Careful finishes"),
  ];

  const problems = [
    tr("Coordinar varios oficios sin un referente claro", "Coordinare più professionisti senza un referente chiaro", "Coordinating several trades without a clear point of contact"),
    tr("Materiales que no llegan a tiempo", "Materiali che non arrivano in tempo", "Materials that do not arrive on time"),
    tr("Presupuestos abiertos sin alcance definido", "Preventivi aperti senza ambito definito", "Open budgets without defined scope"),
    tr("Decisiones que se acumulan sin guía", "Decisioni che si accumulano senza guida", "Decisions piling up without guidance"),
  ];

  return (
    <>
      <SEO
        title={tr("Reformas en Ibiza | Empresa de reformas y renovaciones", "Ristrutturazioni a Ibiza | Impresa di ristrutturazioni e rinnovi", "Renovations in Ibiza | Renovation company")}
        description={tr("Empresa de reformas en Ibiza para villas, apartamentos y locales. Coordinación, calidad y atención al detalle. Solicita valoración.", "Impresa di ristrutturazioni a Ibiza per ville, appartamenti e locali. Coordinamento, qualità e attenzione al dettaglio. Richiedi una valutazione.", "Renovation company in Ibiza for villas, apartments and commercial spaces. Coordination, quality and attention to detail. Request an assessment.")}
        path="/reformas-ibiza"
        trackAs="google_landing_view"
        jsonLd={[serviceJsonLd(tr("Reformas en Ibiza", "Ristrutturazioni a Ibiza", "Renovations in Ibiza"), tr("Reformas integrales en Ibiza", "Ristrutturazioni complete a Ibiza", "Full renovations in Ibiza")), faqJsonLd(GENERAL_FAQS.slice(0, 6))]}
      />

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt={tr("Reforma de villa en Ibiza", "Ristrutturazione di villa a Ibiza", "Villa renovation in Ibiza")} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="container-x pt-16 md:pt-24 pb-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <div className="eyebrow">{tr("Reformas · Ibiza", "Ristrutturazioni · Ibiza", "Renovations · Ibiza")}</div>
              <h1 className="display-xl mt-4">
                {tr("Reformas en Ibiza con gestión, calidad y atención al detalle", "Ristrutturazioni a Ibiza con gestione, qualità e attenzione al dettaglio", "Renovations in Ibiza with management, quality and attention to detail")}
              </h1>
              <p className="body-lg mt-6 max-w-xl">
                {tr("Coordinamos reformas integrales y parciales para viviendas, villas, apartamentos y locales comerciales en Ibiza. Un único interlocutor para todo el proyecto.", "Coordiniamo ristrutturazioni complete e parziali per case, ville, appartamenti e locali commerciali a Ibiza. Un unico interlocutore per tutto il progetto.", "We coordinate full and partial renovations for homes, villas, apartments and commercial spaces in Ibiza. One single point of contact for the whole project.")}
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 max-w-xl">
                {benefits.map((x) => (
                  <li key={x} className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary" /> {x}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#form" className="inline-flex items-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment")}
                </a>
                <a
                  href={whatsappUrl(tr("Hola, vengo de Google y me gustaría una valoración para mi reforma en Ibiza.", "Ciao, arrivo da Google e vorrei una valutazione per la mia ristrutturazione a Ibiza.", "Hello, I come from Google and would like an assessment for my renovation in Ibiza."))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { source: "landing_google" })}
                  className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-4 text-sm font-medium text-white"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a href={SITE.phoneHref} onClick={() => track("phone_click", { source: "landing_google" })} className="inline-flex items-center gap-2 px-2 py-4 text-sm">
                  <Phone size={14} /> {SITE.phone}
                </a>
              </div>
            </div>
            <div id="form" className="rounded-sm border border-border bg-card p-6 md:p-8 shadow-card">
              <div className="eyebrow">{tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment")}</div>
              <h2 className="display-md mt-2 mb-6">{tr("Cuéntanos tu proyecto", "Raccontaci il tuo progetto", "Tell us about your project")}</h2>
              <LeadQualificationForm source="landing_google" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 md:grid-cols-2">
          <div>
            <div className="eyebrow">{tr("Problemas típicos", "Problemi tipici", "Typical problems")}</div>
            <h2 className="display-md mt-3">{tr("Reformar en Ibiza sin perder el control", "Ristrutturare a Ibiza senza perdere il controllo", "Renovating in Ibiza without losing control")}</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              {problems.map((x) => <li key={x} className="border-b border-border pb-3">{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="eyebrow">{tr("Nuestra forma de trabajar", "Il nostro modo di lavorare", "How we work")}</div>
            <h2 className="display-md mt-3">{tr("Un proceso claro", "Un processo chiaro", "A clear process")}</h2>
            <div className="mt-6">
              <ProcessSteps
                steps={[
                  { title: tr("Valoración", "Valutazione", "Assessment") },
                  { title: tr("Visita", "Visita", "Visit") },
                  { title: tr("Presupuesto", "Preventivo", "Proposal") },
                  { title: tr("Planificación", "Pianificazione", "Planning") },
                  { title: tr("Ejecución", "Esecuzione", "Execution") },
                  { title: tr("Entrega", "Consegna", "Handover") },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-accent/40">
        <div className="container-x">
          <div className="eyebrow">{tr("Proyectos", "Progetti", "Projects")}</div>
          <h2 className="display-lg mt-4 mb-10">{tr("Casos reales en Ibiza", "Casi reali a Ibiza", "Real cases in Ibiza")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {PROJECTS.slice(0, 4).map((p) => <ProjectCard key={p.slug} project={p} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="eyebrow">FAQ</div>
          <h2 className="display-lg mt-3 mb-10">{tr("Preguntas frecuentes", "Domande frequenti", "Frequently asked questions")}</h2>
          <FAQAccordion items={GENERAL_FAQS} />
        </div>
      </section>

      <section className="section bg-ink text-cream">
        <div className="container-x max-w-3xl text-center">
          <h2 className="display-lg">{tr("¿Listo para empezar?", "Pronto per iniziare?", "Ready to start?")}</h2>
          <p className="mt-5 text-cream/80 text-lg">{tr("Cuéntanos tu proyecto y prepararemos una primera valoración.", "Raccontaci il tuo progetto e prepareremo una prima valutazione.", "Tell us about your project and we will prepare an initial assessment.")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contacto" className="inline-flex items-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground">
              {tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment")}
            </Link>
            <a
              href={whatsappUrl()}
              onClick={() => track("whatsapp_click", { source: "landing_google_footer" })}
              className="inline-flex items-center gap-2 rounded-sm border border-cream/30 px-6 py-4 text-sm font-medium text-cream hover:bg-cream/10"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingGoogle;
