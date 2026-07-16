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
    slug: "investment-oriented-villa-makeover",
    internalName: "Casa Vadella",
    name: "Ibiza Villa Value Makeover",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Makeover orientado a valor", "Makeover orientato al valore", "Value-oriented makeover"),
    zone: "Ibiza",
    category: tr("Villa", "Villa", "Villa"),
    style: tr("Ibiza rustic luxury", "Ibiza rustic luxury", "Ibiza rustic luxury"),
    cover: media("casa-vadella", "casa-vadella-ibiza-mediterranean-garden-cover.webp"),
    image: media("casa-vadella", "casa-vadella-ibiza-mediterranean-garden-cover.webp"),
    gallery: [
      "casa-vadella-ibiza-blue-bathroom-detail.webp",
      "casa-vadella-ibiza-blue-microcement-bathroom.webp",
      "casa-vadella-ibiza-rustic-wood-door.webp",
      "casa-vadella-ibiza-rooftop-terrace.webp",
      "casa-vadella-ibiza-white-villa-exterior.webp",
      "casa-vadella-ibiza-covered-terrace.webp",
      "casa-vadella-ibiza-bedroom-natural-details.webp",
      "casa-vadella-ibiza-dining-living-open-space.webp",
      "casa-vadella-ibiza-pool-terrace-view.webp",
    ].map((f) => media("casa-vadella", f)),
    folderHint: "public/media/projects/casa-vadella/",
    short: tr("Una villa con buena estructura transformada con un make-up inteligente: sin rehacerlo todo, pero cambiando por completo su percepción.", "Una villa con una buona struttura trasformata con un make-up intelligente: senza rifare tutto, ma cambiando completamente la sua percezione.", "A villa with a good structure transformed through an intelligent make-up: without rebuilding everything, but completely changing its perception."),
    situation: tr("La base de la villa era válida, pero la imagen estaba desactualizada: puertas blancas antiguas, cocina vieja, acabados cansados y exteriores sin fuerza.", "La base della villa era valida, ma l'immagine era datata: vecchie porte bianche, cucina superata, finiture stanche ed esterni senza forza.", "The villa had a valid base, but its image was outdated: old white doors, an old kitchen, tired finishes and outdoor areas without strength."),
    goal: tr("Aumentar el valor percibido de la propiedad actuando sobre los puntos que más cambian la lectura de una casa: pavimentos, puertas, cocina, exteriores y jardín.", "Aumentare il valore percepito della proprietà intervenendo sui punti che cambiano di più la lettura di una casa: pavimenti, porte, cucina, esterni e giardino.", "Increase the perceived value of the property by acting on the elements that change a home’s reading the most: floors, doors, kitchen, outdoor areas and garden."),
    challenge: tr("Conseguir una transformación fuerte sin modificar la estructura principal ni convertir la intervención en una obra pesada.", "Ottenere una trasformazione forte senza modificare la struttura principale né trasformare l'intervento in un cantiere pesante.", "Achieve a strong transformation without changing the main structure or turning the intervention into a heavy construction project."),
    vision: tr("Un estilo Ibiza rustic luxury, con microcemento, puertas reinterpretadas, detalles negros y una cocina ibicenca mucho más atractiva.", "Uno stile Ibiza rustic luxury, con microcemento, porte reinterpretate, dettagli neri e una cucina ibizenca molto più attrattiva.", "An Ibiza rustic luxury style with microcement, reworked doors, black details and a much more attractive Ibizan kitchen."),
    solution: tr("Se aplicó microcemento sobre el pavimento existente, se lijaron y transformaron puertas y armarios con un lenguaje rústico, se rehizo la cocina en estilo ibicenco y se trabajaron exteriores, microcemento exterior y jardín.", "È stato applicato microcemento sul pavimento esistente, carteggiate e trasformate porte e armadi con un linguaggio rustico, rifatta la cucina in stile ibizenco e lavorati esterni, microcemento esterno e giardino.", "Microcement was applied over the existing floor, doors and wardrobes were sanded and transformed with a rustic language, the kitchen was rebuilt in an Ibizan style and the outdoor areas, exterior microcement and garden were upgraded."),
    lighting: tr("Iluminación cálida y detalles oscuros para reforzar un carácter mediterráneo más actual y con más presencia.", "Illuminazione calda e dettagli scuri per rafforzare un carattere mediterraneo più attuale e di maggiore presenza.", "Warm lighting and dark details reinforce a more current Mediterranean character with stronger presence."),
    craftsmanship: tr("El trabajo clave fue reinterpretar lo existente: puertas blancas convertidas en piezas rústicas, armarios actualizados, cocina renovada y materiales que cambian la lectura de toda la villa.", "Il lavoro chiave è stato reinterpretare l'esistente: porte bianche trasformate in elementi rustici, armadi aggiornati, cucina rinnovata e materiali che cambiano la lettura di tutta la villa.", "The key work was to reinterpret what already existed: white doors turned into rustic pieces, updated wardrobes, a renovated kitchen and materials that change the whole reading of the villa."),
    works: [
      tr("Microcemento sobre pavimento existente", "Microcemento su pavimento esistente", "Microcement over existing flooring"),
      tr("Transformación de puertas blancas antiguas", "Trasformazione di vecchie porte bianche", "Transformation of old white doors"),
      tr("Cocina nueva en estilo ibicenco", "Nuova cucina in stile ibizenco", "New Ibizan-style kitchen"),
      tr("Microcemento exterior", "Microcemento esterno", "Outdoor microcement"),
      tr("Mejora de jardín y espacios exteriores", "Miglioramento giardino e spazi esterni", "Garden and outdoor space improvement"),
    ],
    materials: [tr("Microcemento", "Microcemento", "Microcement"), tr("Madera", "Legno", "Wood"), tr("Chiodini / detalles negros", "Chiodini / dettagli neri", "Black nail details"), tr("Acabados rústicos", "Finiture rustiche", "Rustic finishes")],
    result: tr("Una villa que parece otra sin haber cambiado su estructura principal: más actual, más atractiva y con una percepción de valor mucho más alta.", "Una villa che sembra un'altra senza aver cambiato la struttura principale: più attuale, più attrattiva e con una percezione di valore molto più alta.", "A villa that feels like a different property without changing its main structure: more current, more attractive and with a much higher perceived value."),
    crmInterest: "villa_value_makeover",
    metaTitle: tr("Ibiza Villa Value Makeover | Eivitech Ibiza", "Ibiza Villa Value Makeover | Eivitech Ibiza", "Ibiza Villa Value Makeover | Eivitech Ibiza"),
    metaDescription: tr("Makeover de villa en Ibiza para elevar valor percibido: microcemento, puertas rústicas, cocina ibicenca, exteriores y jardín sin cambiar la estructura principal.", "Makeover villa a Ibiza per alzare il valore percepito: microcemento, porte rustiche, cucina ibizenca, esterni e giardino senza cambiare la struttura principale.", "Ibiza villa makeover to raise perceived value: microcement, rustic doors, Ibizan kitchen, outdoor areas and garden without changing the main structure."),
  },
  {
    slug: "luxury-mediterranean-villa-renovation",
    internalName: "Casa Vinya",
    name: "Luxury Mediterranean Villa Renovation",
    type: tr("Villa", "Villa", "Villa"),
    intervention: tr("Reforma completa personalizada", "Ristrutturazione completa personalizzata", "Tailored full renovation"),
    zone: "Ibiza",
    category: tr("Villa", "Villa", "Villa"),
    style: tr("Mediterráneo personalizado", "Mediterraneo personalizzato", "Tailored Mediterranean"),
    cover: media("casa-vinya", "casa-vinya-ibiza-open-plan-living-cover.webp"),
    image: media("casa-vinya", "casa-vinya-ibiza-open-plan-living-cover.webp"),
    gallery: [
      "casa-vinya-ibiza-long-kitchen-wood-cabinetry.webp",
      "casa-vinya-ibiza-kitchen-island-storage.webp",
      "casa-vinya-ibiza-natural-wood-counter-detail.webp",
      "casa-vinya-ibiza-stair-hall.webp",
      "casa-vinya-ibiza-bright-open-living.webp",
      "casa-vinya-ibiza-staircase-kitchen-view.webp",
      "casa-vinya-ibiza-modern-fireplace.webp",
    ].map((f) => media("casa-vinya", f)),
    folderHint: "public/media/projects/casa-vinya/",
    short: tr("Una reforma completa pensada alrededor del cliente: espacios personalizados, vestidor de gran formato, instalaciones actualizadas y una gestión integral de obra.", "Una ristrutturazione completa pensata attorno al cliente: spazi personalizzati, grande cabina armadio, impianti aggiornati e gestione integrale dei lavori.", "A complete renovation designed around the client: personalised spaces, a large walk-in wardrobe, upgraded systems and full project coordination."),
    situation: tr("La villa necesitaba mucho más que un cambio de acabados. Había que adaptar espacios, instalaciones y detalles a una forma concreta de vivir.", "La villa aveva bisogno di molto più di un cambio di finiture. Bisognava adattare spazi, impianti e dettagli a un modo concreto di vivere.", "The villa needed far more than a finish update. Spaces, systems and details had to be adapted to a specific way of living."),
    goal: tr("Crear una casa muy personalizada, cómoda y funcional, donde cada zona respondiera a una necesidad real del propietario.", "Creare una casa molto personalizzata, comoda e funzionale, dove ogni zona rispondesse a una reale esigenza del proprietario.", "Create a highly personalised, comfortable and functional home, where each area responded to a real need of the owner."),
    challenge: tr("Coordinar una reforma integral sin perder el control del detalle: obra, cartón yeso, instalaciones, climatización, aerotermia, acabados y soluciones a medida.", "Coordinare una ristrutturazione integrale senza perdere il controllo del dettaglio: opere, cartongesso, impianti, climatizzazione, aerotermia, finiture e soluzioni su misura.", "Coordinate a full renovation without losing control of detail: building work, drywall, systems, climate, aerothermal equipment, finishes and bespoke solutions."),
    vision: tr("Una villa construida alrededor de las rutinas del cliente, con espacios útiles, almacenamiento real y un lenguaje mediterráneo cálido.", "Una villa costruita attorno alle abitudini del cliente, con spazi utili, contenimento reale e un linguaggio mediterraneo caldo.", "A villa built around the client’s routines, with useful spaces, real storage and a warm Mediterranean language."),
    solution: tr("Eivitech se ocupó de coordinar la intervención completa, desde la parte técnica hasta los detalles visibles, incluyendo soluciones muy personalizadas como un gran walk-in wardrobe.", "Eivitech si è occupata di coordinare l'intervento completo, dalla parte tecnica ai dettagli visibili, includendo soluzioni molto personalizzate come una grande cabina armadio.", "Eivitech coordinated the whole intervention, from the technical side to the visible details, including highly personalised solutions such as a large walk-in wardrobe."),
    lighting: tr("Iluminación cálida integrada para acompañar materiales naturales y hacer que la villa se sintiera más acogedora en el uso diario.", "Illuminazione calda integrata per accompagnare materiali naturali e far percepire la villa più accogliente nell'uso quotidiano.", "Integrated warm lighting supports natural materials and makes the villa feel more welcoming in everyday use."),
    craftsmanship: tr("Carpintería, almacenamiento, acabados y soluciones a medida ejecutadas según las necesidades concretas del cliente.", "Falegnameria, contenimento, finiture e soluzioni su misura eseguite secondo le esigenze concrete del cliente.", "Carpentry, storage, finishes and bespoke solutions executed around the client’s concrete needs."),
    works: [
      tr("Reforma completa de interiores", "Ristrutturazione completa degli interni", "Full interior renovation"),
      tr("Muratura, cartón yeso y acabados", "Muratura, cartongesso e finiture", "Masonry, drywall and finishes"),
      tr("Walk-in wardrobe de gran formato", "Grande cabina armadio", "Large walk-in wardrobe"),
      tr("Instalaciones eléctricas, climatización y aerotermia", "Impianti elettrici, climatizzazione e aerotermia", "Electrical, HVAC and aerothermal systems"),
      tr("Espacios personalizados según el cliente", "Spazi personalizzati secondo il cliente", "Client-specific personalised spaces"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Microcemento / acabado continuo", "Microcemento / finitura continua", "Microcement / continuous finish"), tr("Iluminación cálida", "Illuminazione calda", "Warm lighting"), tr("Carpintería a medida", "Falegnameria su misura", "Bespoke carpentry")],
    result: tr("Una villa más personal y mejor resuelta, donde el lujo no está solo en la estética, sino en que la casa funciona exactamente para quien la vive.", "Una villa più personale e meglio risolta, dove il lusso non è solo nell'estetica, ma nel fatto che la casa funziona esattamente per chi la vive.", "A more personal and better-resolved villa, where luxury is not only aesthetic but in the fact that the home works exactly for the person living in it."),
    crmInterest: "villa_tailored_full_renovation",
    metaTitle: tr("Luxury Mediterranean Villa Renovation | Eivitech Ibiza", "Luxury Mediterranean Villa Renovation | Eivitech Ibiza", "Luxury Mediterranean Villa Renovation | Eivitech Ibiza"),
    metaDescription: tr("Reforma completa de villa en Ibiza con espacios personalizados, walk-in wardrobe, instalaciones actualizadas, aerotermia, carpintería y acabados a medida.", "Ristrutturazione completa villa a Ibiza con spazi personalizzati, cabina armadio, impianti aggiornati, aerotermia, falegnameria e finiture su misura.", "Full villa renovation in Ibiza with personalised spaces, walk-in wardrobe, upgraded systems, aerothermal equipment, carpentry and bespoke finishes."),
  },
  {
    slug: "warm-contemporary-apartment-transformation",
    internalName: "Casa Mediterraneo",
    name: "Premium Apartment Renovation – Marina Botafoc",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Transformación cálida estilo Ibiza", "Trasformazione calda in stile Ibiza", "Warm Ibiza-style transformation"),
    zone: "Marina Botafoc, Ibiza",
    category: tr("Apartamento", "Appartamento", "Apartment"),
    style: tr("Cálido ibicenco", "Caldo ibizenco", "Warm Ibiza style"),
    cover: media("casa-mediterraneo", "casa-mediterraneo-ibiza-kitchen-front-cover.webp"),
    image: media("casa-mediterraneo", "casa-mediterraneo-ibiza-kitchen-front-cover.webp"),
    gallery: [
      "casa-mediterraneo-ibiza-warm-living-room.webp",
      "casa-mediterraneo-ibiza-custom-dining-kitchen.webp",
      "casa-mediterraneo-ibiza-bedroom-warm-lighting.webp",
      "casa-mediterraneo-ibiza-open-kitchen.webp",
      "casa-mediterraneo-ibiza-bathroom-double-pendant.webp",
    ].map((f) => media("casa-mediterraneo", f)),
    folderHint: "public/media/projects/casa-mediterraneo/",
    short: tr("De apartamento cerrado y frío de los años 90 a open space cálido, acogedor y alineado con el estilo de vida de Ibiza.", "Da appartamento chiuso e freddo anni '90 a open space caldo, accogliente e allineato allo stile di vita di Ibiza.", "From a closed, cold 90s apartment to a warm, welcoming open space aligned with the Ibiza lifestyle."),
    situation: tr("Antes, la vivienda tenía cocina cerrada, barra americana de otra época, materiales fríos y baldosas grises que hacían que el espacio se sintiera antiguo y poco amable.", "Prima, la casa aveva cucina chiusa, bancone americano datato, materiali freddi e piastrelle grigie che rendevano lo spazio vecchio e poco accogliente.", "Before, the home had a closed kitchen, an outdated American-style bar, cold materials and grey tiles that made the space feel old and unwelcoming."),
    goal: tr("Abrir el apartamento, hacerlo más cómodo y llevarlo a un lenguaje ibicenco actual, cálido y fácil de vivir.", "Aprire l'appartamento, renderlo più comodo e portarlo a un linguaggio ibizenco attuale, caldo e facile da vivere.", "Open up the apartment, make it more comfortable and bring it into a current, warm and easy-to-live Ibiza language."),
    challenge: tr("Cambiar por completo la sensación de la vivienda sin perder funcionalidad en un espacio reducido.", "Cambiare completamente la sensazione della casa senza perdere funzionalità in uno spazio ridotto.", "Completely change the feeling of the home without losing functionality in a compact space."),
    vision: tr("Un open space mediterráneo con madera, microcemento, tonos cálidos y una iluminación que crea relax desde el momento en que entras.", "Un open space mediterraneo con legno, microcemento, toni caldi e un'illuminazione che crea relax dal momento in cui entri.", "A Mediterranean open space with wood, microcement, warm tones and lighting that creates relaxation from the moment you enter."),
    solution: tr("Se abrió la cocina, se eliminó la lectura antigua de la barra, se modernizaron acabados y se creó una atmósfera más natural con materiales cálidos y luz indirecta.", "È stata aperta la cucina, eliminata la lettura datata del bancone, modernizzate le finiture e creata un'atmosfera più naturale con materiali caldi e luce indiretta.", "The kitchen was opened, the outdated bar feeling was removed, finishes were modernised and a more natural atmosphere was created with warm materials and indirect light."),
    lighting: tr("El proyecto se apoya mucho en la luz: tonos cálidos, LED indirecto y puntos de ambiente en lugar del clásico foco frío.", "Il progetto lavora molto sulla luce: toni caldi, LED indiretto e punti d'atmosfera invece del classico faretto freddo.", "The project relies heavily on lighting: warm tones, indirect LED and atmosphere points instead of the usual cold spotlight."),
    craftsmanship: tr("La carpintería a medida integra los muebles de cocina y la mesa de comedor en una composición continua, pensada para aprovechar el espacio reducido sin perder calidez.", "La falegnameria su misura integra i mobili della cucina e il tavolo da pranzo in una composizione continua, progettata per sfruttare lo spazio ridotto senza rinunciare al calore.", "Bespoke joinery integrates the kitchen cabinetry and dining table into a continuous composition designed to make the most of the compact apartment without losing warmth.", "Het maatwerk timmerwerk integreert de keukenkasten en eettafel in één doorlopende compositie, ontworpen om de compacte ruimte optimaal te benutten zonder aan warmte in te boeten."),
    works: [
      tr("Apertura de cocina y creación de open space", "Apertura cucina e creazione open space", "Kitchen opening and open-space creation"),
      tr("Eliminación de lectura antigua años 90", "Eliminazione dell'immagine datata anni '90", "Removal of the dated 90s look"),
      tr("Microcemento, madera y tonos cálidos", "Microcemento, legno e toni caldi", "Microcement, wood and warm tones"),
      tr("Iluminación cálida e indirecta", "Illuminazione calda e indiretta", "Warm indirect lighting"),
      tr("Mejor gestión de un espacio pequeño", "Migliore gestione di uno spazio piccolo", "Smarter use of a compact space"),
    ],
    materials: [tr("Madera", "Legno", "Wood"), tr("Microcemento", "Microcemento", "Microcement"), tr("Tonos cálidos", "Toni caldi", "Warm tones"), tr("LED indirecto", "LED indiretto", "Indirect LED")],
    result: tr("Un apartamento más actual, más emocional y mucho más agradable de vivir, donde la luz y los materiales hacen que el espacio se sienta inmediatamente más Ibiza.", "Un appartamento più attuale, più emozionale e molto più piacevole da vivere, dove luce e materiali fanno percepire subito lo spazio più Ibiza.", "A more current, more emotional and much more pleasant apartment to live in, where light and materials immediately make the space feel more Ibiza."),
    crmInterest: "apartment_warm_open_space",
    metaTitle: tr("Premium Apartment Renovation – Marina Botafoc | Eivitech Ibiza", "Premium Apartment Renovation – Marina Botafoc | Eivitech Ibiza", "Premium Apartment Renovation – Marina Botafoc | Eivitech Ibiza"),
    metaDescription: tr("Renovación de apartamento en Marina Botafoc: cocina abierta, open space, microcemento, madera, tonos cálidos y luz indirecta estilo Ibiza.", "Ristrutturazione appartamento a Marina Botafoc: cucina aperta, open space, microcemento, legno, toni caldi e luce indiretta in stile Ibiza.", "Apartment renovation in Marina Botafoc: open kitchen, open space, microcement, wood, warm tones and indirect Ibiza-style lighting."),
  },
  {
    slug: "authentic-ibiza-finca-restoration",
    internalName: "Casa Charlie",
    name: "Rustic Finca Restoration – Ibiza Countryside",
    type: tr("Finca rústica", "Finca rustica", "Rustic finca"),
    intervention: tr("Restauro de piedra y humedad", "Restauro pietra e umidità", "Stone and moisture restoration"),
    zone: "Ibiza countryside",
    category: tr("Finca", "Finca", "Finca"),
    style: tr("Rústico auténtico", "Rustico autentico", "Authentic rustic"),
    cover: media("casa-charlie", "casa-charlie-ibiza-rustic-finca-exterior-cover.webp"),
    image: media("casa-charlie", "casa-charlie-ibiza-rustic-finca-exterior-cover.webp"),
    gallery: [
      "casa-charlie-ibiza-stone-interior-connected-rooms.webp",
      "casa-charlie-ibiza-original-stone-facade.webp",
      "casa-charlie-ibiza-stone-wall-built-in-shelves.webp",
      "casa-charlie-ibiza-rustic-bathroom-corridor.webp",
    ].map((f) => media("casa-charlie", f)),
    folderHint: "public/media/projects/casa-charlie/",
    short: tr("Restaurar una finca antigua sin borrar su alma: piedra original, mortero de cal, drenaje perimetral y materiales naturales para mejorar confort y habitabilidad.", "Restaurare una finca antica senza cancellarne l'anima: pietra originale, malta di calce, drenaggio perimetrale e materiali naturali per migliorare comfort e abitabilità.", "Restoring an old finca without erasing its soul: original stone, lime mortar, perimeter drainage and natural materials to improve comfort and liveability."),
    situation: tr("La casa tenía un bloque antiguo de piedra con mucha presencia, pero también problemas de humedad y acumulación de agua alrededor de la finca.", "La casa aveva un blocco antico in pietra di grande presenza, ma anche problemi di umidità e accumulo d'acqua attorno alla finca.", "The house had a strong ancient stone volume, but also moisture issues and water accumulating around the finca."),
    goal: tr("Conservar la parte antigua, hacerla más seca y limpia, y actualizarla con materiales clásicos que respetaran la identidad rural.", "Conservare la parte antica, renderla più asciutta e pulita e aggiornarla con materiali classici che rispettassero l'identità rurale.", "Preserve the ancient part, make it drier and cleaner, and update it with classic materials that respected its rural identity."),
    challenge: tr("Resolver un problema técnico real sin convertir la finca en una casa nueva sin carácter.", "Risolvere un problema tecnico reale senza trasformare la finca in una casa nuova senza carattere.", "Solve a real technical issue without turning the finca into a new house without character."),
    vision: tr("Una finca rústica, sana en su sensación diaria, con piedra antigua visible, travertino, madera natural y una atmósfera tranquila.", "Una finca rustica, sana nella sensazione quotidiana, con pietra antica a vista, travertino, legno naturale e un'atmosfera tranquilla.", "A rustic finca with a healthier everyday feeling, visible ancient stone, travertine, natural wood and a calm atmosphere."),
    solution: tr("Se restauró el bloque de piedra, se aplicó mortero de cal natural para ayudar a gestionar la humedad y se realizó drenaje alrededor de la finca para evitar acumulaciones de agua cuando llueve.", "È stato restaurato il blocco in pietra, applicata malta di calce naturale per aiutare a gestire l'umidità e realizzato un drenaggio attorno alla finca per evitare accumuli d'acqua quando piove.", "The stone volume was restored, natural lime mortar was applied to help manage moisture, and drainage was built around the finca to avoid water accumulation when it rains."),
    lighting: tr("La luz cálida acompaña la piedra y la madera para mantener una atmósfera rústica, tranquila y confortable.", "La luce calda accompagna pietra e legno per mantenere un'atmosfera rustica, tranquilla e confortevole.", "Warm lighting supports stone and wood, keeping the atmosphere rustic, calm and comfortable."),
    craftsmanship: tr("Trabajo artesanal sobre muros de piedra, aplicación de mortero de cal, drenaje exterior y acabados clásicos como travertino y madera natural rústica.", "Lavoro artigianale su muri in pietra, applicazione di malta di calce, drenaggio esterno e finiture classiche come travertino e legno naturale rustico.", "Craft work on stone walls, lime mortar application, exterior drainage and classic finishes such as travertine and rustic natural wood."),
    works: [
      tr("Restauración de bloque antiguo de piedra", "Restauro del blocco antico in pietra", "Ancient stone volume restoration"),
      tr("Aplicación de mortero natural de cal", "Applicazione di malta naturale di calce", "Natural lime mortar application"),
      tr("Drenaje perimetral de la finca", "Drenaggio perimetrale della finca", "Perimeter drainage around the finca"),
      tr("Tratamiento de muros afectados por humedad", "Trattamento di muri interessati da umidità", "Treatment of moisture-affected walls"),
      tr("Actualización con travertino y madera natural", "Aggiornamento con travertino e legno naturale", "Upgrade with travertine and natural wood"),
    ],
    materials: [tr("Piedra original", "Pietra originale", "Original stone"), tr("Mortero de cal", "Malta di calce", "Lime mortar"), "Travertino", tr("Madera natural rústica", "Legno naturale rustico", "Rustic natural wood")],
    result: tr("Una finca que conserva su parte antigua, pero se siente más seca, más limpia y mucho más cómoda para vivir.", "Una finca che conserva la sua parte antica, ma si percepisce più asciutta, più pulita e molto più comoda da vivere.", "A finca that keeps its ancient part, but feels drier, cleaner and much more comfortable to live in."),
    crmInterest: "finca_restoration_humidity_stone",
    metaTitle: tr("Rustic Finca Restoration – Ibiza Countryside | Eivitech", "Rustic Finca Restoration – Ibiza Countryside | Eivitech", "Rustic Finca Restoration – Ibiza Countryside | Eivitech"),
    metaDescription: tr("Restauro de finca rústica en Ibiza con piedra antigua, mortero de cal, drenaje perimetral, travertino y madera natural.", "Restauro finca rustica a Ibiza con pietra antica, malta di calce, drenaggio perimetrale, travertino e legno naturale.", "Rustic finca restoration in Ibiza with ancient stone, lime mortar, perimeter drainage, travertine and natural wood."),
  },
  {
    slug: "modern-minimal-apartment-marina-botafoch",
    internalName: "Boas",
    name: "Modern Minimal Apartment – Marina Botafoc",
    type: tr("Apartamento", "Appartamento", "Apartment"),
    intervention: tr("Renovación minimalista a medida", "Ristrutturazione minimalista su misura", "Bespoke minimal renovation"),
    zone: "Marina Botafoc, Ibiza",
    category: tr("Apartamento", "Appartamento", "Apartment"),
    style: tr("Minimal moderno", "Minimal moderno", "Modern minimal"),
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
    short: tr("Un apartamento en Marina Botafoc donde el valor real estaba en recuperar espacio: menos metros perdidos, líneas más limpias y una cocina a medida realizada en Italia.", "Un appartamento a Marina Botafoc dove il vero valore era recuperare spazio: meno metri persi, linee più pulite e una cucina su misura realizzata in Italia.", "A Marina Botafoc apartment where the real value was recovered space: fewer wasted metres, cleaner lines and a bespoke kitchen made in Italy."),
    situation: tr("Antes, la vivienda era clásica y perdía demasiados metros en circulación. La distribución con pasillos y un bloque central de habitaciones hacía que el apartamento pareciera menos amplio y menos actual.", "Prima, la casa era classica e perdeva troppi metri nella circolazione. La distribuzione con corridoi e un blocco centrale di stanze faceva sembrare l'appartamento meno ampio e meno attuale.", "Before, the home was classic and lost too much space in circulation. The corridor layout and central room block made the apartment feel smaller and less current than it could be."),
    goal: tr("Aprovechar mejor cada metro y transformar la vivienda en un apartamento minimalista, moderno y mucho más claro en su uso diario.", "Sfruttare meglio ogni metro e trasformare la casa in un appartamento minimalista, moderno e molto più chiaro nell'uso quotidiano.", "Make better use of every metre and turn the home into a minimal, modern apartment with a much clearer everyday use."),
    challenge: tr("Mejorar el espacio sin hacer una intervención fría: el apartamento necesitaba precisión, líneas rectas y soluciones a medida, pero también una sensación habitable.", "Migliorare lo spazio senza creare un risultato freddo: l'appartamento aveva bisogno di precisione, linee dritte e soluzioni su misura, ma anche di una sensazione abitabile.", "Improve the space without creating a cold result: the apartment needed precision, straight lines and bespoke solutions, but still had to feel liveable."),
    vision: tr("Una casa más limpia y squadrada, donde la distribución trabaja a favor del espacio y la cocina se convierte en una pieza importante del proyecto.", "Una casa più pulita e squadrata, dove la distribuzione lavora a favore dello spazio e la cucina diventa una parte importante del progetto.", "A cleaner, more squared home, where the layout works in favour of the space and the kitchen becomes an important part of the project."),
    solution: tr("Eivitech reorganizó la lectura del apartamento, redujo la sensación de espacio perdido y trabajó una estética minimalista con cocina hecha a medida y acabados cálidos.", "Eivitech ha riorganizzato la lettura dell'appartamento, ridotto la sensazione di spazio perso e lavorato su un'estetica minimalista con cucina fatta su misura e finiture calde.", "Eivitech reorganised the way the apartment reads, reduced the feeling of wasted space and created a minimal aesthetic with a made-to-measure kitchen and warm finishes."),
    lighting: tr("Luz cálida e indirecta para que las líneas minimalistas se perciban elegantes, no frías.", "Luce calda e indiretta per far percepire le linee minimaliste eleganti, non fredde.", "Warm indirect lighting makes the minimal lines feel elegant rather than cold."),
    craftsmanship: tr("Cocina a medida llegada desde Italia, carpintería personalizada y detalles pensados específicamente para este apartamento.", "Cucina su misura arrivata dall'Italia, falegnameria personalizzata e dettagli pensati specificamente per questo appartamento.", "A bespoke kitchen brought from Italy, custom carpentry and details designed specifically for this apartment."),
    works: [
      tr("Optimización de distribución y pasillos", "Ottimizzazione di distribuzione e corridoi", "Layout and corridor optimisation"),
      tr("Cocina a medida Made in Italy", "Cucina su misura Made in Italy", "Bespoke Made in Italy kitchen"),
      tr("Estética minimalista con líneas rectas", "Estetica minimalista con linee dritte", "Minimal aesthetic with straight lines"),
      tr("Mobiliario y detalles a medida", "Arredi e dettagli su misura", "Custom furniture and details"),
      tr("Iluminación cálida e indirecta", "Illuminazione calda e indiretta", "Warm indirect lighting"),
    ],
    materials: [tr("Madera natural", "Legno naturale", "Natural wood"), tr("Cocina Made in Italy", "Cucina Made in Italy", "Made in Italy kitchen"), tr("Iluminación LED cálida", "Illuminazione LED calda", "Warm LED lighting"), tr("Acabados continuos", "Finiture continue", "Continuous finishes")],
    result: tr("Un apartamento más moderno y mejor aprovechado, donde la diferencia se nota tanto en la imagen final como en la forma de moverse y vivir el espacio.", "Un appartamento più moderno e meglio sfruttato, dove la differenza si nota sia nell'immagine finale sia nel modo di muoversi e vivere lo spazio.", "A more modern and better-used apartment, where the difference is visible both in the final image and in how the space is moved through and lived."),
    crmInterest: "apartment_minimal_marina_botafoc",
    metaTitle: tr("Modern Minimal Apartment – Marina Botafoc | Eivitech Ibiza", "Modern Minimal Apartment – Marina Botafoc | Eivitech Ibiza", "Modern Minimal Apartment – Marina Botafoc | Eivitech Ibiza"),
    metaDescription: tr("Reforma minimalista en Marina Botafoc con mejor distribución, cocina Made in Italy a medida, líneas rectas, luz cálida y espacios mejor aprovechados.", "Ristrutturazione minimalista a Marina Botafoc con migliore distribuzione, cucina Made in Italy su misura, linee dritte, luce calda e spazi meglio sfruttati.", "Minimal renovation in Marina Botafoc with a better layout, bespoke Made in Italy kitchen, straight lines, warm light and better-used space."),
  },
  {
    slug: "low-maintenance-mediterranean-landscape",
    internalName: "Proyecto paisajismo exterior",
    name: "Desert Style Outdoor Renovation",
    type: tr("Exterior", "Esterno", "Outdoor"),
    intervention: tr("Exterior low maintenance", "Esterno low maintenance", "Low-maintenance outdoor renovation"),
    zone: "Ibiza",
    category: tr("Exterior", "Esterno", "Outdoor"),
    style: tr("Desert style mediterráneo", "Desert style mediterraneo", "Mediterranean desert style"),
    cover: media("proyecto-paisajismo-exterior", "cover.jpg"),
    image: media("proyecto-paisajismo-exterior", "cover.jpg"),
    gallery: ["paisajismo-01.jpg", "paisajismo-02.jpg", "paisajismo-03.jpg", "paisajismo-04.jpg", "paisajismo-05.jpg", "paisajismo-06.jpg", "paisajismo-07.jpg", "paisajismo-08.jpg"].map((f) => media("proyecto-paisajismo-exterior", f)),
    folderHint: "public/media/projects/proyecto-paisajismo-exterior/",
    short: tr("De un exterior árido y vacío a una zona con efecto wow, diseñada para verse bien con la menor manutención posible.", "Da esterno arido e vuoto a zona con effetto wow, progettata per apparire curata con la minore manutenzione possibile.", "From an arid, empty exterior to a wow-effect outdoor area designed to look good with as little maintenance as possible."),
    situation: tr("Antes no había una lectura clara del exterior: era un espacio seco, vacío y sin una intención visual fuerte.", "Prima non c'era una lettura chiara dell'esterno: era uno spazio secco, vuoto e senza una forte intenzione visiva.", "Before, the exterior had no clear reading: it was dry, empty and lacked a strong visual intention."),
    goal: tr("Crear una solución bonita y práctica para una casa de uso estacional, evitando un jardín que exigiera mantenimiento constante.", "Creare una soluzione bella e pratica per una casa a uso stagionale, evitando un giardino che richiedesse manutenzione costante.", "Create a beautiful and practical solution for a seasonally used home, avoiding a garden that would require constant upkeep."),
    challenge: tr("Lograr impacto visual sin depender de plantas delicadas, cortes frecuentes ni costes mensuales altos de jardinería.", "Ottenere impatto visivo senza dipendere da piante delicate, tagli frequenti o costi mensili alti di giardinaggio.", "Achieve visual impact without relying on delicate plants, frequent trimming or high monthly gardening costs."),
    vision: tr("Un paisaje seco de estilo mediterráneo-desértico, con grava, arena, piedra y cactus, pensado para durar y mantener una imagen cuidada.", "Un paesaggio secco in stile mediterraneo-desertico, con ghiaia, sabbia, pietra e cactus, pensato per durare e mantenere un'immagine curata.", "A dry Mediterranean-desert landscape with gravel, sand, stone and cactus, designed to last and keep a curated image."),
    solution: tr("Eivitech ordenó el exterior con grava, piedra natural, arena y cactus, integrando zonas funcionales como accesos y aparcamiento dentro de una composición sencilla y potente.", "Eivitech ha ordinato l'esterno con ghiaia, pietra naturale, sabbia e cactus, integrando zone funzionali come accessi e parcheggio dentro una composizione semplice e potente.", "Eivitech structured the exterior with gravel, natural stone, sand and cactus, integrating functional areas such as access and parking into a simple, strong composition."),
    lighting: tr("Iluminación exterior discreta para acompañar recorridos y reforzar texturas sin romper la calma del paisaje.", "Illuminazione esterna discreta per accompagnare i percorsi e rafforzare le texture senza rompere la calma del paesaggio.", "Discreet outdoor lighting accompanies paths and reinforces textures without breaking the calm of the landscape."),
    craftsmanship: tr("Composición de gravas, piedras, cactus, arena y zonas funcionales pensadas para crear orden, impacto y bajo mantenimiento real.", "Composizione di ghiaie, pietre, cactus, sabbia e zone funzionali pensate per creare ordine, impatto e reale bassa manutenzione.", "Composition of gravel, stone, cactus, sand and functional areas designed to create order, impact and real low maintenance."),
    works: [
      tr("Diseño de jardín seco mediterráneo", "Progettazione giardino secco mediterraneo", "Dry Mediterranean garden design"),
      tr("Decoración con arena, grava y cactus", "Decorazione con sabbia, ghiaia e cactus", "Decoration with sand, gravel and cactus"),
      tr("Aparcamiento integrado con grava", "Parcheggio integrato con ghiaia", "Integrated gravel parking"),
      tr("Ordenación de accesos y exterior", "Organizzazione di accessi ed esterni", "Access and exterior organisation"),
      tr("Solución de bajo mantenimiento", "Soluzione a bassa manutenzione", "Low-maintenance solution"),
    ],
    materials: [tr("Arena", "Sabbia", "Sand"), tr("Grava decorativa", "Ghiaia decorativa", "Decorative gravel"), tr("Piedra natural", "Pietra naturale", "Natural stone"), "Cactus"],
    result: tr("Un exterior que causa impacto desde el primer vistazo y que responde a un problema muy real en Ibiza: tener una villa bonita sin depender de un jardín complicado.", "Un esterno che crea impatto al primo sguardo e risponde a un problema molto reale a Ibiza: avere una villa bella senza dipendere da un giardino complicato.", "An exterior that creates impact at first sight and responds to a very real Ibiza problem: having a beautiful villa without depending on a complicated garden."),
    crmInterest: "outdoor_low_maintenance_landscape",
    metaTitle: tr("Desert Style Outdoor Renovation | Eivitech Ibiza", "Desert Style Outdoor Renovation | Eivitech Ibiza", "Desert Style Outdoor Renovation | Eivitech Ibiza"),
    metaDescription: tr("Renovación exterior low maintenance en Ibiza con grava, arena, piedra natural, cactus, aparcamiento integrado y efecto visual wow.", "Rinnovamento esterno low maintenance a Ibiza con ghiaia, sabbia, pietra naturale, cactus, parcheggio integrato ed effetto visuale wow.", "Low-maintenance outdoor renovation in Ibiza with gravel, sand, natural stone, cactus, integrated parking and wow visual impact."),
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);