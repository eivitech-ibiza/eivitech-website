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
    title: "Reformas integrales",
    short: "Coordinamos la reforma completa de viviendas, apartamentos, villas y locales en Ibiza.",
    hero: "Reformas integrales en Ibiza con gestión, calidad y atención al detalle",
    intro:
      "Cada propiedad tiene necesidades distintas. Ayudamos a transformar viviendas, apartamentos, villas y locales comerciales combinando planificación, coordinación de profesionales y acabados cuidados.",
    includes: [
      "Valoración inicial del proyecto",
      "Coordinación de oficios y proveedores",
      "Albañilería, instalaciones y acabados",
      "Selección de materiales",
      "Seguimiento de obra hasta la entrega",
    ],
    whenToAsk: [
      "Has comprado una propiedad para reformar",
      "Quieres renovar tu vivienda habitual o de vacaciones",
      "Necesitas adaptar un local comercial",
    ],
    examples: ["Redistribución de espacios", "Sustitución de instalaciones", "Renovación de baños y cocina", "Acabados decorativos"],
    relatedProjects: ["apartamento-marina-botafoch", "casa-sant-josep"],
    metaTitle: "Reformas integrales en Ibiza | Eivitech",
    metaDescription:
      "Reformas integrales en Ibiza: coordinación, calidad y atención al detalle para viviendas, villas, apartamentos y locales. Solicita valoración.",
  },
  {
    slug: "electricidad-iluminacion",
    title: "Electricidad e iluminación",
    short: "Instalaciones eléctricas y diseño de iluminación para reformas y obra nueva.",
    hero: "Electricidad e iluminación a medida",
    intro:
      "Instalaciones eléctricas, cuadros, puntos de luz y sistemas de iluminación pensados para cada espacio: técnica, decorativa y exterior.",
    includes: ["Instalación eléctrica completa", "Cuadros y protecciones", "Puntos de luz y mecanismos", "Iluminación LED técnica y decorativa", "Iluminación exterior"],
    whenToAsk: ["Reforma integral o parcial", "Renovación de instalación antigua", "Proyecto de iluminación decorativa"],
    examples: ["Sistemas LED en interior y exterior", "Iluminación de terrazas y jardines"],
    relatedProjects: ["apartamento-marina-botafoch", "urbanizacion-valverde"],
    metaTitle: "Electricidad e iluminación en Ibiza | Eivitech",
    metaDescription: "Instalaciones eléctricas e iluminación a medida en Ibiza. Reformas, obra nueva y proyectos decorativos.",
  },
  {
    slug: "albanileria-acabados",
    title: "Albañilería y acabados",
    short: "Trabajos de obra, microcemento, pladur, escayola y acabados decorativos.",
    hero: "Albañilería y acabados con detalle",
    intro:
      "De la estructura al último detalle decorativo: albañilería, pladur, escayola, microcemento y acabados pensados para durar y para integrarse en el carácter del proyecto.",
    includes: ["Tabiquería y reforma de espacios", "Pladur y escayola decorativa", "Microcemento", "Revestimientos de pared y suelo", "Trabajos exteriores en piedra"],
    whenToAsk: ["Redistribución de espacios", "Renovación estética", "Acabados decorativos a medida"],
    examples: ["Microcemento gris oscuro", "Pared en piedra beige ibicenca", "Falsos techos y molduras"],
    relatedProjects: ["apartamento-marina-botafoch", "urbanizacion-valverde"],
    metaTitle: "Albañilería y acabados en Ibiza | Eivitech",
    metaDescription: "Albañilería, microcemento, pladur, escayola y acabados decorativos en Ibiza.",
  },
  {
    slug: "fontaneria",
    title: "Fontanería",
    short: "Instalaciones de agua, saneamiento y soluciones para baños y cocinas.",
    hero: "Fontanería e instalaciones de agua",
    intro: "Instalaciones nuevas, sustituciones y soluciones a medida para baños, cocinas y exteriores.",
    includes: ["Instalación y renovación de tuberías", "Baños y duchas", "Conexiones de cocina", "Saneamiento", "Grifería y sanitarios"],
    whenToAsk: ["Renovación de baño o cocina", "Instalación antigua", "Filtraciones o reformas húmedas"],
    examples: ["Reforma completa de baños", "Duchas a medida"],
    relatedProjects: ["apartamento-marina-botafoch", "true-bar"],
    metaTitle: "Fontanería en Ibiza | Eivitech",
    metaDescription: "Instalaciones de fontanería para reformas integrales, baños y cocinas en Ibiza.",
  },
  {
    slug: "cocinas-banos",
    title: "Cocinas y baños",
    short: "Reformas y diseño de cocinas y baños, integrando carpintería, instalaciones y acabados.",
    hero: "Cocinas y baños diseñados para tu día a día",
    intro:
      "Coordinamos diseño, instalaciones, carpintería y acabados para crear cocinas y baños funcionales, duraderos y coherentes con el estilo de la propiedad.",
    includes: ["Diseño y distribución", "Carpintería a medida", "Instalaciones eléctricas e hidráulicas", "Revestimientos y sanitarios", "Electrodomésticos integrados"],
    whenToAsk: ["Renovación parcial o completa", "Cocina a medida", "Baños obsoletos"],
    examples: ["Cocina en madera de roble italiano", "Baños con microcemento"],
    relatedProjects: ["apartamento-marina-botafoch"],
    metaTitle: "Reformas de cocinas y baños en Ibiza | Eivitech",
    metaDescription: "Reformas de cocinas y baños en Ibiza con diseño, carpintería e instalaciones coordinadas.",
  },
  {
    slug: "carpinteria",
    title: "Carpintería y soluciones a medida",
    short: "Cocinas, armarios, revestimientos en madera y carpintería exterior.",
    hero: "Carpintería a medida en madera",
    intro: "Trabajos en madera para interiores y exteriores, desde cocinas y armarios hasta porches y revestimientos.",
    includes: ["Cocinas en madera", "Armarios a medida", "Revestimientos de madera", "Porches y carpintería exterior"],
    whenToAsk: ["Necesitas mobiliario integrado", "Quieres incorporar madera natural en interiores", "Carpintería exterior para terrazas"],
    examples: ["Cocina en roble italiano", "Porche en madera tratada"],
    relatedProjects: ["apartamento-marina-botafoch", "true-bar", "urbanizacion-valverde"],
    metaTitle: "Carpintería a medida en Ibiza | Eivitech",
    metaDescription: "Carpintería a medida en Ibiza: cocinas, armarios, revestimientos y soluciones exteriores en madera.",
  },
  {
    slug: "terrazas-exteriores",
    title: "Terrazas y exteriores",
    short: "Porches, terrazas, iluminación exterior y trabajos en piedra y madera.",
    hero: "Terrazas y exteriores con carácter ibicenco",
    intro: "Espacios exteriores diseñados para integrarse con el entorno: madera, piedra, iluminación y soluciones para el clima de Ibiza.",
    includes: ["Tarimas y revestimientos de madera", "Iluminación LED exterior", "Trabajos en piedra natural", "Impermeabilizaciones"],
    whenToAsk: ["Renovar terraza o porche", "Adecuar espacios exteriores", "Proteger frente al viento marino"],
    examples: ["Terraza en madera de Indonesia", "Pared en piedra ibicenca"],
    relatedProjects: ["urbanizacion-valverde", "true-bar"],
    metaTitle: "Terrazas y exteriores en Ibiza | Eivitech",
    metaDescription: "Terrazas, porches e iluminación exterior en Ibiza. Trabajos en madera, piedra y soluciones a medida.",
  },
  {
    slug: "locales-comerciales",
    title: "Locales comerciales",
    short: "Reformas de bares, restaurantes y locales adaptados al uso comercial.",
    hero: "Reformas para locales comerciales en Ibiza",
    intro:
      "Coordinamos reformas de locales comerciales considerando funcionalidad, normativa y experiencia del cliente final.",
    includes: ["Reforma integral del local", "Instalaciones técnicas", "Acabados decorativos", "Carpintería y mobiliario"],
    whenToAsk: ["Apertura de nuevo local", "Renovación de un negocio existente", "Adaptación de espacio comercial"],
    examples: ["Bares cerca del mar", "Locales con exigencias estéticas y funcionales"],
    relatedProjects: ["true-bar"],
    metaTitle: "Reformas de locales comerciales en Ibiza | Eivitech",
    metaDescription: "Reformas de bares, restaurantes y locales comerciales en Ibiza con enfoque funcional y estético.",
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
