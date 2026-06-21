import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <Link to={`/proyectos/${project.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <img
          src={project.image}
          alt={project.name}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">
            {project.type} · {project.intervention}
          </div>
          <h3 className="mt-2 font-display text-2xl md:text-3xl leading-tight">{project.name}</h3>
          {project.zone && <div className="mt-1 text-xs opacity-80">{project.zone}</div>}
        </div>
        <div className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform group-hover:rotate-45">
          <ArrowUpRight size={16} />
        </div>
      </div>
    </Link>
  );
}
