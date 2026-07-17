import { api } from "./api";
import type { Equipamento } from "../types/equipamento";

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

export const equipamentoService = {
  async listar(): Promise<Equipamento[]> {
    const response = await api.get<ListarEquipamentosResponse>("/equipamentos");

    return response.data.data;
  },

  async criar(dados: Omit<Equipamento, "id" | "criadoEm" | "atualizadoEm">) {
    const response = await api.post("/equipamentos", dados);

    return response.data;
  },

  async atualizar(id: number, dados: Partial<Equipamento>) {
    const response = await api.put(`/equipamentos/${id}`, dados);

    return response.data;
  },

  async excluir(id: number) {
    await api.delete(`/equipamentos/${id}`);
  },
};
