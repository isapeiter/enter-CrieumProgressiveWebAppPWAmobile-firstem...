import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { COR_CATEGORIA, CATEGORIAS_LOCAIS } from "@/lib/types";

interface LegendaSheetProps {
  aberta: boolean;
  onOpenChange: (o: boolean) => void;
}

/** Legenda das cores dos pinos, sempre acessível pelo botão "Legenda" */
export function LegendaSheet({ aberta, onOpenChange }: LegendaSheetProps) {
  return (
    <Drawer open={aberta} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Legenda do mapa</DrawerTitle>
          <DrawerDescription>
            O que cada pino significa no câmpus.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-8">
          <div className="flex flex-col gap-2">
            {CATEGORIAS_LOCAIS.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full border-2 border-white shadow"
                  style={{ background: COR_CATEGORIA[cat] }}
                />
                <span className="text-sm font-medium">{cat}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 rounded-2xl border border-warning/40 bg-warning/10 p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-warning">
              <span className="h-4 w-4 shrink-0 rounded-full bg-warning marker-pulse" />
              Pino laranja pulsante
            </p>
            <p className="mt-1 text-sm text-foreground">
              O bloco tem um ou mais avisos ativos (prova, mudança de sala ou
              aula cancelada). O número em vermelho indica quantos avisos há.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Toque em um pino para ver os detalhes do local, as salas do bloco
            ou o cardápio do RU.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
