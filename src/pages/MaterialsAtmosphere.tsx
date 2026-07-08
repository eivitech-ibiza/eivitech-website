import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { tr } from "@/lib/i18n";

const items = [
  {
    title: tr("Madera natural", "Legno naturale", "Natural wood"),
    text: tr("Aporta calidez, textura y una sensación más humana en cocinas, armarios, puertas y detalles.", "Porta calore, texture e una sensazione più umana in cucine, armadi, porte e dettagli.", "It brings warmth, texture and a more human feeling to kitchens, wardrobes, doors and details."),
  },
  {
    title: "Travertine",
    text: tr("Un material natural, atemporal y mediterráneo, capaz de elevar una vivienda sin hacerla fría.", "Un materiale naturale, senza tempo e mediterraneo, capace di elevare una casa senza renderla fredda.", "A natural, timeless Mediterranean material that elevates a home without making it feel cold."),
  },
  {
    title: "Microcement",
    text: tr("Superficies continuas, limpias y sin juntas para interiores, baños, suelos y zonas exteriores.", "Superfici continue, pulite e senza fughe per interni, bagni, pavimenti e zone esterne.", "Continuous, clean joint-free surfaces for interiors, bathrooms, floors and outdoor areas."),
  },
  {
    title: tr("Mortero de cal natural", "Malta di calce naturale", "Natural lime mortar"),
    text: tr("Permite que los muros antiguos respiren y ayuda a gestionar la humedad en fincas tradicionales.", "Permette ai muri antichi di respirare e aiuta a gestire l'umidità nelle fincas tradizionali.", "It allows old walls to breathe and helps manage moisture in traditional fincas."),
  },
  {
    title: tr("Piedra", "Pietra", "Stone"),
    text: tr("Ordena exteriores, refuerza el carácter ibicenco y crea una relación natural con el paisaje.", "Ordina gli esterni, rafforza il carattere ibizenco e crea una relazione naturale con il paesaggio.", "It structures outdoor spaces, reinforces Ibizan character and creates a natural connection with the landscape."),
  },
  {
    title: tr("Iluminación cálida", "Illuminazione calda", "Warm lighting"),
    text: tr("La luz define la atmósfera: cambia cómo se siente un salón, un baño o un dormitorio.", "La luce definisce l'atmosfera: cambia come si percepisce un soggiorno, un bagno o una camera.", "Light defines atmosphere: it changes how a living room, bathroom or bedroom feels."),
  },
];

const MaterialsAtmosphere = () => (
  <>
    <SEO
      title={tr("Materiales y atmósfera | Eivitech Ibiza", "Materiali e atmosfera | Eivitech Ibiza", "Materials & Atmosphere | Eivitech Ibiza")}
      description={tr("Materiales naturales, luz cálida y soluciones saludables para reformas premium en Ibiza.", "Materiali naturali, luce calda e soluzioni sane per ristrutturazioni premium a Ibiza.", "Natural materials, warm lighting and healthy solutions for premium renovations in Ibiza.")}
      path="/materials-atmosphere"
    />

    <section className="container-x pt-16 pb-12 md:pt-24">
      <div className="eyebrow">{tr("Materiales y atmósfera", "Materiali e atmosfera", "Materials & Atmosphere")}</div>
      <h1 className="display-xl mt-4 max-w-4xl">{tr("Materiales que cambian cómo se siente una casa.", "Materiali che modellano il modo in cui una casa si sente.", "Materials that shape the way a home feels.")}</h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr(
          "La diferencia entre una casa reformada y una casa que se vive bien está en los detalles: texturas, luz, temperatura visual, materiales que respiran y acabados que envejecen con naturalidad.",
          "La differenza tra una casa ristrutturata e una casa che si vive bene sta nei dettagli: texture, luce, temperatura visiva, materiali che respirano e finiture che invecchiano naturalmente.",
          "The difference between a renovated house and a home that feels good to live in is in the details: textures, light, visual temperature, breathable materials and finishes that age naturally."
        )}
      </p>
    </section>

    <section className="container-x pb-20">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-display text-3xl">{item.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section-tight bg-accent/40">
      <div className="container-x max-w-4xl">
        <div className="eyebrow">{tr("Viviendas más sanas", "Benessere abitativo", "Healthy living")}</div>
        <h2 className="display-md mt-3">
          {tr("Una casa también debe sentirse sana.", "Una casa deve anche sentirsi sana.", "A home should also feel healthy.")}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {tr(
            "En fincas y viviendas antiguas, resolver humedad, drenajes y transpiración de muros puede ser tan importante como elegir el pavimento o la cocina.",
            "Nelle fincas e nelle case antiche, risolvere umidità, drenaggi e traspirazione dei muri può essere importante quanto scegliere il pavimento o la cucina.",
            "In old fincas and traditional homes, solving moisture, drainage and wall breathability can be as important as choosing flooring or a kitchen."
          )}
        </p>
      </div>
    </section>

    <CTASection title={tr("Hablemos de tu propiedad.", "Parliamo della tua proprietà.", "Let's talk about your property.")} />
  </>
);

export default MaterialsAtmosphere;
