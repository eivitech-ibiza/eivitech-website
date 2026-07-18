import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { GENERAL_FAQS } from "@/data/faqs";
import { PROJECTS } from "@/data/projects";
import { orgJsonLd, faqJsonLd } from "@/lib/seo";
import { tr } from "@/lib/i18n";
import { ArrowRight, Check } from "lucide-react";

const heroImg = `${import.meta.env.BASE_URL}media/hero/eivitech-ibiza-ristrutturazione-villa-mediterranea-top-banner.webp`;
const materialsAtmosphereImg = `${import.meta.env.BASE_URL}media/home/eivitech-ibiza-materiali-atmosfera-lavabo-pietra.webp`;

const HOME_PROJECT_SLUGS = [
  "investment-oriented-villa-makeover",
  "luxury-mediterranean-villa-renovation",
  "warm-contemporary-apartment-transformation",
  "authentic-ibiza-finca-restoration",
] as const;

const HOME_PROJECTS = HOME_PROJECT_SLUGS.flatMap((slug) => {
  const project = PROJECTS.find((item) => item.slug === slug);
  return project ? [project] : [];
});

const pillars = [
  {
    title: tr("Atmósfera a través de la luz", "Atmosfera attraverso la luce", "Atmosphere through light"),
    text: tr("Luz cálida e indirecta para que cada espacio se sienta relajado, acogedor y bien pensado.", "Luce calda e indiretta perché ogni spazio sia rilassante, accogliente e ben pensato.", "Warm, indirect lighting designed to make every space feel calm, welcoming and considered."),
  },
  {
    title: tr("Materiales naturales", "Materiali naturali", "Natural materials"),
    text: tr("Madera, travertino, microcemento, piedra y cal natural elegidos por cómo envejecen y cómo hacen sentir la casa.", "Legno, travertino, microcemento, pietra e calce naturale scelti per come invecchiano e per come fanno sentire la casa.", "Wood, travertine, microcement, stone and natural lime selected for how they age and how they make a home feel."),
  },
  {
    title: tr("Espacios a medida", "Spazi su misura", "Tailored spaces"),
    text: tr("Distribuciones, cocinas, armarios y detalles diseñados alrededor de la forma real de vivir del cliente.", "Distribuzioni, cucine, armadi e dettagli progettati attorno al reale modo di vivere del cliente.", "Layouts, kitchens, wardrobes and details shaped around the client’s real way of living."),
  },
  {
    title: tr("Viviendas más sanas", "Benessere abitativo", "Healthy living"),
    text: tr("Soluciones como mortero de cal, drenajes y muros respirantes para viviendas más secas, sanas y confortables.", "Soluzioni come malta di calce, drenaggi e muri traspiranti per case più asciutte, sane e confortevoli.", "Solutions such as lime mortar, drainage and breathable walls for drier, healthier and more comfortable homes."),
  },
  {
    title: tr("Un único referente", "Un referente unico", "One trusted partner"),
    text: tr("Un solo equipo para coordinar obra, instalaciones, acabados, proveedores y detalles hasta la entrega.", "Un solo team per coordinare lavori, impianti, finiture, fornitori e dettagli fino alla consegna.", "One team coordinating construction, installations, finishes, suppliers and details through to handover."),
  },
  {
    title: tr("Artesanía premium", "Artigianalità premium", "Premium craftsmanship"),
    text: tr("Carpintería, cocinas Made in Italy y acabados a medida donde el detalle cambia la percepción de la propiedad.", "Falegnameria, cucine Made in Italy e finiture su misura dove il dettaglio cambia la percezione della proprietà.", "Carpentry, Made in Italy kitchens and bespoke finishes where detail changes the perception of the property."),
  },
];

const process = [
  tr("Descubrir", "Scoprire", "Discover"),
  tr("Diseñar", "Progettare", "Design"),
  tr("Planificar", "Pianificare", "Plan"),
  tr("Construir", "Costruire", "Build"),
  tr("Refinar", "Rifinire", "Refine"),
  tr("Entregar", "Consegnare", "Deliver"),
];

const Index = () => (
  <>
    <SEO
      title={tr("Eivitech Ibiza | Transformaciones y reformas de propiedades", "Eivitech Ibiza | Trasformazioni e ristrutturazioni immobiliari", "Eivitech Ibiza | Property transformations and renovations")}
      description={tr("Reformas completas, interiores a medida y transformaciones exteriores en Ibiza, con materiales naturales, luz cálida y gestión completa del proyecto.", "Ristrutturazioni complete, interni su misura e trasformazioni esterne a Ibiza, con materiali naturali, luce calda e gestione completa del progetto.", "Complete renovations, bespoke interiors and outdoor transformations in Ibiza with natural materials, warm lighting and complete project management.")}
      path="/"
      trackAs="home_view"
      jsonLd={[orgJsonLd(), faqJsonLd(GENERAL_FAQS.slice(0, 4))]}
    />

    <section className="relative isolate min-h-[86vh] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt={tr("Transformación de propiedad Eivitech en Ibiza", "Trasformazione immobiliare Eivitech a Ibiza", "Eivitech property transformation in Ibiza")}
          width={1668}
          height={725}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>
      <div className="container-x flex min-h-[86vh] items-end pb-16 pt-28 md:pb-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl text-white">
          <div className="text-xs uppercase tracking-[0.28em] text-white/75">Eivitech Ibiza</div>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] md:text-7xl">
            {tr("Creamos espacios excepcionales para vivir en Ibiza", "Creiamo spazi abitativi eccezionali a Ibiza", "Crafting exceptional living spaces in Ibiza")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
            {tr("Reformas completas, interiores a medida y transformaciones exteriores diseñadas alrededor de tu forma de vivir.", "Ristrutturazioni complete, interni su misura e trasformazioni esterne progettate attorno al tuo modo di vivere.", "Complete renovations, bespoke interiors and outdoor transformations designed around the way you live.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/transformations" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {tr("Ver transformaciones", "Vedi trasformazioni", "View transformations")} <ArrowRight size={16} />
            </Link>
            <Link to="/contacto" className="inline-flex items-center rounded-sm border border-white/50 px-6 py-4 text-sm font-medium text-white hover:bg-white/10">
              {tr("Hablemos de tu propiedad", "Parliamo della tua proprietà", "Let’s talk about your property")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="section">
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.6fr] lg:items-start">
        <div>
          <div className="eyebrow">{tr("Filosofía", "Filosofia", "Philosophy")}</div>
          <h2 className="display-lg mt-4">{tr("Casas diseñadas alrededor de las personas, no solo de los materiales.", "Case progettate attorno alle persone, non solo ai materiali.", "Homes designed around people, not just materials.")}</h2>
        </div>
        <div className="space-y-8">
          <p className="text-2xl leading-relaxed text-foreground/85">
            {tr("Cada reforma empieza entendiendo cómo quieres vivir, no solo qué quieres construir.", "Ogni ristrutturazione inizia capendo come vuoi vivere, non semplicemente cosa vuoi costruire.", "Every renovation begins by understanding how you want to live, not simply what you want to build.")}
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {tr("Eivitech transforma villas, apartamentos, fincas y espacios exteriores con materiales naturales, artesanía a medida y gestión completa del proyecto. El objetivo no es solo reformar una propiedad, sino crear una casa que se sienta correcta.", "Eivitech trasforma ville, appartamenti, fincas e spazi esterni con materiali naturali, artigianalità su misura e gestione completa del progetto. L'obiettivo non è solo ristrutturare una proprietà, ma creare una casa che si senta giusta.", "Eivitech transforms villas, apartments, fincas and outdoor spaces through natural materials, tailored craftsmanship and complete project management. The goal is not only to renovate a property, but to create a home that feels right.")}
          </p>
        </div>
      </div>
    </section>

    <section className="section-tight bg-accent/40">
      <div className="container-x">
        <div className="eyebrow">{tr("Por qué los propietarios eligen Eivitech", "Perché i proprietari scelgono Eivitech", "Why homeowners choose Eivitech")}</div>
        <h2 className="display-md mt-3 max-w-3xl">{tr("Una reforma debe mejorar la forma en que las personas viven su casa.", "Una ristrutturazione deve migliorare il modo in cui le persone vivono la propria casa.", "A renovation should improve the way people experience their home.")}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item) => (
            <div key={item.title} className="rounded-sm border border-border bg-background p-6">
              <Check size={18} className="text-primary" />
              <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">{tr("Transformaciones seleccionadas", "Trasformazioni selezionate", "Selected transformations")}</div>
            <h2 className="display-lg mt-3">{tr("Proyectos reales, problemas reales, soluciones reales.", "Progetti reali, problemi reali, soluzioni reali.", "Real projects, real problems, real solutions.")}</h2>
          </div>
          <Link to="/transformations" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            {tr("Ver todas las transformaciones", "Vedi tutte le trasformazioni", "View all transformations")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {HOME_PROJECTS.map((project, index) => (
            <ProjectCard key={project.slug} project={project} priority={index === 0} />
          ))}
        </div>
      </div>
    </section>

    <section className="section-tight bg-accent/40">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="eyebrow">The Eivitech Way</div>
          <h2 className="display-md mt-3">{tr("Un referente. Cada detalle.", "Un partner. Ogni dettaglio.", "One partner. Every detail.")}</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            {tr("Desde la primera conversación hasta el último detalle, Eivitech coordina las personas, materiales, decisiones y acabados que dan forma al proyecto.", "Dalla prima conversazione all'ultimo dettaglio, Eivitech coordina persone, materiali, decisioni e finiture che danno forma al progetto.", "From the first conversation to the final detail, Eivitech coordinates the people, materials, decisions and finishes that shape the project.")}
          </p>
          <Link to="/the-eivitech-way" className="mt-7 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            {tr("Descubre el proceso", "Scopri il processo", "Discover the process")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {process.map((item, index) => (
            <div key={item} className="rounded-sm border border-border bg-background p-5">
              <div className="font-display text-primary">{String(index + 1).padStart(2, "0")}</div>
              <div className="mt-3 font-display text-2xl">{item}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-sm bg-muted">
          <img
            src={materialsAtmosphereImg}
            alt={tr("Lavabo de piedra natural y grifería mural en un baño Eivitech en Ibiza", "Lavabo in pietra naturale e rubinetteria a parete in un bagno Eivitech a Ibiza", "Natural stone basin and wall-mounted tapware in an Eivitech bathroom in Ibiza")}
            width={1600}
            height={1200}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <div className="eyebrow">{tr("Materiales y atmósfera", "Materiali e atmosfera", "Materials & atmosphere")}</div>
          <h2 className="display-md mt-3">{tr("Materiales que cambian cómo se siente una casa.", "Materiali che modellano il modo in cui una casa si sente.", "Materials that shape the way a home feels.")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {tr("Travertino, madera, microcemento, piedra, cal natural y luz cálida no son solo elecciones estéticas. Definen el confort, la durabilidad y la atmósfera de la vida cotidiana.", "Travertino, legno, microcemento, pietra, calce naturale e luce calda non sono solo scelte estetiche. Definiscono comfort, durabilità e atmosfera della vita quotidiana.", "Travertine, wood, microcement, stone, natural lime and warm lighting are not just aesthetic choices. They define comfort, durability and the atmosphere of everyday living.")}
          </p>
          <Link to="/materials-atmosphere" className="mt-7 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            {tr("Explora materiales y atmósfera", "Esplora materiali e atmosfera", "Explore materials and atmosphere")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>

    <section className="section bg-foreground text-background">
      <div className="container-x max-w-4xl text-center">
        <div className="eyebrow text-background/70">{tr("Empezar", "Iniziare", "Start")}</div>
        <h2 className="display-lg mt-4">{tr("Hablemos de tu propiedad.", "Parliamo della tua proprietà.", "Let’s talk about your property.")}</h2>
        <p className="mt-5 text-background/75">
          {tr("Cuéntanos qué quieres transformar. Te ayudaremos a entender el siguiente paso.", "Raccontaci cosa vuoi trasformare. Ti aiuteremo a capire il prossimo passo.", "Tell us what you want to transform. We will help you understand the next step.")}
        </p>
        <Link to="/contacto" className="mt-8 inline-flex rounded-sm bg-background px-6 py-4 text-sm font-medium text-foreground hover:bg-background/90">
          {tr("Reservar una consulta", "Prenota una consulenza", "Book a consultation")}
        </Link>
      </div>
    </section>

    <section className="section-tight">
      <div className="container-x max-w-3xl">
        <div className="eyebrow">FAQ</div>
        <h2 className="display-md mt-3 mb-8">{tr("Antes de empezar una reforma en Ibiza", "Prima di iniziare una ristrutturazione a Ibiza", "Before starting a renovation in Ibiza")}</h2>
        <FAQAccordion items={GENERAL_FAQS.slice(0, 5)} />
      </div>
    </section>
  </>
);

export default Index;
