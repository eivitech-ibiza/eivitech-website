const SITE_URL = "https://eivitech.com";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const organizationMetadata = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": ORGANIZATION_ID,
  name: "Eivitech",
  alternateName: "Eivitech Ibiza",
  url: `${SITE_URL}/`,
  description:
    "Empresa de reformas, instalaciones, acabados e interiores a medida para villas, apartamentos, fincas y espacios comerciales en Ibiza.",
  logo: `${SITE_URL}/media/brand/eivitech-logo.svg`,
  image: `${SITE_URL}/media/hero/eivitech-ibiza-ristrutturazione-villa-mediterranea-top-banner.webp`,
  telephone: "+34 674 735 188",
  email: "info@eivitech.com",
  areaServed: { "@type": "Place", name: "Ibiza, España" },
  address: { "@type": "PostalAddress", addressLocality: "Ibiza", addressCountry: "ES" },
};

const websiteMetadata = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: "Eivitech Ibiza",
  publisher: { "@id": ORGANIZATION_ID },
  inLanguage: ["es-ES", "it-IT", "en-GB", "nl-NL"],
};

const service = (slug, title, description) => {
  const url = `${SITE_URL}/servicios/${slug}/`;
  return {
    path: `/servicios/${slug}`,
    title,
    description,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      serviceType: title.split("|")[0].trim(),
      url,
      description,
      provider: { "@id": ORGANIZATION_ID },
      areaServed: { "@type": "Place", name: "Ibiza, España" },
      mainEntityOfPage: { "@id": `${url}#webpage` },
    },
  };
};

const project = (slug, title, description, metadata = {}) => ({
  path: `/transformations/${slug}`,
  title,
  description,
  type: "article",
  ...metadata,
});

const projectMetadata = ({ slug, name, description, zone, image, imageAlt, width, height }) => {
  const url = `${SITE_URL}/transformations/${slug}/`;
  return {
    socialImage: image,
    socialImageAlt: imageAlt,
    socialImageType: "image/webp",
    socialImageWidth: width,
    socialImageHeight: height,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `${url}#project`,
      name,
      description,
      url,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      creator: { "@id": ORGANIZATION_ID },
      contentLocation: {
        "@type": "Place",
        name: zone,
      },
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}${image}`,
        caption: imageAlt,
        width,
        height,
      },
    },
  };
};

export const indexableRoutes = [
  {
    path: "/",
    title: "Eivitech Ibiza | Transformaciones y reformas de propiedades",
    description: "Reformas completas, interiores a medida y transformaciones exteriores en Ibiza, con materiales naturales, luz cálida y gestión completa del proyecto.",
    jsonLd: [organizationMetadata, websiteMetadata],
  },
  {
    path: "/empresa",
    title: "Empresa de reformas en Ibiza | Eivitech",
    description: "Eivitech acompaña cada reforma en Ibiza desde la idea inicial hasta el último detalle, con coordinación, atención personalizada y acabados cuidados.",
    jsonLd: organizationMetadata,
  },
  {
    path: "/servicios",
    title: "Servicios de reformas e instalaciones en Ibiza | Eivitech",
    description: "Reformas integrales, instalaciones, carpintería, exteriores y locales comerciales en Ibiza.",
  },
  service(
    "reformas-integrales", "Reformas integrales en Ibiza | Eivitech", "Reformas integrales en Ibiza: coordinación, calidad y atención al detalle para viviendas, villas, apartamentos y locales. Solicita valoración.",
  ),
  service(
    "electricidad-iluminacion", "Electricidad e iluminación en Ibiza | Eivitech", "Instalaciones eléctricas e iluminación a medida en Ibiza para reformas, obra nueva y proyectos decorativos.",
  ),
  service(
    "albanileria-acabados", "Albañilería y acabados en Ibiza | Eivitech", "Albañilería, microcemento, pladur, escayola y acabados decorativos en Ibiza.",
  ),
  service(
    "fontaneria", "Fontanería en Ibiza | Eivitech", "Instalaciones de fontanería para reformas integrales, baños y cocinas en Ibiza.",
  ),
  service(
    "cocinas-banos", "Reformas de cocinas y baños en Ibiza | Eivitech", "Reformas de cocinas y baños en Ibiza con diseño, carpintería e instalaciones coordinadas.",
  ),
  service(
    "carpinteria", "Carpintería a medida en Ibiza | Eivitech", "Carpintería a medida en Ibiza: cocinas, armarios, revestimientos y soluciones exteriores en madera.",
  ),
  service(
    "terrazas-exteriores", "Terrazas y exteriores en Ibiza | Eivitech", "Terrazas, porches e iluminación exterior en Ibiza con madera, piedra y soluciones a medida.",
  ),
  service(
    "locales-comerciales", "Reformas de locales comerciales en Ibiza | Eivitech", "Reformas de bares, restaurantes y locales comerciales en Ibiza con enfoque funcional y estético.",
  ),
  {
    path: "/transformations",
    title: "Transformaciones de propiedades en Ibiza | Eivitech",
    description: "Seis casos seleccionados de Eivitech en Ibiza: apartamentos, villas, fincas, exteriores y reformas orientadas a valor.",
  },
  project(
    "investment-oriented-villa-makeover",
    "Ibiza Villa Value Makeover – Cala Carbó | Eivitech Ibiza",
    "Makeover de villa en Cala Carbó para elevar el valor percibido mediante microcemento, cocina ibicenca, exteriores y jardín sin cambiar la estructura principal.",
    projectMetadata({
      slug: "investment-oriented-villa-makeover",
      name: "Ibiza Villa Value Makeover",
      description: "Makeover de villa en Cala Carbó para elevar el valor percibido mediante microcemento, cocina ibicenca, exteriores y jardín sin cambiar la estructura principal.",
      zone: "Cala Carbó, Ibiza",
      image: "/media/projects/casa-vadella/casa-vadella-ibiza-mediterranean-garden-cover.webp",
      imageAlt: "Jardín mediterráneo de la villa en Cala Carbó, con vegetación y zonas de grava.",
      width: 1024,
      height: 768,
    }),
  ),
  project(
    "luxury-mediterranean-villa-renovation",
    "Luxury Mediterranean Villa Renovation – San Antonio | Eivitech Ibiza",
    "Reforma completa de villa en San Antonio con espacios personalizados, vestidor, instalaciones eléctricas y climatización, carpintería y acabados a medida.",
    projectMetadata({
      slug: "luxury-mediterranean-villa-renovation",
      name: "Luxury Mediterranean Villa Renovation",
      description: "Reforma completa de villa en San Antonio con espacios personalizados, vestidor, instalaciones eléctricas y climatización, carpintería y acabados a medida.",
      zone: "San Antonio, Ibiza",
      image: "/media/projects/casa-vinya/casa-vinya-ibiza-open-plan-living-cover.webp",
      imageAlt: "Living open plan de la villa en San Antonio, con cocina integrada, madera natural y grandes aperturas al exterior.",
      width: 2400,
      height: 1800,
    }),
  ),
  project(
    "warm-contemporary-apartment-transformation",
    "Premium Apartment Renovation – Marina Botafoc | Eivitech",
    "Renovación de apartamento en Marina Botafoc con cocina abierta, microcemento, madera, tonos cálidos y luz indirecta.",
    projectMetadata({
      slug: "warm-contemporary-apartment-transformation",
      name: "Premium Apartment Renovation – Marina Botafoc",
      description: "Renovación de apartamento en Marina Botafoc con cocina abierta, microcemento, madera, tonos cálidos y luz indirecta.",
      zone: "Marina Botafoc, Ibiza",
      image: "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-kitchen-front-cover.webp",
      imageAlt: "Cocina a medida del apartamento en Marina Botafoc, con frentes de madera natural y electrodomésticos integrados.",
      width: 1080,
      height: 1350,
    }),
  ),
  project(
    "authentic-ibiza-finca-restoration",
    "Rustic Finca Restoration – Ibiza Countryside | Eivitech",
    "Restauración de finca rústica en Ibiza con piedra antigua, mortero de cal natural, drenaje perimetral, travertino y madera natural.",
    projectMetadata({
      slug: "authentic-ibiza-finca-restoration",
      name: "Rustic Finca Restoration – Ibiza Countryside",
      description: "Restauración de finca rústica en Ibiza con piedra antigua, mortero de cal natural, drenaje perimetral, travertino y madera natural.",
      zone: "Ibiza countryside",
      image: "/media/projects/casa-charlie/casa-charlie-ibiza-rustic-finca-exterior-cover.webp",
      imageAlt: "Exterior de la finca rústica restaurada en el campo de Ibiza, con fachada blanca y piedra original.",
      width: 2400,
      height: 1800,
    }),
  ),
  project(
    "modern-minimal-apartment-marina-botafoch",
    "Modern Minimal Apartment – Marina Botafoc | Eivitech",
    "Reforma minimalista en Marina Botafoc con mejor distribución, cocina a medida, líneas rectas, microcemento y luz cálida.",
    projectMetadata({
      slug: "modern-minimal-apartment-marina-botafoch",
      name: "Modern Minimal Apartment – Marina Botafoc",
      description: "Reforma minimalista en Marina Botafoc con mejor distribución, cocina a medida, líneas rectas, microcemento y luz cálida.",
      zone: "Marina Botafoc, Ibiza",
      image: "/media/projects/modern-minimal-apartment-marina-botafoch/modern-minimal-apartment-marina-botafoch-ibiza-cover.webp",
      imageAlt: "Zona living minimalista abierta hacia la terraza en Marina Botafoc, con luz natural y mobiliario integrado.",
      width: 1600,
      height: 1000,
    }),
  ),
  project(
    "low-maintenance-mediterranean-landscape",
    "Desert Style Outdoor Renovation | Eivitech Ibiza",
    "Renovación exterior de bajo mantenimiento en Ibiza con grava, arena, piedra natural, cactus y aparcamiento integrado.",
    projectMetadata({
      slug: "low-maintenance-mediterranean-landscape",
      name: "Desert Style Outdoor Renovation",
      description: "Renovación exterior de bajo mantenimiento en Ibiza con grava, arena, piedra natural, cactus y aparcamiento integrado.",
      zone: "Ibiza",
      image: "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-dry-beach-cactus-garden.webp",
      imageAlt: "Jardín desert style con cactus, grava clara y una composición paisajística de bajo mantenimiento.",
      width: 1600,
      height: 1200,
    }),
  ),
  {
    path: "/the-eivitech-way",
    title: "The Eivitech Way | Un referente para tu reforma en Ibiza",
    description: "El método Eivitech para reformas en Ibiza: descubrimiento, diseño, planificación, obra, detalles y entrega.",
  },
  {
    path: "/materials-atmosphere",
    title: "Materiales y atmósfera | Eivitech Ibiza",
    description: "Materiales naturales, luz cálida y soluciones saludables para reformas premium en Ibiza.",
  },
  {
    path: "/contacto",
    title: "Contacto | Eivitech Ibiza",
    description: "Cuéntanos tu proyecto en Ibiza y solicita una primera valoración para tu reforma, instalación o transformación.",
  },
  {
    path: "/reformas-ibiza",
    title: "Reformas en Ibiza | Empresa de reformas y renovaciones",
    description: "Empresa de reformas en Ibiza para villas, apartamentos y locales. Coordinación, calidad y atención al detalle. Solicita valoración.",
  },
  {
    path: "/proyectos-reformas-ibiza",
    title: "Proyectos de reformas en Ibiza | Eivitech",
    description: "Descubre casos reales de reformas en Ibiza: villas, apartamentos y locales con materiales y acabados cuidados.",
  },
  {
    path: "/renovation-company-ibiza",
    title: "Renovation company in Ibiza | Eivitech",
    description: "Renovation company in Ibiza for villas, apartments and commercial spaces. Coordination, quality and attention to detail.",
    language: "en",
  },
  {
    path: "/privacy-policy",
    title: "Política de privacidad | Eivitech Ibiza",
    description: "Información sobre el tratamiento de datos personales realizado por Eivitech.",
  },
  {
    path: "/cookie-policy",
    title: "Política de cookies | Eivitech Ibiza",
    description: "Información sobre cookies, almacenamiento local y herramientas de medición utilizadas por Eivitech.",
  },
  {
    path: "/aviso-legal",
    title: "Aviso legal | Eivitech Ibiza",
    description: "Aviso legal, condiciones de uso y datos identificativos del sitio web de Eivitech.",
  },
];

export const noIndexRoutes = [
  { path: "/gracias", title: "Gracias | Eivitech Ibiza", description: "Hemos recibido tu solicitud.", },
  { path: "/dashboard", title: "CRM privado | Eivitech Ibiza", description: "Área privada de Eivitech.", },
];

export const redirects = [
  ["/proyectos", "/transformations"],
  ["/privacidad", "/privacy-policy"],
  ["/cookies", "/cookie-policy"],
  [
    "/proyectos/casa-sant-josep",
    "/transformations/investment-oriented-villa-makeover",
  ],
  [
    "/proyectos/apartamento-marina-botafoch",
    "/transformations/modern-minimal-apartment-marina-botafoch",
  ],
  ["/proyectos/true-bar", "/transformations"],
  ["/proyectos/urbanizacion-valverde", "/transformations"],
];
