import L from "leaflet";
import { COR_CATEGORIA, type Local } from "@/lib/types";

/** Cria o ícone de pino (divIcon) de um local, com letra, cor por categoria,
 *  pulso laranja e badge vermelho quando o bloco tem avisos ativos. */
export function pinDeLocal(
  local: Local,
  nAvisos: number,
): L.DivIcon {
  const cor = COR_CATEGORIA[local.categoria] ?? "#FFC107";
  const ehBloco = local.categoria === "Blocos";
  const letra = ehBloco
    ? (local.nome.replace(/^Bloco\s+/i, "").charAt(0) || "").toUpperCase()
    : "";
  const temAviso = nAvisos > 0;

  const corpo = `<div class="cf-pin-corpo">${letra ? escapeHtml(letra) : ""}</div>`;
  const badge = temAviso
    ? `<div class="cf-pin-badge">${nAvisos}</div>`
    : "";

  const html = `<div class="cf-pin ${temAviso ? "marker-pulse" : ""} ${!letra ? "cf-pin-sem-letra" : ""}" style="--cor:${cor}">${corpo}${badge}</div>`;

  return L.divIcon({
    className: "",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
