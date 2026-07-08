import { tr } from "@/lib/i18n";

export type Service = {
  slug: string;
  title: string;
  short: string;
  hero: string;
  intro: string;
  includes: string[];
  whenToAsk: string[];
  examples: string[];
  relatedProjects?: string[];
  metaTitle: string;
  metaDescription: string;
};

export const SERVICES: Service[] = [
  {
    slug: "reformas-integrales",
    title: tr("Reformas integrales", "Ristrutturazioni complete", "Full renovations"),
    short: tr("Coordinamos la reforma completa de viviendas, apartamentos, villas y locales en Ibiza.", "Coordiniamo la ristrutturazione completa di case, appartamenti, ville e locali a Ibiza.", "We coordinate full renovations for homes, apartments, villas and commercial spaces in Ibiza."),
    hero: tr("Reformas integrales en Ibiza con gestión, calidad y atención al detalle", "Ristrutturazioni complete a Ibiza con gestione, qualità e attenzione al dettaglio", "Full renovations in Ibiza with management, quality and attention to detail"),
    intro: tr("Cada propiedad tiene necesidades distintas. Ayudamos a transformar viviendas, apartamentos, villas y locales comerciales combinando planificación, coordinación de profesionales y acabados cuidados.", "Ogni proprietà ha esigenze diverse. Aiutiamo a trasformare case, appartamenti, ville e locali commerciali combinando pianificazione, coordinamento dei professionisti e finiture curate.", "Every property has different needs. We help transform homes, apartments, villas and commercial spaces by combining planning, trade coordination and careful finishes."),
    includes: [
      tr("Valoración inicial del proyecto", "Valutazione iniziale del progetto", "Initial project assessment"),
      tr("Coordinación de oficios y proveedores", "Coordinamento di artigiani e fornitori", "Coordination of trades and suppliers"),
      tr("Albañilería, instalaciones y acabados", "Muratura, impianti e finiture", "Masonry, installations and finishes"),
      tr("Selección de materiales", "Selezione dei materiali", "Material selection"),
      tr("Seguimiento de obra hasta la entrega", "Monitoraggio del cantiere fino alla consegna", "Worksite follow-up until handover"),
    ],
    whenToAsk: [
      tr("Has comprado una propiedad para reformar", "Hai acquistato una proprietà da ristrutturare", "You bought a property to renovate"),
      tr("Quieres renovar tu vivienda habitual o de vacaciones", "Vuoi rinnovare la tua casa principale o vacanze", "You want to renovate your main or holiday home"),
      tr("Necesitas adaptar un local comercial", "Devi adattare un locale commerciale", "You need to adapt a commercial space"),
    ],
    examples: [tr("Redistribución de espacios", "Redistribuzione degli spazi", "Space redistribution"), tr("Sustitución de instalaciones", "Sostituzione degli impianti", "Installation replacement"), tr("Renovación de baños y cocina", "Rinnovo di bagni e cucina", "Bathroom and kitchen renovation"), tr("Acabados decorativos", "Finiture decorative", "Decorative finishes")],
    relatedProjects: ["casa-mediterraneo", "casa-vadella"],
    metaTitle: tr("Reformas integrales en Ibiza | Eivitech", "Ristrutturazioni complete a Ibiza | Eivitech", "Full renovations in Ibiza | Eivitech"),
    metaDescription: tr("Reformas integrales en Ibiza: coordinación, calidad y atención al detalle para viviendas, villas, apartamentos y locales. Solicita valoración.", "Ristrutturazioni complete a Ibiza: coordinamento, qualità e attenzione al dettaglio per case, ville, appartamenti e locali. Richiedi una valutazione.", "Full renovations in Ibiza: coordination, quality and attention to detail for homes, villas, apartments and commercial spaces. Request an assessment."),
  },
  {
    slug: "electricidad-iluminacion",
    title: tr("Electricidad e iluminación", "Elettricità e illuminazione", "Electrical work and lighting"),
    short: tr("Instalaciones eléctricas y diseño de iluminación para reformas y obra nueva.", "Impianti elettrici e progettazione illuminotecnica per ristrutturazioni e nuove opere.", "Electrical installations and lighting design for renovations and new works."),
    hero: tr("Electricidad e iluminación a medida", "Elettricità e illuminazione su misura", "Custom electrical work and lighting"),
    intro: tr("Instalaciones eléctricas, cuadros, puntos de luz y sistemas de iluminación pensados para cada espacio: técnica, decorativa y exterior.", "Impianti elettrici, quadri, punti luce e sistemi di illuminazione pensati per ogni spazio: tecnica, decorativa ed esterna.", "Electrical installations, panels, light points and lighting systems designed for each space: technical, decorative and outdoor."),
    includes: [tr("Instalación eléctrica completa", "Impianto elettrico completo", "Full electrical installation"), tr("Cuadros y protecciones", "Quadri e protezioni", "Panels and protections"), tr("Puntos de luz y mecanismos", "Punti luce e meccanismi", "Light points and switches"), tr("Iluminación LED técnica y decorativa", "Illuminazione LED tecnica e decorativa", "Technical and decorative LED lighting"), tr("Iluminación exterior", "Illuminazione esterna", "Outdoor lighting")],
    whenToAsk: [tr("Reforma integral o parcial", "Ristrutturazione completa o parziale", "Full or partial renovation"), tr("Renovación de instalación antigua", "Rinnovo di impianto datato", "Old installation renovation"), tr("Proyecto de iluminación decorativa", "Progetto di illuminazione decorativa", "Decorative lighting project")],
    examples: [tr("Sistemas LED en interior y exterior", "Sistemi LED interni ed esterni", "Indoor and outdoor LED systems"), tr("Iluminación de terrazas y jardines", "Illuminazione di terrazze e giardini", "Terrace and garden lighting")],
    relatedProjects: ["casa-mediterraneo", "proyecto-paisajismo-exterior"],
    metaTitle: tr("Electricidad e iluminación en Ibiza | Eivitech", "Elettricità e illuminazione a Ibiza | Eivitech", "Electrical work and lighting in Ibiza | Eivitech"),
    metaDescription: tr("Instalaciones eléctricas e iluminación a medida en Ibiza. Reformas, obra nueva y proyectos decorativos.", "Impianti elettrici e illuminazione su misura a Ibiza. Ristrutturazioni, nuove opere e progetti decorativi.", "Custom electrical installations and lighting in Ibiza. Renovations, new works and decorative projects."),
  },
  {
    slug: "albanileria-acabados",
    title: tr("Albañilería y acabados", "Muratura e finiture", "Masonry and finishes"),
    short: tr("Trabajos de obra, microcemento, pladur, escayola y acabados decorativos.", "Lavori edili, microcemento, cartongesso, gesso decorativo e finiture.", "Building works, microcement, plasterboard, decorative plaster and finishes."),
    hero: tr("Albañilería y acabados con detalle", "Muratura e finiture curate nel dettaglio", "Masonry and finishes with attention to detail"),
    intro: tr("De la estructura al último detalle decorativo: albañilería, pladur, escayola, microcemento y acabados pensados para durar y para integrarse en el carácter del proyecto.", "Dalla struttura all'ultimo dettaglio decorativo: muratura, cartongesso, gesso, microcemento e finiture pensate per durare e integrarsi nel carattere del progetto.", "From structure to the final decorative detail: masonry, plasterboard, plaster, microcement and finishes designed to last and fit the project character."),
    includes: [tr("Tabiquería y reforma de espacios", "Tramezzi e riorganizzazione degli spazi", "Partitions and space renovation"), "Pladur", tr("Escayola decorativa", "Gesso decorativo", "Decorative plaster"), "Microcemento", tr("Revestimientos de pared y suelo", "Rivestimenti pareti e pavimenti", "Wall and floor coverings"), tr("Trabajos exteriores en piedra", "Lavori esterni in pietra", "Outdoor stone work")],
    whenToAsk: [tr("Redistribución de espacios", "Redistribuzione degli spazi", "Space redistribution"), tr("Renovación estética", "Rinnovo estetico", "Aesthetic renovation"), tr("Acabados decorativos a medida", "Finiture decorative su misura", "Custom decorative finishes")],
    examples: [tr("Microcemento gris oscuro", "Microcemento grigio scuro", "Dark grey microcement"), tr("Pared en piedra beige ibicenca", "Parete in pietra beige ibizenca", "Beige Ibizan stone wall"), tr("Falsos techos y molduras", "Controsoffitti e modanature", "False ceilings and mouldings")],
    relatedProjects: ["casa-mediterraneo", "proyecto-paisajismo-exterior"],
    metaTitle: tr("Albañilería y acabados en Ibiza | Eivitech", "Muratura e finiture a Ibiza | Eivitech", "Masonry and finishes in Ibiza | Eivitech"),
    metaDescription: tr("Albañilería, microcemento, pladur, escayola y acabados decorativos en Ibiza.", "Muratura, microcemento, cartongesso, gesso decorativo e finiture a Ibiza.", "Masonry, microcement, plasterboard, decorative plaster and finishes in Ibiza."),
  },
  {
    slug: "fontaneria",
    title: tr("Fontanería", "Idraulica", "Plumbing"),
    short: tr("Instalaciones de agua, saneamiento y soluciones para baños y cocinas.", "Impianti idrici, scarichi e soluzioni per bagni e cucine.", "Water installations, drainage and solutions for bathrooms and kitchens."),
    hero: tr("Fontanería e instalaciones de agua", "Idraulica e impianti idrici", "Plumbing and water installations"),
    intro: tr("Instalaciones nuevas, sustituciones y soluciones a medida para baños, cocinas y exteriores.", "Nuovi impianti, sostituzioni e soluzioni su misura per bagni, cucine ed esterni.", "New installations, replacements and custom solutions for bathrooms, kitchens and outdoor areas."),
    includes: [tr("Instalación y renovación de tuberías", "Installazione e rinnovo tubazioni", "Pipe installation and renewal"), tr("Baños y duchas", "Bagni e docce", "Bathrooms and showers"), tr("Conexiones de cocina", "Collegamenti cucina", "Kitchen connections"), tr("Saneamiento", "Scarichi", "Drainage"), tr("Grifería y sanitarios", "Rubinetteria e sanitari", "Taps and sanitaryware")],
    whenToAsk: [tr("Renovación de baño o cocina", "Rinnovo bagno o cucina", "Bathroom or kitchen renovation"), tr("Instalación antigua", "Impianto datato", "Old installation"), tr("Filtraciones o reformas húmedas", "Infiltrazioni o lavori in zone umide", "Leaks or wet-area renovation")],
    examples: [tr("Reforma completa de baños", "Ristrutturazione completa dei bagni", "Full bathroom renovation"), tr("Duchas a medida", "Docce su misura", "Custom showers")],
    relatedProjects: ["casa-mediterraneo", "casa-boas"],
    metaTitle: tr("Fontanería en Ibiza | Eivitech", "Idraulica a Ibiza | Eivitech", "Plumbing in Ibiza | Eivitech"),
    metaDescription: tr("Instalaciones de fontanería para reformas integrales, baños y cocinas en Ibiza.", "Impianti idraulici per ristrutturazioni complete, bagni e cucine a Ibiza.", "Plumbing installations for full renovations, bathrooms and kitchens in Ibiza."),
  },
  {
    slug: "cocinas-banos",
    title: tr("Cocinas y baños", "Cucine e bagni", "Kitchens and bathrooms"),
    short: tr("Reformas y diseño de cocinas y baños, integrando carpintería, instalaciones y acabados.", "Ristrutturazione e design di cucine e bagni, integrando falegnameria, impianti e finiture.", "Kitchen and bathroom renovation and design, integrating carpentry, installations and finishes."),
    hero: tr("Cocinas y baños diseñados para tu día a día", "Cucine e bagni pensati per la vita quotidiana", "Kitchens and bathrooms designed for daily life"),
    intro: tr("Coordinamos diseño, instalaciones, carpintería y acabados para crear cocinas y baños funcionales, duraderos y coherentes con el estilo de la propiedad.", "Coordiniamo design, impianti, falegnameria e finiture per creare cucine e bagni funzionali, durevoli e coerenti con lo stile della proprietà.", "We coordinate design, installations, carpentry and finishes to create functional, durable kitchens and bathrooms aligned with the property style."),
    includes: [tr("Diseño y distribución", "Design e distribuzione", "Design and layout"), tr("Carpintería a medida", "Falegnameria su misura", "Custom carpentry"), tr("Instalaciones eléctricas e hidráulicas", "Impianti elettrici e idraulici", "Electrical and plumbing installations"), tr("Revestimientos y sanitarios", "Rivestimenti e sanitari", "Coverings and sanitaryware"), tr("Electrodomésticos integrados", "Elettrodomestici integrati", "Integrated appliances")],
    whenToAsk: [tr("Renovación parcial o completa", "Rinnovo parziale o completo", "Partial or full renovation"), tr("Cocina a medida", "Cucina su misura", "Custom kitchen"), tr("Baños obsoletos", "Bagni datati", "Outdated bathrooms")],
    examples: [tr("Cocina en madera de roble italiano", "Cucina in rovere italiano", "Italian oak kitchen"), tr("Baños con microcemento", "Bagni con microcemento", "Bathrooms with microcement")],
    relatedProjects: ["casa-mediterraneo"],
    metaTitle: tr("Reformas de cocinas y baños en Ibiza | Eivitech", "Ristrutturazione cucine e bagni a Ibiza | Eivitech", "Kitchen and bathroom renovations in Ibiza | Eivitech"),
    metaDescription: tr("Reformas de cocinas y baños en Ibiza con diseño, carpintería e instalaciones coordinadas.", "Ristrutturazioni di cucine e bagni a Ibiza con design, falegnameria e impianti coordinati.", "Kitchen and bathroom renovations in Ibiza with coordinated design, carpentry and installations."),
  },
  {
    slug: "carpinteria",
    title: tr("Carpintería y soluciones a medida", "Falegnameria e soluzioni su misura", "Carpentry and custom solutions"),
    short: tr("Cocinas, armarios, revestimientos en madera y carpintería exterior.", "Cucine, armadi, rivestimenti in legno e falegnameria esterna.", "Kitchens, wardrobes, wood cladding and outdoor carpentry."),
    hero: tr("Carpintería a medida en madera", "Falegnameria su misura in legno", "Custom wood carpentry"),
    intro: tr("Trabajos en madera para interiores y exteriores, desde cocinas y armarios hasta porches y revestimientos.", "Lavori in legno per interni ed esterni, da cucine e armadi a portici e rivestimenti.", "Wood work for interiors and exteriors, from kitchens and wardrobes to porches and cladding."),
    includes: [tr("Cocinas en madera", "Cucine in legno", "Wood kitchens"), tr("Armarios a medida", "Armadi su misura", "Custom wardrobes"), tr("Revestimientos de madera", "Rivestimenti in legno", "Wood cladding"), tr("Porches y carpintería exterior", "Portici e falegnameria esterna", "Porches and outdoor carpentry")],
    whenToAsk: [tr("Necesitas mobiliario integrado", "Hai bisogno di arredi integrati", "You need integrated furniture"), tr("Quieres incorporar madera natural en interiores", "Vuoi inserire legno naturale negli interni", "You want to include natural wood indoors"), tr("Carpintería exterior para terrazas", "Falegnameria esterna per terrazze", "Outdoor carpentry for terraces")],
    examples: [tr("Cocina en roble italiano", "Cucina in rovere italiano", "Italian oak kitchen"), tr("Porche en madera tratada", "Portico in legno trattato", "Treated wood porch")],
    relatedProjects: ["casa-mediterraneo", "casa-boas", "proyecto-paisajismo-exterior"],
    metaTitle: tr("Carpintería a medida en Ibiza | Eivitech", "Falegnameria su misura a Ibiza | Eivitech", "Custom carpentry in Ibiza | Eivitech"),
    metaDescription: tr("Carpintería a medida en Ibiza: cocinas, armarios, revestimientos y soluciones exteriores en madera.", "Falegnameria su misura a Ibiza: cucine, armadi, rivestimenti e soluzioni esterne in legno.", "Custom carpentry in Ibiza: kitchens, wardrobes, cladding and outdoor wood solutions."),
  },
  {
    slug: "terrazas-exteriores",
    title: tr("Terrazas y exteriores", "Terrazze ed esterni", "Terraces and outdoor areas"),
    short: tr("Porches, terrazas, iluminación exterior y trabajos en piedra y madera.", "Portici, terrazze, illuminazione esterna e lavori in pietra e legno.", "Porches, terraces, outdoor lighting and stone and wood work."),
    hero: tr("Terrazas y exteriores con carácter ibicenco", "Terrazze ed esterni con carattere ibizenco", "Terraces and outdoor areas with Ibizan character"),
    intro: tr("Espacios exteriores diseñados para integrarse con el entorno: madera, piedra, iluminación y soluciones para el clima de Ibiza.", "Spazi esterni pensati per integrarsi con l'ambiente: legno, pietra, illuminazione e soluzioni per il clima di Ibiza.", "Outdoor spaces designed to blend with the setting: wood, stone, lighting and solutions for Ibiza's climate."),
    includes: [tr("Tarimas y revestimientos de madera", "Pedane e rivestimenti in legno", "Wood decking and cladding"), tr("Iluminación LED exterior", "Illuminazione LED esterna", "Outdoor LED lighting"), tr("Trabajos en piedra natural", "Lavori in pietra naturale", "Natural stone work"), tr("Impermeabilizaciones", "Impermeabilizzazioni", "Waterproofing")],
    whenToAsk: [tr("Renovar terraza o porche", "Rinnovare terrazza o portico", "Renovate terrace or porch"), tr("Adecuar espacios exteriores", "Adeguare spazi esterni", "Upgrade outdoor spaces"), tr("Proteger frente al viento marino", "Proteggere dal vento marino", "Protect against sea wind")],
    examples: [tr("Terraza en madera de Indonesia", "Terrazza in legno indonesiano", "Indonesian wood terrace"), tr("Pared en piedra ibicenca", "Parete in pietra ibizenca", "Ibizan stone wall")],
    relatedProjects: ["proyecto-paisajismo-exterior", "casa-boas"],
    metaTitle: tr("Terrazas y exteriores en Ibiza | Eivitech", "Terrazze ed esterni a Ibiza | Eivitech", "Terraces and outdoor areas in Ibiza | Eivitech"),
    metaDescription: tr("Terrazas, porches e iluminación exterior en Ibiza. Trabajos en madera, piedra y soluciones a medida.", "Terrazze, portici e illuminazione esterna a Ibiza. Lavori in legno, pietra e soluzioni su misura.", "Terraces, porches and outdoor lighting in Ibiza. Wood, stone and custom solutions."),
  },
  {
    slug: "locales-comerciales",
    title: tr("Locales comerciales", "Locali commerciali", "Commercial spaces"),
    short: tr("Reformas de bares, restaurantes y locales adaptados al uso comercial.", "Ristrutturazioni di bar, ristoranti e locali adattati all'uso commerciale.", "Renovations of bars, restaurants and spaces adapted for commercial use."),
    hero: tr("Reformas para locales comerciales en Ibiza", "Ristrutturazioni per locali commerciali a Ibiza", "Renovations for commercial spaces in Ibiza"),
    intro: tr("Coordinamos reformas de locales comerciales considerando funcionalidad, normativa y experiencia del cliente final.", "Coordiniamo ristrutturazioni di locali commerciali considerando funzionalità, normativa ed esperienza del cliente finale.", "We coordinate commercial renovations considering functionality, regulations and the final customer experience."),
    includes: [tr("Reforma integral del local", "Ristrutturazione completa del locale", "Full commercial space renovation"), tr("Instalaciones técnicas", "Impianti tecnici", "Technical installations"), tr("Acabados decorativos", "Finiture decorative", "Decorative finishes"), tr("Carpintería y mobiliario", "Falegnameria e arredi", "Carpentry and furniture")],
    whenToAsk: [tr("Apertura de nuevo local", "Apertura di un nuovo locale", "Opening a new space"), tr("Renovación de un negocio existente", "Rinnovo di un'attività esistente", "Renovating an existing business"), tr("Adaptación de espacio comercial", "Adattamento di uno spazio commerciale", "Adapting a commercial space")],
    examples: [tr("Bares cerca del mar", "Bar vicino al mare", "Bars near the sea"), tr("Locales con exigencias estéticas y funcionales", "Locali con esigenze estetiche e funzionali", "Spaces with aesthetic and functional requirements")],
    relatedProjects: ["casa-boas"],
    metaTitle: tr("Reformas de locales comerciales en Ibiza | Eivitech", "Ristrutturazioni di locali commerciali a Ibiza | Eivitech", "Commercial space renovations in Ibiza | Eivitech"),
    metaDescription: tr("Reformas de bares, restaurantes y locales comerciales en Ibiza con enfoque funcional y estético.", "Ristrutturazioni di bar, ristoranti e locali commerciali a Ibiza con approccio funzionale ed estetico.", "Bar, restaurant and commercial space renovations in Ibiza with functional and aesthetic focus."),
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
