import { api } from "./api";
import type { Categoria } from "../types/equipamento";

type CategoriasAtivasResponse =
  | Categoria[]
  | {
      success?: boolean;
      data: Categoria[];
    };

export const categoriaService = {
  async listarAtivas(): Promise<Categoria[]> {
    const response =
      await api.get<CategoriasAtivasResponse>("/categorias/ativas");

    const dados = Array.isArray(response.data)
      ? response.data
      : response.data.data;

    return Array.isArray(dados) ? dados : [];
  },
};
