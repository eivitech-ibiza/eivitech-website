import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

import Index from "./pages/Index.tsx";
import Empresa from "./pages/Empresa.tsx";
import Servicios from "./pages/Servicios.tsx";
import Servicio from "./pages/Servicio.tsx";
import Proyectos from "./pages/Proyectos.tsx";
import Proyecto from "./pages/Proyecto.tsx";
import Contacto from "./pages/Contacto.tsx";
import Gracias from "./pages/Gracias.tsx";
import LandingGoogle from "./pages/LandingGoogle.tsx";
import LandingMeta from "./pages/LandingMeta.tsx";
import LandingEN from "./pages/LandingEN.tsx";
import Privacidad from "./pages/Privacidad.tsx";
import AvisoLegal from "./pages/AvisoLegal.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/empresa", element: <Empresa /> },
      { path: "/servicios", element: <Servicios /> },
      { path: "/servicios/:slug", element: <Servicio /> },
      { path: "/proyectos", element: <Proyectos /> },
      { path: "/proyectos/:slug", element: <Proyecto /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/gracias", element: <Gracias /> },
      { path: "/reformas-ibiza", element: <LandingGoogle /> },
      { path: "/proyectos-reformas-ibiza", element: <LandingMeta /> },
      { path: "/renovation-company-ibiza", element: <LandingEN /> },
      { path: "/privacidad", element: <Privacidad /> },
      { path: "/aviso-legal", element: <AvisoLegal /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
