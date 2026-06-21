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
import heroImg from "@/assets/hero-home.jpg";

const LandingGoogle = () => {
  return (
    <>
      <SEO
        title="Reformas en Ibiza | Empresa de reformas y renovaciones"
        description="Empresa de reformas en Ibiza para villas, apartamentos y locales. Coordinación, calidad y atención al detalle. Solicita valoración."
        path="/reformas-ibiza"
        trackAs="google_landing_view"
        jsonLd={[serviceJsonLd("Reformas en Ibiza", "Reformas integrales en Ibiza"), faqJsonLd(GENERAL_FAQS.slice(0, 6))]}
      />

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Reforma de villa en Ibiza" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="container-x pt-16 md:pt-24 pb-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <div className="eyebrow">Reformas · Ibiza</div>
              <h1 className="display-xl mt-4">
                Reformas en Ibiza con gestión, calidad y atención al detalle
              </h1>
              <p className="body-lg mt-6 max-w-xl">
                Coordinamos reformas integrales y parciales para viviendas, villas, apartamentos y locales
                comerciales en Ibiza. Un único interlocutor para todo el proyecto.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 max-w-xl">
                {["Coordinación de oficios", "Materiales seleccionados", "Seguimiento de obra", "Acabados cuidados"].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary" /> {x}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#form" className="inline-flex items-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Solicitar valoración
                </a>
                <a
                  href={whatsappUrl("Hola, vengo de Google y me gustaría una valoración para mi reforma en Ibiza.")}
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
              <div className="eyebrow">Solicitar valoración</div>
              <h2 className="display-md mt-2 mb-6">Cuéntanos tu proyecto</h2>
              <LeadQualificationForm source="landing_google" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 md:grid-cols-2">
          <div>
            <div className="eyebrow">Problemas típicos</div>
            <h2 className="display-md mt-3">Reformar en Ibiza sin perder el control</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              {[
                "Coordinar varios oficios sin un referente claro",
                "Materiales que no llegan a tiempo",
                "Presupuestos abiertos sin alcance definido",
                "Decisiones que se acumulan sin guía",
              ].map((x) => <li key={x} className="border-b border-border pb-3">{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="eyebrow">Nuestra forma de trabajar</div>
            <h2 className="display-md mt-3">Un proceso claro</h2>
            <div className="mt-6">
              <ProcessSteps
                steps={[
                  { title: "Valoración" },
                  { title: "Visita" },
                  { title: "Presupuesto" },
                  { title: "Planificación" },
                  { title: "Ejecución" },
                  { title: "Entrega" },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-accent/40">
        <div className="container-x">
          <div className="eyebrow">Proyectos</div>
          <h2 className="display-lg mt-4 mb-10">Casos reales en Ibiza</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {PROJECTS.slice(0, 4).map((p) => <ProjectCard key={p.slug} project={p} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="eyebrow">FAQ</div>
          <h2 className="display-lg mt-3 mb-10">Preguntas frecuentes</h2>
          <FAQAccordion items={GENERAL_FAQS} />
        </div>
      </section>

      <section className="section bg-ink text-cream">
        <div className="container-x max-w-3xl text-center">
          <h2 className="display-lg">¿Listo para empezar?</h2>
          <p className="mt-5 text-cream/80 text-lg">Cuéntanos tu proyecto y prepararemos una primera valoración.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contacto" className="inline-flex items-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground">
              Solicitar valoración
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
