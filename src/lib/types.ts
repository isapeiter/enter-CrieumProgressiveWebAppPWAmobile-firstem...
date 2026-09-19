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

export const COR_CATEGORIA: Record<string, string> = {
  Blocos: "#3B82F6",
  RU: "#F59E0B",
  Biblioteca: "#8B5CF6",
  Coordenação: "#06B6D4",
  Informática: "#22C55E",
};

export const CATEGORIAS_LOCAIS = [
  "Blocos",
  "RU",
  "Biblioteca",
  "Coordenação",
  "Informática",
] as const;

export const FILTROS_MAPA = ["Todos", ...CATEGORIAS_LOCAIS] as const;

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

export const CENTRO_MAPA: [number, number] = [-26.0795, -53.0505];
