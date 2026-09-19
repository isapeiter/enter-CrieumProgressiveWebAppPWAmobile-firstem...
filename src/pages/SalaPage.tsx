import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Clock,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvisos, useHorarios, useLocais, useSalas } from "@/hooks/use-data";
import { diaSemanaHoje, formatData, formatTime, nomeDia } from "@/lib/format";
import { DIAS_SEMANA } from "@/lib/types";

const SalaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dia, setDia] = useState(diaSemanaHoje());

  const { data: salas, isLoading: carregandoSalas } = useSalas();
  const { data: locais } = useLocais();
  const { data: horarios } = useHorarios(id ?? null);
  const { data: avisos } = useAvisos();

  const sala = salas?.find((s) => s.id === id);
  const local = sala && locais?.find((l) => l.id === sala.local_id);
  const avisoAtivo = useMemo(
    () => avisos?.find((av) => av.sala_id === id),
    [avisos, id],
  );
  const novaSala =
    avisoAtivo &&
    avisoAtivo.nova_sala_id &&
    salas?.find((s) => s.id === avisoAtivo.nova_sala_id);
  const aulaAgora = horarios?.filter((h) => h.dia_semana === dia) ?? [];

  if (carregandoSalas) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="p-4">
        <EmptyState
          icone={<BookOpen className="h-8 w-8" aria-hidden />}
          titulo="Sala não encontrada"
          descricao="Esta sala não existe ou foi removida."
          acao={
            <Button onClick={() => navigate("/")}>Voltar para o mapa</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-2 inline-flex min-h-[40px] items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
        </button>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              Sala {sala.nome}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[15px] text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {local?.nome ?? "Local não informado"}
              {sala.andar ? ` · ${sala.andar}` : ""}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {sala.tipo}
          </Badge>
        </div>
      </div>

      {avisoAtivo && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning bg-warning/10 p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold text-warning">
              {avisoAtivo.tipo} {avisoAtivo.nova_sala_id ? "— troca de sala" : ""}
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatData(avisoAtivo.data_evento)}
              {avisoAtivo.horario ? ` às ${formatTime(avisoAtivo.horario)}` : ""}
              {novaSala ? ` · agora na sala ${novaSala.nome}` : ""}
            </p>
            {avisoAtivo.mensagem && (
              <p className="mt-1 text-sm text-foreground">
                {avisoAtivo.mensagem}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Publicado por {avisoAtivo.criador_nome ?? "professor(a)"}
            </p>
            {novaSala && (
              <Button
                className="mt-3 h-11 w-full bg-warning text-white hover:bg-warning/90"
                onClick={() =>
                  navigate("/", { state: { focoLocalId: novaSala.local_id } })
                }
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Ver a nova sala no mapa
              </Button>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Aulas de {nomeDia(dia).toLowerCase()}
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DIAS_SEMANA.map((nome, i) => (
            <Chip key={nome} ativo={dia === i + 1} onClick={() => setDia(i + 1)}>
              {nome}
            </Chip>
          ))}
        </div>

        {aulaAgora.length === 0 ? (
          <EmptyState
            icone={<Clock className="h-8 w-8" aria-hidden />}
            titulo={`Sem aulas de ${nomeDia(dia).toLowerCase()}`}
            descricao="Nenhuma aula cadastrada para esta sala neste dia."
          />
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {aulaAgora.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-primary">
                    {formatTime(h.inicio)} – {formatTime(h.fim)}
                  </p>
                  <Badge variant="secondary">{h.turma ?? "—"}</Badge>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  {h.disciplina}
                </p>
                <p className="text-sm text-muted-foreground">
                  Prof. {h.professor}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="h-12 w-full text-base"
        onClick={() => navigate("/reportar", { state: { salaId: sala.id } })}
      >
        <TriangleAlert className="h-5 w-5" aria-hidden />
        Reportar problema nesta sala
      </Button>
    </div>
  );
};

export default SalaPage;
