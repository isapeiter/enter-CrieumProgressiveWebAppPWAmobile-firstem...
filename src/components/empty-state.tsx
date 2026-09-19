import { ReactNode } from "react";

interface EmptyStateProps {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

/** Estado vazio amigável com ícone, texto e botão de ação */
export function EmptyState({ icone, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
        {icone}
      </div>
      <div>
        <p className="text-base font-bold text-foreground">{titulo}</p>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          {descricao}
        </p>
      </div>
      {acao}
    </div>
  );
}
