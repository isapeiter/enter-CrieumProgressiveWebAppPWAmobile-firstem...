import {
  BookOpen,
  Bus,
  DoorOpen,
  Users,
  UtensilsCrossed,
  Volleyball,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface LegendaSheetProps {
  aberta: boolean;
  onOpenChange: (o: boolean) => void;
}

const ITENS = [
  {
    cor: "#3B82F6",
    icone: <span className="text-sm font-extrabold text-white">A</span>,
    rotulo: "Blocos (A, G, Q, R, O, M)",
    detalhe: "Letra no pino identifica o bloco.",
  },
  {
    cor: "#F59E0B",
    icone: <UtensilsCrossed className="h-4 w-4 text-white" aria-hidden />,
    rotulo: "RU — Restaurante Universitário",
    detalhe: "Toque para ver o cardápio do dia.",
  },
  {
    cor: "#8B5CF6",
    icone: <BookOpen className="h-4 w-4 text-white" aria-hidden />,
    rotulo: "Biblioteca",
    detalhe: "Acervo e salas de estudo.",
  },
  {
    cor: "#06B6D4",
    icone: (
      <span className="flex items-center gap-0.5">
        <Users className="h-4 w-4 text-white" aria-hidden />
      </span>
    ),
    rotulo: "Centro de Convivência",
    detalhe: "Convivência, cantina e lazer.",
  },
  {
    cor: "#06B6D4",
    icone: <Volleyball className="h-4 w-4 text-white" aria-hidden />,
    rotulo: "Quadra de Esporte",
    detalhe: "Quadra poliesportiva.",
  },
  {
    cor: "#06B6D4",
    icone: <Bus className="h-4 w-4 text-white" aria-hidden />,
    rotulo: "Ponto de Ônibus",
    detalhe: "Embarque e desembarque.",
  },
  {
    cor: "#06B6D4",
    icone: <DoorOpen className="h-4 w-4 text-white" aria-hidden />,
    rotulo: "Portão e Guarita",
    detalhe: "Acesso principal ao câmpus.",
  },
];

/** Legenda do mapa explicando os principais tipos de marcador */
export function LegendaSheet({ aberta, onOpenChange }: LegendaSheetProps) {
  return (
    <Drawer open={aberta} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Legenda do mapa</DrawerTitle>
          <DrawerDescription>
            Como identificar cada local no câmpus.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2.5 px-4 pb-8">
          {ITENS.map((item) => (
            <div key={item.rotulo} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white shadow"
                style={{ background: item.cor }}
              >
                {item.icone}
              </span>
              <div>
                <p className="text-sm font-bold leading-tight text-foreground">
                  {item.rotulo}
                </p>
                <p className="text-xs text-muted-foreground">{item.detalhe}</p>
              </div>
            </div>
          ))}

          <div className="mt-2 rounded-2xl border border-warning/40 bg-warning/10 p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-warning">
              <span className="h-4 w-4 shrink-0 rounded-full bg-warning marker-pulse" />
              Pino laranja pulsante + badge vermelho
            </p>
            <p className="mt-1 text-sm text-foreground">
              O local (ou uma de suas salas) tem avisos ativos — prova, mudança
              de sala ou aula cancelada. O número em vermelho indica quantos
              avisos há. O bloco continua identificável pela letra.
            </p>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Toque em um pino para ver os detalhes, as salas do bloco ou o
            cardápio do RU. Procure por "DERAC" na busca: a diretoria fica no
            subsolo do Bloco R.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
