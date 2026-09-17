export const GRUPOS_CATEGORIA = [
  "COMPUTADORES",
  "PERIFERICOS",
  "PECAS",
  "OUTROS",
] as const;

export type GrupoCategoria = (typeof GRUPOS_CATEGORIA)[number];

export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

export function obterGrupo(
  categoria?: { grupo?: string } | null,
): GrupoCategoria {
  const grupo = categoria?.grupo;

  if (
    grupo === "COMPUTADORES" ||
    grupo === "PERIFERICOS" ||
    grupo === "PECAS" ||
    grupo === "OUTROS"
  ) {
    return grupo;
  }

  return "OUTROS";
}
