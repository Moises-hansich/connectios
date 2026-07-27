import { api } from "./api";

import type {
  AtualizarHardwareData,
  CriarHardwareData,
  Hardware,
} from "../types/hardware";

export const hardwareService = {
  async listar(): Promise<Hardware[]> {
    const response = await api.get<Hardware[]>("/hardwares");

    return response.data;
  },

  async buscarPorId(id: number): Promise<Hardware> {
    const response = await api.get<Hardware>(`/hardwares/${id}`);

    return response.data;
  },

  async criar(dados: CriarHardwareData): Promise<Hardware> {
    const response = await api.post<Hardware>("/hardwares", dados);

    return response.data;
  },

  async atualizar(id: number, dados: AtualizarHardwareData): Promise<Hardware> {
    const response = await api.put<Hardware>(`/hardwares/${id}`, dados);

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/hardwares/${id}`);
  },
};
