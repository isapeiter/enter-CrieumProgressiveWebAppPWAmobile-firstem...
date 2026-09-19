import { AppLayout } from "@/components/layout";
import Index from "./pages/Index";
import AvisosPage from "./pages/AvisosPage";
import PainelPage from "./pages/PainelPage";
import PerfilPage from "./pages/PerfilPage";
import ReportarPage from "./pages/ReportarPage";
import SalaPage from "./pages/SalaPage";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "avisos", element: <AvisosPage /> },
      { path: "reportar", element: <ReportarPage /> },
      { path: "perfil", element: <PerfilPage /> },
      { path: "painel", element: <PainelPage /> },
      { path: "sala/:id", element: <SalaPage /> },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
