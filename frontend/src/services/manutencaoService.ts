import { api } from "./api";

import type {
  AbrirManutencaoData,
  FinalizarManutencaoData,
  GarantiaEquipamento,
  Manutencao,
  ManutencaoFiltros,
  ManutencaoResponse,
  ManutencoesResponse,
} from "../types/manutencao";

export const manutencaoService = {
  async listar(filtros: ManutencaoFiltros = {}): Promise<ManutencoesResponse> {
    const response = await api.get<ManutencoesResponse>("/manutencoes", {
      params: filtros,
    });

    return response.data;
  },

  async buscarPorId(id: number): Promise<Manutencao> {
    const response = await api.get<Manutencao>(`/manutencoes/${id}`);

    return response.data;
  },

  async buscarPorEquipamento(equipamentoId: number): Promise<Manutencao[]> {
    const response = await api.get<Manutencao[]>(
      `/manutencoes/equipamento/${equipamentoId}`,
    );

    return response.data;
  },

  async consultarGarantia(equipamentoId: number): Promise<GarantiaEquipamento> {
    const response = await api.get<GarantiaEquipamento>(
      `/manutencoes/equipamento/${equipamentoId}/garantia`,
    );

    return response.data;
  },

  async abrir(dados: AbrirManutencaoData): Promise<ManutencaoResponse> {
    const response = await api.post<ManutencaoResponse>("/manutencoes", dados);

    return response.data;
  },

  async finalizar(
    id: number,
    dados: FinalizarManutencaoData,
  ): Promise<ManutencaoResponse> {
    const response = await api.patch<ManutencaoResponse>(
      `/manutencoes/${id}/finalizar`,
      dados,
    );

    return response.data;
  },
};
