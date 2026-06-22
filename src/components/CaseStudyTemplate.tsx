import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const mediaRoot = String.fromCharCode(104,116,116,112,115,58,47,47,101,105,118,105,116,101,99,104,46,99,111,109,47,119,112,45,99,111,110,116,101,110,116,47,117,112,108,111,97,100,115,47,50,48,50,49,47,48,56,47);
const mediaUrl = (name: string) => `${mediaRoot}${name}`;
const localMediaUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

type GalleryItem = { src: string; alt: string; portrait?: boolean };
type VideoData = { src: string; poster: string; title: string; description: string };
type ProjectMedia = { hero: string; gallery: GalleryItem[]; video?: VideoData };

function getProjectPath(project: Project) {
  if (project.slug === "apartamento-marina-botafoch") return "/proyectos/apartamento-marina-botafoc";
  if (project.slug === "casa-sant-josep") return "/proyectos/sant-josep-de-sa-talaia";
  return `/proyectos/${project.slug}`;
}

function getProjectMedia(project: Project): ProjectMedia {
  if (project.slug === "casa-sant-josep") {
    const hero = mediaUrl("casa-lujo-sant-josep-2.jpg");
    return {
      hero,
      gallery: [
        { src: mediaUrl("casa-lujo-sant-josep-2.jpg"), alt: tr("Vista aérea de la villa y la piscina en Sant Josep de sa Talaia", "Vista aerea della villa e della piscina a Sant Josep de sa Talaia", "Aerial view of the villa and pool in Sant Josep de sa Talaia") },
        { src: mediaUrl("casa-lujo-sant-josep-1.jpg"), alt: tr("Vista superior del acceso ajardinado y la finca", "Vista dall'alto dell'accesso paesaggistico e della proprietà", "Top view of the landscaped access and estate") },
        { src: mediaUrl("casa-lujo-sant-josep-3.jpg"), alt: tr("Panorámica del entorno natural de Sant Josep con vistas al valle", "Panoramica dell'ambiente naturale di Sant Josep con vista sulla valle", "Panoramic natural setting in Sant Josep with valley views") },
      ],
      video: {
        src: localMediaUrl("media/projects/sant-josep-de-sa-talaia/sant-josep-video.mp4"),
        poster: hero,
        title: tr("Recorrido en vídeo de la finca", "Tour video della proprietà", "Video walkthrough of the estate"),
        description: tr("Un vídeo 16:9 ayuda a entender la escala real del entorno, los accesos, la piscina y la relación de la vivienda con el paisaje.", "Un video 16:9 aiuta a comprendere la scala reale dell'ambiente, gli accessi, la piscina e il rapporto della casa con il paesaggio.", "A 16:9 video helps show the true scale of the setting, access, pool and the relationship between the house and landscape."),
      },
    };
  }

  if (project.slug === "urbanizacion-valverde") {
    return {
      hero: mediaUrl("terraza-casita-valverde-4-1024x576.jpg"),
      gallery: [
        { src: mediaUrl("terraza-casita-valverde-2-1024x576.jpg"), alt: tr("Vista panorámica de la terraza Valverde", "Vista panoramica della terrazza Valverde", "Panoramic view of the Valverde terrace") },
        { src: mediaUrl("terraza-casita-valverde-1-576x1024.jpg"), alt: tr("Detalle del pavimento exterior en madera de Indonesia", "Dettaglio della pavimentazione esterna in legno indonesiano", "Detail of the Indonesian wood decking"), portrait: true },
        { src: mediaUrl("terraza-casita-valverde-3-1024x576.jpg"), alt: tr("Zona exterior con cama de madera y vistas al entorno rural", "Zona esterna con letto in legno e vista sull'ambiente rurale", "Outdoor area with wooden daybed and rural views") },
        { src: mediaUrl("terraza-casita-valverde-4-1024x576.jpg"), alt: tr("Muro de piedra ibicenca y tarima exterior de madera", "Muro in pietra ibizenca e pavimentazione esterna in legno", "Ibizan stone wall and outdoor wood decking") },
      ],
    };
  }

  if (project.slug === "true-bar") {
    return {
      hero: mediaUrl("true-bar-2.jpeg"),
      gallery: [
        { src: mediaUrl("true-bar-2.jpeg"), alt: tr("Terraza exterior del proyecto True Bar", "Terrazza esterna del progetto True Bar", "Outdoor terrace of the True Bar project") },
        { src: mediaUrl("true-bar-1-576x1024.jpeg"), alt: tr("Fachada blanca del proyecto True Bar", "Facciata bianca del progetto True Bar", "White facade of the True Bar project"), portrait: true },
      ],
    };
  }

  if (project.slug === "apartamento-marina-botafoch") {
    return {
      hero: mediaUrl("marina-botafoch-apartamento-04-1024x768.jpg"),
      gallery: [
        { src: mediaUrl("marina-botafoch-apartamento-04-1024x768.jpg"), alt: tr("Cocina a medida con isla central en Marina Botafoc", "Cucina su misura con isola centrale a Marina Botafoc", "Custom kitchen with central island in Marina Botafoc") },
        { src: mediaUrl("marina-botafoch-apartamento-10-1024x768.jpg"), alt: tr("Baño principal con microcemento e iluminación LED", "Bagno principale con microcemento e illuminazione LED", "Main bathroom with microcement and LED lighting") },
        { src: mediaUrl("marina-botafoch-apartamento-09-768x576.jpg"), alt: tr("Baño doble con espejos retroiluminados", "Bagno doppio con specchi retroilluminati", "Double bathroom with backlit mirrors") },
        { src: mediaUrl("marina-botafoch-apartamento-08-768x576.jpg"), alt: tr("Dormitorio con iluminación indirecta azul y magenta", "Camera con illuminazione indiretta blu e magenta", "Bedroom with blue and magenta indirect lighting") },
        { src: mediaUrl("marina-botafoch-apartamento-07-768x576.jpg"), alt: tr("Terraza cubierta con jacuzzi y zona de descanso", "Terrazza coperta con jacuzzi e zona relax", "Covered terrace with jacuzzi and lounge area") },
        { src: mediaUrl("marina-botafoch-apartamento-06-768x576.jpg"), alt: tr("Salón luminoso conectado con la terraza", "Soggiorno luminoso collegato alla terrazza", "Bright living area connected to the terrace") },
        { src: mediaUrl("marina-botafoch-apartamento-05-768x576.jpg"), alt: tr("Cocina lineal con madera, negro mate y luz natural", "Cucina lineare con legno, nero opaco e luce naturale", "Linear kitchen with wood, matte black and natural light") },
        { src: mediaUrl("marina-botafoch-apartamento-03-1024x768.jpg"), alt: tr("Vista amplia de la cocina y mobiliario integrado", "Vista ampia della cucina e degli arredi integrati", "Wide view of the kitchen and integrated furniture") },
        { src: mediaUrl("marina-botafoch-apartamento-02.jpg"), alt: tr("Detalle de isla y encimera negra", "Dettaglio dell'isola e del piano nero", "Detail of the island and black countertop") },
        { src: mediaUrl("marina-botafoch-apartamento-01.jpg"), alt: tr("Cocina terminada con líneas limpias y almacenaje a medida", "Cucina completata con linee pulite e contenimento su misura", "Finished kitchen with clean lines and custom storage") },
      ],
    };
  }

  return { hero: project.image, gallery: [] };
}

function getProjectPresentation(project: Project) {
  if (project.slug === "casa-sant-josep") {
    return {
      ...project,
      name: "Sant Josep de sa Talaia",
      zone: "Sant Josep de sa Talaia, Ibiza",
      type: tr("Villa", "Villa", "Villa"),
      intervention: tr("Exterior, accesos y zona piscina", "Esterni, accessi e zona piscina", "Outdoor areas, access and pool zone"),
      short: tr("Intervención exterior en una villa de Sant Josep de sa Talaia, con accesos, entorno ajardinado, piscina y una relación visual directa con el paisaje.", "Intervento esterno in una villa a Sant Josep de sa Talaia, con accessi, paesaggio curato, piscina e un rapporto visivo diretto con il panorama.", "Outdoor intervention in a villa in Sant Josep de sa Talaia, with access routes, landscaped surroundings, pool area and a strong visual connection with the landscape."),
      situation: tr("Villa ubicada en un entorno natural elevado, con una finca amplia, vistas abiertas y necesidad de ordenar los accesos exteriores para que la llegada a la propiedad estuviera a la altura del contexto.", "Villa situata in un ambiente naturale elevato, con una proprietà ampia, viste aperte e la necessità di ordinare gli accessi esterni perché l'arrivo alla casa fosse all'altezza del contesto.", "A villa located in an elevated natural setting, with a large estate, open views and the need to organise the outdoor access so the arrival experience matched the quality of the setting."),
      goal: tr("Crear una llegada más elegante, funcional y coherente con la arquitectura de la vivienda, integrando caminos, zonas exteriores, piscina y vegetación mediterránea sin competir con el paisaje.", "Creare un arrivo più elegante, funzionale e coerente con l'architettura della casa, integrando percorsi, aree esterne, piscina e vegetazione mediterranea senza competere con il paesaggio.", "Create a more elegant, functional arrival experience aligned with the architecture, integrating paths, outdoor areas, pool and Mediterranean vegetation without competing with the landscape."),
      works: [tr("Ordenación del acceso exterior y recorrido de llegada", "Organizzazione dell'accesso esterno e del percorso di arrivo", "Outdoor access and arrival route organisation"), tr("Adecuación de caminos, zonas de paso y entorno ajardinado", "Adeguamento di percorsi, zone di passaggio e paesaggio esterno", "Upgrade of paths, circulation areas and landscaped surroundings"), tr("Integración visual de la piscina con la vivienda y el paisaje", "Integrazione visiva della piscina con la casa e il paesaggio", "Visual integration of the pool with the house and landscape"), tr("Selección de materiales exteriores sobrios y resistentes", "Selezione di materiali esterni sobri e resistenti", "Selection of sober and durable outdoor materials"), tr("Preparación de contenido visual aéreo y vídeo para mostrar la escala real del proyecto", "Preparazione di contenuti visivi aerei e video per mostrare la scala reale del progetto", "Aerial and video content prepared to show the true scale of the project")],
      materials: [tr("Grava exterior", "Ghiaia esterna", "Outdoor gravel"), tr("Piedra y caminos", "Pietra e percorsi", "Stone and paths"), tr("Vegetación mediterránea", "Vegetazione mediterranea", "Mediterranean planting"), tr("Piscina", "Piscina", "Pool"), tr("Vistas abiertas", "Viste aperte", "Open views")],
      result: tr("Una finca con una presencia mucho más ordenada y atractiva: el acceso, la piscina y el entorno natural trabajan juntos para transmitir amplitud, privacidad y valor desde el primer vistazo.", "Una proprietà con una presenza molto più ordinata e attraente: accesso, piscina e ambiente naturale lavorano insieme per trasmettere ampiezza, privacy e valore fin dal primo sguardo.", "An estate with a far more ordered and attractive presence: access, pool and natural surroundings work together to communicate space, privacy and value at first sight."),
      metaTitle: tr("Sant Josep de sa Talaia — Villa exterior y piscina | Eivitech Ibiza", "Sant Josep de sa Talaia — Villa, esterni e piscina | Eivitech Ibiza", "Sant Josep de sa Talaia — Villa outdoor areas and pool | Eivitech Ibiza"),
      metaDescription: tr("Proyecto exterior en Sant Josep de sa Talaia: accesos, entorno ajardinado, piscina, vistas abiertas y contenido visual aéreo con vídeo.", "Progetto esterno a Sant Josep de sa Talaia: accessi, paesaggio curato, piscina, viste aperte e contenuto visivo aereo con video.", "Outdoor project in Sant Josep de sa Talaia: access routes, landscaped surroundings, pool, open views and aerial video content."),
    };
  }

  if (project.slug === "true-bar") {
    return {
      ...project,
      short: tr("Reforma de local comercial en Ibiza con terraza exterior, cubierta renovada, baños, cocina y porche en madera tratada.", "Ristrutturazione di locale commerciale a Ibiza con terrazza esterna, copertura rinnovata, bagni, cucina e portico in legno trattato.", "Commercial space renovation in Ibiza with outdoor terrace, renewed roof, bathrooms, kitchen and treated wood porch."),
      situation: tr("Local cerca del mar, expuesto a humedad, sol y viento, con necesidad de renovar zonas clave y mejorar la imagen exterior.", "Locale vicino al mare, esposto a umidità, sole e vento, con necessità di rinnovare aree chiave e migliorare l'immagine esterna.", "A space near the sea, exposed to humidity, sun and wind, requiring key areas to be renewed and the exterior image improved."),
      goal: tr("Crear un espacio funcional, fresco y resistente, reforzando la terraza y la experiencia del cliente en el exterior.", "Creare uno spazio funzionale, fresco e resistente, rafforzando la terrazza e l'esperienza del cliente all'esterno.", "Create a functional, fresh and durable space, strengthening the terrace and the outdoor customer experience."),
      works: [tr("Renovación e impermeabilización de la cubierta", "Rinnovo e impermeabilizzazione della copertura", "Roof renovation and waterproofing"), tr("Reforma de baños y cocina", "Ristrutturazione di bagni e cucina", "Bathroom and kitchen renovation"), tr("Adecuación de la zona principal del local", "Adeguamento della zona principale del locale", "Upgrade of the main area of the space"), tr("Porche en madera tratada para la terraza", "Portico in legno trattato per la terrazza", "Treated wood porch for the terrace"), tr("Mejora exterior con vegetación e imagen comercial", "Miglioramento esterno con vegetazione e immagine commerciale", "Exterior improvement with greenery and commercial identity")],
      materials: [tr("Madera tratada", "Legno trattato", "Treated wood"), tr("Cubierta impermeabilizada", "Copertura impermeabilizzata", "Waterproofed roof"), tr("Acabados resistentes", "Finiture resistenti", "Durable finishes"), tr("Terraza exterior", "Terrazza esterna", "Outdoor terrace")],
      result: tr("Un local más atractivo, funcional y preparado para el clima de Ibiza, con una terraza exterior más agradable y una imagen reconocible.", "Un locale più attraente, funzionale e preparato per il clima di Ibiza, con una terrazza esterna più piacevole e un'immagine riconoscibile.", "A more attractive, functional space prepared for Ibiza's climate, with a more pleasant outdoor terrace and recognizable image."),
      metaTitle: tr("True Bar — Reforma de local comercial en Ibiza | Eivitech", "True Bar — Ristrutturazione di locale commerciale a Ibiza | Eivitech", "True Bar — Commercial space renovation in Ibiza | Eivitech"),
      metaDescription: tr("Reforma de True Bar en Ibiza: terraza, cubierta, baños, cocina, porche en madera tratada e imagen exterior.", "Ristrutturazione del True Bar a Ibiza: terrazza, copertura, bagni, cucina, portico in legno trattato e immagine esterna.", "True Bar renovation in Ibiza: terrace, roof, bathrooms, kitchen, treated wood porch and exterior image."),
    };
  }

  if (project.slug === "apartamento-marina-botafoch") {
    return {
      ...project,
      name: "Apartamento Marina Botafoc",
      zone: "Marina Botafoc, Ibiza",
      short: tr("Reforma integral de 120 m² en Marina Botafoc con cocina a medida, microcemento, baños y luz indirecta.", "Ristrutturazione completa di 120 m² a Marina Botafoc con cucina su misura, microcemento, bagni e luce indiretta.", "Full 120 m² renovation in Marina Botafoc with custom kitchen, microcement, bathrooms and indirect lighting."),
      situation: tr("Apartamento de 120 m² con una distribución poco aprovechada y necesidad de crear una experiencia más amplia, luminosa y contemporánea.", "Appartamento di 120 m² con una distribuzione poco sfruttata e la necessità di creare un'esperienza più ampia, luminosa e contemporanea.", "A 120 m² apartment with an underused layout and the need to create a wider, brighter and more contemporary experience."),
      goal: tr("Rediseñar la vivienda como un espacio fluido: cocina integrada, baños con acabado continuo, iluminación ambiental y una relación más elegante entre interior y terraza.", "Ridisegnare l'abitazione come uno spazio fluido: cucina integrata, bagni con finitura continua, illuminazione ambientale e una relazione più elegante tra interno e terrazza.", "Redesign the home as a fluid space: integrated kitchen, bathrooms with continuous finishes, ambient lighting and a more elegant relationship between interior and terrace."),
      works: [tr("Redistribución completa de los espacios", "Redistribuzione completa degli spazi", "Complete space redistribution"), tr("Cocina a medida con madera, blanco y encimera negra", "Cucina su misura con legno, bianco e piano nero", "Custom kitchen with wood, white finishes and black countertop"), tr("Baños con microcemento gris y mamparas de vidrio", "Bagni con microcemento grigio e pareti in vetro", "Bathrooms with grey microcement and glass screens"), tr("Iluminación LED indirecta en dormitorio, baños y zonas de paso", "Illuminazione LED indiretta in camera, bagni e zone di passaggio", "Indirect LED lighting in bedroom, bathrooms and circulation areas"), tr("Integración visual entre salón, cocina y terraza", "Integrazione visiva tra soggiorno, cucina e terrazza", "Visual integration between living area, kitchen and terrace")],
      materials: [tr("Microcemento gris", "Microcemento grigio", "Grey microcement"), tr("Madera natural", "Legno naturale", "Natural wood"), tr("Encimera negra", "Piano nero", "Black countertop"), tr("Iluminación LED", "Illuminazione LED", "LED lighting"), "Bosch"],
      result: tr("Un apartamento contemporáneo, luminoso y muy visual, donde la luz indirecta, la madera y el microcemento crean una atmósfera de diseño sin perder funcionalidad diaria.", "Un appartamento contemporaneo, luminoso e molto scenografico, dove luce indiretta, legno e microcemento creano un'atmosfera di design senza perdere funzionalità quotidiana.", "A contemporary, bright and highly visual apartment where indirect light, wood and microcement create a design-led atmosphere without losing everyday functionality."),
      metaTitle: tr("Apartamento Marina Botafoc — Reforma integral | Eivitech Ibiza", "Appartamento Marina Botafoc — Ristrutturazione completa | Eivitech Ibiza", "Marina Botafoc Apartment — Full renovation | Eivitech Ibiza"),
      metaDescription: tr("Reforma integral de 120 m² en Marina Botafoc: cocina a medida, microcemento, baños, iluminación LED indirecta y terraza.", "Ristrutturazione completa di 120 m² a Marina Botafoc: cucina su misura, microcemento, bagni, illuminazione LED indiretta e terrazza.", "Full 120 m² renovation in Marina Botafoc: custom kitchen, microcement, bathrooms, indirect LED lighting and terrace."),
    };
  }

  return project;
}

function VideoSources({ src }: { src: string }) {
  return (
    <>
      <source src={src} type="video/mp4" />
      <source src={src.replace(/\.mp4$/i, ".MP4")} type="video/mp4" />
    </>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
      <path d="M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6" opacity="0.55" />
    </svg>
  );
}

function ProjectVideo({ video }: { video: VideoData }) {
  const [open, setOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <section className="container-x mt-6">
      <div className="grid gap-6 rounded-sm border border-border bg-card p-4 md:grid-cols-[1.4fr_0.8fr] md:p-6">
        <div className="relative overflow-hidden rounded-sm bg-black">
          <video className="aspect-video w-full object-cover" controls playsInline preload="metadata" poster={video.poster} onError={() => setHasError(true)}>
            <VideoSources src={video.src} />
          </video>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={tr("Ver vídeo grande", "Vedi video grande", "View larger video")}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-sm border border-dashed border-white/80 bg-black/35 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/55"
          >
            <ExpandIcon />
          </button>
        </div>
        <div className="flex flex-col justify-center">
          <div className="eyebrow">Video</div>
          <h2 className="display-sm mt-3">{video.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{video.description}</p>
          {hasError && (
            <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {tr("El vídeo no está disponible todavía. Revisa que el archivo esté cargado con el nombre exacto sant-josep-video.mp4 dentro de public/media/projects/sant-josep-de-sa-talaia/.", "Il video non è ancora disponibile. Controlla che il file sia caricato con il nome esatto sant-josep-video.mp4 dentro public/media/projects/sant-josep-de-sa-talaia/.", "The video is not available yet. Check that the file is uploaded with the exact name sant-josep-video.mp4 inside public/media/projects/sant-josep-de-sa-talaia/.")}
            </p>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" type="button" aria-label={tr("Cerrar vídeo", "Chiudi video", "Close video")} onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-6xl translate-y-0 rounded-sm bg-black shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <button type="button" onClick={() => setOpen(false)} className="absolute -top-12 right-0 rounded-sm bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25">
              {tr("Cerrar", "Chiudi", "Close")}
            </button>
            <video className="aspect-video w-full rounded-sm bg-black" controls autoPlay playsInline poster={video.poster} onError={() => setHasError(true)}>
              <VideoSources src={video.src} />
            </video>
          </div>
        </div>
      )}
    </section>
  );
}

export function CaseStudyTemplate({ project }: { project: Project }) {
  const presentation = getProjectPresentation(project);
  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const path = getProjectPath(project);
  const media = getProjectMedia(project);

  return (
    <>
      <SEO title={presentation.metaTitle} description={presentation.metaDescription} path={path} trackAs="project_view" trackPayload={{ project: project.slug }} ogImage={media.hero} />
      <article>
        <section className="container-x pt-12 md:pt-20">
          <Link to="/proyectos" className="text-sm text-muted-foreground hover:text-foreground">← Todos los proyectos</Link>
          <div className="mt-6 grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <div className="eyebrow">{presentation.type} · {presentation.intervention}</div>
              <h1 className="display-xl mt-4">{presentation.name}</h1>
            </div>
            {presentation.zone && <div className="text-muted-foreground md:text-right"><div className="eyebrow">Zona</div><div className="mt-1">{presentation.zone}</div></div>}
          </div>
        </section>

        <section className="container-x mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:aspect-[16/8]">
            <img src={media.hero} alt={presentation.name} loading="eager" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 max-w-2xl text-white">
              <div className="text-xs uppercase tracking-[0.25em] text-white/75">{tr("Proyecto real", "Progetto reale", "Real project")}</div>
              <p className="mt-3 text-xl font-medium leading-snug md:text-3xl">{presentation.short}</p>
            </div>
          </div>
        </section>

        {media.video && <ProjectVideo video={media.video} />}

        {media.gallery.length > 0 && (
          <section className="container-x mt-6">
            <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[260px]">
              {media.gallery.map((item, index) => (
                <figure key={`${item.src}-${index}`} className={`group relative overflow-hidden rounded-sm bg-muted ${index === 0 ? "md:col-span-2 md:row-span-2" : ""} ${item.portrait ? "md:row-span-2" : ""}`}>
                  <img src={item.src} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">{item.alt}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="section-tight">
          <div className="container-x grid gap-14 lg:grid-cols-[1fr_2fr]">
            <div><div className="eyebrow">Caso</div><h2 className="display-md mt-3">Situación y objetivo</h2></div>
            <div className="space-y-8 text-lg leading-relaxed">
              <div><div className="text-sm uppercase tracking-widest text-muted-foreground">Situación inicial</div><p className="mt-2">{presentation.situation}</p></div>
              <div><div className="text-sm uppercase tracking-widest text-muted-foreground">Objetivo del cliente</div><p className="mt-2">{presentation.goal}</p></div>
            </div>
          </div>
        </section>

        <section className="section-tight bg-accent/40">
          <div className="container-x grid gap-14 lg:grid-cols-2">
            <div>
              <div className="eyebrow">Intervenciones</div><h2 className="display-md mt-3 mb-6">Lo que realizamos</h2>
              <ul className="space-y-3">{presentation.works.map((w, i) => <li key={i} className="border-b border-border pb-3 flex gap-4"><span className="text-primary font-display">{String(i + 1).padStart(2, "0")}</span><span>{w}</span></li>)}</ul>
            </div>
            <div>
              <div className="eyebrow">Materiales y detalles</div><h2 className="display-md mt-3 mb-6">Acabados</h2>
              <div className="flex flex-wrap gap-2">{presentation.materials.map((m) => <span key={m} className="rounded-sm border border-border bg-background px-4 py-2 text-sm">{m}</span>)}</div>
              <div className="mt-10"><div className="text-sm uppercase tracking-widest text-muted-foreground">Resultado</div><p className="mt-2 text-lg leading-relaxed">{presentation.result}</p></div>
            </div>
          </div>
        </section>

        {project.placeholder && project.slug !== "casa-sant-josep" && <section className="container-x mt-6"><div className="rounded-sm border border-dashed border-primary/40 bg-primary-soft/40 p-5 text-sm">Contenido y galería de este proyecto pendientes de completar con Daniele.</div></section>}

        <section className="section-tight"><div className="container-x"><div className="eyebrow">Otros proyectos</div><div className="mt-6 grid gap-6 md:grid-cols-3">{others.map((p) => <ProjectCard key={p.slug} project={p} />)}</div></div></section>
      </article>

      <CTASection title={tr("¿Tienes una propiedad parecida en Ibiza?", "Hai una proprietà simile a Ibiza?", "Do you have a similar property in Ibiza?")} />
    </>
  );
}
