import { api } from "./api";
import type { EquipamentosResponse } from "../types/equipamento";

export const equipamentoService = {
  async listar() {
    const response = await api.get<EquipamentosResponse>("/equipamentos");
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get(`/equipamentos/${id}`);
    return response.data;
  },

  async criar(data: unknown) {
    const response = await api.post("/equipamentos", data);
    return response.data;
  },

  async atualizar(id: number, data: unknown) {
    const response = await api.put(`/equipamentos/${id}`, data);
    return response.data;
  },

  async deletar(id: number) {
    const response = await api.delete(`/equipamentos/${id}`);
    return response.data;
  },
};
