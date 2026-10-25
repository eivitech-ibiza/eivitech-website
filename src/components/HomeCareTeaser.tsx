import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { tr } from "@/lib/i18n";

// Kept here (not in the page content file) so the homepage and service pages
// do not download the full four-language Home Care copy for a teaser.
const teaserCopy = () => ({
  eyebrow: tr("Nuevo · Home Care 365", "Novità · Home Care 365", "New · Home Care 365", "Nieuw · Home Care 365"),
  title: tr("¿Segunda residencia en Ibiza?", "Hai una seconda casa a Ibiza?", "A second home in Ibiza?", "Een tweede woning op Ibiza?"),
  text: tr(
    "Revisamos tu casa mientras no estás: agua, electricidad, climatización y humedades, con informe y fotos.",
    "La controlliamo mentre sei via: acqua, impianto elettrico, climatizzazione e umidità, con report e foto.",
    "We check your home while you're away: water, electrics, air conditioning and damp, with a photo report.",
    "We controleren je huis terwijl je weg bent: water, elektra, airco en vocht, met een fotorapport.",
  ),
  link: tr("Descubre Home Care 365", "Scopri Home Care 365", "Discover Home Care 365", "Ontdek Home Care 365"),
});

/** Internal link block pointing owners of second homes to Home Care 365. */
export function HomeCareTeaser({ compact = false }: { compact?: boolean }) {
  const teaser = teaserCopy();

  if (compact) {
    return (
      <Link
        to="/home-care-365"
        className="mt-7 block rounded-sm border border-primary/25 bg-primary/10 p-4 transition hover:border-primary"
      >
        <span className="text-xs uppercase tracking-[0.18em] text-primary">{teaser.eyebrow}</span>
        <span className="mt-1 block font-display text-lg">{teaser.title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{teaser.text}</span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {teaser.link} <ArrowRight size={14} aria-hidden="true" />
        </span>
      </Link>
    );
  }

  return (
    <section className="section-tight">
      <div className="container-x">
        <div className="grid gap-6 rounded-sm border border-border bg-card p-6 shadow-soft md:grid-cols-[1.4fr_1fr] md:items-center md:p-10">
          <div>
            <div className="eyebrow">{teaser.eyebrow}</div>
            <h2 className="display-md mt-3">{teaser.title}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{teaser.text}</p>
          </div>
          <div className="md:text-right">
            <Link
              to="/home-care-365"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              {teaser.link} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
