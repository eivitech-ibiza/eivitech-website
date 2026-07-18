import { Link } from "react-router-dom";
import type { Service } from "@/data/services";
import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { GENERAL_FAQS } from "@/data/faqs";
import { PROJECTS } from "@/data/projects";
import { SERVICES } from "@/data/services";
import { serviceJsonLd, faqJsonLd } from "@/lib/seo";
import { tr } from "@/lib/i18n";
import { Check } from "lucide-react";
const heroImg = `${import.meta.env.BASE_URL}media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-warm-contemporary-apartment-cover.webp`;

export function ServicePageTemplate({ service }: { service: Service }) {
  const related = (service.relatedProjects || [])
    .map((s) => PROJECTS.find((p) => p.slug === s))
    .filter(Boolean) as typeof PROJECTS;
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);
  const path = `/servicios/${service.slug}`;

  return (
    <>
      <SEO
        title={service.metaTitle}
        description={service.metaDescription}
        path={path}
        trackAs="service_page_view"
        trackPayload={{ service: service.slug }}
        jsonLd={[serviceJsonLd(service.title, service.metaDescription), faqJsonLd(GENERAL_FAQS.slice(0, 5))]}
      />

      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div className="container-x pt-20 md:pt-28 pb-16 md:pb-20">
          <div className="eyebrow">{tr("Servicio", "Servizio", "Service")}</div>
          <h1 className="display-xl mt-4 max-w-4xl">{service.hero}</h1>
          <p className="body-lg mt-6 max-w-2xl">{service.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contacto" className="inline-flex items-center rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment")}
            </Link>
            <Link to="/transformations" className="inline-flex items-center rounded-sm border border-foreground/20 px-6 py-3.5 text-sm font-medium hover:bg-foreground/5">
              {tr("Ver proyectos", "Vedi progetti", "View projects")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x grid gap-12 md:grid-cols-2">
          <div>
            <div className="eyebrow">{tr("Qué incluye", "Cosa include", "What is included")}</div>
            <h2 className="display-md mt-3">{tr("Alcance del servicio", "Ambito del servizio", "Service scope")}</h2>
            <ul className="mt-6 space-y-3">
              {service.includes.map((it) => (
                <li key={it} className="flex items-start gap-3 text-base">
                  <Check size={18} className="mt-1 shrink-0 text-primary" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow">{tr("Cuándo solicitarlo", "Quando richiederlo", "When to request it")}</div>
            <h2 className="display-md mt-3">{tr("Casos típicos", "Casi tipici", "Typical cases")}</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              {service.whenToAsk.map((it) => <li key={it} className="border-b border-border pb-3">{it}</li>)}
            </ul>
            {service.examples.length > 0 && (
              <div className="mt-8">
                <div className="eyebrow">{tr("Ejemplos de intervenciones", "Esempi di interventi", "Examples of work")}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.examples.map((e) => (
                    <span key={e} className="rounded-sm bg-accent px-3 py-1.5 text-xs">{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-tight bg-accent/40">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <div className="eyebrow">{tr("Proyectos relacionados", "Progetti correlati", "Related projects")}</div>
                <h2 className="display-md mt-3">{tr("Casos donde aplicamos este servicio", "Casi in cui applichiamo questo servizio", "Cases where we apply this service")}</h2>
              </div>
              <Link to="/transformations" className="hidden md:inline-flex text-sm text-primary hover:underline">{tr("Ver todos", "Vedi tutti", "View all")}</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((p) => <ProjectCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section-tight">
        <div className="container-x">
          <div className="eyebrow">{tr("Preguntas frecuentes", "Domande frequenti", "Frequently asked questions")}</div>
          <h2 className="display-md mt-3 mb-10">{tr("Antes de solicitar valoración", "Prima di richiedere una valutazione", "Before requesting an assessment")}</h2>
          <FAQAccordion items={GENERAL_FAQS.slice(0, 5)} />
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x">
          <div className="eyebrow">{tr("Otros servicios", "Altri servizi", "Other services")}</div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <Link key={s.slug} to={`/servicios/${s.slug}`} className="rounded-sm border border-border p-5 hover:border-primary transition">
                <div className="font-display text-lg">{s.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{tr("Ver servicio", "Vedi servizio", "View service")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
