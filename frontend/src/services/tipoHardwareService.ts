import { api } from "./api";

import type {
  AtualizarTipoHardwareData,
  CriarTipoHardwareData,
  TipoHardware,
} from "../types/hardware";

export const tipoHardwareService = {
  async listar(): Promise<TipoHardware[]> {
    const response = await api.get<TipoHardware[]>("/tipos-hardware");

    return response.data;
  },

  async buscarPorId(id: number): Promise<TipoHardware> {
    const response = await api.get<TipoHardware>(`/tipos-hardware/${id}`);

    return response.data;
  },

  async criar(dados: CriarTipoHardwareData): Promise<TipoHardware> {
    const response = await api.post<TipoHardware>("/tipos-hardware", dados);

    return response.data;
  },

  async atualizar(
    id: number,
    dados: AtualizarTipoHardwareData,
  ): Promise<TipoHardware> {
    const response = await api.put<TipoHardware>(
      `/tipos-hardware/${id}`,
      dados,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/tipos-hardware/${id}`);
  },
};
