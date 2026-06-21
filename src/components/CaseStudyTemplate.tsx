import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const mediaRoot = String.fromCharCode(104,116,116,112,115,58,47,47,101,105,118,105,116,101,99,104,46,99,111,109,47,119,112,45,99,111,110,116,101,110,116,47,117,112,108,111,97,100,115,47,50,48,50,49,47,48,56,47);
const mediaUrl = (name: string) => `${mediaRoot}${name}`;

function getProjectMedia(project: Project) {
  if (project.slug !== "urbanizacion-valverde") return { hero: project.image, gallery: [] as Array<{ src: string; alt: string; portrait?: boolean }> };

  return {
    hero: mediaUrl("terraza-casita-valverde-4-1024x576.jpg"),
    gallery: [
      { src: mediaUrl("terraza-casita-valverde-2-1024x576.jpg"), alt: tr("Vista panorámica de la terraza Valverde", "Vista panoramica della terrazza Valverde", "Panoramic view of the Valverde terrace") },
      { src: mediaUrl("terraza-casita-valverde-1-576x1024.jpg"), alt: tr("Detalle del pavimento exterior en madera de Indonesia", "Dettaglio della pavimentazione esterna in legno indonesiano", "Detail of the Indonesian wood decking"), portrait: true },
      { src: mediaUrl("terraza-casita-valverde-3-1024x576.jpg"), alt: tr("Zona exterior con cama de madera y vistas al entorno rural", "Zona esterna con letto in legno e vista sull'ambiente rurale", "Outdoor area with wooden daybed and rural views") },
      { src: mediaUrl("terraza-casita-valverde-4-1024x576.jpg"), alt: tr("Muro de piedra ibicenca y tarima exterior de madera", "Muro in pietra ibizenca e pavimentazione esterna in legno", "Ibizan stone wall and outdoor wood decking") },
    ],
  };
}

export function CaseStudyTemplate({ project }: { project: Project }) {
  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const path = `/proyectos/${project.slug}`;
  const media = getProjectMedia(project);

  return (
    <>
      <SEO
        title={project.metaTitle}
        description={project.metaDescription}
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
              <div className="eyebrow">{project.type} · {project.intervention}</div>
              <h1 className="display-xl mt-4">{project.name}</h1>
            </div>
            {project.zone && <div className="text-muted-foreground md:text-right"><div className="eyebrow">Zona</div><div className="mt-1">{project.zone}</div></div>}
          </div>
        </section>

        <section className="container-x mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:aspect-[16/8]">
            <img src={media.hero} alt={project.name} loading="eager" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 max-w-2xl text-white">
              <div className="text-xs uppercase tracking-[0.25em] text-white/75">{tr("Proyecto real", "Progetto reale", "Real project")}</div>
              <p className="mt-3 text-xl font-medium leading-snug md:text-3xl">{project.short}</p>
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
                <p className="mt-2">{project.situation}</p>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Objetivo del cliente</div>
                <p className="mt-2">{project.goal}</p>
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
                {project.works.map((w, i) => (
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
                {project.materials.map((m) => (
                  <span key={m} className="rounded-sm border border-border bg-background px-4 py-2 text-sm">{m}</span>
                ))}
              </div>
              <div className="mt-10">
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Resultado</div>
                <p className="mt-2 text-lg leading-relaxed">{project.result}</p>
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

      <CTASection title="¿Tienes una propiedad parecida en Ibiza?" />
    </>
  );
}
