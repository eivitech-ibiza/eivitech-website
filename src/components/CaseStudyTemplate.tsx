import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";
import { resolveProjectMediaPath } from "@/lib/projectMedia";

const fallbackImage = `${import.meta.env.BASE_URL}placeholder.svg`;

function withBase(path: string) {
  const resolvedPath = resolveProjectMediaPath(path);
  if (/^https?:\/\//i.test(resolvedPath)) return resolvedPath;
  return `${import.meta.env.BASE_URL}${resolvedPath.replace(/^\//, "")}`;
}

function ProjectImage({ src, alt, priority = false, className = "" }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <img
      src={withBase(src)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      onError={(event) => {
        event.currentTarget.src = fallbackImage;
      }}
      className={className}
    />
  );
}

function DetailBlock({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="border-t border-border pt-7">
      <div className="eyebrow">{label}</div>
      <h2 className="display-sm mt-3">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function getProjectPath(project: Project) {
  return `/transformations/${project.slug}`;
}

export function CaseStudyTemplate({ project }: { project: Project }) {
  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const path = getProjectPath(project);
  const gallery = project.gallery?.length ? project.gallery : [project.cover];

  return (
    <>
      <SEO
        title={project.metaTitle}
        description={project.metaDescription}
        path={path}
        trackAs="project_view"
        trackPayload={{ project: project.slug, interest: project.crmInterest }}
        ogImage={withBase(project.cover)}
      />

      <article>
        <section className="container-x pt-12 md:pt-20">
          <Link to="/transformations" className="text-sm text-muted-foreground hover:text-foreground">
            ← {tr("Todas las transformaciones", "Tutte le trasformazioni", "All transformations")}
          </Link>

          <div className="mt-6 grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <div className="eyebrow">{project.type} · {project.intervention}</div>
              <h1 className="display-xl mt-4">{project.name}</h1>
              <p className="body-lg mt-5 max-w-2xl">{project.short}</p>
            </div>
            <div className="space-y-4 text-muted-foreground md:text-right">
              {project.zone && (
                <div>
                  <div className="eyebrow">{tr("Zona", "Zona", "Area")}</div>
                  <div className="mt-1">{project.zone}</div>
                </div>
              )}
              <div>
                <div className="eyebrow">{tr("Estilo", "Stile", "Style")}</div>
                <div className="mt-1">{project.style}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-x mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:aspect-[16/8]">
            <ProjectImage src={project.cover} alt={project.name} priority className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 max-w-3xl text-white">
              <div className="text-xs uppercase tracking-[0.25em] text-white/75">
                {tr("Transformación de propiedad", "Trasformazione immobiliare", "Property transformation")}
              </div>
              <p className="mt-3 text-xl font-medium leading-snug md:text-4xl">{project.short}</p>
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.7fr]">
            <div>
              <div className="eyebrow">{tr("Historia", "Storia", "Story")}</div>
              <h2 className="display-md mt-3">
                {tr("Del problema a la experiencia de vivir", "Dal problema all'esperienza abitativa", "From problem to living experience")}
              </h2>
            </div>
            <div className="space-y-10">
              <DetailBlock label={tr("01 Desafío", "01 Sfida", "01 Challenge")} title={tr("El punto de partida", "Il punto di partenza", "The starting point")} body={project.challenge || project.situation} />
              <DetailBlock label={tr("02 Visión del cliente", "02 Visione del cliente", "02 Client vision")} title={tr("Lo que buscaba el cliente", "Cosa cercava il cliente", "What the client wanted")} body={project.vision || project.goal} />
              <DetailBlock label={tr("03 Solución Eivitech", "03 Soluzione Eivitech", "03 Eivitech solution")} title={tr("Cómo lo resolvimos", "Come lo abbiamo risolto", "How we solved it")} body={project.solution} />
            </div>
          </div>
        </section>

        <section className="section-tight bg-accent/40">
          <div className="container-x grid gap-14 lg:grid-cols-2">
            <div>
              <div className="eyebrow">{tr("Intervenciones", "Interventi", "Works")}</div>
              <h2 className="display-md mt-3 mb-6">{tr("Lo que entregamos", "Cosa abbiamo realizzato", "What we delivered")}</h2>
              <ul className="space-y-3">
                {project.works.map((w, i) => (
                  <li key={i} className="flex gap-4 border-b border-border pb-3">
                    <span className="font-display text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">{tr("Materiales y detalles", "Materiali e dettagli", "Materials and details")}</div>
              <h2 className="display-md mt-3 mb-6">{tr("Materiales que moldean la sensación", "Materiali che modellano la sensazione", "Materials that shape the feeling")}</h2>
              <div className="flex flex-wrap gap-2">
                {project.materials.map((m) => (
                  <span key={m} className="rounded-sm border border-border bg-background px-4 py-2 text-sm">
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-10 grid gap-8">
                <div>
                  <div className="text-sm uppercase tracking-widest text-muted-foreground">{tr("Iluminación / atmósfera", "Illuminazione / atmosfera", "Lighting / Atmosphere")}</div>
                  <p className="mt-2 text-lg leading-relaxed">{project.lighting}</p>
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-muted-foreground">{tr("Artesanía", "Artigianalità", "Craftsmanship")}</div>
                  <p className="mt-2 text-lg leading-relaxed">{project.craftsmanship}</p>
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-muted-foreground">{tr("Resultado final", "Risultato finale", "Final result")}</div>
                  <p className="mt-2 text-lg leading-relaxed">{project.result}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-x mt-6">
          <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[260px]">
            {gallery.map((src, index) => (
              <figure
                key={`${src}-${index}`}
                className={`group relative overflow-hidden rounded-sm bg-muted ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <ProjectImage
                  src={src}
                  alt={`${project.name} — ${tr("imagen", "immagine", "image")} ${index + 1}`}
                  priority={index === 0}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {project.name} · {project.category}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section-tight">
          <div className="container-x">
            <div className="eyebrow">{tr("Otros proyectos", "Altri progetti", "Other projects")}</div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {others.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      </article>

      <CTASection title={tr("Hablemos de tu propiedad.", "Parliamo della tua proprietà.", "Let's talk about your property.")} />
    </>
  );
}
