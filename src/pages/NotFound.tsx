import { Link } from "react-router-dom";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15">
          <MapPinned className="h-10 w-10 text-primary" aria-hidden />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground">404</h1>
        <p className="text-base text-muted-foreground">
          Página não encontrada. Que tal voltar para o mapa do câmpus?
        </p>
        <Link to="/">
          <Button className="h-12 text-base">Voltar para o início</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
