import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, DoorOpen } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { CardapioCard } from "@/components/cardapio-card";
import { useAvisos, useSalasDoLocal } from "@/hooks/use-data";
import { hojeISO } from "@/lib/format";
import { corDoGrupo, type Local } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LocalSheetProps {
  local: Local | null;
  aberta: boolean;
  onOpenChange: (o: boolean) => void;
}

/** Bottom sheet do pino: bloco → salas; RU → cardápio; demais → descrição */
export function LocalSheet({ local, aberta, onOpenChange }: LocalSheetProps) {
  const navigate = useNavigate();
  const { data: salas } = useSalasDoLocal(local?.id ?? null);
  const { data: avisos } = useAvisos();

  const avisosPorSala = useMemo(() => {
    const mapa = new Map<string, number>();
    avisos?.forEach((av) => {
      mapa.set(av.sala_id, (mapa.get(av.sala_id) ?? 0) + 1);
    });
    return mapa;
  }, [avisos]);

  const cor = local ? corDoGrupo(local.categoria) : "#FFC107";

  return (
    <Drawer open={aberta && Boolean(local)} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[480px]">
        {local && (
          <>
            <DrawerHeader className="text-left">
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full border-2 border-white shadow"
                  style={{ background: cor }}
                  aria-hidden
                />
                <DrawerTitle className="text-xl">{local.nome}</DrawerTitle>
              </div>
              <Badge
                variant="secondary"
                className="mt-1 w-fit"
              >
                {local.categoria}
              </Badge>
              <DrawerDescription>
                {local.descricao ?? "Toque em um item para ver mais detalhes."}
              </DrawerDescription>
            </DrawerHeader>

            <div className="max-h-[58vh] overflow-y-auto px-4 pb-8">
              {local.categoria === "RU" && <CardapioCard data={hojeISO()} />}

              {salas && salas.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Salas do {local.categoria === "Blocos" ? "bloco" : "local"}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {salas.map((sala) => {
                      const nAvisos = avisosPorSala.get(sala.id) ?? 0;
                      return (
                        <button
                          key={sala.id}
                          type="button"
                          onClick={() => navigate(`/sala/${sala.id}`)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-accent",
                            nAvisos > 0
                              ? "border-warning bg-warning/5"
                              : "border-border",
                          )}
                        >
                          <DoorOpen
                            className="h-5 w-5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 text-[15px] font-bold text-foreground">
                              {sala.nome}
                              {nAvisos > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-[11px] font-bold text-white">
                                  <AlertTriangle className="h-3 w-3" aria-hidden />
                                  Alteração
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sala.tipo}
                              {sala.andar ? ` · ${sala.andar}` : ""}
                            </p>
                          </div>
                          <ChevronRight
                            className="h-5 w-5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {local.categoria !== "RU" &&
                (!salas || salas.length === 0) && (
                  <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
                    Este local não possui salas listadas.
                  </p>
                )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
