import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

const Index = lazy(() => import("./pages/Index.tsx"));
const Empresa = lazy(() => import("./pages/Empresa.tsx"));
const Servicios = lazy(() => import("./pages/Servicios.tsx"));
const Servicio = lazy(() => import("./pages/Servicio.tsx"));
const Proyectos = lazy(() => import("./pages/Proyectos.tsx"));
const Proyecto = lazy(() => import("./pages/Proyecto.tsx"));
const TheEivitechWay = lazy(() => import("./pages/TheEivitechWay.tsx"));
const MaterialsAtmosphere = lazy(() => import("./pages/MaterialsAtmosphere.tsx"));
const Contacto = lazy(() => import("./pages/Contacto.tsx"));
const Gracias = lazy(() => import("./pages/Gracias.tsx"));
const LandingGoogle = lazy(() => import("./pages/LandingGoogle.tsx"));
const LandingMeta = lazy(() => import("./pages/LandingMeta.tsx"));
const LandingEN = lazy(() => import("./pages/LandingEN.tsx"));
const Privacidad = lazy(() => import("./pages/Privacidad.tsx"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy.tsx"));
const AvisoLegal = lazy(() => import("./pages/AvisoLegal.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/empresa", element: <Empresa /> },
      { path: "/servicios", element: <Servicios /> },
      { path: "/servicios/:slug", element: <Servicio /> },
      { path: "/transformations", element: <Proyectos /> },
      { path: "/transformations/:slug", element: <Proyecto /> },
      { path: "/proyectos", element: <Navigate to="/transformations" replace /> },
      { path: "/proyectos/:slug", element: <Proyecto /> },
      { path: "/the-eivitech-way", element: <TheEivitechWay /> },
      { path: "/materials-atmosphere", element: <MaterialsAtmosphere /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/gracias", element: <Gracias /> },
      { path: "/reformas-ibiza", element: <LandingGoogle /> },
      { path: "/proyectos-reformas-ibiza", element: <LandingMeta /> },
      { path: "/renovation-company-ibiza", element: <LandingEN /> },
      { path: "/privacidad", element: <Navigate to="/privacy-policy" replace /> },
      { path: "/privacy-policy", element: <Privacidad /> },
      { path: "/cookie-policy", element: <CookiePolicy /> },
      { path: "/cookies", element: <Navigate to="/cookie-policy" replace /> },
      { path: "/aviso-legal", element: <AvisoLegal /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "*", element: <NotFound /> },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
        <RouterProvider router={router} />
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
