import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/data/site";
import { track } from "@/lib/tracking";

export function WhatsAppFloat({ message = "Hola, me gustaría solicitar una valoración para mi proyecto en Ibiza." }: { message?: string }) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { source: "float" })}
      aria-label="Hablar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-elevated transition hover:scale-105 md:bottom-24 lg:bottom-28"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
