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
    slug: "modern-minimal-apartment-marina-botafoc",
    internalName: "Boas",
    name: "Modern Minimal Apartment – Marina Botafoc",
    type: tr("Apartamento premium", "Appartamento premium", "Premium apartment"),
    intervention: tr("Renovación minimalista a medida", "Ristrutturazione minimalista su misura", "Bespoke minimal renovation"),
    zone: "Marina Botafoc, Ibiza",
    category: tr("Apartamento", "Appartamento", "Apartment"),
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
    short: tr("Un apartamento en Marina Botafoc convertido en una vivienda más abierta, precisa y actual, con una distribución más lógica y una cocina a medida como pieza central.", "Un appartamento a Marina Botafoc trasformato in una casa più aperta, precisa e attuale, con una distribuzione più logica e una cucina su misura come punto centrale.", "A Marina Botafoc apartment turned into a more open, precise and contemporary home, with smarter planning and a bespoke kitchen as the centrepiece."),
    situation: tr("La vivienda tenía una imagen clásica y una distribución que no aprovechaba bien el espacio: demasiada circulación, zonas poco conectadas y una sensación inferior al potencial real del apartamento.", "La casa aveva un'immagine classica e una distribuzione che non sfruttava bene lo spazio: troppa circolazione, zone poco collegate e una percezione inferiore al reale potenziale dell'appartamento.", "The home had a classic look and a layout that did not make the most of the space: too much circulation, poorly connected areas and a feeling below the apartment’s real potential."),
    goal: tr("Reordenar la vivienda para que se sintiera más amplia, más funcional y más coherente con el nivel de Marina Botafoc.", "Riorganizzare la casa per farla percepire più ampia, più funzionale e più coerente con il livello di Marina Botafoc.", "Reorganise the home so it felt wider, more functional and more aligned with the standard of Marina Botafoc."),
    challenge: tr("Ganar amplitud y calidad percibida sin perder calidez, transformando una propiedad convencional en un apartamento premium listo para vivirse mejor.", "Guadagnare ampiezza e qualità percepita senza perdere calore, trasformando una proprietà convenzionale in un appartamento premium da vivere meglio.", "Gain space and perceived quality without losing warmth, turning a conventional property into a premium apartment designed for better everyday living."),
    vision: tr("Un interior limpio y sereno, con líneas rectas, luz cálida y detalles a medida que hacen que cada metro tenga una función clara.", "Un interno pulito e sereno, con linee dritte, luce calda e dettagli su misura che fanno sì che ogni metro abbia una funzione chiara.", "A clean and calm interior, with straight lines, warm light and bespoke details that give every metre a clear purpose."),
    solution: tr("Se replanteó la distribución, se simplificó la lectura visual del apartamento y se incorporó una cocina a medida con acabados cálidos para que el minimalismo no resultara frío.", "È stata ripensata la distribuzione, semplificata la lettura visiva dell'appartamento e inserita una cucina su misura con finiture calde per evitare un minimalismo freddo.", "The layout was rethought, the visual reading of the apartment was simplified and a bespoke kitchen with warm finishes was introduced so the minimal style would not feel cold."),
    lighting: tr("Luz cálida e indirecta para acompañar las zonas de estar, suavizar las líneas minimalistas y crear una atmósfera más relajada.", "Luce calda e indiretta per accompagnare le zone living, ammorbidire le linee minimaliste e creare un'atmosfera più rilassata.", "Warm indirect lighting supports the living areas, softens the minimal lines and creates a more relaxed atmosphere."),
    craftsmanship: tr("Cocina a medida, carpintería personalizada y detalles integrados para que la intervención se perciba precisa, ordenada y hecha para esa vivienda.", "Cucina su misura, falegnameria personalizzata e dettagli integrati per far percepire l'intervento preciso, ordinato e pensato per quella casa.", "Bespoke kitchen, custom carpentry and integrated details make the intervention feel precise, ordered and designed for this specific home."),
    works: [
      tr("Rediseño de distribución y circulación", "Ridisegno di distribuzione e circolazione", "Layout and circulation redesign"),
      tr("Cocina a medida integrada", "Cucina su misura integrata", "Integrated bespoke kitchen"),
      tr("Acabados minimalistas con calidez", "Finiture minimaliste con calore", "Minimal finishes with warmth"),
      tr("Mobiliario y detalles a medida", "Arredi e dettagli su misura", "Custom furniture and details"),
      tr("Iluminación cálida e indirecta", "Illuminazione calda e indiretta", "Warm indirect lighting"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Cocina a medida", "Cucina su misura", "Bespoke kitchen"), tr("Iluminación LED cálida", "Illuminazione LED calda", "Warm LED lighting"), tr("Acabados continuos", "Finiture continue", "Continuous finishes")],
    result: tr("Un apartamento más amplio, más lógico y más comercial, donde el valor no está solo en el acabado final, sino en cómo se ha recuperado el uso real del espacio.", "Un appartamento più ampio, più logico e più commerciale, dove il valore non è solo nella finitura finale, ma nel modo in cui è stato recuperato l'uso reale dello spazio.", "A wider, more logical and more marketable apartment, where the value is not only in the final finish but in how the real use of space has been recovered."),
    crmInterest: "apartment_minimal_marina_botafoc",
    metaTitle: tr("Modern Minimal Apartment – Marina Botafoc | Eivitech Ibiza", "Modern Minimal Apartment – Marina Botafoc | Eivitech Ibiza", "Modern Minimal Apartment – Marina Botafoc | Eivitech Ibiza"),
    metaDescription: tr("Transformación de apartamento minimalista en Marina Botafoc con distribución más inteligente, cocina a medida, luz cálida, terraza privada y acabados contemporáneos.", "Trasformazione di appartamento minimalista a Marina Botafoc con distribuzione più intelligente, cucina su misura, luce calda, terrazza privata e finiture contemporanee.", "Minimal apartment transformation in Marina Botafoc with smarter layout, bespoke kitchen, warm lighting, private terrace and contemporary finishes."),
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
    short: tr("Una villa renovada desde una lectura muy personal del cliente: espacios más cómodos, soluciones a medida y una atmósfera mediterránea cálida y coherente.", "Una villa rinnovata partendo da una lettura molto personale del cliente: spazi più comodi, soluzioni su misura e un'atmosfera mediterranea calda e coerente.", "A villa renovated around a very personal reading of the client: more comfortable spaces, tailored solutions and a warm, coherent Mediterranean atmosphere."),
    situation: tr("La propiedad tenía una buena base, pero necesitaba una actualización que uniera estética, funcionalidad e instalaciones en un proyecto único y bien coordinado.", "La proprietà aveva una buona base, ma aveva bisogno di un aggiornamento che unisse estetica, funzionalità e impianti in un progetto unico e ben coordinato.", "The property had a good base, but needed an update that brought aesthetics, functionality and systems together in one well-coordinated project."),
    goal: tr("Crear una villa más cómoda y personal, donde cada decisión respondiera a la forma real de vivir del propietario.", "Creare una villa più comoda e personale, dove ogni scelta rispondesse al modo reale di vivere del proprietario.", "Create a more comfortable and personal villa, where every decision responded to the owner’s real way of living."),
    challenge: tr("Evitar una reforma genérica y convertir la intervención en una casa con identidad propia, práctica en el día a día y cuidada en los detalles.", "Evitare una ristrutturazione generica e trasformare l'intervento in una casa con identità propria, pratica nella vita quotidiana e curata nei dettagli.", "Avoid a generic renovation and turn the intervention into a home with its own identity, practical for daily life and carefully detailed."),
    vision: tr("Una villa mediterránea cálida, con materiales naturales, almacenamiento bien resuelto, zonas más fluidas y acabados pensados para durar.", "Una villa mediterranea calda, con materiali naturali, contenimento ben risolto, zone più fluide e finiture pensate per durare.", "A warm Mediterranean villa with natural materials, well-resolved storage, more fluid areas and finishes designed to last."),
    solution: tr("Eivitech coordinó la reforma de forma integral, conectando obra, instalaciones, acabados y soluciones a medida para que el resultado no pareciera una suma de piezas, sino una vivienda completa.", "Eivitech ha coordinato la ristrutturazione in modo integrale, collegando opere, impianti, finiture e soluzioni su misura affinché il risultato non sembrasse una somma di parti, ma una casa completa.", "Eivitech coordinated the renovation as a complete process, connecting building work, systems, finishes and bespoke solutions so the result felt like a complete home rather than a sum of separate pieces."),
    lighting: tr("Iluminación cálida integrada para reforzar los materiales naturales y acompañar la vida diaria sin invadir los espacios.", "Illuminazione calda integrata per valorizzare i materiali naturali e accompagnare la vita quotidiana senza invadere gli spazi.", "Integrated warm lighting reinforces natural materials and supports everyday living without overpowering the spaces."),
    craftsmanship: tr("Soluciones a medida, carpintería, almacenamiento personalizado y detalles ejecutados alrededor de necesidades concretas, no de un catálogo estándar.", "Soluzioni su misura, falegnameria, contenimento personalizzato e dettagli eseguiti attorno a esigenze concrete, non a un catalogo standard.", "Bespoke solutions, carpentry, personalised storage and details executed around concrete needs, not around a standard catalogue."),
    works: [
      tr("Reforma completa de interiores", "Ristrutturazione completa degli interni", "Full interior renovation"),
      tr("Redistribución y mejora funcional de espacios", "Redistribuzione e miglioramento funzionale degli spazi", "Space redistribution and functional upgrade"),
      tr("Soluciones de almacenamiento a medida", "Soluzioni di contenimento su misura", "Tailored storage solutions"),
      tr("Actualización de instalaciones y confort", "Aggiornamento impianti e comfort", "Systems and comfort upgrade"),
      tr("Acabados naturales y detalles personalizados", "Finiture naturali e dettagli personalizzati", "Natural finishes and personalised details"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Microcemento / acabado continuo", "Microcemento / finitura continua", "Microcement / continuous finish"), tr("Iluminación cálida", "Illuminazione calda", "Warm lighting"), tr("Carpintería a medida", "Falegnameria su misura", "Bespoke carpentry")],
    result: tr("Una villa más coherente, cómoda y personal, donde la renovación se percibe en la experiencia diaria y no solo en la imagen final.", "Una villa più coerente, comoda e personale, dove la ristrutturazione si percepisce nell'esperienza quotidiana e non solo nell'immagine finale.", "A more coherent, comfortable and personal villa, where the renovation is felt in daily experience and not only in the final image."),
    crmInterest: "villa_tailored_full_renovation",
    metaTitle: tr("Luxury Mediterranean Villa Renovation | Eivitech Ibiza", "Luxury Mediterranean Villa Renovation | Eivitech Ibiza", "Luxury Mediterranean Villa Renovation | Eivitech Ibiza"),
    metaDescription: tr("Reforma completa de villa en Ibiza con espacios personalizados, materiales naturales, soluciones a medida, instalaciones actualizadas y atmósfera mediterránea cálida.", "Ristrutturazione completa villa a Ibiza con spazi personalizzati, materiali naturali, soluzioni su misura, impianti aggiornati e atmosfera mediterranea calda.", "Full villa renovation in Ibiza with tailored spaces, natural materials, bespoke solutions, upgraded systems and a warm Mediterranean atmosphere."),
  },
  {
    slug: "warm-contemporary-apartment-transformation",
    internalName: "Casa Mediterraneo",
    name: "Warm Contemporary Apartment Transformation",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Transformación cálida y funcional", "Trasformazione calda e funzionale", "Warm functional transformation"),
    zone: "Marina Botafoc, Ibiza",
    category: tr("Apartamento", "Appartamento", "Apartment"),
    style: tr("Cálido contemporáneo", "Caldo contemporaneo", "Warm contemporary"),
    cover: media("casa-mediterraneo", "cover.jpg"),
    image: media("casa-mediterraneo", "cover.jpg"),
    gallery: ["mediterraneo-01.jpg", "mediterraneo-02.jpg", "mediterraneo-03.jpg", "mediterraneo-04.jpg", "mediterraneo-05.jpg", "mediterraneo-06.jpg", "mediterraneo-07.jpg", "mediterraneo-08.jpg"].map((f) => media("casa-mediterraneo", f)),
    folderHint: "public/media/projects/casa-mediterraneo/",
    short: tr("Un apartamento anticuado convertido en un open space más cálido, cómodo y actual, donde la luz y los materiales cambian por completo la sensación de la vivienda.", "Un appartamento datato trasformato in un open space più caldo, comodo e attuale, dove luce e materiali cambiano completamente la percezione della casa.", "An outdated apartment turned into a warmer, more comfortable and contemporary open space, where light and materials completely change the feeling of the home."),
    situation: tr("La vivienda estaba marcada por una cocina cerrada, una barra muy de otra época, materiales fríos y una distribución que hacía que el espacio pareciera menos amable de lo que podía ser.", "La casa era segnata da una cucina chiusa, un bancone molto datato, materiali freddi e una distribuzione che faceva sembrare lo spazio meno accogliente di quanto potesse essere.", "The home was defined by a closed kitchen, an outdated bar, cold materials and a layout that made the space feel less welcoming than it could be."),
    goal: tr("Abrir la vivienda, actualizar su lenguaje y crear una atmósfera más cercana al estilo de vida actual de Ibiza.", "Aprire la casa, aggiornarne il linguaggio e creare un'atmosfera più vicina allo stile di vita attuale di Ibiza.", "Open up the home, update its language and create an atmosphere closer to today’s Ibiza lifestyle."),
    challenge: tr("Pasar de un apartamento rígido y poco emocional a un espacio fluido, cálido y fácil de vivir, sin perder funcionalidad.", "Passare da un appartamento rigido e poco emozionale a uno spazio fluido, caldo e facile da vivere, senza perdere funzionalità.", "Move from a rigid and unemotional apartment to a fluid, warm and easy-to-live space, without losing functionality."),
    vision: tr("Un open space mediterráneo contemporáneo, con madera, microcemento, tonos cálidos y una iluminación pensada para bajar el ritmo.", "Un open space mediterraneo contemporaneo, con legno, microcemento, toni caldi e un'illuminazione pensata per rallentare il ritmo.", "A contemporary Mediterranean open space with wood, microcement, warm tones and lighting designed to slow the pace down."),
    solution: tr("Se abrió la cocina, se simplificaron los acabados y se trabajó una paleta más natural para que el apartamento ganara continuidad, confort y una imagen mucho más actual.", "È stata aperta la cucina, semplificate le finiture e lavorata una palette più naturale per dare all'appartamento continuità, comfort e un'immagine molto più attuale.", "The kitchen was opened, the finishes were simplified and a more natural palette was introduced, giving the apartment continuity, comfort and a much more contemporary image."),
    lighting: tr("Luz cálida, puntos indirectos y LED para crear ambiente y evitar la sensación fría de una iluminación demasiado técnica.", "Luce calda, punti indiretti e LED per creare atmosfera ed evitare la sensazione fredda di un'illuminazione troppo tecnica.", "Warm light, indirect points and LEDs create atmosphere and avoid the cold feeling of overly technical lighting."),
    craftsmanship: tr("Detalles a medida, cocina integrada y acabados coordinados para que la transformación se sintiera natural, no forzada.", "Dettagli su misura, cucina integrata e finiture coordinate per far percepire la trasformazione naturale, non forzata.", "Custom details, an integrated kitchen and coordinated finishes make the transformation feel natural rather than forced."),
    works: [
      tr("Apertura de cocina y creación de open space", "Apertura cucina e creazione open space", "Kitchen opening and open-space creation"),
      tr("Modernización completa de acabados", "Modernizzazione completa delle finiture", "Full finish modernisation"),
      tr("Materiales cálidos y naturales", "Materiali caldi e naturali", "Warm natural materials"),
      tr("Iluminación ambiental cálida", "Illuminazione ambientale calda", "Warm ambient lighting"),
      tr("Mejora de funcionalidad y percepción del espacio", "Miglioramento funzionale e percettivo dello spazio", "Improved functionality and spatial perception"),
    ],
    materials: [tr("Madera", "Legno", "Wood"), tr("Microcemento", "Microcemento", "Microcement"), tr("Tonos cálidos", "Toni caldi", "Warm tones"), tr("LED indirecto", "LED indiretto", "Indirect LED")],
    result: tr("Un apartamento mucho más acogedor y comercial, coherente con Marina Botafoc y pensado para que cada estancia se sienta más conectada y agradable.", "Un appartamento molto più accogliente e commerciale, coerente con Marina Botafoc e pensato perché ogni ambiente risulti più collegato e piacevole.", "A much more welcoming and marketable apartment, aligned with Marina Botafoc and designed so every area feels more connected and pleasant."),
    crmInterest: "apartment_warm_open_space",
    metaTitle: tr("Warm Contemporary Apartment Transformation | Eivitech Ibiza", "Warm Contemporary Apartment Transformation | Eivitech Ibiza", "Warm Contemporary Apartment Transformation | Eivitech Ibiza"),
    metaDescription: tr("Transformación de apartamento en Marina Botafoc: open space, materiales cálidos, microcemento, madera, cocina abierta y luz ambiental.", "Trasformazione appartamento a Marina Botafoc: open space, materiali caldi, microcemento, legno, cucina aperta e luce ambientale.", "Apartment transformation in Marina Botafoc: open space, warm materials, microcement, wood, open kitchen and ambient lighting."),
  },
  {
    slug: "authentic-ibiza-finca-restoration",
    internalName: "Casa Charlie",
    name: "Authentic Ibiza Finca Restoration",
    type: tr("Finca tradicional", "Finca tradizionale", "Traditional finca"),
    intervention: tr("Restauración y mejora de confort", "Restauro e miglioramento del comfort", "Restoration and comfort upgrade"),
    zone: "Ibiza countryside",
    category: tr("Finca", "Finca", "Finca"),
    style: tr("Rústico auténtico", "Rustico autentico", "Authentic rustic"),
    cover: media("casa-charlie", "cover.jpg"),
    image: media("casa-charlie", "cover.jpg"),
    gallery: ["charlie-01.jpg", "charlie-02.jpg", "charlie-03.jpg", "charlie-04.jpg", "charlie-05.jpg", "charlie-06.jpg", "charlie-07.jpg", "charlie-08.jpg"].map((f) => media("casa-charlie", f)),
    folderHint: "public/media/projects/casa-charlie/",
    short: tr("Restauración de una finca ibicenca con piedra original, materiales naturales y soluciones pensadas para mejorar confort y habitabilidad sin perder carácter.", "Restauro di una finca ibizenca con pietra originale, materiali naturali e soluzioni pensate per migliorare comfort e abitabilità senza perdere carattere.", "Restoration of an Ibizan finca with original stone, natural materials and solutions designed to improve comfort and liveability without losing character."),
    situation: tr("La finca conservaba una identidad muy fuerte, pero necesitaba una intervención cuidadosa para recuperar sus espacios y mejorar su uso diario.", "La finca conservava un'identità molto forte, ma aveva bisogno di un intervento attento per recuperare gli spazi e migliorarne l'uso quotidiano.", "The finca had a very strong identity, but needed a careful intervention to recover its spaces and improve everyday use."),
    goal: tr("Mantener el alma original de la casa y, al mismo tiempo, hacerla más confortable, limpia y preparada para una vida actual.", "Mantenere l'anima originale della casa e, allo stesso tempo, renderla più confortevole, pulita e adatta a una vita contemporanea.", "Preserve the home’s original soul while making it more comfortable, clean and ready for contemporary living."),
    challenge: tr("Restaurar sin borrar la identidad: respetar la piedra antigua, ordenar los espacios y actualizar la finca con materiales coherentes.", "Restaurare senza cancellare l'identità: rispettare la pietra antica, ordinare gli spazi e aggiornare la finca con materiali coerenti.", "Restore without erasing identity: respect the ancient stone, organise the spaces and update the finca with coherent materials."),
    vision: tr("Una finca auténtica y serena, donde la piedra, el travertino, la madera y la luz cálida conviven con un confort más actual.", "Una finca autentica e serena, dove pietra, travertino, legno e luce calda convivono con un comfort più attuale.", "An authentic and calm finca where stone, travertine, wood and warm light coexist with more contemporary comfort."),
    solution: tr("Se trabajó sobre el bloque antiguo de piedra, se mejoró la lectura de los espacios y se introdujeron acabados naturales para reforzar la identidad de la finca sin convertirla en una casa genérica.", "Si è lavorato sul blocco antico in pietra, migliorata la lettura degli spazi e inserite finiture naturali per rafforzare l'identità della finca senza trasformarla in una casa generica.", "The ancient stone volume was carefully worked on, the spaces were made easier to read and natural finishes were introduced to reinforce the finca’s identity without turning it into a generic home."),
    lighting: tr("La luz cálida acompaña la piedra y la madera para mantener una atmósfera rústica, tranquila y confortable.", "La luce calda accompagna pietra e legno per mantenere un'atmosfera rustica, tranquilla e confortevole.", "Warm lighting supports stone and wood, keeping the atmosphere rustic, calm and comfortable."),
    craftsmanship: tr("Trabajo artesanal sobre piedra antigua, selección de materiales naturales y detalles ejecutados con un lenguaje respetuoso con la finca.", "Lavoro artigianale sulla pietra antica, selezione di materiali naturali e dettagli realizzati con un linguaggio rispettoso della finca.", "Craft work on ancient stone, natural material selection and details executed with a language that respects the finca."),
    works: [
      tr("Restauración de elementos originales", "Restauro di elementi originali", "Restoration of original elements"),
      tr("Trabajo artesanal sobre piedra antigua", "Lavoro artigianale su pietra antica", "Craft work on ancient stone"),
      tr("Mejora de confort y habitabilidad", "Miglioramento di comfort e abitabilità", "Comfort and liveability upgrade"),
      tr("Actualización de espacios interiores", "Aggiornamento degli spazi interni", "Interior space update"),
      tr("Acabados con travertino y madera natural", "Finiture con travertino e legno naturale", "Finishes with travertine and natural wood"),
    ],
    materials: [tr("Piedra original", "Pietra originale", "Original stone"), tr("Mortero de cal", "Malta di calce", "Lime mortar"), "Travertino", tr("Madera natural", "Legno naturale", "Natural wood")],
    result: tr("Una finca con alma, más cómoda y más habitable, donde el valor histórico se mantiene y el confort mejora sin borrar la memoria del lugar.", "Una finca con anima, più comoda e più abitabile, dove il valore storico rimane e il comfort migliora senza cancellare la memoria del luogo.", "A soulful, more comfortable and liveable finca, where historic value remains and comfort improves without erasing the memory of the place."),
    crmInterest: "finca_restoration_healthy_home",
    metaTitle: tr("Authentic Ibiza Finca Restoration | Eivitech Ibiza", "Authentic Ibiza Finca Restoration | Eivitech Ibiza", "Authentic Ibiza Finca Restoration | Eivitech Ibiza"),
    metaDescription: tr("Restauración de finca ibicenca con piedra original, materiales naturales, travertino, madera y mejoras de confort respetando el carácter tradicional.", "Restauro finca ibizenca con pietra originale, materiali naturali, travertino, legno e miglioramenti di comfort rispettando il carattere tradizionale.", "Ibiza finca restoration with original stone, natural materials, travertine, wood and comfort upgrades while respecting traditional character."),
  },
  {
    slug: "low-maintenance-mediterranean-landscape",
    internalName: "Proyecto paisajismo exterior",
    name: "Low-Maintenance Mediterranean Landscape",
    type: tr("Exterior", "Esterno", "Outdoor"),
    intervention: tr("Paisajismo mediterráneo", "Paesaggismo mediterraneo", "Mediterranean landscaping"),
    zone: "Ibiza",
    category: tr("Exterior", "Esterno", "Outdoor"),
    style: tr("Mediterráneo de bajo mantenimiento", "Mediterraneo a bassa manutenzione", "Low-maintenance Mediterranean"),
    cover: media("proyecto-paisajismo-exterior", "cover.jpg"),
    image: media("proyecto-paisajismo-exterior", "cover.jpg"),
    gallery: ["paisajismo-01.jpg", "paisajismo-02.jpg", "paisajismo-03.jpg", "paisajismo-04.jpg", "paisajismo-05.jpg", "paisajismo-06.jpg", "paisajismo-07.jpg", "paisajismo-08.jpg"].map((f) => media("proyecto-paisajismo-exterior", f)),
    folderHint: "public/media/projects/proyecto-paisajismo-exterior/",
    short: tr("Un exterior vacío y difícil de leer convertido en un paisaje mediterráneo ordenado, resistente y fácil de mantener, con grava, piedra natural y vegetación seca.", "Un esterno vuoto e difficile da leggere trasformato in un paesaggio mediterraneo ordinato, resistente e facile da mantenere, con ghiaia, pietra naturale e vegetazione secca.", "An empty and unclear outdoor area turned into an ordered, durable and easy-to-maintain Mediterranean landscape with gravel, natural stone and dry planting."),
    situation: tr("El exterior no acompañaba el valor de la propiedad: faltaba estructura visual, los accesos podían leerse mejor y la zona no transmitía una primera impresión cuidada.", "L'esterno non accompagnava il valore della proprietà: mancava struttura visiva, gli accessi potevano essere letti meglio e l'area non trasmetteva una prima impressione curata.", "The exterior did not support the value of the property: it lacked visual structure, the access areas could read better and the space did not create a curated first impression."),
    goal: tr("Crear un exterior atractivo, resistente y sencillo de mantener para una propiedad pensada para uso estacional y clima mediterráneo.", "Creare un esterno attraente, resistente e semplice da mantenere per una proprietà pensata per uso stagionale e clima mediterraneo.", "Create an attractive, durable and easy-to-maintain exterior for a property designed around seasonal use and the Mediterranean climate."),
    challenge: tr("Conseguir impacto visual sin depender de un jardín frágil o de mantenimiento constante.", "Ottenere impatto visivo senza dipendere da un giardino fragile o da manutenzione costante.", "Create visual impact without relying on a fragile garden or constant maintenance."),
    vision: tr("Un paisaje seco mediterráneo, con grava, arena, piedra y cactus integrados en una composición limpia, práctica y con presencia.", "Un paesaggio secco mediterraneo, con ghiaia, sabbia, pietra e cactus integrati in una composizione pulita, pratica e di presenza.", "A dry Mediterranean landscape with gravel, sand, stone and cactus integrated into a clean, practical and visually present composition."),
    solution: tr("Se ordenó el exterior con gravas de distintos tonos, piedra natural y una zona decorativa con arena y cactus, integrando también áreas funcionales como el acceso y el aparcamiento.", "È stato ordinato l'esterno con ghiaie di diverse tonalità, pietra naturale e una zona decorativa con sabbia e cactus, integrando anche aree funzionali come accesso e parcheggio.", "The exterior was structured with different gravel tones, natural stone and a decorative area with sand and cactus, while also integrating functional areas such as access and parking."),
    lighting: tr("Iluminación exterior discreta para acompañar recorridos y destacar texturas sin alterar la calma del paisaje.", "Illuminazione esterna discreta per accompagnare i percorsi e valorizzare le texture senza alterare la calma del paesaggio.", "Discreet outdoor lighting accompanies paths and highlights textures without disturbing the calm of the landscape."),
    craftsmanship: tr("Composición de gravas, piedras, cactus y zonas funcionales pensadas para crear orden visual, impacto y facilidad de mantenimiento.", "Composizione di ghiaie, pietre, cactus e zone funzionali pensate per creare ordine visivo, impatto e facilità di manutenzione.", "Composition of gravel, stones, cactus and functional areas designed to create visual order, impact and ease of maintenance."),
    works: [
      tr("Diseño de jardín seco mediterráneo", "Progettazione giardino secco mediterraneo", "Dry Mediterranean garden design"),
      tr("Zona decorativa con arena y cactus", "Zona decorativa con sabbia e cactus", "Decorative area with sand and cactus"),
      tr("Aparcamiento con grava decorativa", "Parcheggio con ghiaia decorativa", "Decorative gravel parking"),
      tr("Integración de piedra natural", "Integrazione pietra naturale", "Natural stone integration"),
      tr("Solución exterior de bajo mantenimiento", "Soluzione esterna a bassa manutenzione", "Low-maintenance outdoor solution"),
    ],
    materials: [tr("Arena", "Sabbia", "Sand"), tr("Grava decorativa", "Ghiaia decorativa", "Decorative gravel"), tr("Piedra natural", "Pietra naturale", "Natural stone"), "Cactus"],
    result: tr("Un exterior más ordenado, más mediterráneo y mucho más fácil de gestionar, pensado para causar buena impresión sin convertirse en una carga de mantenimiento.", "Un esterno più ordinato, più mediterraneo e molto più facile da gestire, pensato per fare una buona impressione senza diventare un peso di manutenzione.", "A more ordered, more Mediterranean and much easier outdoor area to manage, designed to create a strong impression without becoming a maintenance burden."),
    crmInterest: "outdoor_low_maintenance_landscape",
    metaTitle: tr("Low-Maintenance Mediterranean Landscape | Eivitech Ibiza", "Low-Maintenance Mediterranean Landscape | Eivitech Ibiza", "Low-Maintenance Mediterranean Landscape | Eivitech Ibiza"),
    metaDescription: tr("Paisajismo mediterráneo de bajo mantenimiento en Ibiza con grava, piedra natural, cactus, aparcamiento integrado y exterior de alto impacto visual.", "Paesaggismo mediterraneo a bassa manutenzione a Ibiza con ghiaia, pietra naturale, cactus, parcheggio integrato ed esterni ad alto impatto visivo.", "Low-maintenance Mediterranean landscape in Ibiza with gravel, natural stone, cactus, integrated parking and high-impact outdoor design."),
  },
  {
    slug: "value-oriented-villa-makeover",
    internalName: "Casa Vadella",
    name: "Value-Oriented Villa Makeover",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Makeover orientado a valor", "Makeover orientato al valore", "Value-oriented makeover"),
    zone: "Ibiza",
    category: tr("Villa", "Villa", "Villa"),
    style: tr("Ibiza rustic luxury", "Ibiza rustic luxury", "Ibiza rustic luxury"),
    cover: media("casa-vadella", "cover.jpg"),
    image: media("casa-vadella", "cover.jpg"),
    gallery: ["vadella-01.jpg", "vadella-02.jpg", "vadella-03.jpg", "vadella-04.jpg", "vadella-05.jpg", "vadella-06.jpg"].map((f) => media("casa-vadella", f)),
    folderHint: "public/media/projects/casa-vadella/",
    short: tr("Una villa con buena base transformada con intervenciones precisas para elevar su atractivo, actualizar su imagen y reforzar su valor percibido.", "Una villa con una buona base trasformata con interventi mirati per aumentarne l'attrattiva, aggiornarne l'immagine e rafforzarne il valore percepito.", "A villa with a strong base transformed through precise interventions to raise its appeal, update its image and reinforce perceived value."),
    situation: tr("La estructura funcionaba, pero la propiedad se veía anticuada: acabados poco actuales, puertas simples, cocina desfasada y exteriores que no transmitían todo su potencial.", "La struttura funzionava, ma la proprietà appariva datata: finiture poco attuali, porte semplici, cucina superata ed esterni che non trasmettevano tutto il potenziale.", "The structure worked, but the property looked dated: old finishes, simple doors, an outdated kitchen and outdoor areas that did not communicate its full potential."),
    goal: tr("Actualizar la percepción de la villa sin entrar en una reforma estructural pesada, actuando donde el cambio visual y comercial podía ser mayor.", "Aggiornare la percezione della villa senza entrare in una ristrutturazione strutturale pesante, intervenendo dove il cambiamento visivo e commerciale poteva essere maggiore.", "Update the perception of the villa without entering into a heavy structural renovation, focusing where the visual and market impact could be strongest."),
    challenge: tr("Aumentar atractivo y valor percibido con una intervención inteligente, controlada y muy visible.", "Aumentare attrattiva e valore percepito con un intervento intelligente, controllato e molto visibile.", "Increase appeal and perceived value through an intelligent, controlled and highly visible intervention."),
    vision: tr("Un estilo Ibiza rustic luxury, con microcemento, cocina ibicenca, puertas reinterpretadas y exteriores mucho más cuidados.", "Uno stile Ibiza rustic luxury con microcemento, cucina ibizenca, porte reinterpretate ed esterni molto più curati.", "An Ibiza rustic luxury style with microcement, an Ibizan kitchen, reworked doors and much more curated outdoor areas."),
    solution: tr("Se aplicó microcemento sobre superficies existentes, se reinterpretaron puertas y armarios con un lenguaje más rústico, se actualizó la cocina y se cuidaron exteriores y jardín para cambiar la percepción general de la villa.", "È stato applicato microcemento su superfici esistenti, reinterpretate porte e armadi con un linguaggio più rustico, aggiornata la cucina e curati esterni e giardino per cambiare la percezione generale della villa.", "Microcement was applied over existing surfaces, doors and wardrobes were reworked with a more rustic language, the kitchen was updated and the outdoor and garden areas were curated to change the overall perception of the villa."),
    lighting: tr("Iluminación cálida y materiales naturales para reforzar una sensación de vivienda mediterránea premium sin caer en un resultado demasiado frío.", "Illuminazione calda e materiali naturali per rafforzare una sensazione di casa mediterranea premium senza cadere in un risultato troppo freddo.", "Warm lighting and natural materials reinforce the feeling of a premium Mediterranean home without creating an overly cold result."),
    craftsmanship: tr("Reinterpretación artesanal de elementos existentes, cocina con lenguaje ibicenco y acabados interiores/exteriores pensados para sumar carácter sin rehacer toda la estructura.", "Reinterpretazione artigianale di elementi esistenti, cucina con linguaggio ibizenco e finiture interne/esterne pensate per aggiungere carattere senza rifare tutta la struttura.", "Craft reinterpretation of existing elements, an Ibizan-style kitchen and indoor/outdoor finishes designed to add character without rebuilding the whole structure."),
    works: [
      tr("Microcemento sobre superficies existentes", "Microcemento su superfici esistenti", "Microcement over existing surfaces"),
      tr("Reforma de cocina en estilo ibicenco", "Ristrutturazione cucina in stile ibizenco", "Ibizan-style kitchen renovation"),
      tr("Actualización de puertas y armarios", "Aggiornamento porte e armadi", "Door and wardrobe upgrade"),
      tr("Microcemento exterior", "Microcemento esterno", "Outdoor microcement"),
      tr("Mejora de jardín y espacios exteriores", "Miglioramento giardino e spazi esterni", "Garden and outdoor space improvement"),
    ],
    materials: [tr("Microcemento", "Microcemento", "Microcement"), tr("Madera", "Legno", "Wood"), tr("Detalles negros", "Dettagli neri", "Black details"), tr("Acabados rústicos", "Finiture rustiche", "Rustic finishes")],
    result: tr("Una villa con una imagen mucho más actual, coherente y comercial, donde pocos gestos bien elegidos cambian la lectura completa de la propiedad.", "Una villa con un'immagine molto più attuale, coerente e commerciale, dove pochi gesti ben scelti cambiano la lettura completa della proprietà.", "A villa with a much more contemporary, coherent and marketable image, where a few well-chosen moves change the full reading of the property."),
    crmInterest: "villa_value_makeover",
    metaTitle: tr("Value-Oriented Villa Makeover | Eivitech Ibiza", "Value-Oriented Villa Makeover | Eivitech Ibiza", "Value-Oriented Villa Makeover | Eivitech Ibiza"),
    metaDescription: tr("Makeover de villa en Ibiza orientado a valor: microcemento, cocina ibicenca, puertas, exteriores y acabados para elevar la percepción comercial.", "Makeover villa a Ibiza orientato al valore: microcemento, cucina ibizenca, porte, esterni e finiture per alzare la percezione commerciale.", "Value-oriented villa makeover in Ibiza: microcement, Ibizan kitchen, doors, outdoor areas and finishes to raise market appeal."),
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);