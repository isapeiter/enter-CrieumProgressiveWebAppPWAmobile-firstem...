import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  LogOut,
  MapPin,
  PawPrint,
  UserRound,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusSteps } from "@/components/status-steps";
import { useAuth } from "@/hooks/use-auth";
import { useChamadosProprios } from "@/hooks/use-data";
import { tempoAtras } from "@/lib/format";
import { PAPEL_LABEL } from "@/lib/types";

const PerfilPage = () => {
  const {
    profile,
    profileLoading,
    initialLoading,
    openAuthModal,
    signOut,
  } = useAuth();
  const navigate = useNavigate();
  const { data: chamados, isLoading: carregandoChamados } =
    useChamadosProprios(profile?.id ?? null);

  if (initialLoading || (profile && profileLoading)) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <PageHeader
          titulo="Perfil"
          subtitulo="Acompanhe seus chamados e sua conta no Campus Fácil."
        />
        <EmptyState
          icone={<UserRound className="h-8 w-8" aria-hidden />}
          titulo="Você ainda não entrou"
          descricao="Entre com seu e-mail da UTFPR para acompanhar seus chamados."
          acao={
            <Button className="h-12 text-base" onClick={openAuthModal}>
              Entrar no Campus Fácil
            </Button>
          }
        />
      </div>
    );
  }

  const iniciais = profile.nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        titulo="Perfil"
        subtitulo="Acompanhe seus chamados e sua conta no Campus Fácil."
      />

      <div className="px-4">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground">
            {iniciais}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-foreground">
              {profile.nome}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {profile.email}
            </p>
            <Badge
              variant="secondary"
              className="mt-1.5 bg-primary/15 text-primary-foreground"
            >
              {PAPEL_LABEL[profile.papel]}
            </Badge>
          </div>
        </div>
      </div>

      <section className="px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Meus chamados
          </h2>
          <span className="text-xs text-muted-foreground">
            {chamados?.length ?? 0} chamado(s)
          </span>
        </div>

        {carregandoChamados ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : chamados && chamados.length === 0 ? (
          <EmptyState
            icone={<Wrench className="h-8 w-8" aria-hidden />}
            titulo="Nenhum chamado ainda"
            descricao="Viu algo quebrado no câmpus? Abra o primeiro chamado!"
            acao={
              <Button
                className="h-12 text-base"
                onClick={() => navigate("/reportar")}
              >
                Reportar problema
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {chamados?.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">
                    #{c.id.slice(0, 8).toUpperCase()} · {c.categoria}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {tempoAtras(c.criado_em)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.local_texto}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-foreground">
                  {c.descricao}
                </p>
                <div className="mt-3">
                  <StatusSteps status={c.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Em breve
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-4 opacity-70">
            <PawPrint className="h-7 w-7 text-muted-foreground" aria-hidden />
            <p className="text-center text-sm font-semibold text-foreground">
              Personagens desbloqueáveis
            </p>
            <Badge variant="secondary">Em breve</Badge>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-4 opacity-70">
            <MapPin className="h-7 w-7 text-muted-foreground" aria-hidden />
            <p className="text-center text-sm font-semibold text-foreground">
              Localização em tempo real
            </p>
            <Badge variant="secondary">Em breve</Badge>
          </div>
        </div>
      </section>

      <div className="px-4 pb-2">
        <Button
          variant="outline"
          className="h-12 w-full text-base"
          onClick={async () => {
            await signOut();
            toast.success("Você saiu da sua conta.");
          }}
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Sair da conta
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1 pb-2 text-xs text-muted-foreground">
        Campus Fácil — UTFPR Francisco Beltrão
        <ArrowRight className="h-3 w-3" aria-hidden />
      </p>
    </div>
  );
};

export default PerfilPage;
