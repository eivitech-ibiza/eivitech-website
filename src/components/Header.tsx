import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE } from "@/data/site";
import { LOGO_EIVITECH } from "@/assets/logo-eivitech";
import { tr } from "@/lib/i18n";

const NAV = [
  { to: "/", label: tr("Inicio", "Home", "Home") },
  { to: "/servicios", label: tr("Servicios", "Servizi", "Services") },
  { to: "/proyectos", label: tr("Proyectos", "Progetti", "Projects") },
  { to: "/empresa", label: tr("Empresa", "Azienda", "Company") },
  { to: "/contacto", label: tr("Contacto", "Contatto", "Contact") },
];

const logoFilter = {
  filter: "brightness(0) saturate(100%) invert(10%) sepia(14%) saturate(1100%) hue-rotate(345deg) brightness(94%) contrast(96%)",
};

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const ctaLabel = tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment");

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 md:h-20 items-center justify-between">
        <Link to="/" className="inline-flex shrink-0 items-center" aria-label="Eivitech home">
          <img
            src={LOGO_EIVITECH}
            alt="Eivitech instalaciones y reformas"
            className="block h-auto w-[165px] object-contain md:w-[210px]"
            style={logoFilter}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href={SITE.phoneHref} className="text-sm text-muted-foreground hover:text-foreground">
            {SITE.phone}
          </a>
          <Link
            to="/contacto"
            className="inline-flex items-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          aria-label={open ? tr("Cerrar menú", "Chiudi menu", "Close menu") : tr("Abrir menú", "Apri menu", "Open menu")}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-x py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `py-3 text-base ${isActive ? "text-foreground" : "text-muted-foreground"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/contacto"
              className="mt-3 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              {ctaLabel}
            </Link>
            <a href={SITE.phoneHref} className="py-3 text-sm text-muted-foreground">
              {SITE.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
