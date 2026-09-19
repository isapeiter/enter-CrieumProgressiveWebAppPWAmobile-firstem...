import { Flame, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prioridade } from "@/lib/types";

interface PriorityBadgeProps {
  prioridade: Prioridade;
  papelAutor?: string | null;
  className?: string;
}

/** Badge de prioridade do chamado (vermelho exclusivo para alta) */
export function PriorityBadge({
  prioridade,
  papelAutor,
  className,
}: PriorityBadgeProps) {
  const alta = prioridade === "alta";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        alta
          ? "bg-destructive text-white"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {alta ? (
        <>
          <Flame className="h-3.5 w-3.5" aria-hidden />
          {papelAutor === "professor" ? "PRIORIDADE ALTA – Professor" : "Prioridade alta"}
        </>
      ) : (
        <>
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Prioridade normal
        </>
      )}
    </span>
  );
}
