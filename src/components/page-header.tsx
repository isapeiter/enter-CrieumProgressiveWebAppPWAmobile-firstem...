interface PageHeaderProps {
  titulo: string;
  subtitulo: string;
}

/** Título da tela + frase curta explicando para que serve (regra de UX) */
export function PageHeader({ titulo, subtitulo }: PageHeaderProps) {
  return (
    <header className="px-4 pb-3 pt-5">
      <h1 className="text-2xl font-extrabold leading-tight text-foreground">
        {titulo}
      </h1>
      <p className="mt-1 text-[15px] leading-snug text-muted-foreground">
        {subtitulo}
      </p>
    </header>
  );
}
