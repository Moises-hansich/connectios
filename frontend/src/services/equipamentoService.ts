import { api } from "./api";

import type {
  AtualizarEquipamentoData,
  CriarEquipamentoData,
  Equipamento,
} from "../types/equipamento";

type ListarEquipamentosResponse = {
  success: boolean;
  data: Equipamento[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type BuscarEquipamentoCompletoResponse = {
  success: boolean;
  data: Equipamento;
};

type SalvarEquipamentoResponse = {
  success: boolean;
  message: string;
  data: Equipamento;
};

export const equipamentoService = {
  async listar(): Promise<Equipamento[]> {
    const response = await api.get<ListarEquipamentosResponse>(
      "/equipamentos",
      {
        params: {
          page: 1,
          limit: 100,
        },
      },
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async buscarCompleto(id: number): Promise<Equipamento> {
    const response = await api.get<BuscarEquipamentoCompletoResponse>(
      `/equipamentos/${id}/completo`,
    );

    return response.data.data;
  },

  async criar(dados: CriarEquipamentoData): Promise<Equipamento> {
    const response = await api.post<SalvarEquipamentoResponse>(
      "/equipamentos",
      dados,
    );

    return response.data.data;
  },

  async atualizar(
    id: number,
    dados: AtualizarEquipamentoData,
  ): Promise<Equipamento> {
    const response = await api.put<SalvarEquipamentoResponse>(
      `/equipamentos/${id}`,
      dados,
    );

    return response.data.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/equipamentos/${id}`);
  },
};
