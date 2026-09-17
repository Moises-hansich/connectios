export const GRUPOS_CATEGORIA = [
  "COMPUTADORES",
  "PERIFERICOS",
  "PECAS",
  "OUTROS",
] as const;

export type GrupoCategoria = (typeof GRUPOS_CATEGORIA)[number];

export const NOMES_GRUPOS: Record<GrupoCategoria, string> = {
  COMPUTADORES: "Computadores",
  PERIFERICOS: "Periféricos",
  PECAS: "Peças",
  OUTROS: "Outros",
};

export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

export function grupoValido(valor: unknown): valor is GrupoCategoria {
  return (
    typeof valor === "string" &&
    GRUPOS_CATEGORIA.some((grupo) => grupo === valor)
  );
}

export function obterGrupo(
  categoria?: { grupo?: string } | null,
): GrupoCategoria {
  const grupo = categoria?.grupo;

  return grupoValido(grupo) ? grupo : "OUTROS";
}
