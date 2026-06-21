import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { ProjectCard } from "@/components/ProjectCard";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { SERVICES } from "@/data/services";
import { PROJECTS } from "@/data/projects";
import { GENERAL_FAQS } from "@/data/faqs";
import { orgJsonLd, faqJsonLd } from "@/lib/seo";
import { whatsappUrl, SITE } from "@/data/site";
import { track } from "@/lib/tracking";
import { ArrowRight, Phone, MessageCircle, Home, Building2, Store, Wrench, Lightbulb, TreePine } from "lucide-react";
import heroImg from "@/assets/hero-home.jpg";
import materiales from "@/assets/materiales.jpg";

const homeServices = [
  { slug: "reformas-integrales", icon: Home },
  { slug: "electricidad-iluminacion", icon: Lightbulb },
  { slug: "albanileria-acabados", icon: Wrench },
  { slug: "fontaneria", icon: Wrench },
  { slug: "carpinteria", icon: Building2 },
  { slug: "terrazas-exteriores", icon: TreePine },
];

const audienceItems = [
  { icon: Home, label: "Propietarios de viviendas" },
  { icon: Building2, label: "Villas y apartamentos" },
  { icon: Store, label: "Locales comerciales" },
  { icon: Building2, label: "Inversores inmobiliarios" },
];

const Index = () => {
  return (
    <>
      <SEO
        title="Eivitech Ibiza | Reformas e instalaciones en Ibiza"
        description="Reformas, instalaciones y acabados en Ibiza para viviendas, apartamentos, villas y locales comerciales. Solicita una valoración para tu proyecto."
        path="/"
        jsonLd={[orgJsonLd(), faqJsonLd(GENERAL_FAQS)]}
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Interior reformado en Ibiza con microcemento y madera" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>

        <div className="container-x pt-24 md:pt-32 pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="eyebrow">{SITE.tagline}</div>
            <h1 className="display-xl mt-5 max-w-5xl">
              Reformas e instalaciones en Ibiza para propiedades que necesitan{" "}
              <span className="italic text-primary">gestión, calidad y detalle</span>
            </h1>
            <p className="body-lg mt-6 max-w-2xl">
              Coordinamos reformas, instalaciones y acabados para viviendas, apartamentos, villas y locales
              comerciales, acompañando al cliente desde la idea inicial hasta el último detalle.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition shadow-soft"
              >
                Solicitar valoración <ArrowRight size={16} />
              </Link>
              <Link
                to="/proyectos"
                className="inline-flex items-center rounded-sm border border-foreground/20 bg-background/60 px-6 py-4 text-sm font-medium backdrop-blur hover:bg-background"
              >
                Ver proyectos
              </Link>
              <a
                href={whatsappUrl()}
                onClick={() => track("whatsapp_click", { source: "hero" })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-4 text-sm font-medium text-white"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={SITE.phoneHref}
                onClick={() => track("phone_click", { source: "hero" })}
                className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground px-2 py-4"
              >
                <Phone size={14} /> {SITE.phone}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="section bg-accent/40">
        <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="eyebrow">El contexto</div>
            <h2 className="display-lg mt-4">
              Reformar en Ibiza no debería ser una <em className="italic text-primary not-italic font-display">preocupación constante</em>
            </h2>
          </div>
          <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
            <p>
              Cada reforma implica tomar decisiones sobre materiales, profesionales, plazos y detalles. Cuando
              no hay un referente que coordine, el proyecto se vuelve agotador y se aleja del resultado imaginado.
            </p>
            <p>
              En Ibiza, además, entran en juego logística, disponibilidad de proveedores y particularidades
              del clima y del entorno. Por eso tiene sentido contar con alguien que se ocupe de gestionarlo todo.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUZIONE */}
      <section className="section">
        <div className="container-x grid gap-14 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="aspect-[4/5] overflow-hidden rounded-sm">
            <img src={materiales} alt="Materiales naturales: madera, piedra y microcemento" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="eyebrow">La propuesta</div>
            <h2 className="display-lg mt-4">
              Un referente para coordinar la reforma <em className="italic">de principio a fin</em>
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>Escuchamos lo que necesitas, definimos juntos la intervención y nos hacemos cargo del proyecto.</p>
              <p>
                Coordinamos profesionales, materiales, instalaciones y acabados, para que el resultado sea coherente
                y se cuiden los detalles que marcan la diferencia.
              </p>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Un único interlocutor",
                "Coordinación de oficios",
                "Materiales seleccionados",
                "Seguimiento hasta el último detalle",
              ].map((it) => (
                <li key={it} className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SERVIZI */}
      <section className="section bg-accent/40">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div className="eyebrow">Servicios</div>
              <h2 className="display-lg mt-4 max-w-2xl">Lo que coordinamos para tu propiedad</h2>
            </div>
            <Link to="/servicios" className="text-sm text-primary hover:underline">Ver todos los servicios →</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homeServices.map(({ slug }) => {
              const s = SERVICES.find((x) => x.slug === slug)!;
              return <ServiceCard key={slug} service={s} />;
            })}
          </div>
        </div>
      </section>

      {/* PROYECTOS */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div className="eyebrow">Proyectos destacados</div>
              <h2 className="display-lg mt-4 max-w-2xl">Casos reales en Ibiza</h2>
            </div>
            <Link to="/proyectos" className="text-sm text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {PROJECTS.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i === 0} />)}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="section bg-ink text-cream">
        <div className="container-x">
          <div className="grid gap-10 md:grid-cols-2 md:items-end mb-12">
            <div>
              <div className="eyebrow text-cream/70">Cómo trabajamos</div>
              <h2 className="display-lg mt-4">Un proceso pensado para mantener el control</h2>
            </div>
            <p className="text-cream/80 text-lg leading-relaxed">
              Desde la primera valoración hasta los detalles finales, mantenemos la comunicación abierta y un
              referente claro para cada decisión.
            </p>
          </div>
          <div className="[&_li]:!bg-ink [&_li]:!text-cream [&_ol]:!bg-cream/10 [&_li_div.text-primary]:!text-primary [&_li_p]:!text-cream/70">
            <ProcessSteps
              steps={[
                { title: "Primera valoración", description: "Entendemos qué necesitas y la propiedad." },
                { title: "Visita o revisión", description: "Vemos el estado actual y el potencial." },
                { title: "Presupuesto", description: "Definimos alcance y propuesta." },
                { title: "Planificación", description: "Organizamos oficios, materiales y tiempos." },
                { title: "Ejecución", description: "Coordinamos el trabajo y el seguimiento." },
                { title: "Entrega", description: "Cuidamos cada detalle final." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="section">
        <div className="container-x">
          <div className="eyebrow">Trabajamos con</div>
          <h2 className="display-lg mt-4 mb-12 max-w-3xl">Propietarios, inversores y clientes que buscan un referente local</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audienceItems.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-sm border border-border bg-card p-6">
                <Icon size={22} className="text-primary" />
                <div className="mt-4 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-accent/40">
        <div className="container-x">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow">Preguntas frecuentes</div>
              <h2 className="display-lg mt-4">Lo que más nos preguntan</h2>
            </div>
            <FAQAccordion items={GENERAL_FAQS} />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default Index;
