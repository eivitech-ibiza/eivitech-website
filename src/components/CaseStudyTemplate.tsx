import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const mediaRoot = String.fromCharCode(104,116,116,112,115,58,47,47,101,105,118,105,116,101,99,104,46,99,111,109,47,119,112,45,99,111,110,116,101,110,116,47,117,112,108,111,97,100,115,47,50,48,50,49,47,48,56,47);
const mediaUrl = (name: string) => `${mediaRoot}${name}`;

type GalleryItem = { src: string; alt: string; portrait?: boolean };

function getProjectMedia(project: Project) {
  if (project.slug === "urbanizacion-valverde") {
    return {
      hero: mediaUrl("terraza-casita-valverde-4-1024x576.jpg"),
      gallery: [
        { src: mediaUrl("terraza-casita-valverde-2-1024x576.jpg"), alt: tr("Vista panorámica de la terraza Valverde", "Vista panoramica della terrazza Valverde", "Panoramic view of the Valverde terrace") },
        { src: mediaUrl("terraza-casita-valverde-1-576x1024.jpg"), alt: tr("Detalle del pavimento exterior en madera de Indonesia", "Dettaglio della pavimentazione esterna in legno indonesiano", "Detail of the Indonesian wood decking"), portrait: true },
        { src: mediaUrl("terraza-casita-valverde-3-1024x576.jpg"), alt: tr("Zona exterior con cama de madera y vistas al entorno rural", "Zona esterna con letto in legno e vista sull'ambiente rurale", "Outdoor area with wooden daybed and rural views") },
        { src: mediaUrl("terraza-casita-valverde-4-1024x576.jpg"), alt: tr("Muro de piedra ibicenca y tarima exterior de madera", "Muro in pietra ibizenca e pavimentazione esterna in legno", "Ibizan stone wall and outdoor wood decking") },
      ] as GalleryItem[],
    };
  }

  if (project.slug === "apartamento-marina-botafoch") {
    return {
      hero: mediaUrl("marina-botafoch-apartamento-04-1024x768.jpg"),
      gallery: [
        { src: mediaUrl("marina-botafoch-apartamento-04-1024x768.jpg"), alt: tr("Cocina a medida con isla central en Marina Botafoc", "Cucina su misura con isola centrale a Marina Botafoc", "Custom kitchen with central island in Marina Botafoc") },
        { src: mediaUrl("marina-botafoch-apartamento-10-1024x768.jpg"), alt: tr("Baño principal con microcemento e iluminación LED", "Bagno principale con microcemento e illuminazione LED", "Main bathroom with microcement and LED lighting") },
        { src: mediaUrl("marina-botafoch-apartamento-09-768x576.jpg"), alt: tr("Baño doble con espejos retroiluminados", "Bagno doppio con specchi retroilluminati", "Double bathroom with backlit mirrors") },
        { src: mediaUrl("marina-botafoch-apartamento-08-768x576.jpg"), alt: tr("Dormitorio con iluminación indirecta azul y magenta", "Camera con illuminazione indiretta blu e magenta", "Bedroom with blue and magenta indirect lighting") },
        { src: mediaUrl("marina-botafoch-apartamento-07-768x576.jpg"), alt: tr("Terraza cubierta con jacuzzi y zona de descanso", "Terrazza coperta con jacuzzi e zona relax", "Covered terrace with jacuzzi and lounge area") },
        { src: mediaUrl("marina-botafoch-apartamento-06-768x576.jpg"), alt: tr("Salón luminoso conectado con la terraza", "Soggiorno luminoso collegato alla terrazza", "Bright living area connected to the terrace") },
        { src: mediaUrl("marina-botafoch-apartamento-05-768x576.jpg"), alt: tr("Cocina lineal con madera, negro mate y luz natural", "Cucina lineare con legno, nero opaco e luce naturale", "Linear kitchen with wood, matte black and natural light") },
        { src: mediaUrl("marina-botafoch-apartamento-03-1024x768.jpg"), alt: tr("Vista amplia de la cocina y mobiliario integrado", "Vista ampia della cucina e degli arredi integrati", "Wide view of the kitchen and integrated furniture") },
        { src: mediaUrl("marina-botafoch-apartamento-02.jpg"), alt: tr("Detalle de isla y encimera negra", "Dettaglio dell'isola e del piano nero", "Detail of the island and black countertop") },
        { src: mediaUrl("marina-botafoch-apartamento-01.jpg"), alt: tr("Cocina terminada con líneas limpias y almacenaje a medida", "Cucina completata con linee pulite e contenimento su misura", "Finished kitchen with clean lines and custom storage") },
      ] as GalleryItem[],
    };
  }

  return { hero: project.image, gallery: [] as GalleryItem[] };
}

function getProjectPresentation(project: Project) {
  if (project.slug !== "apartamento-marina-botafoch") return project;

  return {
    ...project,
    name: "Apartamento Marina Botafoc",
    zone: "Marina Botafoc, Ibiza",
    short: tr("Reforma integral de 120 m² en Marina Botafoc con cocina a medida, microcemento, baños y luz indirecta.", "Ristrutturazione completa di 120 m² a Marina Botafoc con cucina su misura, microcemento, bagni e luce indiretta.", "Full 120 m² renovation in Marina Botafoc with custom kitchen, microcement, bathrooms and indirect lighting."),
    situation: tr("Apartamento de 120 m² con una distribución poco aprovechada y necesidad de crear una experiencia más amplia, luminosa y contemporánea.", "Appartamento di 120 m² con una distribuzione poco sfruttata e la necessità di creare un'esperienza più ampia, luminosa e contemporanea.", "A 120 m² apartment with an underused layout and the need to create a wider, brighter and more contemporary experience."),
    goal: tr("Rediseñar la vivienda como un espacio fluido: cocina integrada, baños con acabado continuo, iluminación ambiental y una relación más elegante entre interior y terraza.", "Ridisegnare l'abitazione come uno spazio fluido: cucina integrata, bagni con finitura continua, illuminazione ambientale e una relazione più elegante tra interno e terrazza.", "Redesign the home as a fluid space: integrated kitchen, bathrooms with continuous finishes, ambient lighting and a more elegant relationship between interior and terrace."),
    works: [
      tr("Redistribución completa de los espacios", "Redistribuzione completa degli spazi", "Complete space redistribution"),
      tr("Cocina a medida con madera, blanco y encimera negra", "Cucina su misura con legno, bianco e piano nero", "Custom kitchen with wood, white finishes and black countertop"),
      tr("Baños con microcemento gris y mamparas de vidrio", "Bagni con microcemento grigio e pareti in vetro", "Bathrooms with grey microcement and glass screens"),
      tr("Iluminación LED indirecta en dormitorio, baños y zonas de paso", "Illuminazione LED indiretta in camera, bagni e zone di passaggio", "Indirect LED lighting in bedroom, bathrooms and circulation areas"),
      tr("Integración visual entre salón, cocina y terraza", "Integrazione visiva tra soggiorno, cucina e terrazza", "Visual integration between living area, kitchen and terrace"),
    ],
    materials: [tr("Microcemento gris", "Microcemento grigio", "Grey microcement"), tr("Madera natural", "Legno naturale", "Natural wood"), tr("Encimera negra", "Piano nero", "Black countertop"), tr("Iluminación LED", "Illuminazione LED", "LED lighting"), "Bosch"],
    result: tr("Un apartamento contemporáneo, luminoso y muy visual, donde la luz indirecta, la madera y el microcemento crean una atmósfera de diseño sin perder funcionalidad diaria.", "Un appartamento contemporaneo, luminoso e molto scenografico, dove luce indiretta, legno e microcemento creano un'atmosfera di design senza perdere funzionalità quotidiana.", "A contemporary, bright and highly visual apartment where indirect light, wood and microcement create a design-led atmosphere without losing everyday functionality."),
    metaTitle: tr("Apartamento Marina Botafoc — Reforma integral | Eivitech Ibiza", "Appartamento Marina Botafoc — Ristrutturazione completa | Eivitech Ibiza", "Marina Botafoc Apartment — Full renovation | Eivitech Ibiza"),
    metaDescription: tr("Reforma integral de 120 m² en Marina Botafoc: cocina a medida, microcemento, baños, iluminación LED indirecta y terraza.", "Ristrutturazione completa di 120 m² a Marina Botafoc: cucina su misura, microcemento, bagni, illuminazione LED indiretta e terrazza.", "Full 120 m² renovation in Marina Botafoc: custom kitchen, microcement, bathrooms, indirect LED lighting and terrace."),
  };
}

export function CaseStudyTemplate({ project }: { project: Project }) {
  const presentation = getProjectPresentation(project);
  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const path = `/proyectos/${project.slug}`;
  const media = getProjectMedia(project);

  return (
    <>
      <SEO
        title={presentation.metaTitle}
        description={presentation.metaDescription}
        path={path}
        trackAs="project_view"
        trackPayload={{ project: project.slug }}
        ogImage={media.hero}
      />
      <article>
        <section className="container-x pt-12 md:pt-20">
          <Link to="/proyectos" className="text-sm text-muted-foreground hover:text-foreground">← Todos los proyectos</Link>
          <div className="mt-6 grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <div className="eyebrow">{presentation.type} · {presentation.intervention}</div>
              <h1 className="display-xl mt-4">{presentation.name}</h1>
            </div>
            {presentation.zone && <div className="text-muted-foreground md:text-right"><div className="eyebrow">Zona</div><div className="mt-1">{presentation.zone}</div></div>}
          </div>
        </section>

        <section className="container-x mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:aspect-[16/8]">
            <img src={media.hero} alt={presentation.name} loading="eager" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 max-w-2xl text-white">
              <div className="text-xs uppercase tracking-[0.25em] text-white/75">{tr("Proyecto real", "Progetto reale", "Real project")}</div>
              <p className="mt-3 text-xl font-medium leading-snug md:text-3xl">{presentation.short}</p>
            </div>
          </div>
        </section>

        {media.gallery.length > 0 && (
          <section className="container-x mt-6">
            <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[260px]">
              {media.gallery.map((item, index) => (
                <figure
                  key={`${item.src}-${index}`}
                  className={`group relative overflow-hidden rounded-sm bg-muted ${index === 0 ? "md:col-span-2 md:row-span-2" : ""} ${item.portrait ? "md:row-span-2" : ""}`}
                >
                  <img src={item.src} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="section-tight">
          <div className="container-x grid gap-14 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow">Caso</div>
              <h2 className="display-md mt-3">Situación y objetivo</h2>
            </div>
            <div className="space-y-8 text-lg leading-relaxed">
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Situación inicial</div>
                <p className="mt-2">{presentation.situation}</p>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Objetivo del cliente</div>
                <p className="mt-2">{presentation.goal}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight bg-accent/40">
          <div className="container-x grid gap-14 lg:grid-cols-2">
            <div>
              <div className="eyebrow">Intervenciones</div>
              <h2 className="display-md mt-3 mb-6">Lo que realizamos</h2>
              <ul className="space-y-3">
                {presentation.works.map((w, i) => (
                  <li key={i} className="border-b border-border pb-3 flex gap-4">
                    <span className="text-primary font-display">{String(i + 1).padStart(2, "0")}</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">Materiales y detalles</div>
              <h2 className="display-md mt-3 mb-6">Acabados</h2>
              <div className="flex flex-wrap gap-2">
                {presentation.materials.map((m) => (
                  <span key={m} className="rounded-sm border border-border bg-background px-4 py-2 text-sm">{m}</span>
                ))}
              </div>
              <div className="mt-10">
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Resultado</div>
                <p className="mt-2 text-lg leading-relaxed">{presentation.result}</p>
              </div>
            </div>
          </div>
        </section>

        {project.placeholder && (
          <section className="container-x mt-6">
            <div className="rounded-sm border border-dashed border-primary/40 bg-primary-soft/40 p-5 text-sm">
              Contenido y galería de este proyecto pendientes de completar con Daniele.
            </div>
          </section>
        )}

        <section className="section-tight">
          <div className="container-x">
            <div className="eyebrow">Otros proyectos</div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {others.map((p) => <ProjectCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      </article>

      <CTASection title={tr("¿Tienes una propiedad parecida en Ibiza?", "Hai una proprietà simile a Ibiza?", "Do you have a similar property in Ibiza?")} />
    </>
  );
}
