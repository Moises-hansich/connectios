import { api } from "./api";

import type {
  Movimentacao,
  MovimentacaoFilters,
  MovimentacoesResponse,
} from "../types/movimentacao";

export const movimentacaoService = {
  async listar(
    filtros: MovimentacaoFilters = {},
  ): Promise<MovimentacoesResponse> {
    const response = await api.get<MovimentacoesResponse>("/movimentacoes", {
      params: filtros,
    });

    return response.data;
  },

  async buscarPorId(id: number): Promise<Movimentacao> {
    const response = await api.get<Movimentacao>(`/movimentacoes/${id}`);

    return response.data;
  },

  async buscarPorEquipamento(equipamentoId: number): Promise<Movimentacao[]> {
    const response = await api.get<Movimentacao[]>(
      `/movimentacoes/equipamento/${equipamentoId}`,
    );

    return response.data;
  },
};
