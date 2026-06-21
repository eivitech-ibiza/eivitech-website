import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import type { FAQ } from "@/data/faqs";

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg md:text-xl">{item.q}</span>
              <span className="shrink-0 text-primary">{isOpen ? <Minus size={20} /> : <Plus size={20} />}</span>
            </button>
            {isOpen && <div className="pb-6 -mt-1 max-w-3xl text-muted-foreground leading-relaxed">{item.a}</div>}
          </div>
        );
      })}
    </div>
  );
}
