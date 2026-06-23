import { SEO } from "@/components/SEO";
import { tr } from "@/lib/i18n";

const AvisoLegal = () => (
  <>
    <SEO title={tr("Aviso legal | Eivitech Ibiza", "Note legali | Eivitech Ibiza", "Legal notice | Eivitech Ibiza")} description={tr("Aviso legal de Eivitech.", "Note legali di Eivitech.", "Eivitech legal notice.")} path="/aviso-legal" />
    <section className="container-x py-20 max-w-3xl">
      <div className="eyebrow">{tr("Legal", "Legale", "Legal")}</div>
      <h1 className="display-lg mt-4">{tr("Aviso legal", "Note legali", "Legal notice")}</h1>
      <p className="mt-6 text-muted-foreground">
        {tr("Página placeholder. Datos fiscales completos, condiciones de uso y responsabilidades pendientes de confirmación.", "Pagina placeholder. Dati fiscali completi, condizioni d'uso e responsabilità in attesa di conferma.", "Placeholder page. Full tax details, terms of use and responsibilities pending confirmation.")}
      </p>
    </section>
  </>
);

export default AvisoLegal;
