import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  FileImage,
  Flame,
  Loader2,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { enviarFoto, useLocais, useSalas } from "@/hooks/use-data";
import { CATEGORIAS_CHAMADO, PAPEL_LABEL } from "@/lib/types";

const selCls =
  "flex h-12 w-full items-center rounded-xl border border-input bg-background px-3 text-base";

const ReportarPage = () => {
  const { profile, initialLoading, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: locais } = useLocais();
  const { data: salas } = useSalas();

  const [categoria, setCategoria] = useState<string>("");
  const [localId, setLocalId] = useState("");
  const [salaId, setSalaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const salasDoLocal = useMemo(
    () => (salas ?? []).filter((s) => s.local_id === localId),
    [salas, localId],
  );

  // Pré-preenche a sala quando vindo de "Reportar problema nesta sala"
  useEffect(() => {
    const estado = location.state as { salaId?: string } | null;
    const sala = estado?.salaId && salas?.find((s) => s.id === estado.salaId);
    if (sala) {
      setLocalId(sala.local_id);
      setSalaId(sala.id);
      setCategoria((c) => c || "Outro");
    }
  }, [location.state, salas]);

  // Abre o login automaticamente quando um visitante tenta reportar
  useEffect(() => {
    if (!initialLoading && !profile) {
      openAuthModal();
    }
  }, [initialLoading, profile, openAuthModal]);

  const localTexto = salaId
    ? (salas?.find((s) => s.id === salaId)?.nome ?? "")
    : localId
      ? (locais?.find((l) => l.id === localId)?.nome ?? "")
      : "Área externa";

  const aoEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria || !descricao.trim() || !profile) return;
    setEnviando(true);
    try {
      const fotoUrl = foto ? await enviarFoto(foto) : null;
      const { data, error } = await supabase
        .from("chamados")
        .insert({
          categoria,
          sala_id: salaId || null,
          local_texto: localTexto,
          descricao: descricao.trim(),
          foto_url: fotoUrl,
          criado_por: profile.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      const numero = (data.id as string).slice(0, 8).toUpperCase();
      setSucesso(numero);
      setCategoria("");
      setLocalId("");
      setSalaId("");
      setDescricao("");
      setFoto(null);
      setPreview(null);
      queryClient.invalidateQueries({ queryKey: ["chamados"] });
    } catch {
      toast.error("Não foi possível enviar o chamado. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <PageHeader
          titulo="Reportar problema"
          subtitulo="Avise a equipe responsável sobre algo que precisa de conserto."
        />
        <EmptyState
          icone={<UserRound className="h-8 w-8" aria-hidden />}
          titulo="Faça seu login para continuar"
          descricao="Você precisa entrar com seu e-mail da UTFPR para reportar um problema."
          acao={
            <Button className="h-12 text-base" onClick={openAuthModal}>
              Entrar com e-mail da UTFPR
            </Button>
          }
        />
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="p-4">
        <PageHeader
          titulo="Reportar problema"
          subtitulo="Avise a equipe responsável sobre algo que precisa de conserto."
        />
        <EmptyState
          icone={<CheckCircle2 className="h-8 w-8 text-success" aria-hidden />}
          titulo={`Chamado nº ${sucesso} aberto!`}
          descricao="A equipe responsável já foi avisada. Você pode acompanhar o andamento em Meus chamados."
          acao={
            <div className="flex w-full max-w-xs flex-col gap-2">
              <Button
                className="h-12 text-base"
                onClick={() => navigate("/perfil")}
              >
                Ver meus chamados
              </Button>
              <Button
                variant="outline"
                className="h-12 text-base"
                onClick={() => setSucesso(null)}
              >
                Reportar outro problema
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        titulo="Reportar problema"
        subtitulo="Avise a equipe responsável sobre algo que precisa de conserto."
      />

      <div className="px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3">
          {profile?.papel === "professor" ? (
            <Flame className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
          ) : (
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-hidden />
          )}
          <p className="text-sm text-foreground">
            Você é {PAPEL_LABEL[profile.papel]}. Seu chamado terá prioridade{" "}
            <strong className={profile.papel === "professor" ? "text-destructive" : ""}>
              {profile.papel === "professor" ? "ALTA" : "normal"}
            </strong>
            .
          </p>
        </div>
      </div>

      <form
        onSubmit={aoEnviar}
        className="flex flex-col gap-3 px-4 pb-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-categoria">Categoria do problema</Label>
          <select
            id="rep-categoria"
            required
            className={selCls}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="" disabled>
              Escolha a categoria…
            </option>
            {CATEGORIAS_CHAMADO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-local">Local</Label>
          <select
            id="rep-local"
            className={selCls}
            value={localId}
            onChange={(e) => {
              setLocalId(e.target.value);
              setSalaId("");
            }}
          >
            <option value="">Área externa</option>
            {locais?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>

        {salasDoLocal.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rep-sala">Sala</Label>
            <select
              id="rep-sala"
              className={selCls}
              value={salaId}
              onChange={(e) => setSalaId(e.target.value)}
            >
              <option value="">Sala não específica</option>
              {salasDoLocal.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} · {s.tipo}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-desc">Descrição</Label>
          <Textarea
            id="rep-desc"
            required
            rows={4}
            maxLength={500}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o que está quebrado ou com problema…"
          />
          <span className="text-right text-xs text-muted-foreground">
            {descricao.length}/500
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-foto">
            Foto <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <label className="flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-input bg-card px-4 py-3">
            {preview ? (
              <img
                src={preview}
                alt="Prévia da foto do problema"
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <FileImage className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className="flex-1 text-sm text-muted-foreground">
              {foto ? foto.name : "Toque para anexar uma foto"}
            </span>
            <Camera className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              id="rep-foto"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFoto(f);
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </label>
        </div>

        <Button
          type="submit"
          disabled={enviando || !categoria || descricao.trim().length < 10}
          className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
        >
          {enviando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Send className="h-5 w-5" aria-hidden />
          )}
          Enviar chamado
        </Button>
      </form>
    </div>
  );
};

export default ReportarPage;
