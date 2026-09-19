import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  ClipboardList,
  Flame,
  Inbox,
  Play,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusSteps } from "@/components/status-steps";
import { useAuth } from "@/hooks/use-auth";
import {
  useChamadosTodos,
  useLocais,
  useSalas,
  fotoUrlPublica,
} from "@/hooks/use-data";
import { hojeISO, tempoAtras } from "@/lib/format";
import {
  CATEGORIAS_CHAMADO,
  PAPEL_LABEL,
  type StatusChamado,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PESO_STATUS: Record<StatusChamado, number> = {
  aberto: 0,
  em_andamento: 1,
  resolvido: 2,
};

function FotoChamado({ caminho }: { caminho: string | null }) {
  const url = fotoUrlPublica(caminho);
  if (!url) return null;
  return (
    <img
      src={url}
      alt="Foto anexada ao chamado"
      className="mt-2 h-32 w-full rounded-xl object-cover"
    />
  );
}

const PainelPage = () => {
  const { profile, initialLoading, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const { data: chamados, isLoading } = useChamadosTodos();
  const { data: locais } = useLocais();
  const { data: salas } = useSalas();

  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusChamado>(
    "todos",
  );
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroLocal, setFiltroLocal] = useState("todos");

  // Abre o login automaticamente quando um visitante tenta abrir o painel
  useEffect(() => {
    if (!initialLoading && !profile) openAuthModal();
  }, [initialLoading, profile, openAuthModal]);

  const contadores = useMemo(() => {
    const base = chamados ?? [];
    const hoje = hojeISO();
    return {
      abertos: base.filter((c) => c.status === "aberto").length,
      emAndamento: base.filter((c) => c.status === "em_andamento").length,
      resolvidosHoje: base.filter(
        (c) =>
          c.status === "resolvido" &&
          c.atualizado_em.slice(0, 10) === hoje,
      ).length,
      alta: base.filter((c) => c.prioridade === "alta").length,
    };
  }, [chamados]);

  const lista = useMemo(() => {
    // Nome do bloco/local do chamado, resolvido pela sala quando houver
    const localDoChamado = (
      salaId: string | null,
      texto: string,
    ): string => {
      const sala = salaId && salas?.find((s) => s.id === salaId);
      const local = sala && locais?.find((l) => l.id === sala.local_id);
      return local?.nome ?? texto;
    };

    const base = chamados ?? [];
    const filtrados = base.filter((c) => {
      if (filtroStatus !== "todos" && c.status !== filtroStatus) return false;
      if (filtroCategoria !== "todas" && c.categoria !== filtroCategoria)
        return false;
      if (filtroLocal !== "todos") {
        const local = localDoChamado(c.sala_id, c.local_texto);
        if (local !== filtroLocal) return false;
      }
      return true;
    });
    return [...filtrados].sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return a.prioridade === "alta" ? -1 : 1;
      }
      if (PESO_STATUS[a.status] !== PESO_STATUS[b.status]) {
        return PESO_STATUS[a.status] - PESO_STATUS[b.status];
      }
      return (
        new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
      );
    });
  }, [chamados, filtroStatus, filtroCategoria, filtroLocal, locais, salas]);

  const atualizarStatus = async (id: string, status: StatusChamado) => {
    const { error } = await supabase
      .from("chamados")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o chamado.");
      return;
    }
    toast.success(
      status === "resolvido"
        ? "Chamado marcado como resolvido!"
        : "Atendimento iniciado!",
    );
    queryClient.invalidateQueries({ queryKey: ["chamados"] });
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <PageHeader
          titulo="Painel do estagiário"
          subtitulo="Acompanhe e resolva os chamados do câmpus."
        />
        <EmptyState
          icone={<UserRound className="h-8 w-8" aria-hidden />}
          titulo="Faça seu login para continuar"
          descricao="Entre com uma conta de estagiário para abrir o painel."
          acao={
            <Button className="h-12 text-base" onClick={openAuthModal}>
              Entrar no Campus Fácil
            </Button>
          }
        />
      </div>
    );
  }

  if (profile.papel !== "estagiario") {
    return (
      <div className="p-4">
        <PageHeader
          titulo="Painel do estagiário"
          subtitulo="Acompanhe e resolva os chamados do câmpus."
        />
        <EmptyState
          icone={<ShieldAlert className="h-8 w-8 text-destructive" aria-hidden />}
          titulo="Acesso restrito"
          descricao="Apenas estagiários da equipe de infraestrutura têm acesso ao painel."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        titulo="Painel do estagiário"
        subtitulo="Acompanhe e resolva os chamados do câmpus."
      />

      <div className="grid grid-cols-4 gap-2 px-4">
        {[
          { rotulo: "Abertos", valor: contadores.abertos, icone: Inbox },
          {
            rotulo: "Em andamento",
            valor: contadores.emAndamento,
            icone: Play,
          },
          {
            rotulo: "Resolvidos hoje",
            valor: contadores.resolvidosHoje,
            icone: CheckCircle2,
          },
          { rotulo: "Prioridade alta", valor: contadores.alta, icone: Flame },
        ].map(({ rotulo, valor, icone: Icone }) => (
          <div
            key={rotulo}
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 shadow-sm"
          >
            <Icone
              className={cn(
                "h-5 w-5",
                rotulo === "Prioridade alta"
                  ? "text-destructive"
                  : "text-primary",
              )}
              aria-hidden
            />
            <span className="text-2xl font-extrabold text-foreground">
              {valor}
            </span>
            <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">
              {rotulo}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["todos", "aberto", "em_andamento", "resolvido"] as const).map(
            (s) => (
              <Chip
                key={s}
                ativo={filtroStatus === s}
                onClick={() => setFiltroStatus(s)}
              >
                {s === "todos"
                  ? "Todos"
                  : s === "em_andamento"
                    ? "Em andamento"
                    : s === "resolvido"
                      ? "Resolvido"
                      : "Aberto"}
              </Chip>
            ),
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            ativo={filtroCategoria === "todas"}
            onClick={() => setFiltroCategoria("todas")}
          >
            Todas categorias
          </Chip>
          {CATEGORIAS_CHAMADO.map((c) => (
            <Chip
              key={c}
              ativo={filtroCategoria === c}
              onClick={() => setFiltroCategoria(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            ativo={filtroLocal === "todos"}
            onClick={() => setFiltroLocal("todos")}
          >
            Todos os locais
          </Chip>
          {(locais ?? []).map((l) => (
            <Chip
              key={l.id}
              ativo={filtroLocal === l.nome}
              onClick={() => setFiltroLocal(l.nome)}
            >
              {l.nome}
            </Chip>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 px-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="px-4">
          <EmptyState
            icone={<ClipboardList className="h-8 w-8" aria-hidden />}
            titulo="Nenhum chamado aqui"
            descricao="Não há chamados com os filtros escolhidos."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-2">
          {lista.map((c) => {
            const alta = c.prioridade === "alta";
            return (
              <article
                key={c.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 shadow-sm",
                  alta
                    ? "border-l-4 border-l-destructive bg-destructive/5"
                    : "border-l-4 border-l-gray-300",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">
                    #{c.id.slice(0, 8).toUpperCase()} · {c.categoria}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {tempoAtras(c.criado_em)}
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <PriorityBadge
                    prioridade={c.prioridade}
                    papelAutor={c.autor_papel}
                  />
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                    {c.local_texto}
                  </span>
                </div>

                <p className="mt-2 text-sm text-foreground">{c.descricao}</p>
                <FotoChamado caminho={c.foto_url} />

                <p className="mt-2 text-xs text-muted-foreground">
                  Aberto por{" "}
                  <span className="font-semibold text-foreground">
                    {c.autor_nome ?? "usuário"}
                  </span>{" "}
                  · {c.autor_papel ? PAPEL_LABEL[c.autor_papel] : ""}
                </p>

                <div className="mt-3">
                  <StatusSteps status={c.status} />
                </div>

                {c.status !== "resolvido" && (
                  <div className="mt-3 flex gap-2">
                    {c.status === "aberto" && (
                      <Button
                        className="h-11 flex-1"
                        onClick={() =>
                          atualizarStatus(c.id, "em_andamento")
                        }
                      >
                        <Play className="h-4 w-4" aria-hidden />
                        Iniciar atendimento
                      </Button>
                    )}
                    <Button
                      className="h-11 flex-1 bg-success text-white hover:bg-success/90"
                      onClick={() => atualizarStatus(c.id, "resolvido")}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Marcar como resolvido
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PainelPage;
