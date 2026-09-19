import L from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BookOpen,
  Bus,
  DoorOpen,
  FileText,
  GraduationCap,
  Users,
  UtensilsCrossed,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import { corDoGrupo, type Local } from "@/lib/types";

type TipoMarcador =
  | "bloco"
  | "ru"
  | "biblioteca"
  | "conveniencia"
  | "quadra"
  | "onibus"
  | "portao"
  | "coordenacoes"
  | "derac";

/** Ícone por tipo de marcador (lucide) */
const ICONES: Partial<Record<TipoMarcador, LucideIcon>> = {
  ru: UtensilsCrossed,
  biblioteca: BookOpen,
  conveniencia: Users,
  quadra: Volleyball,
  onibus: Bus,
  portao: DoorOpen,
  coordenacoes: GraduationCap,
  derac: FileText,
};

/** Rótulo pequeno exibido sob o pino (apenas para não-blocos) */
const ROTULOS: Partial<Record<TipoMarcador, string>> = {
  ru: "RU",
  biblioteca: "Biblioteca",
  conveniencia: "Convivência",
  quadra: "Quadra",
  onibus: "Ônibus",
  portao: "Portão",
  coordenacoes: "Coordenação",
  derac: "DERAC",
};

/** Define o tipo visual do marcador a partir do local cadastrado. */
function tipoDeLocal(local: Local): TipoMarcador {
  if (local.categoria === "Blocos") return "bloco";
  if (local.categoria === "RU") return "ru";
  if (local.categoria === "Biblioteca") return "biblioteca";
  if (local.categoria === "Coordenações") return "coordenacoes";
  if (local.categoria === "DERAC") return "derac";
  const nome = local.nome.toLowerCase();
  if (nome.includes("ônibus")) return "onibus";
  if (nome.includes("quadra")) return "quadra";
  if (nome.includes("portão") || nome.includes("guarita")) return "portao";
  return "conveniencia"; // Serviços e demais
}

/** Letra do bloco: "Bloco A – Hall…" → A, "Bloco Meia Lua" → M */
function letraDoBloco(local: Local): string {
  const semPrefixo = local.nome.replace(/^Bloco\s+/i, "");
  const letra = semPrefixo.replace(/\s*[–-].*$/, "").trim().charAt(0);
  return (letra || "?").toUpperCase();
}

/** Cria o pino (divIcon) de um local: letra nos blocos, ícone + rótulo nos
 *  demais, e badge vermelho + pulso laranja quando há avisos ativos. */
export function pinDeLocal(local: Local, nAvisos: number): L.DivIcon {
  const cor = corDoGrupo(local.categoria);
  const tipo = tipoDeLocal(local);
  const temAviso = nAvisos > 0;
  const ehBloco = tipo === "bloco";

  let conteudo: string;
  if (ehBloco) {
    conteudo = `<span class="cf-pin-letra">${letraDoBloco(local)}</span>`;
  } else {
    const Icone = ICONES[tipo] ?? Users;
    conteudo = `<span class="cf-pin-icone">${renderToStaticMarkup(
      createElement(Icone),
    )}</span>`;
  }

  const rotulo = ehBloco ? "" : ROTULOS[tipo];
  const badge = temAviso ? `<div class="cf-pin-badge">${nAvisos}</div>` : "";

  const html = `<div class="cf-pin ${temAviso ? "marker-pulse" : ""} ${
    ehBloco ? "cf-pin-bloco" : "cf-pin-local"
  }" style="--cor:${cor}">
    <div class="cf-pin-corpo">${conteudo}</div>
    ${badge}
    ${rotulo ? `<span class="cf-pin-rotulo">${escapeHtml(rotulo)}</span>` : ""}
  </div>`;

  return L.divIcon({
    className: "",
    html,
    iconSize: ehBloco ? [36, 36] : [48, 54],
    iconAnchor: ehBloco ? [18, 18] : [24, 22],
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
