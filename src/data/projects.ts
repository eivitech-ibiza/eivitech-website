import casaSantJosep from "@/assets/casa-sant-josep.jpg";
import trueBar from "@/assets/true-bar.jpg";
import apartamento from "@/assets/apartamento.jpg";
import valverde from "@/assets/valverde.jpg";
import { tr } from "@/lib/i18n";

export type Project = {
  slug: string;
  name: string;
  type: string;
  intervention: string;
  zone?: string;
  image: string;
  short: string;
  situation: string;
  goal: string;
  works: string[];
  materials: string[];
  result: string;
  placeholder?: boolean;
  metaTitle: string;
  metaDescription: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "casa-sant-josep",
    name: "Casa Sant Josep",
    type: tr("Vivienda", "Abitazione", "Home"),
    intervention: tr("Reforma", "Ristrutturazione", "Renovation"),
    zone: "Sant Josep, Ibiza",
    image: casaSantJosep,
    short: tr("Proyecto residencial en Sant Josep.", "Progetto residenziale a Sant Josep.", "Residential project in Sant Josep."),
    situation: tr("Contenido del proyecto pendiente de completar con Daniele.", "Contenuto del progetto da completare con Daniele.", "Project content to be completed with Daniele."),
    goal: tr("Contenido pendiente de completar con Daniele.", "Contenuto da completare con Daniele.", "Content to be completed with Daniele."),
    works: [tr("Contenido pendiente de completar con Daniele.", "Contenuto da completare con Daniele.", "Content to be completed with Daniele.")],
    materials: [tr("Contenido pendiente de completar con Daniele.", "Contenuto da completare con Daniele.", "Content to be completed with Daniele.")],
    result: tr("Contenido pendiente de completar con Daniele.", "Contenuto da completare con Daniele.", "Content to be completed with Daniele."),
    placeholder: true,
    metaTitle: tr("Casa Sant Josep — Proyecto Eivitech Ibiza", "Casa Sant Josep — Progetto Eivitech Ibiza", "Casa Sant Josep — Eivitech Ibiza Project"),
    metaDescription: tr("Proyecto residencial en Sant Josep, Ibiza, realizado por Eivitech.", "Progetto residenziale a Sant Josep, Ibiza, realizzato da Eivitech.", "Residential project in Sant Josep, Ibiza, delivered by Eivitech."),
  },
  {
    slug: "true-bar",
    name: "True Bar",
    type: tr("Local comercial", "Locale commerciale", "Commercial space"),
    intervention: tr("Reforma integral", "Ristrutturazione completa", "Full renovation"),
    zone: "Ibiza",
    image: trueBar,
    short: tr("Reforma de un local situado cerca del mar.", "Ristrutturazione di un locale vicino al mare.", "Renovation of a space located near the sea."),
    situation: tr("Local situado cerca del mar, expuesto a humedad y vientos marítimos, con necesidad de renovar cubierta, baños, cocina y zona de bar.", "Locale situato vicino al mare, esposto a umidità e venti marini, con necessità di rinnovare copertura, bagni, cucina e zona bar.", "A space located near the sea, exposed to humidity and sea winds, requiring renovation of the roof, bathrooms, kitchen and bar area."),
    goal: tr("Crear un espacio funcional, sencillo y con clase, capaz de resistir las condiciones del entorno costero.", "Creare uno spazio funzionale, semplice ed elegante, capace di resistere alle condizioni dell'ambiente costiero.", "Create a functional, simple and elegant space able to withstand the coastal environment."),
    works: [
      tr("Impermeabilización de la cubierta", "Impermeabilizzazione della copertura", "Roof waterproofing"),
      tr("Reforma de baños", "Ristrutturazione dei bagni", "Bathroom renovation"),
      tr("Reforma de cocina", "Ristrutturazione della cucina", "Kitchen renovation"),
      tr("Reforma de la zona de bar", "Ristrutturazione della zona bar", "Bar area renovation"),
      tr("Porche en madera tratada para la terraza", "Portico in legno trattato per la terrazza", "Treated wood porch for the terrace"),
    ],
    materials: [tr("Madera tratada para exterior", "Legno trattato per esterni", "Treated wood for outdoor use"), tr("Materiales resistentes a humedad y salinidad", "Materiali resistenti a umidità e salinità", "Materials resistant to humidity and salinity")],
    result: tr("Un local que combina simplicidad, funcionalidad y un ambiente de clase frente al mar.", "Un locale che combina semplicità, funzionalità e un'atmosfera elegante di fronte al mare.", "A space that combines simplicity, functionality and an elegant atmosphere by the sea."),
    metaTitle: tr("True Bar — Reforma de local comercial en Ibiza | Eivitech", "True Bar — Ristrutturazione di locale commerciale a Ibiza | Eivitech", "True Bar — Commercial space renovation in Ibiza | Eivitech"),
    metaDescription: tr("Reforma integral de True Bar en Ibiza: cubierta, baños, cocina, bar y porche en madera tratada.", "Ristrutturazione completa del True Bar a Ibiza: copertura, bagni, cucina, bar e portico in legno trattato.", "Full renovation of True Bar in Ibiza: roof, bathrooms, kitchen, bar and treated wood porch."),
  },
  {
    slug: "apartamento-marina-botafoch",
    name: "Apartamento Marina Botafoch",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Reforma integral", "Ristrutturazione completa", "Full renovation"),
    zone: "Marina Botafoch, Ibiza",
    image: apartamento,
    short: tr("Reforma integral de 120 m² en Marina Botafoch.", "Ristrutturazione completa di 120 m² a Marina Botafoch.", "Full renovation of 120 m² in Marina Botafoch."),
    situation: tr("Apartamento de 120 m² con una distribución poco aprovechada y necesidades de renovación integral.", "Appartamento di 120 m² con una distribuzione poco sfruttata e necessità di ristrutturazione completa.", "A 120 m² apartment with an underused layout and the need for a full renovation."),
    goal: tr("Redistribuir los espacios para conseguir ambientes más amplios, luminosos y diáfanos.", "Redistribuire gli spazi per ottenere ambienti più ampi, luminosi e aperti.", "Redistribute the spaces to create wider, brighter and more open environments."),
    works: [
      tr("Redistribución completa de espacios", "Redistribuzione completa degli spazi", "Complete space redistribution"),
      tr("Aplicación de microcemento gris oscuro", "Applicazione di microcemento grigio scuro", "Application of dark grey microcement"),
      tr("Reforma de baños y duchas", "Ristrutturazione di bagni e docce", "Bathroom and shower renovation"),
      tr("Cocina a medida en madera de roble italiano con electrodomésticos Bosch", "Cucina su misura in rovere italiano con elettrodomestici Bosch", "Custom Italian oak kitchen with Bosch appliances"),
      tr("Sistema LED decorativo", "Sistema LED decorativo", "Decorative LED system"),
    ],
    materials: [tr("Microcemento gris oscuro", "Microcemento grigio scuro", "Dark grey microcement"), tr("Madera de roble italiano", "Legno di rovere italiano", "Italian oak wood"), tr("Iluminación LED decorativa", "Illuminazione LED decorativa", "Decorative LED lighting"), "Electrodomésticos Bosch"],
    result: tr("Un apartamento amplio, luminoso y coherente, con materiales naturales y una iluminación cuidada.", "Un appartamento ampio, luminoso e coerente, con materiali naturali e un'illuminazione curata.", "A spacious, bright and coherent apartment with natural materials and carefully designed lighting."),
    metaTitle: tr("Apartamento Marina Botafoch — Reforma integral | Eivitech Ibiza", "Appartamento Marina Botafoch — Ristrutturazione completa | Eivitech Ibiza", "Marina Botafoch Apartment — Full renovation | Eivitech Ibiza"),
    metaDescription: tr("Reforma integral de 120 m² en Marina Botafoch: microcemento, cocina en roble italiano, baños y sistema LED decorativo.", "Ristrutturazione completa di 120 m² a Marina Botafoch: microcemento, cucina in rovere italiano, bagni e sistema LED decorativo.", "Full renovation of 120 m² in Marina Botafoch: microcement, Italian oak kitchen, bathrooms and decorative LED system."),
  },
  {
    slug: "urbanizacion-valverde",
    name: "Urbanización Valverde",
    type: tr("Piso con terraza", "Appartamento con terrazza", "Apartment with terrace"),
    intervention: tr("Acabados y exterior", "Finiture ed esterni", "Finishes and outdoor area"),
    zone: "Santa Eulalia, Ibiza",
    image: valverde,
    short: tr("Piso con terraza panorámica en entorno rural de Santa Eulalia.", "Appartamento con terrazza panoramica in un ambiente rurale di Santa Eulalia.", "Apartment with panoramic terrace in a rural setting in Santa Eulalia."),
    situation: tr("Piso con terraza panorámica situado en un entorno rural de Santa Eulalia.", "Appartamento con terrazza panoramica situato in un ambiente rurale di Santa Eulalia.", "Apartment with panoramic terrace located in a rural setting in Santa Eulalia."),
    goal: tr("Renovar la estética del interior y aprovechar al máximo el potencial de la terraza exterior.", "Rinnovare l'estetica degli interni e sfruttare al massimo il potenziale della terrazza esterna.", "Refresh the interior aesthetics and make the most of the outdoor terrace potential."),
    works: [
      tr("Trabajos decorativos generales", "Lavori decorativi generali", "General decorative work"),
      tr("Carpintería interior", "Falegnameria interna", "Interior carpentry"),
      tr("Revestimiento de terraza en madera de Indonesia", "Rivestimento della terrazza in legno indonesiano", "Terrace cladding in Indonesian wood"),
      tr("Iluminación LED exterior", "Illuminazione LED esterna", "Outdoor LED lighting"),
      tr("Pared en piedra beige ibicenca", "Parete in pietra beige ibizenca", "Beige Ibizan stone wall"),
    ],
    materials: [tr("Madera de Indonesia", "Legno indonesiano", "Indonesian wood"), tr("Piedra beige ibicenca", "Pietra beige ibizenca", "Beige Ibizan stone"), tr("Iluminación LED exterior", "Illuminazione LED esterna", "Outdoor LED lighting")],
    result: tr("Un espacio integrado en el entorno rural, con materiales naturales y una terraza pensada para disfrutar del paisaje.", "Uno spazio integrato nell'ambiente rurale, con materiali naturali e una terrazza pensata per godersi il paesaggio.", "A space integrated into the rural setting, with natural materials and a terrace designed to enjoy the landscape."),
    metaTitle: tr("Urbanización Valverde — Reforma en Santa Eulalia | Eivitech", "Urbanización Valverde — Ristrutturazione a Santa Eulalia | Eivitech", "Urbanización Valverde — Renovation in Santa Eulalia | Eivitech"),
    metaDescription: tr("Reforma con terraza panorámica en Santa Eulalia: madera de Indonesia, piedra ibicenca e iluminación LED exterior.", "Ristrutturazione con terrazza panoramica a Santa Eulalia: legno indonesiano, pietra ibizenca e illuminazione LED esterna.", "Renovation with panoramic terrace in Santa Eulalia: Indonesian wood, Ibizan stone and outdoor LED lighting."),
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
