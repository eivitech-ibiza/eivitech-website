import { tr } from "@/lib/i18n";

export type Project = {
  slug: string;
  internalName: string;
  name: string;
  type: string;
  intervention: string;
  zone?: string;
  image: string;
  cover: string;
  gallery: string[];
  folderHint: string;
  category: string;
  style: string;
  short: string;
  situation: string;
  goal: string;
  challenge: string;
  vision: string;
  solution: string;
  lighting: string;
  craftsmanship: string;
  works: string[];
  materials: string[];
  result: string;
  crmInterest: string;
  metaTitle: string;
  metaDescription: string;
  beforeAfter?: boolean;
  mediaNote?: string;
};

const media = (slug: string, file: string) => `/media/projects/${slug}/${file}`;

export const PROJECTS: Project[] = [
  {
    slug: "modern-minimal-apartment-marina-botafoch",
    internalName: "Boas",
    name: "Modern Minimal Apartment – Marina Botafoch",
    type: tr("Apartamento premium", "Appartamento premium", "Premium apartment"),
    intervention: tr("Renovación minimalista a medida", "Ristrutturazione minimalista su misura", "Bespoke minimal renovation"),
    zone: "Marina Botafoch, Ibiza",
    category: tr("Apartment", "Apartment", "Apartment"),
    style: tr("Minimal contemporáneo", "Minimal contemporaneo", "Contemporary minimal"),
    cover: media("modern-minimal-apartment-marina-botafoch", "modern-minimal-apartment-marina-botafoch-ibiza-cover.webp"),
    image: media("modern-minimal-apartment-marina-botafoch", "modern-minimal-apartment-marina-botafoch-ibiza-cover.webp"),
    gallery: [
      "modern-minimal-apartment-marina-botafoch-ibiza-living-terrace.webp",
      "modern-minimal-apartment-marina-botafoch-ibiza-living-room.webp",
      "modern-minimal-apartment-marina-botafoch-ibiza-kitchen.webp",
      "modern-minimal-apartment-marina-botafoch-ibiza-bathroom.webp",
      "modern-minimal-apartment-marina-botafoch-ibiza-bathroom-shower.webp",
      "modern-minimal-apartment-marina-botafoch-ibiza-jacuzzi.webp",
    ].map((f) => media("modern-minimal-apartment-marina-botafoch", f)),
    folderHint: "public/media/projects/modern-minimal-apartment-marina-botafoch/",
    short: tr("Un apartamento en Marina Botafoch transformado con líneas limpias, distribución más inteligente y cocina Made in Italy a medida.", "Un appartamento a Marina Botafoch trasformato con linee pulite, distribuzione più intelligente e cucina Made in Italy su misura.", "A Marina Botafoch apartment transformed with clean lines, smarter planning and a bespoke Made in Italy kitchen."),
    situation: tr("Apartamento con una distribución poco eficiente, demasiados metros perdidos en pasillos y una imagen clásica que ya no reflejaba el potencial de la propiedad.", "Appartamento con una distribuzione poco efficiente, troppi metri persi in corridoi e un'immagine classica che non rifletteva più il potenziale della proprietà.", "An apartment with an inefficient layout, too much space lost in corridors and a classic look that no longer reflected the property’s potential."),
    goal: tr("Crear un espacio más amplio, moderno y funcional, aprovechando mejor cada metro y elevando la percepción premium del apartamento.", "Creare uno spazio più ampio, moderno e funzionale, sfruttando meglio ogni metro e alzando la percezione premium dell'appartamento.", "Create a wider, more modern and functional space, making better use of every square metre and raising the apartment’s premium perception."),
    challenge: tr("Mejorar la circulación, reducir metros desperdiciados y convertir un apartamento clásico en un espacio minimalista y contemporáneo.", "Migliorare la circolazione, ridurre i metri sprecati e trasformare un appartamento classico in uno spazio minimalista e contemporaneo.", "Improve circulation, reduce wasted space and turn a classic apartment into a contemporary minimal home."),
    vision: tr("Una vivienda con líneas rectas, espacios limpios, cocina de alto nivel y una atmósfera de calma pensada para la vida en Marina Botafoch.", "Una casa con linee dritte, spazi puliti, cucina di alto livello e un'atmosfera calma pensata per la vita a Marina Botafoch.", "A home with straight lines, clean spaces, a high-end kitchen and a calm atmosphere designed for Marina Botafoch living."),
    solution: tr("Se rediseñó la distribución para aprovechar mejor el espacio, se introdujo una cocina a medida realizada en Italia y se trabajó una estética minimalista con acabados cálidos.", "È stata ridisegnata la distribuzione per sfruttare meglio lo spazio, introdotta una cucina su misura realizzata in Italia e lavorata un'estetica minimalista con finiture calde.", "The layout was redesigned to make better use of the space, a bespoke kitchen made in Italy was introduced and the minimal aesthetic was softened with warm finishes."),
    lighting: tr("Luz cálida e indirecta para evitar una sensación fría y crear una atmósfera relajada en las zonas de estar.", "Luce calda e indiretta per evitare una sensazione fredda e creare un'atmosfera rilassata nelle zone living.", "Warm and indirect lighting avoids a cold feeling and creates a relaxed atmosphere in the living areas."),
    craftsmanship: tr("Cocina a medida Made in Italy, carpintería personalizada y detalles diseñados para encajar con precisión en el apartamento.", "Cucina su misura Made in Italy, falegnameria personalizzata e dettagli progettati per inserirsi con precisione nell'appartamento.", "Made in Italy bespoke kitchen, custom carpentry and details designed to fit the apartment precisely."),
    works: [
      tr("Rediseño de distribución y circulación", "Ridisegno di distribuzione e circolazione", "Layout and circulation redesign"),
      tr("Cocina a medida Made in Italy", "Cucina su misura Made in Italy", "Bespoke Made in Italy kitchen"),
      tr("Acabados minimalistas y líneas rectas", "Finiture minimaliste e linee dritte", "Minimal finishes and straight lines"),
      tr("Mobiliario y detalles a medida", "Arredi e dettagli su misura", "Custom furniture and details"),
      tr("Iluminación cálida e indirecta", "Illuminazione calda e indiretta", "Warm indirect lighting"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Cocina Made in Italy", "Cucina Made in Italy", "Made in Italy kitchen"), tr("Iluminación LED cálida", "Illuminazione LED calda", "Warm LED lighting"), tr("Acabados continuos", "Finiture continue", "Continuous finishes")],
    result: tr("Un apartamento más amplio, moderno y preciso, con una imagen premium y una distribución mucho más lógica para vivirlo cada día.", "Un appartamento più ampio, moderno e preciso, con un'immagine premium e una distribuzione molto più logica da vivere ogni giorno.", "A wider, more modern and precise apartment, with a premium image and a far more logical layout for everyday life."),
    crmInterest: "apartment_minimal_marina_botafoch",
    metaTitle: tr("Modern Minimal Apartment – Marina Botafoch | Eivitech Ibiza", "Modern Minimal Apartment – Marina Botafoch | Eivitech Ibiza", "Modern Minimal Apartment – Marina Botafoch | Eivitech Ibiza"),
    metaDescription: tr("Transformación de apartamento minimalista en Marina Botafoch con living luminoso, terraza privada, cocina a medida, baño moderno y jacuzzi.", "Trasformazione di appartamento minimalista a Marina Botafoch con living luminoso, terrazza privata, cucina su misura, bagno moderno e jacuzzi.", "Minimal apartment transformation in Marina Botafoch with bright living space, private terrace, bespoke kitchen, modern bathroom and jacuzzi."),
  },
  {
    slug: "luxury-mediterranean-villa-renovation",
    internalName: "Casa Vinya",
    name: "Luxury Mediterranean Villa Renovation",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Reforma completa personalizada", "Ristrutturazione completa personalizzata", "Tailored full renovation"),
    zone: "Ibiza",
    category: tr("Villa", "Villa", "Villa"),
    style: tr("Mediterráneo cálido", "Mediterraneo caldo", "Warm Mediterranean"),
    cover: media("casa-vinya", "cover.jpg"),
    image: media("casa-vinya", "cover.jpg"),
    gallery: ["IMG_2597.jpg", "IMG_2599.jpg", "IMG_2603.jpg", "IMG_2610.jpg", "IMG_2612.jpg", "IMG_2614.jpg", "IMG_2616.jpg", "IMG_2622.jpg"].map((f) => media("casa-vinya", f)),
    folderHint: "public/media/projects/casa-vinya/",
    short: tr("Renovación completa de villa con espacios personalizados, materiales naturales y soluciones diseñadas alrededor del estilo de vida del cliente.", "Ristrutturazione completa di villa con spazi personalizzati, materiali naturali e soluzioni progettate attorno allo stile di vita del cliente.", "Complete villa renovation with tailored spaces, natural materials and solutions designed around the client’s lifestyle."),
    situation: tr("Villa con espacios que necesitaban actualizarse y adaptarse con mayor precisión a las necesidades reales del propietario.", "Villa con spazi da aggiornare e adattare con maggiore precisione alle esigenze reali del proprietario.", "A villa with spaces that needed updating and a more precise adaptation to the owner’s real needs."),
    goal: tr("Crear una vivienda mediterránea, cálida y altamente personalizada, con zonas funcionales y detalles a medida.", "Creare una casa mediterranea, calda e altamente personalizzata, con zone funzionali e dettagli su misura.", "Create a warm, highly personalised Mediterranean home, with functional areas and bespoke details."),
    challenge: tr("Convertir una reforma completa en una experiencia realmente personalizada, evitando soluciones estándar.", "Trasformare una ristrutturazione completa in un'esperienza realmente personalizzata, evitando soluzioni standard.", "Turn a full renovation into a genuinely personalised experience, avoiding standard solutions."),
    vision: tr("Una villa pensada alrededor del propietario: distribución, almacenamiento, acabados, instalaciones y detalles definidos según su forma de vivir.", "Una villa pensata attorno al proprietario: distribuzione, contenimento, finiture, impianti e dettagli definiti secondo il suo modo di vivere.", "A villa designed around the owner: layout, storage, finishes, systems and details defined around the way they live."),
    solution: tr("Eivitech coordinó la reforma completa, desde albañilería y cartón yeso hasta electricidad, climatización, aerotermia, acabados y espacios personalizados como un gran walk-in wardrobe.", "Eivitech ha coordinato la ristrutturazione completa, da muratura e cartongesso a elettrico, climatizzazione, aerotermia, finiture e spazi personalizzati come una grande cabina armadio.", "Eivitech coordinated the full renovation, from masonry and drywall to electrical work, HVAC, aerothermal systems, finishes and tailored spaces such as a large walk-in wardrobe."),
    lighting: tr("Iluminación cálida integrada para acompañar materiales naturales y generar una atmósfera relajada.", "Illuminazione calda integrata per accompagnare materiali naturali e generare un'atmosfera rilassata.", "Integrated warm lighting supports natural materials and creates a relaxed atmosphere."),
    craftsmanship: tr("Soluciones a medida, carpintería, almacenamiento personalizado y detalles ejecutados según necesidades concretas del cliente.", "Soluzioni su misura, falegnameria, contenimento personalizzato e dettagli eseguiti secondo esigenze concrete del cliente.", "Bespoke solutions, carpentry, personalised storage and details executed around the client’s concrete needs."),
    works: [
      tr("Reforma completa de interiores", "Ristrutturazione completa degli interni", "Full interior renovation"),
      tr("Redistribución y mejora funcional de espacios", "Redistribuzione e miglioramento funzionale degli spazi", "Space redistribution and functional upgrade"),
      tr("Walk-in wardrobe personalizado", "Cabina armadio personalizzata", "Tailored walk-in wardrobe"),
      tr("Instalaciones eléctricas, climatización y aerotermia", "Impianti elettrici, climatizzazione e aerotermia", "Electrical, HVAC and aerothermal systems"),
      tr("Acabados naturales y detalles personalizados", "Finiture naturali e dettagli personalizzati", "Natural finishes and personalised details"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Microcemento / acabado continuo", "Microcemento / finitura continua", "Microcement / continuous finish"), tr("Iluminación cálida", "Illuminazione calda", "Warm lighting"), tr("Carpintería a medida", "Falegnameria su misura", "Bespoke carpentry")],
    result: tr("Una villa más cómoda, coherente y personal, diseñada para responder a la forma real de vivir del propietario.", "Una villa più comoda, coerente e personale, progettata per rispondere al reale modo di vivere del proprietario.", "A more comfortable, coherent and personal villa, designed to respond to the owner’s real way of living."),
    crmInterest: "villa_tailored_full_renovation",
    metaTitle: tr("Luxury Mediterranean Villa Renovation | Eivitech Ibiza", "Luxury Mediterranean Villa Renovation | Eivitech Ibiza", "Luxury Mediterranean Villa Renovation | Eivitech Ibiza"),
    metaDescription: tr("Reforma completa de villa en Ibiza con espacios personalizados, materiales naturales, walk-in wardrobe e instalaciones integradas.", "Ristrutturazione completa villa a Ibiza con spazi personalizzati, materiali naturali, cabina armadio e impianti integrati.", "Full villa renovation in Ibiza with tailored spaces, natural materials, walk-in wardrobe and integrated systems."),
  },
  {
    slug: "warm-contemporary-apartment-transformation",
    internalName: "Casa Mediterraneo",
    name: "Warm Contemporary Apartment Transformation",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Transformación cálida y funcional", "Trasformazione calda e funzionale", "Warm functional transformation"),
    zone: "Marina Botafoch, Ibiza",
    category: tr("Apartment", "Apartment", "Apartment"),
    style: tr("Cálido contemporáneo", "Caldo contemporaneo", "Warm contemporary"),
    cover: media("casa-mediterraneo", "cover.jpg"),
    image: media("casa-mediterraneo", "cover.jpg"),
    gallery: ["mediterraneo-01.jpg", "mediterraneo-02.jpg", "mediterraneo-03.jpg", "mediterraneo-04.jpg", "mediterraneo-05.jpg", "mediterraneo-06.jpg", "mediterraneo-07.jpg", "mediterraneo-08.jpg"].map((f) => media("casa-mediterraneo", f)),
    folderHint: "public/media/projects/casa-mediterraneo/",
    short: tr("De un apartamento anticuado y poco funcional a un open space cálido, con materiales naturales y luz diseñada para crear ambiente.", "Da appartamento datato e poco funzionale a open space caldo, con materiali naturali e luce progettata per creare atmosfera.", "From an outdated and poorly functional apartment to a warm open space with natural materials and atmosphere-led lighting."),
    situation: tr("Apartamento antiguo, con cocina cerrada, barra de estilo noventero, materiales fríos y distribución poco práctica.", "Appartamento datato, con cucina chiusa, bancone stile anni Novanta, materiali freddi e distribuzione poco pratica.", "An outdated apartment with an enclosed kitchen, a 90s-style bar, cold materials and an impractical layout."),
    goal: tr("Actualizarlo al estilo actual de Ibiza, creando un ambiente cálido, acogedor y mejor aprovechado.", "Aggiornarlo allo stile attuale di Ibiza, creando un ambiente caldo, accogliente e meglio sfruttato.", "Update it to current Ibiza style, creating a warm, welcoming and better-used environment."),
    challenge: tr("Transformar un apartamento viejo y rígido en un espacio abierto, cálido y mucho más cómodo para vivir.", "Trasformare un appartamento vecchio e rigido in uno spazio aperto, caldo e molto più comodo da vivere.", "Transform an old and rigid apartment into an open, warm and much more comfortable living space."),
    vision: tr("Un open space mediterráneo contemporáneo, con madera, microcemento, tonos cálidos y una iluminación que relaja.", "Un open space mediterraneo contemporaneo, con legno, microcemento, toni caldi e un'illuminazione che rilassa.", "A contemporary Mediterranean open space with wood, microcement, warm tones and relaxing lighting."),
    solution: tr("Se abrió la cocina, se modernizaron los acabados y se trabajó una paleta cálida con materiales naturales para alinear el apartamento con su zona y el estilo de vida de Ibiza.", "È stata aperta la cucina, modernizzate le finiture e lavorata una palette calda con materiali naturali per allineare l'appartamento alla sua zona e allo stile di vita di Ibiza.", "The kitchen was opened up, finishes were modernised and a warm palette of natural materials aligned the apartment with its area and Ibiza lifestyle."),
    lighting: tr("Uso de luces cálidas, puntos indirectos y LED para crear una sensación de relax en lugar del clásico foco frío.", "Uso di luci calde, punti indiretti e LED per creare una sensazione di relax invece del classico faro freddo.", "Warm lights, indirect points and LEDs create a relaxing feeling instead of the usual cold spotlight effect."),
    craftsmanship: tr("Detalles a medida, cocina integrada, acabados coordinados y soluciones para aprovechar mejor el espacio disponible.", "Dettagli su misura, cucina integrata, finiture coordinate e soluzioni per sfruttare meglio lo spazio disponibile.", "Custom details, integrated kitchen, coordinated finishes and solutions to make better use of the available space."),
    works: [
      tr("Apertura de cocina y creación de open space", "Apertura cucina e creazione open space", "Kitchen opening and open-space creation"),
      tr("Modernización completa de acabados", "Modernizzazione completa delle finiture", "Full finish modernisation"),
      tr("Materiales cálidos y naturales", "Materiali caldi e naturali", "Warm natural materials"),
      tr("Iluminación ambiental cálida", "Illuminazione ambientale calda", "Warm ambient lighting"),
      tr("Mejora de funcionalidad y percepción del espacio", "Miglioramento funzionale e percettivo dello spazio", "Improved functionality and spatial perception"),
    ],
    materials: [tr("Madera", "Legno", "Wood"), tr("Microcemento", "Microcemento", "Microcement"), tr("Tonos cálidos", "Toni caldi", "Warm tones"), tr("LED indirecto", "LED indiretto", "Indirect LED")],
    result: tr("Un apartamento mucho más actual, acogedor y coherente con Marina Botafoch, donde la luz y los materiales cambian completamente la experiencia diaria.", "Un appartamento molto più attuale, accogliente e coerente con Marina Botafoch, dove luce e materiali cambiano completamente l'esperienza quotidiana.", "A far more current, welcoming apartment aligned with Marina Botafoch, where light and materials completely change the daily experience."),
    crmInterest: "apartment_warm_open_space",
    metaTitle: tr("Warm Contemporary Apartment Transformation | Eivitech Ibiza", "Warm Contemporary Apartment Transformation | Eivitech Ibiza", "Warm Contemporary Apartment Transformation | Eivitech Ibiza"),
    metaDescription: tr("Transformación de apartamento en Marina Botafoch: open space, materiales cálidos, microcemento, madera y luz ambiental.", "Trasformazione appartamento a Marina Botafoch: open space, materiali caldi, microcemento, legno e luce ambientale.", "Apartment transformation in Marina Botafoch: open space, warm materials, microcement, wood and ambient lighting."),
  },
  {
    slug: "authentic-ibiza-finca-restoration",
    internalName: "Casa Charlie",
    name: "Authentic Ibiza Finca Restoration",
    type: tr("Finca tradicional", "Finca tradizionale", "Traditional finca"),
    intervention: tr("Restauración y saneamiento", "Restauro e risanamento", "Restoration and remediation"),
    zone: "Ibiza countryside",
    category: tr("Finca", "Finca", "Finca"),
    style: tr("Rústico auténtico", "Rustico autentico", "Authentic rustic"),
    cover: media("casa-charlie", "cover.jpg"),
    image: media("casa-charlie", "cover.jpg"),
    gallery: ["charlie-01.jpg", "charlie-02.jpg", "charlie-03.jpg", "charlie-04.jpg", "charlie-05.jpg", "charlie-06.jpg", "charlie-07.jpg", "charlie-08.jpg"].map((f) => media("casa-charlie", f)),
    folderHint: "public/media/projects/casa-charlie/",
    short: tr("Restauración de una finca antigua con piedra original, mortero de cal, drenajes y materiales naturales para crear una casa más sana.", "Restauro di una finca antica con pietra originale, malta di calce, drenaggi e materiali naturali per creare una casa più sana.", "Restoration of an old finca with original stone, lime mortar, drainage and natural materials to create a healthier home."),
    situation: tr("Finca antigua con muros de piedra afectados por humedad y acumulación de agua alrededor de la vivienda.", "Finca antica con muri in pietra colpiti dall'umidità e accumulo d'acqua attorno alla casa.", "An old finca with stone walls affected by moisture and water accumulating around the house."),
    goal: tr("Conservar el carácter original de la finca y, al mismo tiempo, hacerla más seca, saludable y confortable.", "Conservare il carattere originale della finca e allo stesso tempo renderla più asciutta, sana e confortevole.", "Preserve the finca’s original character while making it drier, healthier and more comfortable."),
    challenge: tr("Restaurar sin borrar la identidad: conservar la piedra antigua, resolver la humedad y actualizar los espacios con materiales coherentes.", "Restaurare senza cancellare l'identità: conservare la pietra antica, risolvere l'umidità e aggiornare gli spazi con materiali coerenti.", "Restore without erasing identity: preserve ancient stone, solve moisture issues and update spaces with coherent materials."),
    vision: tr("Una finca auténtica, seca, limpia y sana, con piedra respirante, travertino, madera natural y confort contemporáneo.", "Una finca autentica, asciutta, pulita e sana, con pietra traspirante, travertino, legno naturale e comfort contemporaneo.", "An authentic, dry, clean and healthy finca with breathable stone, travertine, natural wood and contemporary comfort."),
    solution: tr("Se restauró el bloque antiguo de piedra usando mortero de cal natural, se ejecutó un sistema de drenaje alrededor de la finca y se modernizaron interiores con materiales clásicos.", "È stato restaurato il blocco antico in pietra usando malta di calce naturale, realizzato un sistema di drenaggio attorno alla finca e modernizzati gli interni con materiali classici.", "The ancient stone block was restored with natural lime mortar, a drainage system was built around the finca and interiors were modernised with classic materials."),
    lighting: tr("La luz cálida acompaña la piedra y la madera para mantener una atmósfera rústica, tranquila y confortable.", "La luce calda accompagna pietra e legno per mantenere un'atmosfera rustica, tranquilla e confortevole.", "Warm lighting supports stone and wood, keeping the atmosphere rustic, calm and comfortable."),
    craftsmanship: tr("Trabajo artesanal sobre piedra antigua, aplicación de mortero de cal, drenaje perimetral y acabados naturales como travertino y madera rústica.", "Lavoro artigianale su pietra antica, applicazione di malta di calce, drenaggio perimetrale e finiture naturali come travertino e legno rustico.", "Craft work on ancient stone, lime mortar application, perimeter drainage and natural finishes such as travertine and rustic wood."),
    works: [
      tr("Restauración de muros de piedra antigua", "Restauro muri in pietra antica", "Ancient stone wall restoration"),
      tr("Aplicación de mortero natural de cal", "Applicazione di malta naturale di calce", "Natural lime mortar application"),
      tr("Sistema de drenaje perimetral", "Sistema di drenaggio perimetrale", "Perimeter drainage system"),
      tr("Tratamiento contra humedad", "Trattamento contro umidità", "Moisture remediation"),
      tr("Actualización con travertino y madera natural", "Aggiornamento con travertino e legno naturale", "Upgrade with travertine and natural wood"),
    ],
    materials: [tr("Piedra original", "Pietra originale", "Original stone"), tr("Mortero de cal", "Malta di calce", "Lime mortar"), "Travertino", tr("Madera natural", "Legno naturale", "Natural wood")],
    result: tr("Una finca con alma, más sana y habitable, donde el valor histórico se conserva y el confort mejora de forma real.", "Una finca con anima, più sana e abitabile, dove il valore storico è conservato e il comfort migliora realmente.", "A soulful, healthier and more liveable finca, where historic value is preserved and comfort genuinely improves."),
    crmInterest: "finca_restoration_healthy_home",
    metaTitle: tr("Authentic Ibiza Finca Restoration | Eivitech Ibiza", "Authentic Ibiza Finca Restoration | Eivitech Ibiza", "Authentic Ibiza Finca Restoration | Eivitech Ibiza"),
    metaDescription: tr("Restauración de finca ibicenca con piedra antigua, mortero de cal, drenajes, travertino y materiales naturales.", "Restauro finca ibizenca con pietra antica, malta di calce, drenaggi, travertino e materiali naturali.", "Ibiza finca restoration with ancient stone, lime mortar, drainage, travertine and natural materials."),
  },
  {
    slug: "low-maintenance-mediterranean-landscape",
    internalName: "Proyecto paisajismo exterior",
    name: "Low-Maintenance Mediterranean Landscape",
    type: tr("Exterior", "Esterno", "Outdoor"),
    intervention: tr("Paisajismo mediterráneo", "Paesaggismo mediterraneo", "Mediterranean landscaping"),
    zone: "Ibiza",
    category: tr("Outdoor", "Outdoor", "Outdoor"),
    style: tr("Mediterráneo low-maintenance", "Mediterraneo low-maintenance", "Low-maintenance Mediterranean"),
    cover: media("proyecto-paisajismo-exterior", "cover.jpg"),
    image: media("proyecto-paisajismo-exterior", "cover.jpg"),
    gallery: ["paisajismo-01.jpg", "paisajismo-02.jpg", "paisajismo-03.jpg", "paisajismo-04.jpg", "paisajismo-05.jpg", "paisajismo-06.jpg", "paisajismo-07.jpg", "paisajismo-08.jpg"].map((f) => media("proyecto-paisajismo-exterior", f)),
    folderHint: "public/media/projects/proyecto-paisajismo-exterior/",
    short: tr("De un exterior árido y sin uso a un paisaje mediterráneo de bajo mantenimiento con grava, piedra natural, cactus y fuerte impacto visual.", "Da esterno arido e inutilizzato a paesaggio mediterraneo a bassa manutenzione con ghiaia, pietra naturale, cactus e forte impatto visivo.", "From an arid, unused exterior to a low-maintenance Mediterranean landscape with gravel, natural stone, cactus and strong visual impact."),
    situation: tr("Zona exterior árida, vacía y sin una lectura clara, con necesidad de mejorar accesos, aparcamiento e imagen general.", "Zona esterna arida, vuota e senza una lettura chiara, con necessità di migliorare accessi, parcheggio e immagine generale.", "An arid, empty outdoor area without a clear visual structure, requiring better access, parking and overall image."),
    goal: tr("Crear un exterior bonito, resistente y fácil de mantener para una propiedad de uso estacional.", "Creare un esterno bello, resistente e facile da mantenere per una proprietà a uso stagionale.", "Create an attractive, durable and easy-to-maintain exterior for a seasonally used property."),
    challenge: tr("Conseguir efecto visual sin depender de jardines que requieren mantenimiento constante y altos costes mensuales.", "Ottenere impatto visivo senza dipendere da giardini che richiedono manutenzione costante e alti costi mensili.", "Create visual impact without relying on gardens that require constant maintenance and high monthly costs."),
    vision: tr("Un paisaje seco mediterráneo, con grava, arena, cactus, piedra y aparcamiento integrado en una composición limpia.", "Un paesaggio secco mediterraneo, con ghiaia, sabbia, cactus, pietra e parcheggio integrato in una composizione pulita.", "A dry Mediterranean landscape with gravel, sand, cactus, stone and parking integrated into a clean composition."),
    solution: tr("Se diseñó una playa seca con arena y cactus, se trabajaron zonas de aparcamiento con grava de distintos colores y se integró piedra natural para ordenar todo el exterior.", "È stata progettata una spiaggia secca con sabbia e cactus, lavorate zone parcheggio con ghiaia di diversi colori e integrata pietra naturale per ordinare tutto l'esterno.", "A dry beach with sand and cactus was designed, parking areas were built with different gravel tones and natural stone was integrated to structure the exterior."),
    lighting: tr("Iluminación exterior discreta para acompañar recorridos y destacar texturas sin alterar la calma del paisaje.", "Illuminazione esterna discreta per accompagnare i percorsi e valorizzare le texture senza alterare la calma del paesaggio.", "Discreet outdoor lighting accompanies paths and highlights textures without disturbing the calm of the landscape."),
    craftsmanship: tr("Composición de gravas, piedras, cactus y zonas funcionales pensadas para crear orden visual y bajo mantenimiento.", "Composizione di ghiaie, pietre, cactus e zone funzionali pensate per creare ordine visivo e bassa manutenzione.", "Composition of gravel, stones, cactus and functional areas designed for visual order and low maintenance."),
    works: [
      tr("Diseño de jardín seco mediterráneo", "Progettazione giardino secco mediterraneo", "Dry Mediterranean garden design"),
      tr("Creación de zona tipo playa con arena y cactus", "Creazione zona tipo spiaggia con sabbia e cactus", "Beach-style area with sand and cactus"),
      tr("Aparcamiento con grava decorativa", "Parcheggio con ghiaia decorativa", "Decorative gravel parking"),
      tr("Integración de piedra natural", "Integrazione pietra naturale", "Natural stone integration"),
      tr("Solución exterior de bajo mantenimiento", "Soluzione esterna a bassa manutenzione", "Low-maintenance outdoor solution"),
    ],
    materials: [tr("Arena", "Sabbia", "Sand"), tr("Grava decorativa", "Ghiaia decorativa", "Decorative gravel"), tr("Piedra natural", "Pietra naturale", "Natural stone"), "Cactus"],
    result: tr("Un exterior con efecto wow, más ordenado y mucho más fácil de mantener para propietarios que no viven todo el año en Ibiza.", "Un esterno con effetto wow, più ordinato e molto più facile da mantenere per proprietari che non vivono tutto l'anno a Ibiza.", "An outdoor area with a wow effect, more ordered and much easier to maintain for owners who do not live in Ibiza all year."),
    crmInterest: "outdoor_low_maintenance_landscape",
    metaTitle: tr("Low-Maintenance Mediterranean Landscape | Eivitech Ibiza", "Low-Maintenance Mediterranean Landscape | Eivitech Ibiza", "Low-Maintenance Mediterranean Landscape | Eivitech Ibiza"),
    metaDescription: tr("Paisajismo mediterráneo de bajo mantenimiento en Ibiza con grava, piedra natural, cactus, parking y exterior de alto impacto visual.", "Paesaggismo mediterraneo a bassa manutenzione a Ibiza con ghiaia, pietra naturale, cactus, parking ed esterni ad alto impatto visivo.", "Low-maintenance Mediterranean landscape in Ibiza with gravel, natural stone, cactus, parking and high-impact outdoor design."),
  },
  {
    slug: "investment-oriented-villa-makeover",
    internalName: "Casa Vadella",
    name: "Investment-Oriented Villa Makeover",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Makeover orientado a valor", "Makeover orientato al valore", "Value-oriented makeover"),
    zone: "Ibiza",
    category: tr("Villa", "Villa", "Villa"),
    style: tr("Ibiza rustic luxury", "Ibiza rustic luxury", "Ibiza rustic luxury"),
    cover: media("casa-vadella", "cover.jpg"),
    image: media("casa-vadella", "cover.jpg"),
    gallery: ["vadella-01.jpg", "vadella-02.jpg", "vadella-03.jpg", "vadella-04.jpg", "vadella-05.jpg", "vadella-06.jpg"].map((f) => media("casa-vadella", f)),
    folderHint: "public/media/projects/casa-vadella/",
    short: tr("Un makeover de villa centrado en aumentar atractivo visual y valor percibido sin alterar la estructura principal.", "Un makeover di villa centrato sull'aumento dell'attrattiva visiva e del valore percepito senza alterare la struttura principale.", "A villa makeover focused on increasing visual appeal and perceived value without changing the main structure."),
    situation: tr("Villa con estructura válida, pero acabados antiguos, puertas blancas simples, cocina desactualizada y exteriores sin el impacto visual adecuado.", "Villa con struttura valida, ma finiture datate, porte bianche semplici, cucina non aggiornata ed esterni senza il giusto impatto visivo.", "A villa with a valid structure, but dated finishes, simple white doors, an outdated kitchen and outdoor areas lacking the right visual impact."),
    goal: tr("Actualizar completamente la percepción de la propiedad con una intervención inteligente sobre acabados, cocina, puertas, exteriores y materiales.", "Aggiornare completamente la percezione della proprietà con un intervento intelligente su finiture, cucina, porte, esterni e materiali.", "Completely update the property’s perception through an intelligent intervention on finishes, kitchen, doors, outdoor areas and materials."),
    challenge: tr("Aumentar atractivo y valor percibido sin hacer una demolición total ni cambiar la estructura principal.", "Aumentare attrattiva e valore percepito senza demolizione totale né modifica della struttura principale.", "Increase appeal and perceived value without a total demolition or a major structural change."),
    vision: tr("Un estilo Ibiza rustic luxury con microcemento, cocina ibicenca, puertas reinterpretadas y exteriores mucho más cuidados.", "Uno stile Ibiza rustic luxury con microcemento, cucina ibizenca, porte reinterpretate ed esterni molto più curati.", "An Ibiza rustic luxury style with microcement, Ibizan kitchen, reworked doors and much more curated outdoor spaces."),
    solution: tr("Se aplicó microcemento sobre el pavimento existente, se rediseñaron puertas y armarios con un lenguaje rústico, se rehizo la cocina y se trabajaron exteriores y jardín.", "È stato applicato microcemento sul pavimento esistente, ridisegnate porte e armadi con linguaggio rustico, rifatta la cucina e lavorati esterni e giardino.", "Microcement was applied over the existing floor, doors and wardrobes were reworked with a rustic language, the kitchen was rebuilt and outdoor/garden areas were upgraded."),
    lighting: tr("Iluminación cálida y materialidad natural para reforzar una sensación de vivienda mediterránea premium.", "Illuminazione calda e materialità naturale per rafforzare una sensazione di casa mediterranea premium.", "Warm lighting and natural materiality reinforce the feeling of a premium Mediterranean home."),
    craftsmanship: tr("Reinterpretación artesanal de puertas y armarios existentes, cocina con lenguaje ibicenco y microcemento interior/exterior.", "Reinterpretazione artigianale di porte e armadi esistenti, cucina con linguaggio ibizenco e microcemento interno/esterno.", "Craft reinterpretation of existing doors and wardrobes, an Ibizan-style kitchen and indoor/outdoor microcement."),
    works: [
      tr("Microcemento sobre pavimento existente", "Microcemento su pavimento esistente", "Microcement over existing flooring"),
      tr("Reforma de cocina en estilo ibicenco", "Ristrutturazione cucina in stile ibizenco", "Ibizan-style kitchen renovation"),
      tr("Actualización de puertas y armarios", "Aggiornamento porte e armadi", "Door and wardrobe upgrade"),
      tr("Microcemento exterior", "Microcemento esterno", "Outdoor microcement"),
      tr("Mejora de jardín y espacios exteriores", "Miglioramento giardino e spazi esterni", "Garden and outdoor space improvement"),
    ],
    materials: [tr("Microcemento", "Microcemento", "Microcement"), tr("Madera", "Legno", "Wood"), tr("Detalles negros", "Dettagli neri", "Black details"), tr("Acabados rústicos", "Finiture rustiche", "Rustic finishes")],
    result: tr("Una villa con una imagen mucho más actual y comercial, orientada a elevar la percepción de valor de la propiedad.", "Una villa con un'immagine molto più attuale e commerciale, orientata ad alzare la percezione di valore della proprietà.", "A villa with a much more current and marketable image, focused on raising the property’s perceived value."),
    crmInterest: "villa_investment_makeover",
    metaTitle: tr("Investment-Oriented Villa Makeover | Eivitech Ibiza", "Investment-Oriented Villa Makeover | Eivitech Ibiza", "Investment-Oriented Villa Makeover | Eivitech Ibiza"),
    metaDescription: tr("Makeover de villa en Ibiza orientado a valor: microcemento, cocina ibicenca, exteriores y acabados para elevar la percepción comercial.", "Makeover villa a Ibiza orientato al valore: microcemento, cucina ibizenca, esterni e finiture per alzare la percezione commerciale.", "Value-oriented villa makeover in Ibiza: microcement, Ibizan kitchen, outdoor areas and finishes to raise market appeal."),
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
