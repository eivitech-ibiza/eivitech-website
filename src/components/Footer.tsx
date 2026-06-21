import { Link } from "react-router-dom";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { tr } from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-accent/40">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl">
            Eivi<span className="text-primary">tech</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            {tr("Coordinamos reformas, instalaciones y acabados en Ibiza.", "Coordiniamo ristrutturazioni, impianti e finiture a Ibiza.", "We coordinate renovations, installations and finishes in Ibiza.")}
          </p>
          <div className="mt-6 space-y-1 text-sm">
            <a href={SITE.phoneHref} className="block hover:text-primary">{SITE.phone}</a>
            <a href={SITE.emailHref} className="block hover:text-primary">{SITE.email}</a>
            <div className="text-muted-foreground">{SITE.location}</div>
          </div>
        </div>

        <div>
          <div className="eyebrow mb-4">{tr("Servicios", "Servizi", "Services")}</div>
          <ul className="space-y-2 text-sm">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link to={`/servicios/${s.slug}`} className="text-muted-foreground hover:text-foreground">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">{tr("Sitio", "Sito", "Site")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/proyectos" className="text-muted-foreground hover:text-foreground">{tr("Proyectos", "Progetti", "Projects")}</Link></li>
            <li><Link to="/empresa" className="text-muted-foreground hover:text-foreground">{tr("Empresa", "Azienda", "Company")}</Link></li>
            <li><Link to="/contacto" className="text-muted-foreground hover:text-foreground">{tr("Contacto", "Contatto", "Contact")}</Link></li>
            <li><Link to="/privacidad" className="text-muted-foreground hover:text-foreground">{tr("Privacidad", "Privacy", "Privacy")}</Link></li>
            <li><Link to="/aviso-legal" className="text-muted-foreground hover:text-foreground">{tr("Aviso legal", "Note legali", "Legal notice")}</Link></li>
          </ul>

          <div className="eyebrow mb-4 mt-8">{tr("Área privada", "Area privata", "Private area")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">{tr("CRM privado", "CRM privato", "Private CRM")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} {SITE.name}. {tr("Todos los derechos reservados.", "Tutti i diritti riservati.", "All rights reserved.")}</div>
          <div>{SITE.tagline}</div>
        </div>
      </div>
    </footer>
  );
}
