import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  Clock,
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
import { useAvisos, useLocais, useSalas } from "@/hooks/use-data";
import { dataMaisDias, formatData, formatTime, hojeISO } from "@/lib/format";
import { TIPOS_AVISO, type TipoAviso } from "@/lib/types";

const selCls =
  "flex h-12 w-full items-center rounded-xl border border-input bg-background px-3 text-base";

const AvisosPage = () => {
  const { profile, isProfessor, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const { data: avisos, isLoading } = useAvisos();
  const { data: salas } = useSalas();
  const { data: locais } = useLocais();

  const [formAberto, setFormAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoAviso>("Prova");
  const [salaId, setSalaId] = useState("");
  const [data, setData] = useState(dataMaisDias(1));
  const [horario, setHorario] = useState("");
  const [novaSalaId, setNovaSalaId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const salasPorLocal = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string }[]>();
    salas?.forEach((s) => {
      const arr = mapa.get(s.local_id) ?? [];
      arr.push({ id: s.id, nome: s.nome });
      mapa.set(s.local_id, arr);
    });
    return mapa;
  }, [salas]);

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaId || !data) return;
    setEnviando(true);
    const { error } = await supabase.from("avisos").insert({
      sala_id: salaId,
      tipo,
      data_evento: data,
      horario: horario || null,
      nova_sala_id: novaSalaId || null,
      mensagem,
      criado_por: profile!.id,
    });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível publicar o aviso. Tente de novo.");
      return;
    }
    toast.success("Aviso publicado! Os alunos já podem ver no mapa.");
    setFormAberto(false);
    setSalaId("");
    setHorario("");
    setNovaSalaId("");
    setMensagem("");
    queryClient.invalidateQueries({ queryKey: ["avisos"] });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        titulo="Avisos"
        subtitulo="Provas, trocas de sala e cancelamentos publicados pelos professores."
      />

      <div className="px-4">
        {isProfessor ? (
          <Button
            className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
            onClick={() => setFormAberto(true)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            Publicar aviso
          </Button>
        ) : profile ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3">
            <Megaphone className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Só professores podem publicar avisos.
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            className="h-12 w-full text-base"
            onClick={openAuthModal}
          >
            <UserRound className="h-5 w-5" aria-hidden />
            Entrar para publicar avisos
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-2">
        {isLoading && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {!isLoading && avisos && avisos.length === 0 && (
          <EmptyState
            icone={<BellRing className="h-8 w-8" aria-hidden />}
            titulo="Nenhum aviso ativo"
            descricao="Não há provas, trocas de sala ou cancelamentos no momento."
          />
        )}

        {avisos?.map((av) => {
          const sala = salas?.find((s) => s.id === av.sala_id);
          const local = sala && locais?.find((l) => l.id === sala.local_id);
          const novaSala = av.nova_sala_id
            ? salas?.find((s) => s.id === av.nova_sala_id)
            : null;
          return (
            <article
              key={av.id}
              className="rounded-2xl border border-warning/60 bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge className="bg-warning text-white hover:bg-warning/90">
                  {av.tipo}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {formatData(av.data_evento)}
                  {av.horario ? ` às ${formatTime(av.horario)}` : ""}
                </span>
              </div>
              <p className="mt-2 text-base font-bold text-foreground">
                {sala?.nome ?? "Sala"} · {local?.nome ?? ""}
              </p>
              {av.mensagem && (
                <p className="mt-1 text-sm leading-snug text-foreground">
                  {av.mensagem}
                </p>
              )}
              {novaSala && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-sm font-semibold text-warning">
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  Nova sala: {novaSala.nome}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Publicado por {av.criador_nome ?? "professor(a)"}
              </p>
            </article>
          );
        })}
      </div>

      <Drawer open={formAberto} onOpenChange={setFormAberto}>
        <DrawerContent className="mx-auto max-w-[480px]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">Publicar aviso</DrawerTitle>
            <DrawerDescription>
              O bloco da sala aparecerá em laranja no mapa para todos.
            </DrawerDescription>
          </DrawerHeader>
          <form
            onSubmit={publicar}
            className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto px-4 pb-8"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="av-tipo">Tipo de aviso</Label>
              <select
                id="av-tipo"
                className={selCls}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoAviso)}
              >
                {TIPOS_AVISO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="av-sala">Sala original</Label>
              <select
                id="av-sala"
                required
                className={selCls}
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
              >
                <option value="" disabled>
                  Escolha a sala…
                </option>
                {locais?.map((l) => {
                  const sals = salasPorLocal.get(l.id) ?? [];
                  if (sals.length === 0) return null;
                  return (
                    <optgroup key={l.id} label={l.nome}>
                      {sals.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="av-data">Data</Label>
                <Input
                  id="av-data"
                  type="date"
                  required
                  min={hojeISO()}
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="av-horario">Horário</Label>
                <Input
                  id="av-horario"
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="av-nova-sala">
                Nova sala <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <select
                id="av-nova-sala"
                className={selCls}
                value={novaSalaId}
                onChange={(e) => setNovaSalaId(e.target.value)}
              >
                <option value="">Sem mudança de sala</option>
                {salas?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="av-msg">Mensagem</Label>
              <Textarea
                id="av-msg"
                required
                maxLength={280}
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Ex.: A prova será no Bloco B por problemas de climatização."
              />
              <span className="text-right text-xs text-muted-foreground">
                {mensagem.length}/280
              </span>
            </div>

            <Button
              type="submit"
              disabled={enviando || !salaId}
              className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
            >
              <CalendarDays className="h-5 w-5" aria-hidden />
              Publicar aviso
            </Button>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AvisosPage;
