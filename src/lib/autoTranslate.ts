import { CURRENT_LANGUAGE, type Language } from "@/lib/i18n";

type TranslationMap = Record<string, string>;

const IT: TranslationMap = {
  "Inicio": "Home",
  "Servicios": "Servizi",
  "Proyectos": "Progetti",
  "Empresa": "Azienda",
  "Contacto": "Contatto",
  "Solicitar valoración": "Richiedi una valutazione",
  "Ver proyectos": "Vedi progetti",
  "Ver todos los servicios →": "Vedi tutti i servizi →",
  "Ver todos →": "Vedi tutti →",
  "Ver todos": "Vedi tutti",
  "Ver servicio": "Vedi servizio",
  "Servicio": "Servizio",
  "Siguiente paso": "Prossimo passo",
  "Hablar por WhatsApp": "Parla su WhatsApp",
  "Área privada": "Area privata",
  "CRM privado": "CRM privato",
  "Sitio": "Sito",
  "Privacidad": "Privacy",
  "Aviso legal": "Note legali",
  "Todos los derechos reservados.": "Tutti i diritti riservati.",
  "Reformas · Instalaciones · Acabados · Ibiza": "Ristrutturazioni · Impianti · Finiture · Ibiza",
  "Reformas integrales": "Ristrutturazioni complete",
  "Electricidad e iluminación": "Elettricità e illuminazione",
  "Albañilería y acabados": "Muratura e finiture",
  "Fontanería": "Idraulica",
  "Cocinas y baños": "Cucine e bagni",
  "Carpintería y soluciones a medida": "Falegnameria e soluzioni su misura",
  "Terrazas y exteriores": "Terrazze ed esterni",
  "Locales comerciales": "Locali commerciali",
  "Reformas e instalaciones en Ibiza para propiedades que necesitan": "Ristrutturazioni e impianti a Ibiza per proprietà che richiedono",
  "gestión, calidad y detalle": "gestione, qualità e cura dei dettagli",
  "Coordinamos reformas, instalaciones y acabados para viviendas, apartamentos, villas y locales comerciales, acompañando al cliente desde la idea inicial hasta el último detalle.": "Coordiniamo ristrutturazioni, impianti e finiture per case, appartamenti, ville e locali commerciali, accompagnando il cliente dall'idea iniziale fino all'ultimo dettaglio.",
  "Coordinamos reformas, instalaciones y acabados en Ibiza, acompañando al cliente desde la idea inicial hasta el último detalle.": "Coordiniamo ristrutturazioni, impianti e finiture a Ibiza, accompagnando il cliente dall'idea iniziale fino all'ultimo dettaglio.",
  "Coordinamos reformas, instalaciones y acabados en Ibiza.": "Coordiniamo ristrutturazioni, impianti e finiture a Ibiza.",
  "El contexto": "Il contesto",
  "Reformar en Ibiza no debería ser una": "Ristrutturare a Ibiza non dovrebbe essere una",
  "preocupación constante": "preoccupazione costante",
  "Cada reforma implica tomar decisiones sobre materiales, profesionales, plazos y detalles. Cuando no hay un referente que coordine, el proyecto se vuelve agotador y se aleja del resultado imaginado.": "Ogni ristrutturazione implica decisioni su materiali, professionisti, tempi e dettagli. Quando manca un referente che coordina, il progetto diventa estenuante e si allontana dal risultato immaginato.",
  "En Ibiza, además, entran en juego logística, disponibilidad de proveedores y particularidades del clima y del entorno. Por eso tiene sentido contar con alguien que se ocupe de gestionarlo todo.": "A Ibiza entrano in gioco anche logistica, disponibilità dei fornitori e particolarità del clima e dell'ambiente. Per questo ha senso avere qualcuno che si occupi di gestire tutto.",
  "La propuesta": "La proposta",
  "Un referente para coordinar la reforma": "Un referente per coordinare la ristrutturazione",
  "de principio a fin": "dall'inizio alla fine",
  "Escuchamos lo que necesitas, definimos juntos la intervención y nos hacemos cargo del proyecto.": "Ascoltiamo ciò di cui hai bisogno, definiamo insieme l'intervento e ci facciamo carico del progetto.",
  "Coordinamos profesionales, materiales, instalaciones y acabados, para que el resultado sea coherente y se cuiden los detalles que marcan la diferencia.": "Coordiniamo professionisti, materiali, impianti e finiture, perché il risultato sia coerente e curato nei dettagli che fanno la differenza.",
  "Un único interlocutor": "Un unico interlocutore",
  "Coordinación de oficios": "Coordinamento dei professionisti",
  "Materiales seleccionados": "Materiali selezionati",
  "Seguimiento hasta el último detalle": "Supervisione fino all'ultimo dettaglio",
  "Lo que coordinamos para tu propiedad": "Cosa coordiniamo per la tua proprietà",
  "Proyectos destacados": "Progetti in evidenza",
  "Casos reales en Ibiza": "Casi reali a Ibiza",
  "Cómo trabajamos": "Come lavoriamo",
  "Un proceso pensado para mantener el control": "Un processo pensato per mantenere il controllo",
  "Desde la primera valoración hasta los detalles finales, mantenemos la comunicación abierta y un referente claro para cada decisión.": "Dalla prima valutazione fino ai dettagli finali, manteniamo una comunicazione aperta e un referente chiaro per ogni decisione.",
  "Trabajamos con": "Lavoriamo con",
  "Propietarios, inversores y clientes que buscan un referente local": "Proprietari, investitori e clienti che cercano un referente locale",
  "Propietarios de viviendas": "Proprietari di abitazioni",
  "Villas y apartamentos": "Ville e appartamenti",
  "Inversores inmobiliarios": "Investitori immobiliari",
  "Preguntas frecuentes": "Domande frequenti",
  "Lo que más nos preguntan": "Le domande più frequenti",
  "Primera valoración": "Prima valutazione",
  "Entendemos qué necesitas y la propiedad.": "Comprendiamo cosa ti serve e la proprietà.",
  "Visita o revisión": "Visita o revisione",
  "Vemos el estado actual y el potencial.": "Valutiamo lo stato attuale e il potenziale.",
  "Presupuesto": "Preventivo",
  "Definimos alcance y propuesta.": "Definiamo ambito e proposta.",
  "Planificación": "Pianificazione",
  "Organizamos oficios, materiales y tiempos.": "Organizziamo professionisti, materiali e tempi.",
  "Ejecución": "Esecuzione",
  "Coordinamos el trabajo y el seguimiento.": "Coordiniamo il lavoro e il monitoraggio.",
  "Entrega": "Consegna",
  "Cuidamos cada detalle final.": "Curiamo ogni dettaglio finale.",
  "Coordinamos la reforma completa de viviendas, apartamentos, villas y locales en Ibiza.": "Coordiniamo la ristrutturazione completa di case, appartamenti, ville e locali a Ibiza.",
  "Instalaciones eléctricas y diseño de iluminación para reformas y obra nueva.": "Impianti elettrici e progettazione dell'illuminazione per ristrutturazioni e nuove opere.",
  "Trabajos de obra, microcemento, pladur, escayola y acabados decorativos.": "Lavori edili, microcemento, cartongesso, gesso decorativo e finiture.",
  "Instalaciones de agua, saneamiento y soluciones para baños y cocinas.": "Impianti idrici, scarichi e soluzioni per bagni e cucine.",
  "Reformas y diseño de cocinas y baños, integrando carpintería, instalaciones y acabados.": "Ristrutturazione e design di cucine e bagni, integrando falegnameria, impianti e finiture.",
  "Cocinas, armarios, revestimientos en madera y carpintería exterior.": "Cucine, armadi, rivestimenti in legno e falegnameria esterna.",
  "Porches, terrazas, iluminación exterior y trabajos en piedra y madera.": "Portici, terrazze, illuminazione esterna e lavori in pietra e legno.",
  "Reformas de bares, restaurantes y locales adaptados al uso comercial.": "Ristrutturazioni di bar, ristoranti e locali adattati all'uso commerciale.",
  "Reformas integrales en Ibiza con gestión, calidad y atención al detalle": "Ristrutturazioni complete a Ibiza con gestione, qualità e attenzione al dettaglio",
  "Electricidad e iluminación a medida": "Elettricità e illuminazione su misura",
  "Albañilería y acabados con detalle": "Muratura e finiture curate nel dettaglio",
  "Fontanería e instalaciones de agua": "Idraulica e impianti idrici",
  "Cocinas y baños diseñados para tu día a día": "Cucine e bagni progettati per la vita quotidiana",
  "Carpintería a medida en madera": "Falegnameria in legno su misura",
  "Terrazas y exteriores con carácter ibicenco": "Terrazze ed esterni con carattere ibizenco",
  "Reformas para locales comerciales en Ibiza": "Ristrutturazioni per locali commerciali a Ibiza",
  "Qué incluye": "Cosa include",
  "Alcance del servicio": "Ambito del servizio",
  "Cuándo solicitarlo": "Quando richiederlo",
  "Casos típicos": "Casi tipici",
  "Ejemplos de intervenciones": "Esempi di interventi",
  "Proyectos relacionados": "Progetti correlati",
  "Casos donde aplicamos este servicio": "Casi in cui applichiamo questo servizio",
  "Antes de solicitar valoración": "Prima di richiedere una valutazione",
  "Otros servicios": "Altri servizi",
  "Contacto | Eivitech Ibiza": "Contatto | Eivitech Ibiza",
  "Cuéntanos qué propiedad quieres reformar": "Raccontaci quale proprietà vuoi ristrutturare",
  "Cuanto más nos cuentes sobre la propiedad y el tipo de intervención, mejor podremos orientarte en la primera valoración.": "Più ci racconti sulla proprietà e sul tipo di intervento, meglio potremo orientarti nella prima valutazione.",
  "Otros canales": "Altri canali",
  "Recopilamos solo los datos necesarios para responder a tu solicitud. Más información en la": "Raccogliamo solo i dati necessari per rispondere alla tua richiesta. Maggiori informazioni nella",
  "política de privacidad": "privacy policy",
  "Nombre *": "Nome *",
  "Teléfono / WhatsApp *": "Telefono / WhatsApp *",
  "Zona de Ibiza": "Zona di Ibiza",
  "Tipo de cliente *": "Tipo di cliente *",
  "Tipo de propiedad *": "Tipo di proprietà *",
  "Tipo de intervención *": "Tipo di intervento *",
  "¿Tiene fotos o vídeo? *": "Hai foto o video? *",
  "¿Proyecto técnico? *": "Progetto tecnico? *",
  "Plazo deseado *": "Tempistica desiderata *",
  "Presupuesto orientativo": "Budget indicativo",
  "Mensaje": "Messaggio",
  "Enviar solicitud": "Invia richiesta",
  "Enviando…": "Invio in corso…",
  "Propietario": "Proprietario",
  "Comprador": "Acquirente",
  "Inversor": "Investitore",
  "Agencia": "Agenzia",
  "Otro": "Altro",
  "Apartamento": "Appartamento",
  "Local comercial": "Locale commerciale",
  "Reforma integral": "Ristrutturazione completa",
  "Baño": "Bagno",
  "Cocina": "Cucina",
  "Instalaciones": "Impianti",
  "Exterior": "Esterno",
  "Sí": "Sì",
  "En proceso": "In corso",
  "Urgente": "Urgente",
  "1 a 3 meses": "1-3 mesi",
  "3 a 6 meses": "3-6 mesi",
  "Sin fecha definida": "Senza data definita",
  "Si ya lo tienes definido": "Se lo hai già definito",
  "Cuéntanos lo que tengas en mente del proyecto.": "Raccontaci cosa hai in mente per il progetto.",
  "Enviar": "Invia",
  "Gracias, hemos recibido tu solicitud": "Grazie, abbiamo ricevuto la tua richiesta",
  "Volver al inicio": "Torna alla home",
  "Empresa | Eivitech Ibiza": "Azienda | Eivitech Ibiza",
  "Un referente local para tu reforma en Ibiza": "Un referente locale per la tua ristrutturazione a Ibiza",
  "Lo que nos guía": "Ciò che ci guida",
  "Trato cercano, gestión clara": "Rapporto diretto, gestione chiara",
  "Cómo acompañamos": "Come ti accompagniamo",
  "Reformar con menos preocupación": "Ristrutturare con meno preoccupazioni",
  "Un proceso claro de principio a fin": "Un processo chiaro dall'inizio alla fine",
  "Todos los proyectos": "Tutti i progetti",
  "Caso": "Caso",
  "Situación y objetivo": "Situazione e obiettivo",
  "Situación inicial": "Situazione iniziale",
  "Objetivo del cliente": "Obiettivo del cliente",
  "Intervenciones": "Interventi",
  "Lo que realizamos": "Cosa abbiamo realizzato",
  "Materiales y detalles": "Materiali e dettagli",
  "Acabados": "Finiture",
  "Resultado": "Risultato",
  "Otros proyectos": "Altri progetti"
};

const EN: TranslationMap = {
  "Inicio": "Home",
  "Servicios": "Services",
  "Proyectos": "Projects",
  "Empresa": "Company",
  "Contacto": "Contact",
  "Solicitar valoración": "Request an assessment",
  "Ver proyectos": "View projects",
  "Ver todos los servicios →": "View all services →",
  "Ver todos →": "View all →",
  "Ver todos": "View all",
  "Ver servicio": "View service",
  "Servicio": "Service",
  "Siguiente paso": "Next step",
  "Hablar por WhatsApp": "Chat on WhatsApp",
  "Área privada": "Private area",
  "CRM privado": "Private CRM",
  "Sitio": "Site",
  "Privacidad": "Privacy",
  "Aviso legal": "Legal notice",
  "Todos los derechos reservados.": "All rights reserved.",
  "Reformas · Instalaciones · Acabados · Ibiza": "Renovations · Installations · Finishes · Ibiza",
  "Reformas integrales": "Full renovations",
  "Electricidad e iluminación": "Electrical and lighting",
  "Albañilería y acabados": "Masonry and finishes",
  "Fontanería": "Plumbing",
  "Cocinas y baños": "Kitchens and bathrooms",
  "Carpintería y soluciones a medida": "Carpentry and tailored solutions",
  "Terrazas y exteriores": "Terraces and outdoor areas",
  "Locales comerciales": "Commercial spaces",
  "Reformas e instalaciones en Ibiza para propiedades que necesitan": "Renovations and installations in Ibiza for properties that need",
  "gestión, calidad y detalle": "management, quality and detail",
  "Coordinamos reformas, instalaciones y acabados para viviendas, apartamentos, villas y locales comerciales, acompañando al cliente desde la idea inicial hasta el último detalle.": "We coordinate renovations, installations and finishes for homes, apartments, villas and commercial spaces, supporting clients from the initial idea to the final detail.",
  "Coordinamos reformas, instalaciones y acabados en Ibiza, acompañando al cliente desde la idea inicial hasta el último detalle.": "We coordinate renovations, installations and finishes in Ibiza, supporting clients from the initial idea to the final detail.",
  "Coordinamos reformas, instalaciones y acabados en Ibiza.": "We coordinate renovations, installations and finishes in Ibiza.",
  "El contexto": "The context",
  "Reformar en Ibiza no debería ser una": "Renovating in Ibiza should not be a",
  "preocupación constante": "constant concern",
  "Cada reforma implica tomar decisiones sobre materiales, profesionales, plazos y detalles. Cuando no hay un referente que coordine, el proyecto se vuelve agotador y se aleja del resultado imaginado.": "Every renovation involves decisions about materials, professionals, timing and details. Without a single point of coordination, the project becomes exhausting and moves away from the expected result.",
  "En Ibiza, además, entran en juego logística, disponibilidad de proveedores y particularidades del clima y del entorno. Por eso tiene sentido contar con alguien que se ocupe de gestionarlo todo.": "In Ibiza, logistics, supplier availability and the island's climate and environment also matter. That is why it makes sense to have someone managing everything.",
  "La propuesta": "The proposal",
  "Un referente para coordinar la reforma": "A point of reference to coordinate the renovation",
  "de principio a fin": "from start to finish",
  "Escuchamos lo que necesitas, definimos juntos la intervención y nos hacemos cargo del proyecto.": "We listen to what you need, define the work together and take care of the project.",
  "Coordinamos profesionales, materiales, instalaciones y acabados, para que el resultado sea coherente y se cuiden los detalles que marcan la diferencia.": "We coordinate professionals, materials, installations and finishes so the result is coherent and the details that make the difference are cared for.",
  "Un único interlocutor": "One single point of contact",
  "Coordinación de oficios": "Trade coordination",
  "Materiales seleccionados": "Selected materials",
  "Seguimiento hasta el último detalle": "Follow-up down to the final detail",
  "Lo que coordinamos para tu propiedad": "What we coordinate for your property",
  "Proyectos destacados": "Featured projects",
  "Casos reales en Ibiza": "Real cases in Ibiza",
  "Cómo trabajamos": "How we work",
  "Un proceso pensado para mantener el control": "A process designed to keep control",
  "Desde la primera valoración hasta los detalles finales, mantenemos la comunicación abierta y un referente claro para cada decisión.": "From the first assessment to the final details, we keep communication open and provide a clear point of reference for every decision.",
  "Trabajamos con": "We work with",
  "Propietarios, inversores y clientes que buscan un referente local": "Owners, investors and clients looking for a local point of reference",
  "Propietarios de viviendas": "Homeowners",
  "Villas y apartamentos": "Villas and apartments",
  "Inversores inmobiliarios": "Real estate investors",
  "Preguntas frecuentes": "Frequently asked questions",
  "Lo que más nos preguntan": "What people ask us most",
  "Primera valoración": "Initial assessment",
  "Entendemos qué necesitas y la propiedad.": "We understand what you need and the property.",
  "Visita o revisión": "Visit or review",
  "Vemos el estado actual y el potencial.": "We review the current state and its potential.",
  "Presupuesto": "Quote",
  "Definimos alcance y propuesta.": "We define scope and proposal.",
  "Planificación": "Planning",
  "Organizamos oficios, materiales y tiempos.": "We organize trades, materials and timing.",
  "Ejecución": "Execution",
  "Coordinamos el trabajo y el seguimiento.": "We coordinate the work and follow-up.",
  "Entrega": "Handover",
  "Cuidamos cada detalle final.": "We take care of every final detail.",
  "Coordinamos la reforma completa de viviendas, apartamentos, villas y locales en Ibiza.": "We coordinate complete renovations of homes, apartments, villas and spaces in Ibiza.",
  "Instalaciones eléctricas y diseño de iluminación para reformas y obra nueva.": "Electrical installations and lighting design for renovations and new builds.",
  "Trabajos de obra, microcemento, pladur, escayola y acabados decorativos.": "Building work, microcement, plasterboard, decorative plaster and finishes.",
  "Instalaciones de agua, saneamiento y soluciones para baños y cocinas.": "Water systems, drainage and solutions for bathrooms and kitchens.",
  "Reformas y diseño de cocinas y baños, integrando carpintería, instalaciones y acabados.": "Kitchen and bathroom renovation and design, integrating carpentry, installations and finishes.",
  "Cocinas, armarios, revestimientos en madera y carpintería exterior.": "Kitchens, wardrobes, wood cladding and outdoor carpentry.",
  "Porches, terrazas, iluminación exterior y trabajos en piedra y madera.": "Porches, terraces, outdoor lighting and stone and wood work.",
  "Reformas de bares, restaurantes y locales adaptados al uso comercial.": "Renovations of bars, restaurants and spaces adapted for commercial use.",
  "Reformas integrales en Ibiza con gestión, calidad y atención al detalle": "Full renovations in Ibiza with management, quality and attention to detail",
  "Electricidad e iluminación a medida": "Tailored electrical and lighting solutions",
  "Albañilería y acabados con detalle": "Detailed masonry and finishes",
  "Fontanería e instalaciones de agua": "Plumbing and water installations",
  "Cocinas y baños diseñados para tu día a día": "Kitchens and bathrooms designed for daily living",
  "Carpintería a medida en madera": "Custom wood carpentry",
  "Terrazas y exteriores con carácter ibicenco": "Outdoor spaces with Ibizan character",
  "Reformas para locales comerciales en Ibiza": "Renovations for commercial spaces in Ibiza",
  "Qué incluye": "What is included",
  "Alcance del servicio": "Service scope",
  "Cuándo solicitarlo": "When to request it",
  "Casos típicos": "Typical cases",
  "Ejemplos de intervenciones": "Examples of work",
  "Proyectos relacionados": "Related projects",
  "Casos donde aplicamos este servicio": "Cases where we apply this service",
  "Antes de solicitar valoración": "Before requesting an assessment",
  "Otros servicios": "Other services",
  "Contacto | Eivitech Ibiza": "Contact | Eivitech Ibiza",
  "Cuéntanos qué propiedad quieres reformar": "Tell us which property you want to renovate",
  "Cuanto más nos cuentes sobre la propiedad y el tipo de intervención, mejor podremos orientarte en la primera valoración.": "The more you tell us about the property and the type of work, the better we can guide you in the first assessment.",
  "Otros canales": "Other channels",
  "Recopilamos solo los datos necesarios para responder a tu solicitud. Más información en la": "We collect only the data needed to respond to your request. More information in the",
  "política de privacidad": "privacy policy",
  "Nombre *": "Name *",
  "Teléfono / WhatsApp *": "Phone / WhatsApp *",
  "Zona de Ibiza": "Area of Ibiza",
  "Tipo de cliente *": "Client type *",
  "Tipo de propiedad *": "Property type *",
  "Tipo de intervención *": "Type of work *",
  "¿Tiene fotos o vídeo? *": "Do you have photos or video? *",
  "¿Proyecto técnico? *": "Technical project? *",
  "Plazo deseado *": "Desired timing *",
  "Presupuesto orientativo": "Indicative budget",
  "Mensaje": "Message",
  "Enviar solicitud": "Send request",
  "Enviando…": "Sending…",
  "Propietario": "Owner",
  "Comprador": "Buyer",
  "Inversor": "Investor",
  "Agencia": "Agency",
  "Otro": "Other",
  "Apartamento": "Apartment",
  "Casa": "House",
  "Local comercial": "Commercial space",
  "Reforma integral": "Full renovation",
  "Baño": "Bathroom",
  "Cocina": "Kitchen",
  "Instalaciones": "Installations",
  "Exterior": "Outdoor",
  "Sí": "Yes",
  "En proceso": "In progress",
  "Urgente": "Urgent",
  "1 a 3 meses": "1 to 3 months",
  "3 a 6 meses": "3 to 6 months",
  "Sin fecha definida": "No defined date",
  "Si ya lo tienes definido": "If you already have it defined",
  "Cuéntanos lo que tengas en mente del proyecto.": "Tell us what you have in mind for the project.",
  "Gracias, hemos recibido tu solicitud": "Thank you, we have received your request",
  "Volver al inicio": "Back to home",
  "Empresa | Eivitech Ibiza": "Company | Eivitech Ibiza",
  "Un referente local para tu reforma en Ibiza": "A local point of reference for your renovation in Ibiza",
  "Lo que nos guía": "What guides us",
  "Trato cercano, gestión clara": "Close service, clear management",
  "Cómo acompañamos": "How we support you",
  "Reformar con menos preocupación": "Renovating with less worry",
  "Un proceso claro de principio a fin": "A clear process from start to finish",
  "Todos los proyectos": "All projects",
  "Caso": "Case",
  "Situación y objetivo": "Situation and goal",
  "Situación inicial": "Initial situation",
  "Objetivo del cliente": "Client goal",
  "Intervenciones": "Work performed",
  "Lo que realizamos": "What we did",
  "Materiales y detalles": "Materials and details",
  "Acabados": "Finishes",
  "Resultado": "Result",
  "Otros proyectos": "Other projects"
};

const DICTIONARIES: Record<Exclude<Language, "es">, TranslationMap> = { it: IT, en: EN, nl: {} };
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);

function normalise(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dictionaryEntries() {
  if (CURRENT_LANGUAGE === "es") return [] as [string, string][];
  return Object.entries(DICTIONARIES[CURRENT_LANGUAGE]).sort((a, b) => b[0].length - a[0].length);
}

function translateText(value: string) {
  if (CURRENT_LANGUAGE === "es") return value;
  const entries = dictionaryEntries();
  const compact = normalise(value);
  const exact = entries.find(([source]) => normalise(source) === compact);

  if (exact) {
    const prefix = value.match(/^\s*/)?.[0] || "";
    const suffix = value.match(/\s*$/)?.[0] || "";
    return `${prefix}${exact[1]}${suffix}`;
  }

  let output = value;
  for (const [source, target] of entries) {
    const pattern = new RegExp(escapeRegExp(source), "g");
    output = output.replace(pattern, target);
  }
  return output;
}

function translateAttributes(element: Element) {
  ["placeholder", "aria-label", "alt", "title"].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;
    const next = translateText(value);
    if (next !== value) element.setAttribute(attribute, next);
  });
}

function translateNode(node: Node) {
  if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return;
  const parent = node.parentElement;
  if (parent && SKIP_TAGS.has(parent.tagName)) return;
  const next = translateText(node.textContent);
  if (next !== node.textContent) node.textContent = next;
}

function translateTree(root: ParentNode) {
  if (root instanceof Element) translateAttributes(root);
  root.querySelectorAll?.("[placeholder],[aria-label],[alt],[title]").forEach(translateAttributes);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateNode(node);
    node = walker.nextNode();
  }
}

export function initAutoTranslate() {
  if (typeof window === "undefined" || CURRENT_LANGUAGE === "es") return;

  const run = () => translateTree(document.body);
  window.requestAnimationFrame(run);
  window.setTimeout(run, 250);
  window.setTimeout(run, 1000);

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) translateNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) translateTree(node as Element);
    }));
  }).observe(document.body, { childList: true, subtree: true });
}
