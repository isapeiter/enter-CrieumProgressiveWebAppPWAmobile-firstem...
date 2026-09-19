import { BellRing, ClipboardList, MapPin, TriangleAlert, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const ITENS = [
  { para: "/", rotulo: "Mapa", Icone: MapPin, end: true },
  { para: "/avisos", rotulo: "Avisos", Icone: BellRing },
  { para: "/reportar", rotulo: "Reportar", Icone: TriangleAlert },
  { para: "/perfil", rotulo: "Perfil", Icone: User },
];

export function BottomNav() {
  const { isEstagiario } = useAuth();
  const itens = isEstagiario
    ? [...ITENS, { para: "/painel", rotulo: "Painel", Icone: ClipboardList }]
    : ITENS;

  return (
    <nav
      aria-label="Navegação principal"
      className="absolute inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="grid grid-cols-5">
        {itens.map(({ para, rotulo, Icone, end }) => (
          <NavLink
            key={para}
            to={para}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-[13px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icone className="h-6 w-6" strokeWidth={2.2} aria-hidden />
            <span>{rotulo}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
