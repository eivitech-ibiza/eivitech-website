type Step = { title: string; description?: string };

export function ProcessSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-px bg-border md:grid-cols-3 lg:grid-cols-6 overflow-hidden rounded-sm border border-border">
      {steps.map((s, i) => (
        <li key={s.title} className="bg-background p-6">
          <div className="font-display text-3xl text-primary">{String(i + 1).padStart(2, "0")}</div>
          <div className="mt-3 font-medium">{s.title}</div>
          {s.description && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>}
        </li>
      ))}
    </ol>
  );
}
