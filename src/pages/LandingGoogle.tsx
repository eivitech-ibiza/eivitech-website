import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { ProjectCard } from "@/components/ProjectCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl, SITE } from "@/data/site";
import { track } from "@/lib/tracking";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { serviceJsonLd, faqJsonLd } from "@/lib/seo";
import { tr } from "@/lib/i18n";

const heroImg = `${import.meta.env.BASE_URL}media/projects/casa-vadella/casa-vadella-ibiza-investment-villa-makeover-cover.webp`;

const FEATURED_PROJECT_SLUGS = [
  "investment-oriented-villa-makeover",
  "warm-contemporary-apartment-transformation",
  "authentic-ibiza-finca-restoration",
] as const;

const FEATURED_PROJECTS = FEATURED_PROJECT_SLUGS.flatMap((slug) => {
  const project = PROJECTS.find((item) => item.slug === slug);
  return project ? [project] : [];
});

const LandingGoogle = () => {
  const projectTypes = [
    {
      title: tr("Villas", "Ville", "Villas", "Villa's"),
      text: tr(
        "Reformas completas o parciales de interiores y exteriores, coordinando instalaciones, acabados y soluciones a medida.",
        "Ristrutturazioni complete o parziali di interni ed esterni, coordinando impianti, finiture e soluzioni su misura.",
        "Full or partial interior and exterior renovations, coordinating installations, finishes and bespoke solutions.",
        "Volledige of gedeeltelijke renovaties van binnen- en buitenruimtes, met coördinatie van installaties, afwerkingen en maatwerkoplossingen.",
      ),
      to: "/servicios/reformas-integrales",
    },
    {
      title: tr("Apartamentos", "Appartamenti", "Apartments", "Appartementen"),
      text: tr(
        "Redistribución, cocinas, baños, iluminación y carpintería para aprovechar mejor el espacio y renovar su calidad percibida.",
        "Ridisegno degli spazi, cucine, bagni, illuminazione e falegnameria per valorizzare meglio gli ambienti e la qualità percepita.",
        "Layouts, kitchens, bathrooms, lighting and carpentry to make better use of space and improve perceived quality.",
        "Indeling, keukens, badkamers, verlichting en schrijnwerk om de ruimte beter te benutten en de ervaren kwaliteit te verbeteren.",
      ),
      to: "/servicios/cocinas-banos",
    },
    {
      title: tr("Fincas", "Fincas", "Fincas", "Finca's"),
      text: tr(
        "Intervenciones que respetan el carácter de la propiedad y combinan materiales naturales, soluciones técnicas y confort actual.",
        "Interventi che rispettano il carattere della proprietà e combinano materiali naturali, soluzioni tecniche e comfort contemporaneo.",
        "Work that respects the property's character while combining natural materials, technical solutions and contemporary comfort.",
        "Ingrepen die het karakter van het pand respecteren en natuurlijke materialen combineren met technische oplossingen en hedendaags comfort.",
      ),
      to: "/transformations/authentic-ibiza-finca-restoration",
    },
    {
      title: tr("Locales comerciales", "Locali commerciali", "Commercial spaces", "Commerciële ruimtes"),
      text: tr(
        "Reformas de bares, restaurantes y locales donde instalaciones, funcionalidad, imagen y tiempos deben avanzar coordinados.",
        "Ristrutturazioni di bar, ristoranti e locali dove impianti, funzionalità, immagine e tempi devono procedere in modo coordinato.",
        "Renovations for bars, restaurants and commercial spaces where installations, function, image and timing need to move together.",
        "Renovaties van bars, restaurants en commerciële ruimtes waar installaties, functionaliteit, uitstraling en timing op elkaar moeten aansluiten.",
      ),
      to: "/servicios/locales-comerciales",
    },
  ];

  const islandPoints = [
    {
      title: tr("Un único interlocutor", "Un unico referente", "One point of contact", "Eén vast aanspreekpunt"),
      text: tr(
        "Centralizamos decisiones, profesionales y seguimiento para evitar que el propietario tenga que coordinar cada oficio por separado.",
        "Centralizziamo decisioni, professionisti e monitoraggio, evitando al proprietario di dover coordinare ogni artigiano separatamente.",
        "We centralise decisions, trades and follow-up so the owner does not have to coordinate every professional separately.",
        "We centraliseren beslissingen, vakmensen en opvolging zodat de eigenaar niet iedere professional afzonderlijk hoeft te coördineren.",
      ),
    },
    {
      title: tr("Logística de isla", "Logistica insulare", "Island logistics", "Eilandlogistiek"),
      text: tr(
        "Materiales, entregas y disponibilidad condicionan la obra en Ibiza. La planificación anticipada reduce improvisaciones y esperas evitables.",
        "Materiali, consegne e disponibilità condizionano i lavori a Ibiza. Una pianificazione anticipata riduce improvvisazioni e attese evitabili.",
        "Materials, deliveries and availability affect projects in Ibiza. Planning ahead reduces avoidable improvisation and waiting time.",
        "Materialen, leveringen en beschikbaarheid beïnvloeden projecten op Ibiza. Vooraf plannen vermindert vermijdbare improvisatie en wachttijd.",
      ),
    },
    {
      title: tr("Seguimiento aunque estés fuera", "Monitoraggio anche a distanza", "Follow-up while you are away", "Opvolging wanneer je weg bent"),
      text: tr(
        "Muchos propietarios no viven todo el año en la isla. Organizamos la comunicación y el seguimiento para mantener las decisiones alineadas.",
        "Molti proprietari non vivono tutto l'anno sull'isola. Organizziamo comunicazione e monitoraggio per mantenere le decisioni allineate.",
        "Many owners do not live on the island all year. We organise communication and follow-up to keep decisions aligned.",
        "Veel eigenaars wonen niet het hele jaar op het eiland. We organiseren communicatie en opvolging om beslissingen op één lijn te houden.",
      ),
    },
  ];

  const process = [
    {
      title: tr("Valoración", "Valutazione", "Assessment", "Beoordeling"),
      text: tr(
        "Entendemos la propiedad, la zona, el objetivo y el alcance inicial.",
        "Comprendiamo la proprietà, la zona, l'obiettivo e l'ambito iniziale.",
        "We understand the property, location, objective and initial scope.",
        "We brengen het pand, de locatie, het doel en de eerste scope in kaart.",
      ),
    },
    {
      title: tr("Planificación", "Pianificazione", "Planning", "Planning"),
      text: tr(
        "Ordenamos partidas, decisiones, profesionales, materiales y secuencia de trabajo.",
        "Ordiniamo lavorazioni, decisioni, professionisti, materiali e sequenza dei lavori.",
        "We organise work items, decisions, trades, materials and work sequence.",
        "We ordenen werkzaamheden, beslissingen, vakmensen, materialen en werkvolgorde.",
      ),
    },
    {
      title: tr("Ejecución", "Esecuzione", "Execution", "Uitvoering"),
      text: tr(
        "Coordinamos la obra y resolvemos incidencias manteniendo el proyecto como referencia.",
        "Coordiniamo il cantiere e gestiamo gli imprevisti mantenendo il progetto come riferimento.",
        "We coordinate the works and resolve issues while keeping the project as the reference point.",
        "We coördineren de werken en lossen problemen op met het project als vaste referentie.",
      ),
    },
    {
      title: tr("Revisión y entrega", "Revisione e consegna", "Review and handover", "Controle en oplevering"),
      text: tr(
        "Revisamos detalles, acabados y puntos pendientes antes de cerrar la intervención.",
        "Rivediamo dettagli, finiture e punti aperti prima di concludere l'intervento.",
        "We review details, finishes and outstanding points before closing the project.",
        "We controleren details, afwerkingen en openstaande punten voordat het project wordt afgerond.",
      ),
    },
  ];

  const reformasFaqs = [
    {
      q: tr("¿Realizáis reformas integrales y parciales en Ibiza?", "Realizzate ristrutturazioni complete e parziali a Ibiza?", "Do you carry out full and partial renovations in Ibiza?", "Voeren jullie volledige en gedeeltelijke renovaties uit op Ibiza?"),
      a: tr(
        "Sí. El alcance puede ir desde una intervención parcial hasta una reforma completa, según la propiedad, las necesidades y la planificación del proyecto.",
        "Sì. L'ambito può andare da un intervento parziale a una ristrutturazione completa, in base alla proprietà, alle esigenze e alla pianificazione del progetto.",
        "Yes. The scope can range from partial work to a full renovation, depending on the property, requirements and project planning.",
        "Ja. De scope kan variëren van een gedeeltelijke ingreep tot een volledige renovatie, afhankelijk van het pand, de behoeften en de projectplanning.",
      ),
    },
    {
      q: tr("¿Trabajáis en toda Ibiza?", "Lavorate in tutta Ibiza?", "Do you work across Ibiza?", "Werken jullie op heel Ibiza?"),
      a: tr(
        "Trabajamos en distintas zonas de la isla. En la primera valoración confirmamos disponibilidad según la ubicación y el tipo de intervención.",
        "Lavoriamo in diverse zone dell'isola. Nella prima valutazione confermiamo la disponibilità in base alla posizione e al tipo di intervento.",
        "We work in different areas of the island. During the initial assessment we confirm availability based on location and type of work.",
        "We werken in verschillende delen van het eiland. Tijdens de eerste beoordeling bevestigen we de beschikbaarheid op basis van locatie en type werkzaamheden.",
      ),
    },
    {
      q: tr("¿Podéis gestionar la reforma si no estoy siempre en Ibiza?", "Potete gestire la ristrutturazione se non sono sempre a Ibiza?", "Can you manage the renovation if I am not always in Ibiza?", "Kunnen jullie de renovatie beheren als ik niet altijd op Ibiza ben?"),
      a: tr(
        "Sí. Un único interlocutor facilita el seguimiento, la coordinación y la toma de decisiones cuando el propietario no está permanentemente en la isla.",
        "Sì. Un unico referente facilita il monitoraggio, il coordinamento e le decisioni quando il proprietario non è sempre presente sull'isola.",
        "Yes. One point of contact makes follow-up, coordination and decision-making easier when the owner is not permanently on the island.",
        "Ja. Eén vast aanspreekpunt maakt opvolging, coördinatie en besluitvorming eenvoudiger wanneer de eigenaar niet permanent op het eiland is.",
      ),
    },
    {
      q: tr("¿Necesito tener ya un proyecto técnico?", "Devo avere già un progetto tecnico?", "Do I need to already have a technical project?", "Moet ik al een technisch project hebben?"),
      a: tr(
        "No necesariamente. Podemos hacer una primera valoración con la información disponible. Si ya existe un proyecto técnico o un arquitecto, trabajamos a partir de esa documentación.",
        "Non necessariamente. Possiamo fare una prima valutazione con le informazioni disponibili. Se esiste già un progetto tecnico o un architetto, lavoriamo a partire da quella documentazione.",
        "Not necessarily. We can make an initial assessment from the available information. If a technical project or architect is already involved, we work from that documentation.",
        "Niet noodzakelijk. We kunnen een eerste beoordeling maken op basis van de beschikbare informatie. Als er al een technisch project of architect is, werken we vanuit die documentatie.",
      ),
    },
    {
      q: tr("¿Qué necesitáis para una primera valoración?", "Cosa vi serve per una prima valutazione?", "What do you need for an initial assessment?", "Wat hebben jullie nodig voor een eerste beoordeling?"),
      a: tr(
        "Tipo de propiedad, zona aproximada, una descripción de lo que quieres cambiar y, si los tienes, fotos, vídeos o planos. Con esa información podemos orientar mejor el siguiente paso.",
        "Tipo di proprietà, zona approssimativa, una descrizione di ciò che vuoi cambiare e, se disponibili, foto, video o planimetrie. Con queste informazioni possiamo indicare meglio il passo successivo.",
        "Property type, approximate location, a description of what you want to change and, if available, photos, videos or plans. With that information we can better guide the next step.",
        "Type pand, globale locatie, een beschrijving van wat je wilt veranderen en, indien beschikbaar, foto's, video's of plannen. Met die informatie kunnen we de volgende stap beter bepalen.",
      ),
    },
  ];

  return (
    <>
      <SEO
        title={tr(
          "Reformas en Ibiza | Empresa de reformas y renovaciones",
          "Ristrutturazioni a Ibiza | Impresa di ristrutturazioni e rinnovi",
          "Renovations in Ibiza | Renovation company",
          "Renovaties op Ibiza | Renovatiebedrijf",
        )}
        description={tr(
          "Empresa de reformas en Ibiza para villas, apartamentos, fincas y locales. Coordinación de obra, instalaciones y acabados. Solicita valoración.",
          "Impresa di ristrutturazioni a Ibiza per ville, appartamenti, fincas e locali. Coordinamento di lavori, impianti e finiture. Richiedi una valutazione.",
          "Renovation company in Ibiza for villas, apartments, fincas and commercial spaces. Coordination of works, installations and finishes. Request an assessment.",
          "Renovatiebedrijf op Ibiza voor villa's, appartementen, finca's en commerciële ruimtes. Coördinatie van werken, installaties en afwerkingen.",
        )}
        path="/reformas-ibiza"
        trackAs="google_landing_view"
        jsonLd={[
          serviceJsonLd(
            tr("Reformas en Ibiza", "Ristrutturazioni a Ibiza", "Renovations in Ibiza", "Renovaties op Ibiza"),
            tr(
              "Reformas integrales y parciales en Ibiza con coordinación completa del proyecto.",
              "Ristrutturazioni complete e parziali a Ibiza con coordinamento completo del progetto.",
              "Full and partial renovations in Ibiza with complete project coordination.",
              "Volledige en gedeeltelijke renovaties op Ibiza met complete projectcoördinatie.",
            ),
          ),
          faqJsonLd(reformasFaqs),
        ]}
      />

      <section className="relative isolate min-h-[58vh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt={tr("Reforma de villa en Ibiza", "Ristrutturazione di villa a Ibiza", "Villa renovation in Ibiza", "Villa renovatie op Ibiza")}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/25" />
        </div>
        <div className="container-x flex min-h-[58vh] items-center py-16 md:py-20">
          <div className="max-w-3xl text-white">
            <div className="text-xs uppercase tracking-[0.28em] text-white/75">
              {tr("Reformas · Ibiza", "Ristrutturazioni · Ibiza", "Renovations · Ibiza", "Renovaties · Ibiza")}
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[0.96] md:text-7xl">
              {tr("Reformas en Ibiza", "Ristrutturazioni a Ibiza", "Renovations in Ibiza", "Renovaties op Ibiza")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
              {tr(
                "Reformas integrales y parciales para villas, apartamentos, fincas y espacios comerciales. Un único equipo para coordinar obra, instalaciones, materiales y acabados.",
                "Ristrutturazioni complete e parziali per ville, appartamenti, fincas e spazi commerciali. Un unico team per coordinare lavori, impianti, materiali e finiture.",
                "Full and partial renovations for villas, apartments, fincas and commercial spaces. One team coordinating works, installations, materials and finishes.",
                "Volledige en gedeeltelijke renovaties voor villa's, appartementen, finca's en commerciële ruimtes. Eén team voor de coördinatie van werken, installaties, materialen en afwerkingen.",
              )}
            </p>
            <div className="mt-7 text-sm font-medium text-white/80">
              {tr(
                "Villas · Apartamentos · Fincas · Locales comerciales",
                "Ville · Appartamenti · Fincas · Locali commerciali",
                "Villas · Apartments · Fincas · Commercial spaces",
                "Villa's · Appartementen · Finca's · Commerciële ruimtes",
              )}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#form" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {tr("Solicitar valoración", "Richiedi una valutazione", "Request an assessment", "Beoordeling aanvragen")}
                <ArrowRight size={16} />
              </a>
              <a
                href={whatsappUrl(tr(
                  "Hola, me gustaría hablar sobre una reforma en Ibiza.",
                  "Ciao, vorrei parlare di una ristrutturazione a Ibiza.",
                  "Hello, I would like to discuss a renovation in Ibiza.",
                  "Hallo, ik wil graag een renovatie op Ibiza bespreken.",
                ))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "landing_google_hero" })}
                className="inline-flex items-center gap-2 rounded-sm border border-white/45 bg-black/15 px-6 py-4 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x">
          <div className="max-w-3xl">
            <div className="eyebrow">{tr("Qué necesitas reformar", "Cosa devi ristrutturare", "What do you need to renovate?", "Wat wil je renoveren?")}</div>
            <h2 className="display-lg mt-4">
              {tr("El punto de partida cambia según la propiedad", "Il punto di partenza cambia in base alla proprietà", "The starting point changes with the property", "Het vertrekpunt verschilt per type pand")}
            </h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projectTypes.map((item) => (
              <article key={item.title} className="flex min-h-full flex-col rounded-sm border border-border bg-background p-6">
                <h3 className="font-display text-3xl">{item.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                <Link to={item.to} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  {tr("Ver detalle", "Vedi dettaglio", "View details", "Bekijk details")} <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight bg-accent/40">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="eyebrow">{tr("Coordinación local", "Coordinamento locale", "Local coordination", "Lokale coördinatie")}</div>
              <h2 className="display-md mt-3">
                {tr("Reformar en Ibiza tiene una operativa propia", "Ristrutturare a Ibiza ha una logica operativa propria", "Renovating in Ibiza has its own operational reality", "Renoveren op Ibiza heeft zijn eigen operationele realiteit")}
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                {tr(
                  "El valor no está en añadir más intermediarios, sino en mantener obra, decisiones y logística bajo una misma coordinación.",
                  "Il valore non sta nell'aggiungere più intermediari, ma nel mantenere lavori, decisioni e logistica sotto un unico coordinamento.",
                  "The value is not in adding more intermediaries, but in keeping works, decisions and logistics under one coordination point.",
                  "De waarde zit niet in meer tussenpersonen, maar in het samenbrengen van werken, beslissingen en logistiek onder één coördinatiepunt.",
                )}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {islandPoints.map((item) => (
                <article key={item.title} className="rounded-sm border border-border bg-background p-6">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="eyebrow">{tr("Cómo trabajamos", "Come lavoriamo", "How we work", "Hoe we werken")}</div>
              <h2 className="display-md mt-3">
                {tr("De la primera valoración a la entrega", "Dalla prima valutazione alla consegna", "From initial assessment to handover", "Van eerste beoordeling tot oplevering")}
              </h2>
            </div>
            <Link to="/the-eivitech-way" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              {tr("Ver el método completo", "Vedi il metodo completo", "View the full method", "Bekijk de volledige werkwijze")} <ArrowRight size={14} />
            </Link>
          </div>
          <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step, index) => (
              <li key={step.title} className="rounded-sm border border-border p-6">
                <div className="font-display text-3xl text-primary">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-tight bg-accent/40">
        <div className="container-x">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">{tr("Casos reales", "Casi reali", "Real cases", "Echte cases")}</div>
              <h2 className="display-md mt-3">
                {tr("Tres propiedades, tres necesidades distintas", "Tre proprietà, tre esigenze diverse", "Three properties, three different needs", "Drie panden, drie verschillende behoeften")}
              </h2>
            </div>
            <Link to="/transformations" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              {tr("Ver todas las transformaciones", "Vedi tutte le trasformazioni", "View all transformations", "Bekijk alle transformaties")} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-9 grid gap-6 lg:grid-cols-3">
            {FEATURED_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 className="display-md mt-3">
              {tr("Antes de pedir una valoración", "Prima di richiedere una valutazione", "Before requesting an assessment", "Voordat je een beoordeling aanvraagt")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tr(
                "Respuestas breves a las preguntas que suelen aparecer al inicio de una reforma en Ibiza.",
                "Risposte brevi alle domande che emergono più spesso all'inizio di una ristrutturazione a Ibiza.",
                "Short answers to the questions that usually come up at the start of a renovation in Ibiza.",
                "Korte antwoorden op vragen die meestal ontstaan aan het begin van een renovatie op Ibiza.",
              )}
            </p>
          </div>
          <FAQAccordion items={reformasFaqs} />
        </div>
      </section>

      <section id="form" className="section-tight bg-ink text-cream scroll-mt-24">
        <div className="container-x grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="text-xs uppercase tracking-[0.24em] text-cream/60">
              {tr("Primera valoración", "Prima valutazione", "Initial assessment", "Eerste beoordeling")}
            </div>
            <h2 className="display-lg mt-4">
              {tr("Cuéntanos tu reforma", "Raccontaci la tua ristrutturazione", "Tell us about your renovation", "Vertel ons over je renovatie")}
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-cream/70">
              {tr(
                "Indica la propiedad, la zona y qué quieres cambiar. Con esa información podemos entender el punto de partida y orientarte sobre el siguiente paso.",
                "Indica la proprietà, la zona e cosa vuoi cambiare. Con queste informazioni possiamo capire il punto di partenza e indicarti il passo successivo.",
                "Tell us about the property, the area and what you want to change. With that information we can understand the starting point and guide the next step.",
                "Vertel ons over het pand, de locatie en wat je wilt veranderen. Met die informatie kunnen we het vertrekpunt begrijpen en de volgende stap aangeven.",
              )}
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <a
                href={whatsappUrl(tr(
                  "Hola, me gustaría comentar mi proyecto de reforma en Ibiza.",
                  "Ciao, vorrei parlare del mio progetto di ristrutturazione a Ibiza.",
                  "Hello, I would like to discuss my renovation project in Ibiza.",
                  "Hallo, ik wil graag mijn renovatieproject op Ibiza bespreken.",
                ))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "landing_google_form" })}
                className="flex items-center gap-3 font-medium text-cream hover:text-white"
              >
                <MessageCircle size={17} /> WhatsApp
              </a>
              <a
                href={SITE.phoneHref}
                onClick={() => track("phone_click", { source: "landing_google_form" })}
                className="flex items-center gap-3 font-medium text-cream hover:text-white"
              >
                <Phone size={17} /> {SITE.phone}
              </a>
            </div>
          </div>
          <div className="rounded-sm bg-background p-6 text-foreground shadow-card md:p-8">
            <h3 className="display-md mb-6">
              {tr("Información del proyecto", "Informazioni sul progetto", "Project information", "Projectinformatie")}
            </h3>
            <LeadQualificationForm source="landing_google" />
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingGoogle;
