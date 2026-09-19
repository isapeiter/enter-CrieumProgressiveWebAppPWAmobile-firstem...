import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Crosshair,
  Download,
  Info,
  Layers,
  Map as MapIcon,
  Search,
  X,
} from "lucide-react";
import { pinDeLocal } from "@/components/map/pin-icon";
import { LegendaSheet } from "@/components/map/legenda-sheet";
import { Chip } from "@/components/chip";
import { Button } from "@/components/ui/button";
import { useAvisos, useLocais, useSalas } from "@/hooks/use-data";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { CENTRO_MAPA, FILTROS_MAPA, grupoDeCategoria, type Local } from "@/lib/types";

interface CampusMapProps {
  onSelectLocal: (local: Local) => void;
  foco?: { lat: number; lng: number; key: number } | null;
}

const TILES_OSM =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILES_SATELITE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function RegistradorMapa({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
}

function ControladorVoo({
  alvo,
  aoChegar,
}: {
  alvo: [number, number] | null;
  aoChegar: () => void;
}) {
  const map = useMap();
  const jaIniciado = useRef(false);
  useEffect(() => {
    if (alvo) {
      map.flyTo(alvo, 18, { duration: 0.7 });
      aoChegar();
    } else if (!jaIniciado.current) {
      map.setView(CENTRO_MAPA, 17);
      jaIniciado.current = true;
    }
  }, [alvo, map, aoChegar]);
  return null;
}

export function CampusMap({ onSelectLocal, foco }: CampusMapProps) {
  const [satelite, setSatelite] = useState(false);
  const [categoria, setCategoria] = useState<string>("Todos");
  const [busca, setBusca] = useState("");
  const [legendaAberta, setLegendaAberta] = useState(false);
  const [alvo, setAlvo] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { podeInstalar, promptInstall } = useInstallPrompt();

  const { data: locais, isLoading } = useLocais();
  const { data: salas } = useSalas();
  const { data: avisos } = useAvisos();

  const avisosPorLocal = useMemo(() => {
    const mapa = new Map<string, number>();
    avisos?.forEach((av) => {
      const sala = salas?.find((s) => s.id === av.sala_id);
      if (!sala) return;
      mapa.set(sala.local_id, (mapa.get(sala.local_id) ?? 0) + 1);
    });
    return mapa;
  }, [avisos, salas]);

  const locaisFiltrados = useMemo(() => {
    if (!locais) return [];
    if (categoria === "Todos") return locais;
    // Filtra pelo grupo (Blocos, Alimentação, Acadêmico, Serviços)
    return locais.filter((l) => grupoDeCategoria(l.categoria) === categoria);
  }, [locais, categoria]);

  const resultadoBusca = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (q.length < 2) return { salas: [], locais: [] as Local[] };
    const locaisMatch = (locais ?? []).filter(
      (l) =>
        l.nome.toLowerCase().includes(q) ||
        (l.descricao ?? "").toLowerCase().includes(q),
    );
    const salasMatch = (salas ?? [])
      .filter((s) => s.nome.toLowerCase().includes(q))
      .slice(0, 6);
    return { salas: salasMatch, locais: locaisMatch.slice(0, 3) };
  }, [busca, locais, salas]);

  const focarLocal = (local: Local) => {
    setBusca("");
    setAlvo([local.lat, local.lng]);
    onSelectLocal(local);
  };

  const focarSala = (salaId: string) => {
    const sala = salas?.find((s) => s.id === salaId);
    const local = sala && locais?.find((l) => l.id === sala.local_id);
    if (local) focarLocal(local);
    else setBusca("");
  };

  const minhaLocalizacao = () => {
    mapRef.current?.locate({ setView: true, maxZoom: 18 });
  };

  return (
    <div className="relative h-full w-full overflow-hidden isolate">
      <MapContainer
        center={CENTRO_MAPA}
        zoom={17}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      >
        <RegistradorMapa
          onMap={(m) => {
            mapRef.current = m;
          }}
        />
        <ControladorVoo
          alvo={alvo}
          aoChegar={() => setAlvo(null)}
        />
        <TileLayer
          url={satelite ? TILES_SATELITE : TILES_OSM}
          attribution={
            satelite
              ? "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              : "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
          }
        />
        {locaisFiltrados.map((local) => (
          <Marker
            key={local.id}
            position={[local.lat, local.lng]}
            icon={pinDeLocal(local, avisosPorLocal.get(local.id) ?? 0)}
            eventHandlers={{ click: () => onSelectLocal(local) }}
          />
        ))}
      </MapContainer>

      {/* Busca */}
      <div className="absolute inset-x-0 top-3 z-[1000] px-3">
        <div className="relative mx-auto max-w-[420px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar sala, bloco, biblioteca..."
            aria-label="Buscar sala, bloco, biblioteca"
            className="h-12 w-full rounded-full border border-border bg-card pl-10 pr-10 text-base shadow-lg outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {busca.trim().length >= 2 && (
            <div className="mt-1.5 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              {resultadoBusca.salas.length === 0 &&
                resultadoBusca.locais.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    Nada encontrado para “{busca}”.
                  </p>
                )}
              {resultadoBusca.salas.map((s) => {
                const local = locais?.find((l) => l.id === s.local_id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => focarSala(s.id)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent"
                  >
                    <MapIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="font-semibold">{s.nome}</span>
                      {local && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {local.nome}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
              {resultadoBusca.locais.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => focarLocal(l)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent"
                >
                  <MapIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="font-semibold">{l.nome}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chips de categoria */}
      <div className="absolute inset-x-0 top-[76px] z-[1000] px-3">
        <div
          className="mx-auto flex max-w-[420px] gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filtrar por categoria"
        >
          {FILTROS_MAPA.map((cat) => (
            <Chip
              key={cat}
              ativo={categoria === cat}
              onClick={() => setCategoria(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Botões de camada, localização e legenda */}
      <div className="absolute right-3 top-[132px] z-[1000] flex flex-col gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-11 w-11 rounded-full shadow-md"
          onClick={() => setSatelite((v) => !v)}
          aria-label={satelite ? "Alternar para mapa padrão" : "Alternar para satélite"}
          title={satelite ? "Mapa padrão" : "Satélite"}
        >
          <Layers className="h-5 w-5" aria-hidden />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-11 w-11 rounded-full shadow-md"
          onClick={minhaLocalizacao}
          aria-label="Ir para minha localização"
          title="Minha localização"
        >
          <Crosshair className="h-5 w-5" aria-hidden />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-11 w-11 rounded-full shadow-md"
          onClick={() => setLegendaAberta(true)}
          aria-label="Abrir legenda do mapa"
          title="Legenda"
        >
          <Info className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      {/* Botão discreto de instalação */}
      {podeInstalar && (
        <Button
          type="button"
          variant="secondary"
          className="absolute bottom-4 left-3 z-[1000] h-11 rounded-full px-4 shadow-md"
          onClick={() => promptInstall()}
        >
          <Download className="h-4 w-4" aria-hidden />
          Instalar app
        </Button>
      )}

      {/* Indicador de carregamento */}
      {isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-background/70">
          <p className="rounded-full bg-card px-4 py-2 text-sm font-semibold shadow">
            Carregando o mapa…
          </p>
        </div>
      )}

      <LegendaSheet
        aberta={legendaAberta}
        onOpenChange={setLegendaAberta}
      />
    </div>
  );
}
