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
  metaTitle: string;
  metaDescription: string;
  category: string;
  style: string;
  cover: string;
  gallery: string[];
  folderHint: string;
  beforeAfter?: boolean;
  mediaNote?: string;
};

const media = (slug: string, file: string) => `/media/projects/${slug}/${file}`;

export const PROJECTS: Project[] = [
  {
    slug: "casa-vinya",
    name: "Casa Vinya",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Reforma interior y acabados", "Ristrutturazione interni e finiture", "Interior renovation and finishes"),
    zone: "Ibiza",
    category: tr("Interiores", "Interni", "Interiors"),
    style: tr("Natural contemporary", "Naturale contemporaneo", "Natural contemporary"),
    cover: media("casa-vinya", "cover.jpg"),
    image: media("casa-vinya", "cover.jpg"),
    gallery: ["IMG_2597.jpg", "IMG_2599.jpg", "IMG_2603.jpg", "IMG_2610.jpg", "IMG_2612.jpg", "IMG_2614.jpg", "IMG_2616.jpg", "IMG_2622.jpg"].map((f) => media("casa-vinya", f)),
    folderHint: "public/media/projects/casa-vinya/",
    short: tr("Reforma con acabados continuos, madera natural, baños claros y detalles negros.", "Ristrutturazione con finiture continue, legno naturale, bagni chiari e dettagli neri.", "Renovation with continuous finishes, natural wood, light bathrooms and black details."),
    situation: tr("Vivienda con necesidad de actualizar estancias interiores, baños, carpinterías y detalles para conseguir una imagen más actual y coherente.", "Abitazione da aggiornare negli interni, bagni, falegnameria e dettagli per ottenere un'immagine più attuale e coerente.", "A home requiring an update to interiors, bathrooms, carpentry and details to create a more current and coherent image."),
    goal: tr("Crear una vivienda luminosa, limpia y natural, con acabados continuos y materiales cálidos que transmitan calidad desde el primer vistazo.", "Creare una casa luminosa, pulita e naturale, con finiture continue e materiali caldi che comunichino qualità al primo sguardo.", "Create a bright, clean and natural home with continuous finishes and warm materials that communicate quality at first sight."),
    works: [
      tr("Actualización de estancias interiores", "Aggiornamento degli ambienti interni", "Interior room upgrade"),
      tr("Baños con acabado continuo y piezas naturales", "Bagni con finitura continua e pezzi naturali", "Bathrooms with continuous finishes and natural pieces"),
      tr("Carpintería y puertas con acabado madera", "Falegnameria e porte con finitura legno", "Wood-finish carpentry and doors"),
      tr("Detalles en negro mate para grifería, manillas y mecanismos", "Dettagli nero opaco per rubinetteria, maniglie e meccanismi", "Matte black details for taps, handles and switches"),
      tr("Coordinación de acabados para una lectura visual homogénea", "Coordinamento delle finiture per una lettura visiva omogenea", "Finish coordination for a consistent visual language"),
    ],
    materials: [tr("Microcemento / acabado continuo", "Microcemento / finitura continua", "Microcement / continuous finish"), tr("Madera natural", "Legno naturale", "Natural wood"), tr("Piedra", "Pietra", "Stone"), tr("Negro mate", "Nero opaco", "Matte black")],
    result: tr("Una vivienda más actual, cálida y coherente, con baños y detalles que elevan la percepción general del inmueble.", "Una casa più attuale, calda e coerente, con bagni e dettagli che alzano la percezione generale dell'immobile.", "A warmer, more coherent and up-to-date home, with bathrooms and details that raise the overall perception of the property."),
    metaTitle: tr("Casa Vinya — Reforma natural contemporánea | Eivitech Ibiza", "Casa Vinya — Ristrutturazione naturale contemporanea | Eivitech Ibiza", "Casa Vinya — Natural contemporary renovation | Eivitech Ibiza"),
    metaDescription: tr("Casa Vinya: reforma interior con acabados continuos, madera natural, baños claros y detalles negros en Ibiza.", "Casa Vinya: ristrutturazione interna con finiture continue, legno naturale, bagni chiari e dettagli neri a Ibiza.", "Casa Vinya: interior renovation with continuous finishes, natural wood, light bathrooms and black details in Ibiza."),
  },
  {
    slug: "casa-vadella",
    name: "Casa Vadella",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Exterior e interior mediterráneo", "Esterni e interni mediterranei", "Mediterranean indoor-outdoor renovation"),
    zone: "Cala Vadella, Ibiza",
    category: tr("Villa / exterior", "Villa / esterni", "Villa / outdoor"),
    style: tr("Mediterráneo natural", "Mediterraneo naturale", "Natural Mediterranean"),
    cover: media("casa-vadella", "cover.jpg"),
    image: media("casa-vadella", "cover.jpg"),
    gallery: ["vadella-01.jpg", "vadella-02.jpg", "vadella-03.jpg", "vadella-04.jpg", "vadella-05.jpg", "vadella-06.jpg"].map((f) => media("casa-vadella", f)),
    folderHint: "public/media/projects/casa-vadella/",
    short: tr("Proyecto de villa con exterior mediterráneo, porche, zonas de descanso y detalles naturales.", "Progetto villa con esterni mediterranei, portico, zone relax e dettagli naturali.", "Villa project with Mediterranean outdoor spaces, porch, lounge areas and natural details."),
    situation: tr("Propiedad con potencial exterior e interior que necesitaba una lectura más cuidada, cálida y conectada con el paisaje.", "Proprietà con potenziale interno ed esterno che richiedeva una lettura più curata, calda e collegata al paesaggio.", "A property with indoor and outdoor potential that needed a more refined, warm and landscape-connected feel."),
    goal: tr("Reforzar la experiencia de vida exterior e interior con una imagen mediterránea, simple y preparada para el uso diario.", "Rafforzare l'esperienza abitativa interna ed esterna con un'immagine mediterranea, semplice e pronta per l'uso quotidiano.", "Strengthen the indoor-outdoor living experience with a simple Mediterranean image ready for everyday use."),
    works: [
      tr("Mejora de zonas exteriores y porche", "Miglioramento delle zone esterne e del portico", "Outdoor and porch improvement"),
      tr("Integración de zonas de descanso", "Integrazione delle zone relax", "Integration of lounge areas"),
      tr("Coordinación de acabados naturales", "Coordinamento delle finiture naturali", "Coordination of natural finishes"),
      tr("Actualización de espacios interiores", "Aggiornamento degli spazi interni", "Interior space update"),
      tr("Selección visual para portfolio y presentación comercial", "Selezione visiva per portfolio e presentazione commerciale", "Visual selection for portfolio and commercial presentation"),
    ],
    materials: [tr("Cal blanca", "Calce bianca", "White lime finish"), tr("Madera", "Legno", "Wood"), tr("Fibra natural", "Fibra naturale", "Natural fibre"), tr("Grava y vegetación", "Ghiaia e vegetazione", "Gravel and planting")],
    result: tr("Una villa más acogedora y visual, donde exterior e interior trabajan juntos para transmitir calma, luz y estilo Ibiza.", "Una villa più accogliente e visiva, dove esterni e interni lavorano insieme per trasmettere calma, luce e stile Ibiza.", "A more welcoming and visual villa where exterior and interior work together to convey calm, light and Ibiza style."),
    metaTitle: tr("Casa Vadella — Villa mediterránea en Ibiza | Eivitech", "Casa Vadella — Villa mediterranea a Ibiza | Eivitech", "Casa Vadella — Mediterranean villa in Ibiza | Eivitech"),
    metaDescription: tr("Casa Vadella: proyecto de villa mediterránea con exterior, porche, zonas de descanso y acabados naturales.", "Casa Vadella: progetto villa mediterranea con esterni, portico, zone relax e finiture naturali.", "Casa Vadella: Mediterranean villa project with outdoor spaces, porch, lounge areas and natural finishes."),
  },
  {
    slug: "casa-mediterraneo",
    name: "Casa Mediterráneo",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Reforma interior completa", "Ristrutturazione interna completa", "Full interior renovation"),
    zone: "Ibiza",
    category: tr("Apartamento", "Appartamento", "Apartment"),
    style: tr("Mediterráneo contemporáneo", "Mediterraneo contemporaneo", "Contemporary Mediterranean"),
    cover: media("casa-mediterraneo", "cover.jpg"),
    image: media("casa-mediterraneo", "cover.jpg"),
    gallery: ["mediterraneo-01.jpg", "mediterraneo-02.jpg", "mediterraneo-03.jpg", "mediterraneo-04.jpg", "mediterraneo-05.jpg", "mediterraneo-06.jpg", "mediterraneo-07.jpg", "mediterraneo-08.jpg"].map((f) => media("casa-mediterraneo", f)),
    folderHint: "public/media/projects/casa-mediterraneo/",
    short: tr("Apartamento con cocina en madera, baños continuos, iluminación cuidada y detalles a medida.", "Appartamento con cucina in legno, bagni continui, illuminazione curata e dettagli su misura.", "Apartment with wood kitchen, continuous bathrooms, careful lighting and custom details."),
    situation: tr("Apartamento que necesitaba una renovación interior capaz de hacerlo más luminoso, funcional y alineado con el estilo actual de Ibiza.", "Appartamento che richiedeva una ristrutturazione interna per diventare più luminoso, funzionale e allineato allo stile attuale di Ibiza.", "An apartment requiring an interior renovation to make it brighter, more functional and aligned with current Ibiza style."),
    goal: tr("Crear un interior compacto pero de alto impacto visual, con cocina integrada, baños claros y una iluminación que refuerce los materiales.", "Creare un interno compatto ma di forte impatto visivo, con cucina integrata, bagni chiari e un'illuminazione che valorizzi i materiali.", "Create a compact but visually strong interior with integrated kitchen, light bathrooms and lighting that enhances the materials."),
    works: [
      tr("Reforma de cocina con carpintería en madera", "Ristrutturazione cucina con falegnameria in legno", "Kitchen renovation with wood carpentry"),
      tr("Baños con acabado continuo y ducha integrada", "Bagni con finitura continua e doccia integrata", "Bathrooms with continuous finish and integrated shower"),
      tr("Iluminación técnica e indirecta", "Illuminazione tecnica e indiretta", "Technical and indirect lighting"),
      tr("Mobiliario y detalles a medida", "Arredi e dettagli su misura", "Custom furniture and details"),
      tr("Coordinación estética de todo el apartamento", "Coordinamento estetico di tutto l'appartamento", "Full apartment aesthetic coordination"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Microcemento / acabado continuo", "Microcemento / finitura continua", "Microcement / continuous finish"), tr("Iluminación LED", "Illuminazione LED", "LED lighting"), tr("Negro mate", "Nero opaco", "Matte black")],
    result: tr("Un apartamento más funcional, moderno y reconocible, con materiales cálidos y una imagen muy clara para el cliente final.", "Un appartamento più funzionale, moderno e riconoscibile, con materiali caldi e un'immagine molto chiara per il cliente finale.", "A more functional, modern and recognizable apartment, with warm materials and a clear image for the final client."),
    metaTitle: tr("Casa Mediterráneo — Reforma de apartamento | Eivitech Ibiza", "Casa Mediterráneo — Ristrutturazione appartamento | Eivitech Ibiza", "Casa Mediterráneo — Apartment renovation | Eivitech Ibiza"),
    metaDescription: tr("Casa Mediterráneo: reforma de apartamento con cocina de madera, baños continuos, iluminación y detalles a medida.", "Casa Mediterráneo: ristrutturazione appartamento con cucina in legno, bagni continui, illuminazione e dettagli su misura.", "Casa Mediterráneo: apartment renovation with wood kitchen, continuous bathrooms, lighting and custom details."),
  },
  {
    slug: "casa-charlie",
    name: "Casa Charlie",
    type: tr("Casa tradicional", "Casa tradizionale", "Traditional house"),
    intervention: tr("Reforma rústica premium", "Ristrutturazione rustica premium", "Premium rustic renovation"),
    zone: "Ibiza",
    category: tr("Casa rústica", "Casa rustica", "Rustic house"),
    style: tr("Rústico ibicenco", "Rustico ibizenco", "Ibizan rustic"),
    cover: media("casa-charlie", "cover.jpg"),
    image: media("casa-charlie", "cover.jpg"),
    gallery: ["charlie-01.jpg", "charlie-02.jpg", "charlie-03.jpg", "charlie-04.jpg", "charlie-05.jpg", "charlie-06.jpg", "charlie-07.jpg", "charlie-08.jpg"].map((f) => media("casa-charlie", f)),
    folderHint: "public/media/projects/casa-charlie/",
    short: tr("Reforma de casa tradicional con piedra, travertino, vigas de madera y baños actualizados.", "Ristrutturazione di casa tradizionale con pietra, travertino, travi in legno e bagni aggiornati.", "Traditional house renovation with stone, travertine, wood beams and updated bathrooms."),
    situation: tr("Casa con elementos antiguos y materiales nobles que requería una intervención cuidadosa para conservar carácter y mejorar uso, luz y acabados.", "Casa con elementi antichi e materiali nobili che richiedeva un intervento attento per conservare carattere e migliorare uso, luce e finiture.", "A home with old elements and noble materials requiring careful work to preserve character while improving usability, light and finishes."),
    goal: tr("Mantener la fuerza del lenguaje rústico ibicenco y actualizar baños, circulaciones y acabados sin perder autenticidad.", "Mantenere la forza del linguaggio rustico ibizenco e aggiornare bagni, percorsi e finiture senza perdere autenticità.", "Keep the strength of Ibizan rustic language while updating bathrooms, circulation and finishes without losing authenticity."),
    works: [
      tr("Restauración y valorización de muros de piedra", "Restauro e valorizzazione dei muri in pietra", "Restoration and enhancement of stone walls"),
      tr("Trabajos en travertino y pavimentos naturales", "Lavori in travertino e pavimenti naturali", "Travertine and natural flooring works"),
      tr("Actualización de baños", "Aggiornamento dei bagni", "Bathroom upgrade"),
      tr("Integración de vigas, madera y elementos existentes", "Integrazione di travi, legno ed elementi esistenti", "Integration of beams, wood and existing elements"),
      tr("Coordinación entre parte rústica y acabados contemporáneos", "Coordinamento tra parte rustica e finiture contemporanee", "Coordination between rustic elements and contemporary finishes"),
    ],
    materials: [tr("Piedra natural", "Pietra naturale", "Natural stone"), "Travertino", tr("Madera", "Legno", "Wood"), tr("Vidrio", "Vetro", "Glass"), tr("Acabados minerales", "Finiture minerali", "Mineral finishes")],
    result: tr("Una casa con carácter, más cómoda y vendible, donde el valor histórico queda más visible y los espacios funcionan mejor.", "Una casa con carattere, più comoda e vendibile, dove il valore storico è più visibile e gli spazi funzionano meglio.", "A home with character, more comfortable and marketable, where the historic value is more visible and the spaces work better."),
    metaTitle: tr("Casa Charlie — Reforma rústica premium | Eivitech Ibiza", "Casa Charlie — Ristrutturazione rustica premium | Eivitech Ibiza", "Casa Charlie — Premium rustic renovation | Eivitech Ibiza"),
    metaDescription: tr("Casa Charlie: reforma rústica con piedra natural, travertino, madera, baños actualizados y acabados contemporáneos.", "Casa Charlie: ristrutturazione rustica con pietra naturale, travertino, legno, bagni aggiornati e finiture contemporanee.", "Casa Charlie: rustic renovation with natural stone, travertine, wood, updated bathrooms and contemporary finishes."),
  },
  {
    slug: "casa-boas",
    name: "Casa Boas",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Reforma y actualización premium", "Ristrutturazione e aggiornamento premium", "Premium renovation and upgrade"),
    zone: "Ibiza",
    category: tr("Apartamento premium", "Appartamento premium", "Premium apartment"),
    style: tr("Contemporáneo luminoso", "Contemporaneo luminoso", "Bright contemporary"),
    cover: media("casa-boas", "cover.jpg"),
    image: media("casa-boas", "cover.jpg"),
    gallery: ["boas-01.jpg", "boas-02.jpg", "boas-03.jpg", "boas-04.jpg", "boas-05.jpg", "boas-06.jpg", "boas-07.jpg"].map((f) => media("casa-boas", f)),
    folderHint: "public/media/projects/casa-boas/",
    short: tr("Apartamento premium con terraza, jacuzzi, salón luminoso, cocina actualizada y baños con luz indirecta.", "Appartamento premium con terrazza, jacuzzi, soggiorno luminoso, cucina aggiornata e bagni con luce indiretta.", "Premium apartment with terrace, jacuzzi, bright living room, updated kitchen and bathrooms with indirect lighting."),
    situation: tr("Apartamento con buena base y necesidad de mejorar acabados, zonas de agua, cocina, iluminación y experiencia general.", "Appartamento con buona base e necessità di migliorare finiture, zone acqua, cucina, illuminazione ed esperienza generale.", "An apartment with a strong base needing upgraded finishes, wet areas, kitchen, lighting and overall experience."),
    goal: tr("Elevar la percepción premium del apartamento con espacios luminosos, baños cuidados, cocina funcional y terraza más atractiva.", "Alzare la percezione premium dell'appartamento con spazi luminosi, bagni curati, cucina funzionale e terrazza più attraente.", "Raise the premium perception of the apartment with bright spaces, refined bathrooms, functional kitchen and a more attractive terrace."),
    works: [
      tr("Actualización de salón y zonas de estar", "Aggiornamento soggiorno e zone living", "Living area update"),
      tr("Intervención en cocina", "Intervento in cucina", "Kitchen work"),
      tr("Baños con iluminación indirecta y acabados contemporáneos", "Bagni con illuminazione indiretta e finiture contemporanee", "Bathrooms with indirect lighting and contemporary finishes"),
      tr("Mejora de terraza y zona jacuzzi", "Miglioramento terrazza e zona jacuzzi", "Terrace and jacuzzi area improvement"),
      tr("Coordinación de detalles para uso premium", "Coordinamento dei dettagli per uso premium", "Detail coordination for premium use"),
    ],
    materials: [tr("Microcemento / acabado continuo", "Microcemento / finitura continua", "Microcement / continuous finish"), tr("Madera", "Legno", "Wood"), tr("Vidrio", "Vetro", "Glass"), tr("Iluminación LED", "Illuminazione LED", "LED lighting"), "Jacuzzi"],
    result: tr("Un apartamento más luminoso, preparado para un uso premium y con una imagen clara para venta, alquiler o disfrute personal.", "Un appartamento più luminoso, pronto per un uso premium e con un'immagine chiara per vendita, affitto o uso personale.", "A brighter apartment ready for premium use, with a clear image for sale, rental or personal enjoyment."),
    metaTitle: tr("Casa Boas — Reforma de apartamento premium | Eivitech Ibiza", "Casa Boas — Ristrutturazione appartamento premium | Eivitech Ibiza", "Casa Boas — Premium apartment renovation | Eivitech Ibiza"),
    metaDescription: tr("Casa Boas: apartamento premium con terraza, jacuzzi, cocina, baños con luz indirecta y acabados contemporáneos.", "Casa Boas: appartamento premium con terrazza, jacuzzi, cucina, bagni con luce indiretta e finiture contemporanee.", "Casa Boas: premium apartment with terrace, jacuzzi, kitchen, bathrooms with indirect lighting and contemporary finishes."),
  },
  {
    slug: "proyecto-paisajismo-exterior",
    name: "Proyecto Paisajismo Exterior",
    type: tr("Exterior", "Esterno", "Outdoor"),
    intervention: tr("Paisajismo y accesos", "Paesaggismo e accessi", "Landscaping and access areas"),
    zone: "Ibiza",
    category: tr("Exterior / paisajismo", "Esterni / paesaggismo", "Outdoor / landscaping"),
    style: tr("Desert style mediterráneo", "Desert style mediterraneo", "Mediterranean desert style"),
    cover: media("proyecto-paisajismo-exterior", "cover.jpg"),
    image: media("proyecto-paisajismo-exterior", "cover.jpg"),
    gallery: ["paisajismo-01.jpg", "paisajismo-02.jpg", "paisajismo-03.jpg", "paisajismo-04.jpg", "paisajismo-05.jpg", "paisajismo-06.jpg", "paisajismo-07.jpg", "paisajismo-08.jpg"].map((f) => media("proyecto-paisajismo-exterior", f)),
    folderHint: "public/media/projects/proyecto-paisajismo-exterior/",
    short: tr("Proyecto exterior con grava, piedra natural, zonas de acceso, jardín seco y lectura mediterránea.", "Progetto esterno con ghiaia, pietra naturale, accessi, giardino secco e lettura mediterranea.", "Outdoor project with gravel, natural stone, access areas, dry garden and Mediterranean language."),
    situation: tr("Zona exterior amplia que necesitaba orden, lectura visual y materiales resistentes para acceso, aparcamiento y paisajismo.", "Ampia zona esterna che richiedeva ordine, lettura visiva e materiali resistenti per accesso, parcheggio e paesaggismo.", "A large outdoor area needing order, visual structure and durable materials for access, parking and landscaping."),
    goal: tr("Crear un exterior limpio, resistente y de bajo mantenimiento, con grava de distintos tonos, piedra natural, vegetación y una llegada más cuidada.", "Creare un esterno pulito, resistente e a bassa manutenzione, con ghiaia di diverse tonalità, pietra naturale, vegetazione e un arrivo più curato.", "Create a clean, durable and low-maintenance exterior with different gravel tones, natural stone, planting and a more refined arrival experience."),
    works: [
      tr("Diseño y ejecución de zona exterior", "Progettazione ed esecuzione della zona esterna", "Outdoor area design and execution"),
      tr("Preparación de accesos y aparcamiento", "Preparazione di accessi e parcheggio", "Access and parking preparation"),
      tr("Colocación de grava decorativa en distintos tonos", "Posa di ghiaia decorativa in diverse tonalità", "Decorative gravel installation in different tones"),
      tr("Integración de piedra natural y vegetación mediterránea", "Integrazione di pietra naturale e vegetazione mediterranea", "Integration of natural stone and Mediterranean planting"),
      tr("Creación de una imagen exterior ordenada y fotografiable", "Creazione di un'immagine esterna ordinata e fotografabile", "Creation of an ordered and photogenic exterior image"),
    ],
    materials: [tr("Grava blanca", "Ghiaia bianca", "White gravel"), tr("Grava terracota", "Ghiaia terracotta", "Terracotta gravel"), tr("Piedra natural", "Pietra naturale", "Natural stone"), tr("Cactus y vegetación mediterránea", "Cactus e vegetazione mediterranea", "Cactus and Mediterranean planting")],
    result: tr("Un exterior mucho más claro y atractivo, con mejor llegada, mejor lectura del terreno y una imagen coherente con el estilo actual de Ibiza.", "Un esterno molto più chiaro e attraente, con migliore arrivo, migliore lettura del terreno e un'immagine coerente con lo stile attuale di Ibiza.", "A much clearer and more attractive exterior, with a better arrival experience, better site reading and an image aligned with current Ibiza style."),
    metaTitle: tr("Proyecto Paisajismo Exterior — Exterior en Ibiza | Eivitech", "Proyecto Paisajismo Exterior — Esterni a Ibiza | Eivitech", "Outdoor Landscaping Project — Ibiza exterior | Eivitech"),
    metaDescription: tr("Proyecto de paisajismo exterior en Ibiza: grava, piedra natural, accesos, aparcamiento, jardín seco y vegetación mediterránea.", "Progetto di paesaggismo esterno a Ibiza: ghiaia, pietra naturale, accessi, parcheggio, giardino secco e vegetazione mediterranea.", "Outdoor landscaping project in Ibiza: gravel, natural stone, access, parking, dry garden and Mediterranean planting."),
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
