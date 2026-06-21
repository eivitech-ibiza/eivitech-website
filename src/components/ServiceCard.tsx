import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to={`/servicios/${service.slug}`}
      className="group relative flex flex-col justify-between rounded-sm border border-border bg-card p-7 transition-all duration-300 hover:border-primary hover:shadow-card"
    >
      <div>
        <div className="eyebrow">Servicio</div>
        <h3 className="mt-3 font-display text-2xl leading-tight">{service.title}</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{service.short}</p>
      </div>
      <div className="mt-8 flex items-center gap-2 text-sm font-medium text-primary">
        Ver servicio
        <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
