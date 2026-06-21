import { Link } from "react-router-dom";
import { whatsappUrl } from "@/data/site";
import { track } from "@/lib/tracking";

export function CTASection({
  eyebrow = "Siguiente paso",
  title = "Cuéntanos qué propiedad quieres reformar",
  description = "Una primera valoración sin compromiso. Cuanto más nos cuentes sobre el proyecto, mejor podremos orientarte.",
  primary = { label: "Solicitar valoración", to: "/contacto" },
  whatsappMessage = "Hola, me gustaría solicitar una valoración para mi proyecto en Ibiza.",
  dark = true,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primary?: { label: string; to: string };
  whatsappMessage?: string;
  dark?: boolean;
}) {
  return (
    <section className={`section ${dark ? "bg-ink text-cream" : "bg-accent"}`}>
      <div className="container-x grid gap-10 md:grid-cols-2 md:items-end">
        <div>
          <div className={`eyebrow ${dark ? "text-cream/70" : ""}`}>{eyebrow}</div>
          <h2 className="display-lg mt-4 max-w-xl">{title}</h2>
        </div>
        <div className="space-y-6">
          <p className={`text-lg leading-relaxed ${dark ? "text-cream/80" : "text-muted-foreground"}`}>{description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={primary.to}
              className="inline-flex items-center rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              {primary.label}
            </Link>
            <a
              href={whatsappUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { source: "cta_section" })}
              className={`inline-flex items-center rounded-sm border px-6 py-3.5 text-sm font-medium transition ${
                dark
                  ? "border-cream/30 text-cream hover:bg-cream/10"
                  : "border-foreground/20 text-foreground hover:bg-foreground/5"
              }`}
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
