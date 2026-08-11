import { api } from "./api";
import type { Categoria } from "../types/equipamento";

export interface CriarCategoriaData {
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
}

export type AtualizarCategoriaData = Partial<CriarCategoriaData>;

type ListaCategoriasResponse =
  | Categoria[]
  | {
      success?: boolean;
      data: Categoria[];
    };

type CategoriaResponse =
  | Categoria
  | {
      success?: boolean;
      data: Categoria;
    };

function extrairLista(resposta: ListaCategoriasResponse): Categoria[] {
  const dados = Array.isArray(resposta) ? resposta : resposta.data;

  return Array.isArray(dados) ? dados : [];
}

function extrairCategoria(resposta: CategoriaResponse): Categoria {
  return "data" in resposta ? resposta.data : resposta;
}

export const categoriaService = {
  async listar(): Promise<Categoria[]> {
    const response = await api.get<ListaCategoriasResponse>("/categorias");

    return extrairLista(response.data);
  },

  async listarAtivas(): Promise<Categoria[]> {
    const response =
      await api.get<ListaCategoriasResponse>("/categorias/ativas");

    return extrairLista(response.data);
  },

  async buscarPorId(id: number): Promise<Categoria> {
    const response = await api.get<CategoriaResponse>(`/categorias/${id}`);

    return extrairCategoria(response.data);
  },

  async criar(dados: CriarCategoriaData): Promise<Categoria> {
    const response = await api.post<CategoriaResponse>("/categorias", dados);

    return extrairCategoria(response.data);
  },

  async atualizar(
    id: number,
    dados: AtualizarCategoriaData,
  ): Promise<Categoria> {
    const response = await api.put<CategoriaResponse>(
      `/categorias/${id}`,
      dados,
    );

    return extrairCategoria(response.data);
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`);
  },
};
