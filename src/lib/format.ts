/** Utilitários de formatação em pt-BR */

/** Tempo relativo em português: "há 5 min", "há 2 dias" */
export function tempoAtras(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `há ${dias} dia${dias > 1 ? "s" : ""}`;
  const semanas = Math.floor(dias / 7);
  return `há ${semanas} sem`;
}

/** "08:20" → "08:20" (já vem como texto do banco) */
export function formatTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5);
}

/** "2026-09-20" → "Sex, 20/09" */
export function formatData(d: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(day));
  const nome = dt.toLocaleDateString("pt-BR", { weekday: "short" });
  return `${nome}, ${day}/${m}`;
}

/** Dia da semana de hoje (1=segunda .. 5=sexta); fora da semana → segunda */
export function diaSemanaHoje(): number {
  const jsDay = new Date().getDay(); // 0=domingo
  if (jsDay === 0) return 1;
  if (jsDay === 6) return 1;
  return jsDay; // 1..5 já batem com o banco
}

/** Data de hoje em formato ISO (yyyy-mm-dd) */
export function hojeISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Data futura (para inputs date) — retorna hoje + n dias */
export function dataMaisDias(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Nome do dia da semana (Segunda..Sexta) a partir de 1..5 */
export function nomeDia(dia: number): string {
  const nomes = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  return nomes[(dia - 1) % 5] ?? "Segunda";
}
