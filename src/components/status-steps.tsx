import { STATUS_CHAMADO, type StatusChamado } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusStepsProps {
  status: StatusChamado;
}

/** Etapas coloridas do chamado: Aberto → Em andamento → Resolvido */
export function StatusSteps({ status }: StatusStepsProps) {
  const ordem: StatusChamado[] = ["aberto", "em_andamento", "resolvido"];
  const atual = ordem.indexOf(status);

  return (
    <div className="flex items-center gap-1" aria-label={`Status: ${STATUS_CHAMADO[status].label}`}>
      {ordem.map((s, i) => {
        const concluido = i <= atual;
        return (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "h-3 w-3 rounded-full border-2 border-white shadow",
                  concluido ? STATUS_CHAMADO[s].classe : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold leading-none",
                  i === atual ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STATUS_CHAMADO[s].label}
              </span>
            </div>
            {i < 2 && (
              <span
                className={cn(
                  "mb-4 h-0.5 flex-1 rounded",
                  i < atual ? "bg-success" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
