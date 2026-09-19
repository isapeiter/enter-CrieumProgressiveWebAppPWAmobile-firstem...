import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CampusMap } from "@/components/map/campus-map";
import { LocalSheet } from "@/components/sheets/local-sheet";
import { useLocais } from "@/hooks/use-data";
import type { Local } from "@/lib/types";

interface FocoMapa {
  lat: number;
  lng: number;
  key: number;
}

const Index = () => {
  const [local, setLocal] = useState<Local | null>(null);
  const [sheetAberta, setSheetAberta] = useState(false);
  const [foco, setFoco] = useState<FocoMapa | null>(null);
  const location = useLocation();
  const estadoProcessado = useRef<string | null>(null);
  const { data: locais } = useLocais();

  // "Ver a nova sala no mapa" — vindo da tela da sala
  useEffect(() => {
    const sig = JSON.stringify(location.state ?? null);
    if (estadoProcessado.current === sig) return;
    estadoProcessado.current = sig;
    const estado = location.state as { focoLocalId?: string } | null;
    if (estado?.focoLocalId && locais) {
      const alvo = locais.find((l) => l.id === estado.focoLocalId);
      if (alvo) {
        setLocal(alvo);
        setSheetAberta(true);
        setFoco({ lat: alvo.lat, lng: alvo.lng, key: Date.now() });
      }
    }
  }, [location.state, locais]);

  const selecionarLocal = (l: Local) => {
    setLocal(l);
    setSheetAberta(true);
  };

  return (
    <div className="relative h-full w-full">
      <CampusMap onSelectLocal={selecionarLocal} foco={foco} />
      <LocalSheet
        local={local}
        aberta={sheetAberta}
        onOpenChange={setSheetAberta}
      />
    </div>
  );
};

export default Index;
