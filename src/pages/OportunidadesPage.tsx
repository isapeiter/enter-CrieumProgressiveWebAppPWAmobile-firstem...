import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AtSign,
  Briefcase,
  Loader2,
  Megaphone,
  Plus,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/hooks/use-auth";
import { useOportunidades } from "@/hooks/use-data";
import { tempoAtras } from "@/lib/format";
import {
  COR_TIPO_OPORTUNIDADE,
  TIPOS_OPORTUNIDADE,
  type TipoOportunidade,
} from "@/lib/types";

const selCls =
  "flex h-12 w-full items-center rounded-xl border border-input bg-background px-3 text-base";

const OportunidadesPage = () => {
  const { profile, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const { data: oportunidades, isLoading } = useOportunidades();

  const [formAberto, setFormAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoOportunidade>("Projeto");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [contato, setContato] = useState("");
  const [enviando, setEnviando] = useState(false);

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim() || !profile) return;
    setEnviando(true);
    const { error } = await supabase.from("oportunidades").insert({
      titulo: titulo.trim(),
      tipo,
      descricao: descricao.trim(),
      contato: contato.trim() || null,
      criado_por: profile.id,
    });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível publicar. Tente de novo.");
      return;
    }
    toast.success("Oportunidade publicada! Todos já podem ver.");
    setFormAberto(false);
    setTitulo("");
    setDescricao("");
    setContato("");
    queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        titulo="Oportunidades"
        subtitulo="Projetos, atividades e estágios divulgados pela comunidade do câmpus."
      />

      <div className="px-4">
        {profile ? (
          <Button
            className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
            onClick={() => setFormAberto(true)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            Divulgar oportunidade
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-12 w-full text-base"
            onClick={openAuthModal}
          >
            <UserRound className="h-5 w-5" aria-hidden />
            Entrar para divulgar
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-2">
        {isLoading && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        )}

        {!isLoading && oportunidades && oportunidades.length === 0 && (
          <EmptyState
            icone={<Briefcase className="h-8 w-8" aria-hidden />}
            titulo="Nada por aqui ainda"
            descricao="Projetos, atividades e estágios divulgados aparecerão aqui."
            acao={
              profile && (
                <Button className="h-12 text-base" onClick={() => setFormAberto(true)}>
                  Divulgar oportunidade
                </Button>
              )
            }
          />
        )}

        {oportunidades?.map((op) => (
          <article
            key={op.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge
                className="border-0 text-white"
                style={{
                  background: COR_TIPO_OPORTUNIDADE[op.tipo] ?? "#6B7280",
                }}
              >
                {op.tipo}
              </Badge>
              <span className="shrink-0 text-xs text-muted-foreground">
                {tempoAtras(op.criado_em)}
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold leading-snug text-foreground">
              {op.titulo}
            </h3>
            <p className="mt-1 text-sm leading-snug text-foreground">
              {op.descricao}
            </p>
            {op.contato && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                <AtSign className="h-3.5 w-3.5" aria-hidden />
                {op.contato}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Divulgado por {op.autor_nome ?? "Comunidade UTFPR"}
            </p>
          </article>
        ))}
      </div>

      <Drawer open={formAberto} onOpenChange={setFormAberto}>
        <DrawerContent className="mx-auto max-w-[480px]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">Divulgar oportunidade</DrawerTitle>
            <DrawerDescription>
              Projetos, atividades, estágios e avisos gerais do câmpus.
            </DrawerDescription>
          </DrawerHeader>
          <form
            onSubmit={publicar}
            className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto px-4 pb-8"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="op-tipo">Tipo</Label>
              <select
                id="op-tipo"
                className={selCls}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoOportunidade)}
              >
                {TIPOS_OPORTUNIDADE.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="op-titulo">Título</Label>
              <Input
                id="op-titulo"
                required
                maxLength={120}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Vaga de estágio em Desenvolvimento Web"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="op-desc">Descrição</Label>
              <Textarea
                id="op-desc"
                required
                rows={4}
                maxLength={500}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes, datas, pré-requisitos…"
              />
              <span className="text-right text-xs text-muted-foreground">
                {descricao.length}/500
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="op-contato">
                Contato <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="op-contato"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="E-mail, WhatsApp ou sala"
              />
            </div>

            <Button
              type="submit"
              disabled={enviando || !titulo.trim() || !descricao.trim()}
              className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
            >
              {enviando ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Megaphone className="h-5 w-5" aria-hidden />
              )}
              Publicar oportunidade
            </Button>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default OportunidadesPage;
