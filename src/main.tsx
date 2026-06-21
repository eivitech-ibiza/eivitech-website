import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
import { CLERK_ENABLED, CLERK_PUBLISHABLE_KEY } from "./lib/config";
import { initLanguage } from "./lib/i18n";
import { initAutoTranslate } from "./lib/autoTranslate";

initLanguage();
initAutoTranslate();

const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

createRoot(document.getElementById("root")!).render(
  CLERK_ENABLED ? (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl={`${import.meta.env.BASE_URL}`}
      signInFallbackRedirectUrl={`${import.meta.env.BASE_URL}dashboard`}
      signUpFallbackRedirectUrl={`${import.meta.env.BASE_URL}dashboard`}
    >
      {app}
    </ClerkProvider>
  ) : (
    app
  )
);
