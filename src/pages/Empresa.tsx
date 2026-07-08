import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProcessSteps } from "@/components/ProcessSteps";
import { tr } from "@/lib/i18n";

const casaImg = `${import.meta.env.BASE_URL}media/projects/casa-vadella/cover.jpg`;

const Empresa = () => (
  <>
    <SEO
      title={tr("Empresa | Eivitech Ibiza", "Azienda | Eivitech Ibiza", "Company | Eivitech Ibiza")}
      description={tr("Eivitech nace para ofrecer un servicio individual a cada cliente, acompañando cada proyecto desde la idea inicial hasta el último detalle.", "Eivitech nasce per offrire un servizio individuale a ogni cliente, accompagnando ogni progetto dall'idea iniziale all'ultimo dettaglio.", "Eivitech was created to offer an individual service to each client, supporting every project from the initial idea to the final detail.")}
      path="/empresa"
    />

    <section className="container-x pt-16 md:pt-24 pb-12 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <div className="eyebrow">{tr("Empresa", "Azienda", "Company")}</div>
        <h1 className="display-xl mt-4">{tr("Un referente local para tu reforma en Ibiza", "Un referente locale per la tua ristrutturazione a Ibiza", "A local point of contact for your renovation in Ibiza")}</h1>
        <p className="body-lg mt-6 max-w-2xl">
          {tr("Eivitech nace con la idea de ofrecer un servicio individual para cada cliente, acompañando cada proyecto desde la idea inicial hasta el último detalle.", "Eivitech nasce con l'idea di offrire un servizio individuale per ogni cliente, accompagnando ogni progetto dall'idea iniziale all'ultimo dettaglio.", "Eivitech was created with the idea of offering an individual service for each client, supporting every project from the initial idea to the final detail.")}
        </p>
      </div>
      <div className="aspect-[4/5] overflow-hidden rounded-sm">
        <img src={casaImg} alt={tr("Interior reformado por Eivitech en Ibiza", "Interno ristrutturato da Eivitech a Ibiza", "Interior renovated by Eivitech in Ibiza")} loading="lazy" className="h-full w-full object-cover" />
      </div>
    </section>

    <section className="section">
      <div className="container-x grid gap-12 md:grid-cols-2">
        <div>
          <div className="eyebrow">{tr("Lo que nos guía", "Ciò che ci guida", "What guides us")}</div>
          <h2 className="display-md mt-3">{tr("Trato cercano, gestión clara", "Rapporto diretto, gestione chiara", "Close relationship, clear management")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {tr("Creemos en una relación directa con el cliente y en una gestión clara del proyecto. Un único interlocutor para que no tengas que coordinar entre múltiples profesionales.", "Crediamo in un rapporto diretto con il cliente e in una gestione chiara del progetto. Un unico interlocutore, così non devi coordinare più professionisti.", "We believe in a direct relationship with the client and clear project management. One point of contact so you do not have to coordinate multiple professionals.")}
          </p>
        </div>
        <div>
          <div className="eyebrow">{tr("Cómo acompañamos", "Come ti accompagniamo", "How we support you")}</div>
          <h2 className="display-md mt-3">{tr("Reformar con menos preocupación", "Ristrutturare con meno preoccupazioni", "Renovate with less worry")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {tr("Nos adaptamos al uso de cada propiedad: vivienda habitual, casa de vacaciones o espacio comercial. Cuidamos funcionalidad y acabados para que el resultado dure.", "Ci adattiamo all'uso di ogni proprietà: abitazione principale, casa vacanze o spazio commerciale. Curiamo funzionalità e finiture perché il risultato duri nel tempo.", "We adapt to the use of each property: main home, holiday home or commercial space. We take care of functionality and finishes so the result lasts.")}
          </p>
        </div>
      </div>
    </section>

    <section className="section bg-accent/40">
      <div className="container-x">
        <div className="eyebrow">{tr("Cómo trabajamos", "Come lavoriamo", "How we work")}</div>
        <h2 className="display-lg mt-3 mb-12">{tr("Un proceso claro de principio a fin", "Un processo chiaro dall'inizio alla fine", "A clear process from start to finish")}</h2>
        <ProcessSteps
          steps={[
            { title: tr("Primera valoración", "Prima valutazione", "First assessment") },
            { title: tr("Visita o revisión", "Visita o revisione", "Visit or review") },
            { title: tr("Presupuesto", "Preventivo", "Proposal") },
            { title: tr("Planificación", "Pianificazione", "Planning") },
            { title: tr("Ejecución", "Esecuzione", "Execution") },
            { title: tr("Entrega", "Consegna", "Handover") },
          ]}
        />
      </div>
    </section>

    <CTASection />
  </>
);

export default Empresa;
