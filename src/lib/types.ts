import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Local = Tables["locais"]["Row"];
export type Sala = Tables["salas"]["Row"];
export type Horario = Tables["horarios"]["Row"];
export type Aviso = Tables["avisos"]["Row"];
export type Chamado = Tables["chamados"]["Row"];
export type Cardapio = Tables["cardapio"]["Row"];

export type Papel = Profile["papel"];
export type CategoriaLocal = Local["categoria"];
export type TipoAviso = Aviso["tipo"];
export type Prioridade = Chamado["prioridade"];
export type StatusChamado = Chamado["status"];
export type Refeicao = Cardapio["refeicao"];

/** Grupos de filtro exibidos no mapa (as categorias existentes são agrupadas neles) */
export const GRUPOS_FILTRO = [
  "Blocos",
  "Alimentação",
  "Acadêmico",
  "Serviços",
] as const;

export const FILTROS_MAPA = ["Todos", ...GRUPOS_FILTRO] as const;

/** Mapeia a categoria cadastrada do local para o grupo de filtro */
export const CATEGORIA_GRUPO: Record<string, string> = {
  Blocos: "Blocos",
  RU: "Alimentação",
  Biblioteca: "Acadêmico",
  Coordenações: "Acadêmico",
  DERAC: "Acadêmico",
  Serviços: "Serviços",
  Esporte: "Serviços",
  Transporte: "Serviços",
};

export function grupoDeCategoria(categoria: string): string {
  return CATEGORIA_GRUPO[categoria] ?? "Serviços";
}

/** Cor por grupo de filtro (legível no OSM e no satélite) */
export const COR_GRUPO: Record<string, string> = {
  Blocos: "#3B82F6",
  Alimentação: "#F59E0B",
  Acadêmico: "#8B5CF6",
  Serviços: "#06B6D4",
};

export function corDoGrupo(categoria: string): string {
  return COR_GRUPO[grupoDeCategoria(categoria)] ?? "#06B6D4";
}

export const CATEGORIAS_CHAMADO = [
  "Computador/Notebook",
  "Projetor/Equipamento",
  "Banheiro",
  "Sala/Mobiliário",
  "Iluminação",
  "Wi-Fi/Internet",
  "RU",
  "Outro",
] as const;

export const TIPOS_AVISO = [
  "Prova",
  "Mudança de sala",
  "Aula cancelada",
] as const;

export const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
] as const;

export const STATUS_CHAMADO: Record<
  StatusChamado,
  { label: string; cor: string; classe: string }
> = {
  aberto: { label: "Aberto", cor: "#9CA3AF", classe: "bg-gray-400" },
  em_andamento: {
    label: "Em andamento",
    cor: "#F97316",
    classe: "bg-warning",
  },
  resolvido: { label: "Resolvido", cor: "#22C55E", classe: "bg-success" },
};

export const PAPEL_LABEL: Record<Papel, string> = {
  aluno: "Aluno",
  professor: "Professor(a)",
  estagiario: "Estagiário",
};

export const EMAIL_INSTITUCIONAL_REGEX =
  /^[^@\s]+@(alunos\.utfpr\.edu\.br|utfpr\.edu\.br)$/i;

export const MSG_EMAIL_INSTITUCIONAL =
  "Use seu e-mail institucional (@alunos.utfpr.edu.br ou @utfpr.edu.br)";

export const DEMO_ACCOUNTS = [
  { email: "ana.souza@utfpr.edu.br", papel: "Professora" },
  { email: "bruno.ferreira@utfpr.edu.br", papel: "Estagiário" },
  { email: "carlos.lima@alunos.utfpr.edu.br", papel: "Aluno" },
];

/**
 * Centro do mapa: UTFPR – Câmpus Francisco Beltrão
 * (polígono da universidade no OpenStreetMap: -26.0849479, -53.0907074)
 */
export const CENTRO_MAPA: [number, number] = [-26.0849, -53.0907];

/**
 * Classificação INTERNA de posição dos locais (não exibida ao usuário).
 * Apenas locais com posição georreferenciada confirmada são exibidos no mapa;
 * os demais (posição a revisar) permanecem no banco, mas ficam ocultos até
 * receberem coordenadas reais confirmadas.
 */
export const LOCAIS_POSICAO_CONFIRMADA = new Set<string>([
  "10000000-0000-4000-8000-000000000001", // Bloco A – Hall de Entrada e Anfiteatro (OSM)
  "10000000-0000-4000-8000-000000000003", // Bloco R (OSM)
  "10000000-0000-4000-8000-000000000004", // RU (OSM)
  "10000000-0000-4000-8000-000000000005", // Biblioteca (OSM)
  "10000000-0000-4000-8000-000000000006", // Bloco Q (OSM)
  "10000000-0000-4000-8000-000000000007", // Bloco G (OSM)
  "10000000-0000-4000-8000-000000000009", // Centro de Convivência (OSM)
  "10000000-0000-4000-8000-000000000010", // Quadra de Esporte (ginásio no satélite)
]);

export function posicaoConfirmada(local: Local): boolean {
  return LOCAIS_POSICAO_CONFIRMADA.has(local.id);
}
