import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl } from "@/data/site";
import { MessageCircle, Check } from "lucide-react";

const LandingEN = () => (
  <>
    <SEO
      title="Renovation company in Ibiza | Eivitech"
      description="Renovation company in Ibiza for villas, apartments and commercial spaces. Coordination, quality and attention to detail."
      path="/renovation-company-ibiza"
    />

    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <div className="eyebrow">Renovation · Ibiza</div>
          <h1 className="display-xl mt-4">
            A local contractor for villa and apartment renovations in Ibiza
          </h1>
          <p className="body-lg mt-6 max-w-xl">
            We coordinate full and partial renovations for villas, apartments and commercial spaces in Ibiza, from the
            first idea to the last detail.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 max-w-xl">
            {["One point of contact", "Trades coordination", "Selected materials", "Careful finishings"].map((x) => (
              <li key={x} className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary" /> {x}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#form" className="inline-flex items-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground">
              Request a quote
            </a>
            <a
              href={whatsappUrl("Hi, I'd like to discuss a renovation project in Ibiza.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-4 text-sm font-medium text-white"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
        <div id="form" className="rounded-sm border border-border bg-card p-6 md:p-8 shadow-card">
          <h2 className="display-md mb-2">Tell us about your project</h2>
          <p className="text-sm text-muted-foreground mb-6">Form labels in Spanish — we reply in English too.</p>
          <LeadQualificationForm source="landing_en" />
        </div>
      </div>
    </section>

    <section className="section bg-accent/40">
      <div className="container-x">
        <div className="eyebrow">Featured projects</div>
        <h2 className="display-lg mt-3 mb-10">Recent renovations in Ibiza</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {PROJECTS.map((p) => <ProjectCard key={p.slug} project={p} />)}
        </div>
      </div>
    </section>
  </>
);

export default LandingEN;
