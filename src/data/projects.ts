import casaSantJosep from "@/assets/casa-sant-josep.jpg";
import trueBar from "@/assets/true-bar.jpg";
import apartamento from "@/assets/apartamento.jpg";
import valverde from "@/assets/valverde.jpg";

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
    type: "Vivienda",
    intervention: "Reforma",
    zone: "Sant Josep, Ibiza",
    image: casaSantJosep,
    short: "Proyecto residencial en Sant Josep.",
    situation: "Contenido del proyecto pendiente de completar con Daniele.",
    goal: "Contenido pendiente de completar con Daniele.",
    works: ["Contenido pendiente de completar con Daniele."],
    materials: ["Contenido pendiente de completar con Daniele."],
    result: "Contenido pendiente de completar con Daniele.",
    placeholder: true,
    metaTitle: "Casa Sant Josep — Proyecto Eivitech Ibiza",
    metaDescription: "Proyecto residencial en Sant Josep, Ibiza, realizado por Eivitech.",
  },
  {
    slug: "true-bar",
    name: "True Bar",
    type: "Local comercial",
    intervention: "Reforma integral",
    zone: "Ibiza",
    image: trueBar,
    short: "Reforma de un local situado cerca del mar.",
    situation:
      "Local situado cerca del mar, expuesto a humedad y vientos marítimos, con necesidad de renovar cubierta, baños, cocina y zona de bar.",
    goal: "Crear un espacio funcional, sencillo y con clase, capaz de resistir las condiciones del entorno costero.",
    works: [
      "Impermeabilización de la cubierta",
      "Reforma de baños",
      "Reforma de cocina",
      "Reforma de la zona de bar",
      "Porche en madera tratada para la terraza",
    ],
    materials: ["Madera tratada para exterior", "Materiales resistentes a humedad y salinidad"],
    result: "Un local que combina simplicidad, funcionalidad y un ambiente de clase frente al mar.",
    metaTitle: "True Bar — Reforma de local comercial en Ibiza | Eivitech",
    metaDescription: "Reforma integral de True Bar en Ibiza: cubierta, baños, cocina, bar y porche en madera tratada.",
  },
  {
    slug: "apartamento-marina-botafoch",
    name: "Apartamento Marina Botafoch",
    type: "Apartamento",
    intervention: "Reforma integral",
    zone: "Marina Botafoch, Ibiza",
    image: apartamento,
    short: "Reforma integral de 120 m² en Marina Botafoch.",
    situation: "Apartamento de 120 m² con una distribución poco aprovechada y necesidades de renovación integral.",
    goal: "Redistribuir los espacios para conseguir ambientes más amplios, luminosos y diáfanos.",
    works: [
      "Redistribución completa de espacios",
      "Aplicación de microcemento gris oscuro",
      "Reforma de baños y duchas",
      "Cocina a medida en madera de roble italiano con electrodomésticos Bosch",
      "Sistema LED decorativo",
    ],
    materials: ["Microcemento gris oscuro", "Madera de roble italiano", "Iluminación LED decorativa", "Electrodomésticos Bosch"],
    result: "Un apartamento amplio, luminoso y coherente, con materiales naturales y una iluminación cuidada.",
    metaTitle: "Apartamento Marina Botafoch — Reforma integral | Eivitech Ibiza",
    metaDescription:
      "Reforma integral de 120 m² en Marina Botafoch: microcemento, cocina en roble italiano, baños y sistema LED decorativo.",
  },
  {
    slug: "urbanizacion-valverde",
    name: "Urbanización Valverde",
    type: "Piso con terraza",
    intervention: "Acabados y exterior",
    zone: "Santa Eulalia, Ibiza",
    image: valverde,
    short: "Piso con terraza panorámica en entorno rural de Santa Eulalia.",
    situation: "Piso con terraza panorámica situado en un entorno rural de Santa Eulalia.",
    goal: "Renovar la estética del interior y aprovechar al máximo el potencial de la terraza exterior.",
    works: [
      "Trabajos decorativos generales",
      "Carpintería interior",
      "Revestimiento de terraza en madera de Indonesia",
      "Iluminación LED exterior",
      "Pared en piedra beige ibicenca",
    ],
    materials: ["Madera de Indonesia", "Piedra beige ibicenca", "Iluminación LED exterior"],
    result: "Un espacio integrado en el entorno rural, con materiales naturales y una terraza pensada para disfrutar del paisaje.",
    metaTitle: "Urbanización Valverde — Reforma en Santa Eulalia | Eivitech",
    metaDescription: "Reforma con terraza panorámica en Santa Eulalia: madera de Indonesia, piedra ibicenca e iluminación LED exterior.",
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
