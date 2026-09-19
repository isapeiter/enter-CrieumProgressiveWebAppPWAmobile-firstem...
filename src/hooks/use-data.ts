import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { hojeISO } from "@/lib/format";
import type {
  Aviso,
  Cardapio,
  Chamado,
  Horario,
  Local,
  Oportunidade,
  Sala,
} from "@/lib/types";

const BUCKET_FOTOS = "chamados-fotos";

async function ler<T>(
  query: Promise<{ data: T | null; error: { message: string } | null }>,
): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("Nenhum dado retornado");
  return data;
}

export function useLocais() {
  return useQuery({
    queryKey: ["locais"],
    queryFn: () =>
      ler<Local[]>(supabase.from("locais").select("*").order("nome")),
    staleTime: 5 * 60_000,
  });
}

export function useSalas() {
  return useQuery({
    queryKey: ["salas"],
    queryFn: () =>
      ler<Sala[]>(supabase.from("salas").select("*").order("nome")),
    staleTime: 5 * 60_000,
  });
}

export function useSalasDoLocal(localId: string | null) {
  return useQuery({
    queryKey: ["salas", localId],
    queryFn: () =>
      ler<Sala[]>(
        supabase
          .from("salas")
          .select("*")
          .eq("local_id", localId)
          .order("nome"),
      ),
    enabled: Boolean(localId),
    staleTime: 5 * 60_000,
  });
}

export function useHorarios(salaId: string | null) {
  return useQuery({
    queryKey: ["horarios", salaId],
    queryFn: () =>
      ler<Horario[]>(
        supabase
          .from("horarios")
          .select("*")
          .eq("sala_id", salaId)
          .order("inicio"),
      ),
    enabled: Boolean(salaId),
    staleTime: 5 * 60_000,
  });
}

/** Avisos ainda ativos (data_evento >= hoje), mais antigos de data primeiro */
export function useAvisos() {
  return useQuery({
    queryKey: ["avisos", "ativos", hojeISO()],
    queryFn: () =>
      ler<Aviso[]>(
        supabase
          .from("avisos")
          .select("*")
          .gte("data_evento", hojeISO())
          .order("data_evento", { ascending: true }),
      ),
    staleTime: 60_000,
  });
}

export function useCardapio(data: string) {
  return useQuery({
    queryKey: ["cardapio", data],
    queryFn: () =>
      ler<Cardapio[]>(supabase.from("cardapio").select("*").eq("data", data)),
    staleTime: 60_000,
  });
}

export function useChamadosProprios(userId: string | null) {
  return useQuery({
    queryKey: ["chamados", "meus", userId],
    queryFn: () =>
      ler<Chamado[]>(
        supabase
          .from("chamados")
          .select("*")
          .eq("criado_por", userId)
          .order("criado_em", { ascending: false }),
      ),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

/** Apenas o estagiário enxerga os chamados de todos (RLS) */
export function useChamadosTodos() {
  return useQuery({
    queryKey: ["chamados", "todos"],
    queryFn: () =>
      ler<Chamado[]>(
        supabase.from("chamados").select("*").order("criado_em"),
      ),
    staleTime: 15_000,
  });
}

/** Oportunidades (projetos, atividades, estágios e avisos gerais) */
export function useOportunidades() {
  return useQuery({
    queryKey: ["oportunidades"],
    queryFn: () =>
      ler<Oportunidade[]>(
        supabase
          .from("oportunidades")
          .select("*")
          .order("criado_em", { ascending: false }),
      ),
    staleTime: 30_000,
  });
}

/** URL pública da foto de um chamado (bucket público) */
export function fotoUrlPublica(caminho: string | null): string | null {
  if (!caminho) return null;
  return (
    supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl ??
    null
  );
}

export async function enviarFoto(file: File): Promise<string | null> {
  const form = new FormData();
  form.append("file", file, file.name);
  const { data, error } = await supabase.functions.invoke(
    "upload-foto-chamado",
    { body: form },
  );
  if (error || !data?.path) return null;
  return data.path as string;
}
