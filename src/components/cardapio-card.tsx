import { useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardapio } from "@/hooks/use-data";
import { formatTime } from "@/lib/format";
import type { Refeicao } from "@/lib/types";

const CAMPOS: { chave: keyof RefeicaoCampos; rotulo: string }[] = [
  { chave: "prato_principal", rotulo: "Prato principal" },
  { chave: "guarnicao", rotulo: "Guarnição" },
  { chave: "salada", rotulo: "Salada" },
  { chave: "sobremesa", rotulo: "Sobremesa" },
  { chave: "vegetariana", rotulo: "Opção vegetariana" },
];

type RefeicaoCampos = {
  prato_principal: string | null;
  guarnicao: string | null;
  salada: string | null;
  sobremesa: string | null;
  vegetariana: string | null;
};

function formatHora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

/** Cardápio do RU com abas Almoço | Janta, banners e horários */
export function CardapioCard({ data }: { data: string }) {
  const [aba, setAba] = useState<Refeicao>("almoco");
  const { data: cardapio, isLoading } = useCardapio(data);
  const refeicao = cardapio?.find((c) => c.refeicao === aba);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-extrabold text-foreground">
          Cardápio de hoje
        </h3>
        <Tabs
          value={aba}
          onValueChange={(v) => setAba(v as Refeicao)}
          className="shrink-0"
        >
          <TabsList className="h-9">
            <TabsTrigger value="almoco" className="px-3 text-sm">
              Almoço
            </TabsTrigger>
            <TabsTrigger value="janta" className="px-3 text-sm">
              Janta
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !refeicao && (
        <p className="mt-3 rounded-xl bg-muted/60 px-3 py-4 text-sm text-muted-foreground">
          Cardápio ainda não publicado para esta refeição.
        </p>
      )}

      {!isLoading && refeicao && (
        <div className="mt-3 flex flex-col gap-1.5">
          {refeicao.alterado && (
            <div className="mb-1 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                aria-hidden
              />
              <div>
                <p className="text-sm font-bold text-warning">
                  Cardápio alterado hoje
                </p>
                {refeicao.observacao && (
                  <p className="text-sm text-foreground">
                    {refeicao.observacao}
                  </p>
                )}
              </div>
            </div>
          )}

          {CAMPOS.map(({ chave, rotulo }) => (
            <div
              key={chave}
              className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 last:border-0"
            >
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                {rotulo}
              </span>
              <span className="text-right text-sm font-semibold text-foreground">
                {refeicao[chave] || "—"}
              </span>
            </div>
          ))}

          <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
            {(refeicao.abre || refeicao.fecha) && (
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Funcionamento: {formatTime(refeicao.abre)} às{" "}
                {formatTime(refeicao.fecha)}
              </p>
            )}
            <p>Atualizado às {formatHora(refeicao.atualizado_em)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
