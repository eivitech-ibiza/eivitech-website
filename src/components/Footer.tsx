import { Link } from "react-router-dom";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { EivitechLogo } from "@/components/EivitechLogo";
import { CURRENT_LANGUAGE, changeLanguage, languageSelectionHref, tr, type LanguageSelection } from "@/lib/i18n";

const LANGUAGE_OPTIONS: { value: LanguageSelection; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "es", label: "ES" },
  { value: "it", label: "IT" },
  { value: "en", label: "EN" },
  { value: "nl", label: "NL" },
];

function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("eivitech:open-cookie-preferences"));
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-accent/40">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex shrink-0 items-center" aria-label={tr("Inicio de Eivitech", "Home Eivitech", "Eivitech home")}>
            <EivitechLogo className="h-auto w-[230px] md:w-[280px]" />
          </Link>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            {tr("Coordinamos reformas, instalaciones y acabados en Ibiza.", "Coordiniamo ristrutturazioni, impianti e finiture a Ibiza.", "We coordinate renovations, installations and finishes in Ibiza.")}
          </p>
          <div className="mt-6 space-y-1 text-sm">
            <a href={SITE.phoneHref} className="block hover:text-primary">{SITE.phone}</a>
            <a href={SITE.emailHref} className="block hover:text-primary">{SITE.email}</a>
            <div className="text-muted-foreground">{SITE.location}</div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{tr("Idioma", "Lingua", "Language")}</span>
            {LANGUAGE_OPTIONS.map((option) => {
              const active = option.value !== "auto" && option.value === CURRENT_LANGUAGE;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => changeLanguage(option.value)}
                  className={`rounded-sm border border-border px-2 py-1 hover:bg-background ${active ? "bg-background text-foreground" : ""}`}
                  aria-label={tr(`Cambiar idioma a ${option.label}`, `Cambia lingua in ${option.label}`, `Change language to ${option.label}`)}
                >
                  {option.label}
                </button>
              );
            })}
            <noscript>
              {LANGUAGE_OPTIONS.map((option) => (
                <a key={option.value} href={languageSelectionHref(option.value)} className="rounded-sm border border-border px-2 py-1 hover:bg-background">
                  {option.label}
                </a>
              ))}
            </noscript>
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
            <li><Link to="/transformations" className="text-muted-foreground hover:text-foreground">{tr("Proyectos", "Progetti", "Projects")}</Link></li>
            <li><Link to="/empresa" className="text-muted-foreground hover:text-foreground">{tr("Empresa", "Azienda", "Company")}</Link></li>
            <li><Link to="/contacto" className="text-muted-foreground hover:text-foreground">{tr("Contacto", "Contatto", "Contact")}</Link></li>
            <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">{tr("Privacidad", "Privacy", "Privacy")}</Link></li>
            <li><Link to="/cookie-policy" className="text-muted-foreground hover:text-foreground">{tr("Cookies", "Cookie", "Cookies")}</Link></li>
            <li><button type="button" onClick={openCookiePreferences} className="text-left text-muted-foreground hover:text-foreground">{tr("Gestionar cookies", "Gestisci cookie", "Manage cookies")}</button></li>
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
          <div className="flex flex-col gap-1 md:items-end">
            <div>{SITE.tagline}</div>
            <a
              href="https://www.lucianonovello.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Powered by Digitalempower
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
