import { cn } from "@/lib/utils";

interface ChipProps {
  ativo?: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

/** Chip de filtro clicável */
export function Chip({ ativo, children, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={cn(
        "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
        ativo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
