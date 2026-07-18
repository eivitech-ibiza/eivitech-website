import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { EivitechLogo } from "@/components/EivitechLogo";
import {
  CURRENT_LANGUAGE,
  changeLanguage,
  languageLabels,
  tr,
  type Language,
} from "@/lib/i18n";

const NAV = [
  { to: "/", label: tr("Inicio", "Home", "Home") },
  { to: "/transformations", label: tr("Transformaciones", "Trasformazioni", "Transformations") },
  { to: "/the-eivitech-way", label: tr("Método", "Metodo", "Method") },
  { to: "/materials-atmosphere", label: tr("Materiales", "Materiali", "Materials") },
  { to: "/contacto", label: tr("Contacto", "Contatto", "Contact") },
];

const HEADER_LANGUAGES: Language[] = ["es", "it", "en", "nl"];

function HeaderLanguageSelector() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!languageOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [languageOpen]);

  const selectLanguage = (language: Language) => {
    setLanguageOpen(false);
    if (language !== CURRENT_LANGUAGE) changeLanguage(language);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={languageOpen}
        aria-label={tr(
          "Seleccionar idioma",
          "Seleziona lingua",
          "Select language",
          "Taal selecteren",
        )}
        onClick={() => setLanguageOpen((current) => !current)}
        className="inline-flex h-10 min-w-12 items-center justify-center gap-1 rounded-sm border border-border bg-background/80 px-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Globe2 aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{CURRENT_LANGUAGE.toUpperCase()}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${languageOpen ? "rotate-180" : ""}`}
        />
      </button>

      {languageOpen && (
        <div
          role="menu"
          aria-label={tr(
            "Idiomas disponibles",
            "Lingue disponibili",
            "Available languages",
            "Beschikbare talen",
          )}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-40 overflow-hidden rounded-sm border border-border bg-background py-1 shadow-lg"
        >
          {HEADER_LANGUAGES.map((language) => {
            const active = language === CURRENT_LANGUAGE;
            return (
              <button
                key={language}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => selectLanguage(language)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                  active ? "bg-accent/60 text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="w-6 text-xs font-semibold uppercase text-foreground">
                  {language.toUpperCase()}
                </span>
                <span className="flex-1">{languageLabels[language]}</span>
                {active && <Check aria-hidden="true" className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  const ctaLabel = tr("Hablemos de tu propiedad", "Parliamo della tua proprietà", "Let’s talk about your property");

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 md:h-20 items-center justify-between">
        <Link to="/" className="inline-flex shrink-0 items-center" aria-label="Eivitech home">
          <EivitechLogo className="h-auto w-[165px] md:w-[210px]" />
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
          <HeaderLanguageSelector />
          <Link
            to="/contacto"
            className="inline-flex items-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <HeaderLanguageSelector />
          <button
            aria-label={open ? tr("Cerrar menú", "Chiudi menu", "Close menu") : tr("Abrir menú", "Apri menu", "Open menu")}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute right-4 top-full z-50 w-[min(20rem,calc(100vw-2rem))] md:hidden">
          <nav
            aria-label={tr("Navegación móvil", "Navigazione mobile", "Mobile navigation", "Mobiele navigatie")}
            className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-sm border border-border bg-background p-2 shadow-xl"
          >
            <div className="flex flex-col gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `rounded-sm px-4 py-3 text-base transition-colors hover:bg-accent/60 ${
                      isActive ? "bg-accent/40 text-foreground" : "text-muted-foreground"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link
                to="/contacto"
                className="mt-2 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
