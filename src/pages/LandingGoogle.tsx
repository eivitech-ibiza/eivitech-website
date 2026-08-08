import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { ProjectCard } from "@/components/ProjectCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl, SITE } from "@/data/site";
import { track } from "@/lib/tracking";
import { Phone, MessageCircle, Check, ArrowRight } from "lucide-react";
import { serviceJsonLd, faqJsonLd } from "@/lib/seo";
import { tr } from "@/lib/i18n";

const heroImg = `${import.meta.env.BASE_URL}media/projects/casa-vadella/casa-vadella-ibiza-investment-villa-makeover-cover.webp`;

const FEATURED_PROJECT_SLUGS = [
  "investment-oriented-villa-makeover",
  "luxury-mediterranean-villa-renovation",
  "warm-contemporary-apartment-transformation",
  "authentic-ibiza-finca-restoration",
] as const;

const FEATURED_PROJECTS = FEATURED_PROJECT_SLUGS.flatMap((slug) => {
  const project = PROJECTS.find((item) => item.slug === slug);
  return project ? [project] : [];
});

const LandingGoogle = () => {
  const benefits = [
    tr("Un único referente", "Un unico referente", "One point of contact", "Eén vast aanspreekpunt"),
    tr("Coordinación de profesionales", "Coordinamento dei professionisti", "Professional coordination", "Coördinatie van vakmensen"),
    tr("Seguimiento de obra", "Monitoraggio del cantiere", "Worksite follow-up", "Opvolging van de werken"),
    tr("Materiales y acabados cuidados", "Materiali e finiture curate", "Carefully selected materials and finishes", "Zorgvuldig gekozen materialen en afwerkingen"),
  ];

  const challenges = [
    {
      title: tr("Coordinar varios profesionales", "Coordinare più professionisti", "Coordinating several trades", "Meerdere vakmensen coördineren"),
      text: tr(
        "Una reforma puede implicar albañilería, instalaciones, carpintería, pintura y proveedores distintos. Centralizamos la coordinación para que el proyecto avance con una dirección clara.",
        "Una ristrutturazione può coinvolgere muratura, impianti, falegnameria, pittura e fornitori diversi. Centralizziamo il coordinamento perché il progetto proceda con una direzione chiara.",
        "A renovation can involve construction, installations, carpentry, painting and different suppliers. We centralise coordination so the project moves forward with a clear direction.",
        "Een renovatie kan bouw, installaties, schrijnwerk, schilderwerk en verschillende leveranciers omvatten. Wij centraliseren de coördinatie zodat het project met een duidelijke richting vooruitgaat."
      ),
    },
    {
      title: tr("Logística y materiales en una isla", "Logistica e materiali su un'isola", "Island logistics and materials", "Logistiek en materialen op een eiland"),
      text: tr(
        "La elección y llegada de materiales condiciona tiempos y decisiones. Planificamos compras y secuencias de trabajo con antelación para reducir improvisaciones.",
        "La scelta e l'arrivo dei materiali condizionano tempi e decisioni. Pianifichiamo acquisti e sequenze di lavoro in anticipo per ridurre le improvvisazioni.",
        "The choice and arrival of materials affect timing and decisions. We plan purchasing and work sequences in advance to reduce improvisation.",
        "De keuze en levering van materialen beïnvloeden timing en beslissingen. We plannen aankopen en werkvolgorde vooraf om improvisatie te beperken."
      ),
    },
    {
      title: tr("Control del alcance y del presupuesto", "Controllo dell'ambito e del budget", "Scope and budget control", "Controle over scope en budget"),
      text: tr(
        "Antes de ejecutar, buscamos definir qué se hace, qué queda fuera y qué decisiones deben tomarse. Un alcance más claro permite presupuestar y planificar mejor.",
        "Prima di eseguire i lavori, cerchiamo di definire cosa viene fatto, cosa resta escluso e quali decisioni devono essere prese. Un ambito più chiaro permette di preventivare e pianificare meglio.",
        "Before work starts, we aim to define what is included, what is excluded and which decisions need to be made. A clearer scope makes budgeting and planning more reliable.",
        "Voor de uitvoering bepalen we wat inbegrepen is, wat niet en welke beslissingen nodig zijn. Een duidelijkere scope maakt budgettering en planning betrouwbaarder."
      ),
    },
    {
      title: tr("Seguir la obra aunque no estés en Ibiza", "Seguire i lavori anche se non sei a Ibiza", "Following the project when you are away", "Het project volgen wanneer je niet op Ibiza bent"),
      text: tr(
        "Muchos propietarios no están siempre en la isla. Un interlocutor único facilita el seguimiento, la toma de decisiones y la coordinación durante la obra.",
        "Molti proprietari non sono sempre sull'isola. Un unico referente facilita il monitoraggio, le decisioni e il coordinamento durante i lavori.",
        "Many owners are not always on the island. One point of contact makes follow-up, decision-making and coordination during the works easier.",
        "Veel eigenaars zijn niet altijd op het eiland. Eén aanspreekpunt maakt opvolging, besluitvorming en coördinatie tijdens de werken eenvoudiger."
      ),
    },
  ];

  const projectTypes = [
    {
      title: tr("Villas", "Ville", "Villas", "Villa's"),
      text: tr(
        "Reformas completas o parciales de interiores y exteriores, con coordinación de instalaciones, acabados y soluciones a medida.",
        "Ristrutturazioni complete o parziali di interni ed esterni, con coordinamento di impianti, finiture e soluzioni su misura.",
        "Full or partial interior and exterior renovations, coordinating installations, finishes and bespoke solutions.",
        "Volledige of gedeeltelijke renovaties van binnen- en buitenruimtes, met coördinatie van installaties, afwerkingen en maatwerkoplossingen."
      ),
      to: "/servicios/reformas-integrales",
    },
    {
      title: tr("Apartamentos", "Appartamenti", "Apartments", "Appartementen"),
      text: tr(
        "Redistribución, cocinas, baños, iluminación, carpintería y acabados para aprovechar mejor el espacio y elevar su calidad percibida.",
        "Ridisegno degli spazi, cucine, bagni, illuminazione, falegnameria e finiture per sfruttare meglio gli ambienti e aumentarne la qualità percepita.",
        "Layouts, kitchens, bathrooms, lighting, carpentry and finishes to make better use of space and improve perceived quality.",
        "Indeling, keukens, badkamers, verlichting, schrijnwerk en afwerkingen om de ruimte beter te benutten en de ervaren kwaliteit te verhogen."
      ),
      to: "/servicios/cocinas-banos",
    },
    {
      title: tr("Fincas y casas con carácter", "Fincas e case di carattere", "Fincas and character homes", "Finca's en karaktervolle woningen"),
      text: tr(
        "Intervenciones que buscan respetar la identidad de la propiedad y combinar materiales naturales, soluciones técnicas y confort contemporáneo.",
        "Interventi che rispettano l'identità della proprietà combinando materiali naturali, soluzioni tecniche e comfort contemporaneo.",
        "Work designed to respect the identity of the property while combining natural materials, technical solutions and contemporary comfort.",
        "Ingrepen die de identiteit van het pand respecteren en natuurlijke materialen, technische oplossingen en hedendaags comfort combineren."
      ),
      to: "/transformations/authentic-ibiza-finca-restoration",
    },
    {
      title: tr("Locales comerciales", "Locali commerciali", "Commercial spaces", "Commerciële ruimtes"),
      text: tr(
        "Reformas de bares, restaurantes y locales donde funcionalidad, instalaciones, imagen y tiempos de ejecución deben avanzar coordinados.",
        "Ristrutturazioni di bar, ristoranti e locali dove funzionalità, impianti, immagine e tempi di esecuzione devono procedere in modo coordinato.",
        "Renovations for bars, restaurants and commercial spaces where function, installations, image and execution timing need to move together.",
        "Renovaties van bars, restaurants en commerciële ruimtes waar functionaliteit, installaties, uitstraling en uitvoering op elkaar moeten aansluiten."
      ),
      to: "/servicios/locales-comerciales",
    },
  ];

  const process = [
    {
      title: tr("Primera valoración", "Prima valutazione", "Initial assessment", "Eerste beoordeling"),
      text: tr("Entendemos la propiedad, el objetivo, la zona y el tipo de intervención.", "Comprendiamo la proprietà, l'obiettivo, la zona e il tipo di intervento.", "We understand the property, objective, location and type of work.", "We brengen het pand, het doel, de locatie en het type ingreep in kaart."),
    },
    {
      title: tr("Visita o revisión", "Visita o revisione", "Visit or review", "Bezoek of beoordeling"),
      text: tr("Revisamos el estado actual y la información disponible para concretar necesidades.", "Esaminiamo lo stato attuale e le informazioni disponibili per definire le necessità.", "We review the current condition and available information to define the needs.", "We beoordelen de huidige staat en beschikbare informatie om de behoeften te bepalen."),
    },
    {
      title: tr("Alcance y presupuesto", "Ambito e preventivo", "Scope and proposal", "Scope en voorstel"),
      text: tr("Ordenamos partidas, prioridades y decisiones para construir una propuesta más clara.", "Ordiniamo voci, priorità e decisioni per costruire una proposta più chiara.", "We organise work items, priorities and decisions to build a clearer proposal.", "We ordenen werkzaamheden, prioriteiten en beslissingen om tot een duidelijker voorstel te komen."),
    },
    {
      title: tr("Planificación", "Pianificazione", "Planning", "Planning"),
      text: tr("Coordinamos profesionales, materiales y secuencia de trabajos antes de ejecutar.", "Coordiniamo professionisti, materiali e sequenza dei lavori prima dell'esecuzione.", "We coordinate professionals, materials and work sequence before execution.", "We coördineren vakmensen, materialen en werkvolgorde vóór de uitvoering."),
    },
    {
      title: tr("Ejecución y seguimiento", "Esecuzione e monitoraggio", "Execution and follow-up", "Uitvoering en opvolging"),
      text: tr("Seguimos la obra, resolvemos incidencias y mantenemos las decisiones alineadas con el proyecto.", "Seguiamo i lavori, gestiamo gli imprevisti e manteniamo le decisioni allineate al progetto.", "We follow the works, resolve issues and keep decisions aligned with the project.", "We volgen de werken op, lossen problemen op en houden beslissingen afgestemd op het project."),
    },
    {
      title: tr("Revisión y entrega", "Revisione e consegna", "Review and handover", "Controle en oplevering"),
      text: tr("Revisamos detalles y acabados antes de dar por finalizada la intervención.", "Rivediamo dettagli e finiture prima di considerare concluso l'intervento.", "We review details and finishes before considering the work complete.", "We controleren details en afwerkingen voordat we het project als voltooid beschouwen."),
    },
  ];

  const reasons = [
    {
      title: tr("Gestión centralizada", "Gestione centralizzata", "Centralised management", "Gecentraliseerd beheer"),
      text: tr("Un único referente reduce conversaciones dispersas y ayuda a mantener una visión global del proyecto.", "Un unico referente riduce le comunicazioni frammentate e aiuta a mantenere una visione globale del progetto.", "One point of contact reduces fragmented conversations and helps maintain a complete view of the project.", "Eén aanspreekpunt vermindert versnipperde communicatie en helpt het volledige project te overzien."),
    },
    {
      title: tr("Decisiones con contexto", "Decisioni con contesto", "Decisions with context", "Beslissingen met context"),
      text: tr("Materiales, instalaciones, distribución y acabados se valoran como partes de un mismo resultado, no como decisiones aisladas.", "Materiali, impianti, distribuzione e finiture vengono valutati come parti dello stesso risultato, non come decisioni isolate.", "Materials, installations, layout and finishes are considered as parts of one result rather than isolated decisions.", "Materialen, installaties, indeling en afwerkingen worden bekeken als onderdelen van één geheel, niet als losse beslissingen."),
    },
    {
      title: tr("Atención al detalle", "Attenzione ai dettagli", "Attention to detail", "Aandacht voor detail"),
      text: tr("La percepción final depende tanto de la ejecución general como de encuentros, remates, carpinterías, iluminación y acabados.", "La percezione finale dipende tanto dall'esecuzione generale quanto da raccordi, dettagli, falegnameria, illuminazione e finiture.", "The final perception depends on both the overall execution and the junctions, details, carpentry, lighting and finishes.", "De uiteindelijke uitstraling hangt af van zowel de algemene uitvoering als aansluitingen, details, schrijnwerk, verlichting en afwerkingen."),
    },
    {
      title: tr("Experiencia local", "Esperienza locale", "Local experience", "Lokale ervaring"),
      text: tr("Trabajamos con proyectos y proveedores en Ibiza, adaptando la planificación a la realidad operativa de la isla.", "Lavoriamo con progetti e fornitori a Ibiza, adattando la pianificazione alla realtà operativa dell'isola.", "We work with projects and suppliers in Ibiza, adapting planning to the operational reality of the island.", "We werken met projecten en leveranciers op Ibiza en stemmen de planning af op de operationele realiteit van het eiland."),
    },
  ];

  const reformasFaqs = [
    {
      q: tr("¿Realizáis reformas integrales y parciales en Ibiza?", "Realizzate ristrutturazioni complete e parziali a Ibiza?", "Do you carry out full and partial renovations in Ibiza?", "Voeren jullie volledige en gedeeltelijke renovaties uit op Ibiza?"),
      a: tr("Sí. El alcance puede ir desde una intervención parcial hasta una reforma completa, según la propiedad, las necesidades y la planificación del proyecto.", "Sì. L'ambito può andare da un intervento parziale a una ristrutturazione completa, in base alla proprietà, alle esigenze e alla pianificazione del progetto.", "Yes. The scope can range from partial work to a full renovation, depending on the property, requirements and project planning.", "Ja. De scope kan variëren van een gedeeltelijke ingreep tot een volledige renovatie, afhankelijk van het pand, de behoeften en de projectplanning."),
    },
    {
      q: tr("¿Qué tipo de propiedades reformáis?", "Che tipo di proprietà ristrutturate?", "What types of properties do you renovate?", "Welke soorten panden renoveren jullie?"),
      a: tr("Trabajamos en villas, apartamentos, viviendas, fincas y locales comerciales en distintas zonas de Ibiza.", "Lavoriamo su ville, appartamenti, abitazioni, fincas e locali commerciali in diverse zone di Ibiza.", "We work on villas, apartments, homes, fincas and commercial spaces in different areas of Ibiza.", "We werken aan villa's, appartementen, woningen, finca's en commerciële ruimtes in verschillende delen van Ibiza."),
    },
    {
      q: tr("¿Podéis gestionar la reforma si no estoy siempre en Ibiza?", "Potete gestire la ristrutturazione se non sono sempre a Ibiza?", "Can you manage the renovation if I am not always in Ibiza?", "Kunnen jullie de renovatie beheren als ik niet altijd op Ibiza ben?"),
      a: tr("Sí. La gestión con un único interlocutor facilita el seguimiento, la coordinación y la toma de decisiones cuando el propietario no está de forma permanente en la isla.", "Sì. La gestione con un unico referente facilita il monitoraggio, il coordinamento e le decisioni quando il proprietario non è sempre presente sull'isola.", "Yes. Having one point of contact makes follow-up, coordination and decision-making easier when the owner is not permanently on the island.", "Ja. Eén vast aanspreekpunt maakt opvolging, coördinatie en besluitvorming eenvoudiger wanneer de eigenaar niet permanent op het eiland is."),
    },
    {
      q: tr("¿Necesito tener ya un proyecto técnico?", "Devo avere già un progetto tecnico?", "Do I need to already have a technical project?", "Moet ik al een technisch project hebben?"),
      a: tr("No necesariamente. Podemos hacer una primera valoración a partir de la información disponible. Si ya existe un proyecto técnico o un arquitecto, trabajamos a partir de esa documentación.", "Non necessariamente. Possiamo fare una prima valutazione sulla base delle informazioni disponibili. Se esiste già un progetto tecnico o un architetto, lavoriamo a partire da quella documentazione.", "Not necessarily. We can make an initial assessment based on the available information. If a technical project or architect is already involved, we work from that documentation.", "Niet noodzakelijk. We kunnen een eerste beoordeling maken op basis van de beschikbare informatie. Als er al een technisch project of architect is, werken we vanuit die documentatie."),
    },
    {
      q: tr("¿Cuánto cuesta una reforma en Ibiza?", "Quanto costa una ristrutturazione a Ibiza?", "How much does a renovation in Ibiza cost?", "Hoeveel kost een renovatie op Ibiza?"),
      a: tr("Depende del estado de la propiedad, superficie, instalaciones, materiales, nivel de acabado y alcance real del trabajo. Por eso preferimos definir primero el proyecto antes de dar una cifra poco fiable.", "Dipende dallo stato della proprietà, dalla superficie, dagli impianti, dai materiali, dal livello delle finiture e dall'ambito reale dei lavori. Per questo preferiamo definire prima il progetto anziché dare una cifra poco affidabile.", "It depends on the condition of the property, size, installations, materials, finish level and actual scope of work. We therefore prefer to define the project before giving an unreliable figure.", "Dat hangt af van de staat van het pand, de oppervlakte, installaties, materialen, afwerkingsniveau en werkelijke scope. Daarom bepalen we liever eerst het project dan een onbetrouwbaar bedrag te noemen."),
    },
    {
      q: tr("¿Cuánto tiempo puede durar una reforma?", "Quanto può durare una ristrutturazione?", "How long can a renovation take?", "Hoe lang kan een renovatie duren?"),
      a: tr("La duración depende del alcance, la complejidad, las decisiones pendientes y la disponibilidad de materiales y profesionales. La planificación se concreta una vez definido el proyecto.", "La durata dipende dall'ambito, dalla complessità, dalle decisioni ancora da prendere e dalla disponibilità di materiali e professionisti. La pianificazione viene definita una volta chiarito il progetto.", "Duration depends on scope, complexity, pending decisions and the availability of materials and professionals. The schedule is defined once the project is clear.", "De duur hangt af van de scope, complexiteit, openstaande beslissingen en beschikbaarheid van materialen en vakmensen. De planning wordt bepaald zodra het project duidelijk is."),
    },
    {
      q: tr("¿Qué necesitáis para una primera valoración?", "Cosa vi serve per una prima valutazione?", "What do you need for an initial assessment?", "Wat hebben jullie nodig voor een eerste beoordeling?"),
      a: tr("Tipo de propiedad, zona aproximada, una descripción de lo que quieres cambiar y, si los tienes, fotos, vídeos o planos. Con esa información podemos orientar mejor el siguiente paso.", "Tipo di proprietà, zona approssimativa, una descrizione di ciò che vuoi cambiare e, se disponibili, foto, video o planimetrie. Con queste informazioni possiamo indicare meglio il passo successivo.", "Property type, approximate location, a description of what you want to change and, if available, photos, videos or plans. With that information we can better guide the next step.", "Type pand, globale locatie, een beschrijving van wat je wilt veranderen en, indien beschikbaar, foto's, video's of plannen. Met die informatie kunnen we de volgende stap beter bepalen."),
    },
  ];

  return (
    <>
      <SEO
        title={tr("Reformas en Ibiza | Empresa de reformas y renovaciones", "Ristrutturazioni a Ibiza | Impresa di ristrutturazioni e rinnovi", "Renovations in Ibiza | Renovation company", "Renovaties op Ibiza | Renovatiebedrijf")}
        description={tr("Empresa de reformas en Ibiza para villas, apartamentos y locales. Coordinación, calidad y atención al detalle. Solicita valoración.", "Impresa di ristrutturazioni a Ibiza per ville, appartamenti e locali. Coordinamento, qualità e attenzione al dettaglio. Richiedi una valutazione.", "Renovation company in Ibiza for villas, apartments and commercial spaces. Coordination, quality and attention to detail. Request an assessment.", "Renovatiebedrijf op Ibiza voor villa's, appartementen en commerciële ruimtes. Coördinatie, kwaliteit en aandacht voor detail.")}
        path="/reformas-ibiza"
        trackAs="google_landing_view"
        jsonLd={[
          serviceJsonLd(
            tr("Reformas en Ibiza", "Ristrutturazioni a Ibiza", "Renovations in Ibiza", "Renovaties op Ibiza"),
            tr("Reformas integrales y parciales en Ibiza con coordinación completa del proyecto.", "Ristrutturazioni complete e parziali a Ibiza con coordinamento completo del progetto.", "Full and partial renovations in Ibiza with complete project coordination.", "Volledige en gedeeltelijke renovaties op Ibiza met complete projectcoördinatie.")
          ),
          faqJsonLd(reformasFaqs),
        ]}
      />

      <section className="relative isolate min-h-[72vh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt={tr("Reforma de villa en Ibiza", "Ristrutturazione di villa a Ibiza", "Villa renovation in Ibiza", "Villa renovatie op Ibiza")}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />
        </div>
        <div className="container-x flex min-h-[72vh] items-center py-16 md:py-24">
          <div className="max-w-4xl text-white">
            <div className="text-xs uppercase tracking-[0.28em] text-white/75">
              {tr("Reformas · Ibiza", "Ristrutturazioni · Ibiza", "Renovations · Ibiza", "Renovaties · Ibiza")}
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.96] drop-shadow-sm md:text-7xl">
              {tr("Reformas en Ibiza con gestión, calidad y atención al detalle", "Ristrutturazioni a Ibiza con gestione, qualità e attenzione al dettaglio", "Renovations in Ibiza with management, quality and attention to detail", "Renovaties op Ibiza met beheer, kwaliteit en aandacht voor detail")}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
              {tr("Coordinamos reformas completas y parciales para villas, apartamentos, fincas y locales comerciales. Un único interlocutor para ordenar profesionales, materiales, decisiones y ejecución.", "Coordiniamo ristrutturazioni complete e parziali per ville, appartamenti, fincas e locali commerciali. Un unico referente per organizzare professionisti, materiali, decisioni ed esecuzione.", "We coordinate full and partial renovations for villas, apartments, fincas and commercial spaces. One point of contact to organise professionals, materials, decisions and execution.", "We coördineren volledige en gedeeltelijke renovaties voor villa's, appartementen, finca's en commerciële ruimtes. Eén aanspreekpunt voor vakmensen, materialen, beslissingen en uitvoering.")}
            </p>
            <ul className="mt-8 grid max-w-3xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-white/95 md:text-base">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/20">
                    <Check size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#form" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {tr("Cuéntanos tu proyecto", "Raccontaci il tuo progetto", "Tell us about your project", "Vertel ons over je project")}
                <ArrowRight size={16} />
              </a>
              <a
                href={whatsappUrl(tr("Hola, me gustaría hablar sobre una reforma en Ibiza.", "Ciao, vorrei parlare di una ristrutturazione a Ibiza.", "Hello, I would like to discuss a renovation in Ibiza.", "Hallo, ik wil graag een renovatie op Ibiza bespreken."))}
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

      <section className="section">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <div className="eyebrow">{tr("La realidad de reformar en Ibiza", "La realtà di ristrutturare a Ibiza", "The reality of renovating in Ibiza", "De realiteit van renoveren op Ibiza")}</div>
              <h2 className="display-lg mt-4">
                {tr("Una buena reforma necesita algo más que buenos profesionales", "Una buona ristrutturazione richiede più che bravi professionisti", "A good renovation needs more than good trades", "Een goede renovatie vraagt meer dan goede vakmensen")}
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {tr("El reto está en hacer que todas las piezas funcionen juntas: alcance, decisiones, materiales, instalaciones, oficios, tiempos y acabados. Eivitech actúa como punto de coordinación para mantener esa visión global durante el proyecto.", "La sfida è far funzionare insieme tutte le parti: ambito, decisioni, materiali, impianti, professionisti, tempi e finiture. Eivitech agisce come punto di coordinamento per mantenere questa visione globale durante il progetto.", "The challenge is making every part work together: scope, decisions, materials, installations, trades, timing and finishes. Eivitech acts as the coordination point that keeps that complete view throughout the project.", "De uitdaging is om alle onderdelen samen te laten werken: scope, beslissingen, materialen, installaties, vakmensen, timing en afwerking. Eivitech fungeert als coördinatiepunt en bewaakt het totaalbeeld gedurende het project.")}
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {challenges.map((item) => (
              <article key={item.title} className="rounded-sm border border-border bg-background p-7 md:p-8">
                <h3 className="font-display text-3xl">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-accent/40">
        <div className="container-x">
          <div className="max-w-3xl">
            <div className="eyebrow">{tr("Qué reformamos", "Cosa ristrutturiamo", "What we renovate", "Wat we renoveren")}</div>
            <h2 className="display-lg mt-4">
              {tr("Una gestión adaptada al tipo de propiedad", "Una gestione adattata al tipo di proprietà", "Management adapted to the type of property", "Beheer afgestemd op het type pand")}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {tr("No todas las reformas tienen las mismas prioridades. Adaptamos la coordinación al uso del inmueble, su estado y el resultado que buscas.", "Non tutte le ristrutturazioni hanno le stesse priorità. Adattiamo il coordinamento all'uso dell'immobile, al suo stato e al risultato che cerchi.", "Not every renovation has the same priorities. We adapt coordination to the property's use, condition and the result you want to achieve.", "Niet elke renovatie heeft dezelfde prioriteiten. We stemmen de coördinatie af op het gebruik, de staat van het pand en het gewenste resultaat.")}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {projectTypes.map((item) => (
              <article key={item.title} className="flex min-h-full flex-col rounded-sm border border-border bg-background p-6">
                <h3 className="font-display text-3xl">{item.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                <Link to={item.to} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  {tr("Ver más", "Scopri di più", "Learn more", "Meer bekijken")} <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="max-w-3xl">
            <div className="eyebrow">{tr("Nuestro modo de trabajar", "Il nostro modo di lavorare", "How we work", "Onze werkwijze")}</div>
            <h2 className="display-lg mt-4">{tr("Un proceso claro, sin comprimir las decisiones", "Un processo chiaro, senza comprimere le decisioni", "A clear process without compressing the decisions", "Een duidelijk proces zonder beslissingen te forceren")}</h2>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((step, index) => (
              <li key={step.title} className="rounded-sm border border-border bg-background p-7 md:p-8">
                <div className="font-display text-4xl text-primary">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="mt-5 font-display text-2xl leading-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-accent/40">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">{tr("Proyectos reales", "Progetti reali", "Real projects", "Echte projecten")}</div>
              <h2 className="display-lg mt-4">{tr("Distintas propiedades, distintas soluciones", "Proprietà diverse, soluzioni diverse", "Different properties, different solutions", "Verschillende panden, verschillende oplossingen")}</h2>
            </div>
            <Link to="/transformations" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              {tr("Ver todas las transformaciones", "Vedi tutte le trasformazioni", "View all transformations", "Bekijk alle transformaties")} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {FEATURED_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </div>
      </section>

      <section className="section bg-ink text-cream">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-cream/60">Eivitech Ibiza</div>
              <h2 className="display-lg mt-4">{tr("Qué aporta un único referente", "Cosa offre un unico referente", "What one point of contact changes", "Wat één aanspreekpunt verandert")}</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-sm border border-cream/15 bg-cream/15 sm:grid-cols-2">
              {reasons.map((item) => (
                <article key={item.title} className="bg-ink p-7 md:p-8">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/70">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 className="display-lg mt-4">{tr("Antes de empezar una reforma en Ibiza", "Prima di iniziare una ristrutturazione a Ibiza", "Before starting a renovation in Ibiza", "Voor je aan een renovatie op Ibiza begint")}</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {tr("Estas son algunas de las preguntas que más influyen en la primera fase de un proyecto.", "Queste sono alcune delle domande che incidono maggiormente sulla prima fase di un progetto.", "These are some of the questions that most affect the first stage of a project.", "Dit zijn enkele vragen die de eerste fase van een project het meest beïnvloeden.")}
            </p>
          </div>
          <FAQAccordion items={reformasFaqs} />
        </div>
      </section>

      <section id="form" className="section bg-accent/40 scroll-mt-24">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="eyebrow">{tr("Tu proyecto", "Il tuo progetto", "Your project", "Jouw project")}</div>
            <h2 className="display-lg mt-4">{tr("Cuéntanos qué quieres transformar", "Raccontaci cosa vuoi trasformare", "Tell us what you want to transform", "Vertel ons wat je wilt transformeren")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {tr("Con algunos datos sobre la propiedad podemos entender mejor el punto de partida y proponerte el siguiente paso. El formulario está aquí, al final, después de toda la información útil de la página.", "Con alcuni dati sulla proprietà possiamo capire meglio il punto di partenza e proporti il passo successivo. Il modulo è qui, alla fine, dopo tutte le informazioni utili della pagina.", "With a few details about the property we can better understand the starting point and suggest the next step. The form is here at the end, after the useful information on the page.", "Met enkele gegevens over het pand kunnen we het vertrekpunt beter begrijpen en de volgende stap voorstellen. Het formulier staat hier aan het einde, na alle nuttige informatie op de pagina.")}
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <a
                href={whatsappUrl(tr("Hola, me gustaría comentar mi proyecto de reforma en Ibiza.", "Ciao, vorrei parlare del mio progetto di ristrutturazione a Ibiza.", "Hello, I would like to discuss my renovation project in Ibiza.", "Hallo, ik wil graag mijn renovatieproject op Ibiza bespreken."))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "landing_google_form" })}
                className="flex items-center gap-3 font-medium text-foreground hover:text-primary"
              >
                <MessageCircle size={17} className="text-primary" /> WhatsApp
              </a>
              <a href={SITE.phoneHref} onClick={() => track("phone_click", { source: "landing_google_form" })} className="flex items-center gap-3 font-medium text-foreground hover:text-primary">
                <Phone size={17} className="text-primary" /> {SITE.phone}
              </a>
            </div>
          </div>
          <div className="rounded-sm border border-border bg-background p-6 shadow-card md:p-8">
            <div className="eyebrow">{tr("Primera valoración", "Prima valutazione", "Initial assessment", "Eerste beoordeling")}</div>
            <h3 className="display-md mt-2 mb-6">{tr("Información para entender tu proyecto", "Informazioni per capire il tuo progetto", "Information to understand your project", "Informatie om je project te begrijpen")}</h3>
            <LeadQualificationForm source="landing_google" />
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingGoogle;
