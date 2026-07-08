import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { tr } from "@/lib/i18n";

const fallbackImage = `${import.meta.env.BASE_URL}placeholder.svg`;

function withBase(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export function getProjectPath(project: Project) {
  return `/transformations/${project.slug}`;
}

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const cover = withBase(project.cover || project.image);

  return (
    <Link to={getProjectPath(project)} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <img
          src={cover}
          alt={project.name}
          loading={priority ? "eager" : "lazy"}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute left-5 top-5 rounded-sm bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
          {project.category}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">
            {project.type} · {project.intervention}
          </div>
          <h3 className="mt-2 font-display text-2xl leading-tight md:text-3xl">{project.name}</h3>
          {project.zone && <div className="mt-1 text-xs opacity-80">{project.zone}</div>}
          <div className="mt-3 text-xs opacity-85">{tr("Ver transformación", "Vedi trasformazione", "View transformation")}</div>
        </div>
        <div className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform group-hover:rotate-45">
          <ArrowUpRight size={16} />
        </div>
      </div>
    </Link>
  );
}
