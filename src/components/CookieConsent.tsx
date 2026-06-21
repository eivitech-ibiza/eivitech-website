import { useEffect, useState } from "react";

const KEY = "eivitech_cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch { /* noop */ }
  }, []);

  const set = (value: "accepted" | "rejected") => {
    try { localStorage.setItem(KEY, value); } catch { /* noop */ }
    setVisible(false);
    // NOTA: no se activan píxeles ni trackers reales. Integración pendiente
    // de verificación legal/privacy antes de campañas.
  };

  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur p-4 md:p-5">
      <div className="container-x flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <p className="text-sm text-muted-foreground max-w-3xl">
          Usamos cookies técnicas para el funcionamiento del sitio. Las cookies analíticas y de marketing se
          activarán solo después de tu consentimiento y de verificar la configuración con asesoría legal.
        </p>
        <div className="flex gap-2">
          <button onClick={() => set("rejected")} className="rounded-sm border border-border px-4 py-2 text-sm">
            Rechazar
          </button>
          <button onClick={() => set("accepted")} className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
